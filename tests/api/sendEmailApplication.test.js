// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// Candidature « Devenir partenaire » : Gaspard doit recevoir un email de
// candidature (pas le modèle « demande client »), avec un objet lisible, et
// le professionnel un accusé de réception adapté.
const sent = [];
const logs = [];

vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: async (mail) => { sent.push(mail); return { messageId: `m${sent.length}`, accepted: [mail.to] }; } }) },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: async () => ({ data: true, error: null }),
    from: () => ({
      insert(row) { logs.push(row); return this; },
      update() { return this; },
      select() { return this; },
      eq: async () => ({ error: null }),
      single: async () => ({ data: { id: `log${logs.length}` }, error: null }),
    }),
  }),
}));

const { default: handler } = await import("../../api/send-email.js");

const makeRes = () => ({ statusCode: null, body: null, setHeader() {}, status(c) { this.statusCode = c; return this; }, json(p) { this.body = p; return this; } });
const application = (overrides = {}) => ({
  method: "POST",
  headers: { origin: "https://gaspardnz.style" },
  socket: {},
  body: {
    kind: "partner_application",
    to: ["gaspardnz.contact@gmail.com"],
    cc: ["eliebakala@gmail.com"],
    clientName: "Awa Diop",
    clientEmail: "awa@events.fr",
    clientPhone: "0612345678",
    company: "Awa Events",
    trade: "Wedding Planner",
    city: "Lyon (69)",
    portfolio: "@awaevents",
    message: "Je organise 20 mariages par an.",
    formStartedAt: Date.now() - 30_000,
    ...overrides,
  },
});

beforeEach(() => {
  sent.length = 0;
  logs.length = 0;
  Object.assign(process.env, { EMAIL_FROM: "site@gaspardnz.style", EMAIL_PASSWORD: "x", SMTP_HOST: "smtp.test", SMTP_PORT: "465", SUPABASE_SERVICE_ROLE_KEY: "service-role-de-test" });
});

describe("api/send-email — candidature partenaire", () => {
  it("envoie à Gaspard un email de candidature et un accusé de réception au professionnel", async () => {
    const res = makeRes();
    await handler(application(), res);
    expect(res.statusCode).toBe(200);
    expect(sent).toHaveLength(2);

    const [internal, ack] = sent;
    expect(internal.to).toBe("gaspardnz.contact@gmail.com");
    expect(internal.cc).toBe("eliebakala@gmail.com");
    expect(internal.subject).toBe("Candidature partenaire : Wedding Planner, Awa Events");
    expect(internal.text).toContain("NOUVELLE CANDIDATURE PARTENAIRE");
    expect(internal.text).toContain("Instagram / site: @awaevents");
    expect(internal.text).toContain("Ville: Lyon (69)");
    expect(internal.replyTo).toBe("awa@events.fr");

    expect(ack.to).toBe("awa@events.fr");
    expect(ack.subject).toBe("Votre candidature a bien été reçue - Gaspard NZ");
    expect(ack.text).toContain("en tant que Wedding Planner");

    expect(logs.map((l) => l.template_key)).toEqual(["partner_application_internal", "partner_application_ack"]);
  });

  it("refuse une candidature sans métier", async () => {
    const res = makeRes();
    await handler(application({ trade: "  " }), res);
    expect(res.statusCode).toBe(400);
    expect(sent).toHaveLength(0);
  });

  it("garde le modèle client pour une demande client classique", async () => {
    const res = makeRes();
    await handler(application({ kind: undefined, subject: "Nouvelle demande - Palais Groupe - Awa" }), res);
    expect(res.statusCode).toBe(200);
    expect(sent[0].subject).toBe("Nouvelle demande - Palais Groupe - Awa");
    expect(sent[0].text).toContain("NOUVELLE DEMANDE DE CONTACT");
  });
});
