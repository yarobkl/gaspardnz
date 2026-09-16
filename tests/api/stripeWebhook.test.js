// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Readable } from "node:stream";
import Stripe from "stripe";

// api/stripe-webhook.js utilise les VRAIES fonctions de vérification de
// signature de la librairie Stripe : on ne mocke pas "stripe", pour tester
// le comportement réel, pas une supposition dessus. Seuls les I/O externes
// (base, SMTP) sont simulés.
const sentEmails = [];
const transporterError = { next: null };
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: async (mail) => {
        if (transporterError.next) { const e = transporterError.next; transporterError.next = null; throw e; }
        sentEmails.push(mail);
        return { messageId: `msg-${sentEmails.length}` };
      },
    }),
  },
}));

const dbState = { email_messages: [], site_settings: [] };
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from(table) {
      const rows = () => dbState[table] || (dbState[table] = []);
      let filters = [];
      const api = {
        select() { return api; },
        eq(col, val) { filters.push((r) => r[col] === val); return api; },
        contains(col, partial) { filters.push((r) => Object.entries(partial).every(([k, v]) => r[col]?.[k] === v)); return api; },
        limit() { return api; },
        maybeSingle: async () => ({ data: rows().filter((r) => filters.every((f) => f(r)))[0] || null }),
        insert: async (row) => { rows().push({ id: `row-${rows().length + 1}`, ...row }); return { data: null, error: null }; },
        then: (resolve) => resolve({ data: rows().filter((r) => filters.every((f) => f(r))), error: null }),
      };
      return api;
    },
  }),
}));

const WEBHOOK_SECRET = "whsec_test_secret_de_test_uniquement";
process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.EMAIL_FROM = "gaspardnz.contact@gmail.com";
process.env.EMAIL_PASSWORD = "x";
process.env.SMTP_HOST = "smtp.test";
process.env.SMTP_PORT = "587";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-de-test";

const { default: handler } = await import("../../api/stripe-webhook.js");

function buildReq({ payload, secret = WEBHOOK_SECRET, badSignature = false }) {
  const raw = JSON.stringify(payload);
  const signature = badSignature
    ? "t=1,v1=signature_falsifiee"
    : Stripe.webhooks.generateTestHeaderString({ payload: raw, secret });
  const stream = Readable.from([Buffer.from(raw)]);
  stream.method = "POST";
  stream.headers = { "stripe-signature": signature };
  return stream;
}

function buildRes() {
  return {
    statusCode: null, body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

const checkoutCompletedEvent = (overrides = {}) => ({
  id: "evt_1",
  type: "checkout.session.completed",
  data: { object: {
    id: overrides.sessionId || "cs_test_1",
    // `??` traiterait un null explicite comme "non fourni" et reviendrait au
    // défaut : on distingue donc "la clé est présente" de "elle est absente".
    customer_details: { email: "email" in overrides ? overrides.email : "cliente@example.com" },
    ...overrides.session,
  } },
});

beforeEach(() => {
  sentEmails.length = 0;
  transporterError.next = null;
  dbState.email_messages = [];
  dbState.site_settings = [{ key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf", pdf_filename: "lookbook.pdf" } }];
});

describe("signature Stripe", () => {
  it("refuse une requête sans en-tête de signature", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent() });
    delete req.headers["stripe-signature"];
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(sentEmails).toHaveLength(0);
  });

  it("refuse une signature qui ne correspond pas au corps de la requête", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent(), badSignature: true });
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(sentEmails).toHaveLength(0);
  });

  it("refuse une signature valide pour un AUTRE secret (payload modifié après signature)", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent(), secret: "whsec_un_autre_secret" });
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(sentEmails).toHaveLength(0);
  });
});

describe("achat validé", () => {
  it("envoie le lien du PDF actuellement déposé, à l'email du client", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent({ email: "acheteuse@example.com" }) });
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("acheteuse@example.com");
    expect(sentEmails[0].text).toContain("https://example.test/lookbook.pdf");
  });

  it("journalise l'envoi dans email_messages avec l'identifiant de la session Stripe", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent({ sessionId: "cs_test_journal" }) });
    await handler(req, buildRes());
    const logged = dbState.email_messages.find((r) => r.metadata?.stripe_session_id === "cs_test_journal");
    expect(logged?.status).toBe("sent");
  });

  it("ignore un évènement Stripe qui n'est pas un paiement complété", async () => {
    const req = buildReq({ payload: { id: "evt_2", type: "payment_intent.created", data: { object: {} } } });
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(sentEmails).toHaveLength(0);
  });

  it("n'envoie rien si la session Stripe n'a pas d'email client", async () => {
    const req = buildReq({ payload: checkoutCompletedEvent({ email: null }) });
    const res = buildRes();
    await handler(req, res);
    expect(sentEmails).toHaveLength(0);
  });
});

describe("idempotence", () => {
  it("n'envoie pas deux fois le même achat si Stripe relivre l'évènement", async () => {
    const req1 = buildReq({ payload: checkoutCompletedEvent({ sessionId: "cs_test_double" }) });
    await handler(req1, buildRes());
    const req2 = buildReq({ payload: checkoutCompletedEvent({ sessionId: "cs_test_double" }) });
    const res2 = buildRes();
    await handler(req2, res2);
    expect(sentEmails).toHaveLength(1);
    expect(res2.body?.duplicate).toBe(true);
  });

  it("une tentative précédemment échouée n'empêche PAS une relance de réussir", async () => {
    transporterError.next = new Error("SMTP momentanément indisponible");
    const req1 = buildReq({ payload: checkoutCompletedEvent({ sessionId: "cs_test_retry" }) });
    const res1 = buildRes();
    await handler(req1, res1);
    expect(res1.statusCode).toBe(500); // Stripe comprend qu'il doit réessayer.
    expect(sentEmails).toHaveLength(0);

    const req2 = buildReq({ payload: checkoutCompletedEvent({ sessionId: "cs_test_retry" }) });
    const res2 = buildRes();
    await handler(req2, res2);
    expect(res2.statusCode).toBe(200);
    expect(sentEmails).toHaveLength(1);
  });
});

describe("aucun PDF déposé", () => {
  it("ne tente aucun envoi et le signale, sans faire réessayer Stripe indéfiniment", async () => {
    dbState.site_settings = [];
    const req = buildReq({ payload: checkoutCompletedEvent() });
    const res = buildRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(sentEmails).toHaveLength(0);
    expect(dbState.email_messages.some((r) => r.status === "failed")).toBe(true);
  });
});
