// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ leads: new Map(), emails: new Map(), mails: [], reject: null, allowed: true }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: async mail => {
  state.mails.push(mail);
  if (state.reject === mail.to) throw new Error("SMTP unavailable");
  return { accepted: [mail.to], messageId: `mail-${state.mails.length}` };
} }) } }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({
  rpc: async () => ({ data: state.allowed, error: null }),
  from: table => {
    let inserted, patch;
    const filters = [];
    const execute = async () => {
      const rows = table === "leads" ? state.leads : state.emails;
      if (inserted) {
        if (rows.has(inserted.id)) return { data: null, error: { code: "23505" } };
        const row = { ...inserted, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        rows.set(row.id, row);
        return { data: { ...row }, error: null };
      }
      const row = [...rows.values()].find(r => filters.every(([k, v]) => r[k] === v));
      if (!row) return { data: null, error: null };
      if (patch) Object.assign(row, patch);
      return { data: { ...row }, error: null };
    };
    const query = {
      insert: row => { inserted = row; return query; },
      update: row => { patch = row; return query; },
      select: () => query,
      eq: (k, v) => { filters.push([k, v]); return query; },
      single: execute,
      maybeSingle: execute,
      then: (resolve, reject) => execute().then(resolve, reject),
    };
    return query;
  },
}) }));

import handler, { formatContactNotification } from "../../api/notify-whatsapp-contact.js";
const id = "8c0992df-d0a1-4a5e-a77c-fe9aedf8a757";
const res = () => ({ statusCode: null, body: null, setHeader() {}, status(c) { this.statusCode = c; return this; }, json(v) { this.body = v; return this; } });
const req = (body = { leadId: id }) => ({ method: "POST", headers: { origin: "https://gaspardnz.style" }, socket: {}, body });
beforeEach(() => {
  state.mails.length = 0;
  state.emails.clear();
  state.leads.clear();
  state.reject = null;
  state.allowed = true;
  Object.assign(process.env, { EMAIL_FROM: "site@example.test", EMAIL_PASSWORD: "test", SMTP_HOST: "smtp.test", SMTP_PORT: "465", SUPABASE_SERVICE_ROLE_KEY: "test-service" });
  delete process.env.ALLOWED_EMAIL_RECIPIENTS;
  delete process.env.EMAIL_TO;
  state.leads.set(id, { id, full_name: "Élodie", phone: "+33612345678", request_type: "whatsapp_contact", created_at: new Date().toISOString(), message: "Bonjour Mr GaspardNZ, je m’appelle Élodie.", metadata: { project_label: "Mariage — stylisme et habillage", country_code: "FR", calling_code: "+33" } });
});

describe("automatic WhatsApp contact notifications", () => {
  it("notifies both fixed recipients using the saved CRM data, with no client email required", async () => {
    const response = res();
    await handler(req(), response);
    expect(response.statusCode).toBe(200);
    expect(state.mails.map(m => m.to).sort()).toEqual(["eliebakala@gmail.com", "gaspardnz.contact@gmail.com"]);
    expect(state.mails[0].text).toContain("Élodie");
    expect(state.mails[0].text).toContain("+33612345678");
    expect(state.mails[0].text).toContain("Mariage");
    expect(state.mails[0].html).toContain('href="https://wa.me/33612345678"');
    expect([...state.emails.values()].every(r => r.status === "sent")).toBe(true);
  });

  it("does not resend successful notifications when the same request is retried", async () => {
    await handler(req(), res());
    const response = res();
    await handler(req(), response);
    expect(response.statusCode).toBe(200);
    expect(state.mails).toHaveLength(2);
  });

  it("records per-recipient failures and only retries the failed recipient", async () => {
    state.reject = "eliebakala@gmail.com";
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = res();
      await handler(req(), response);
      expect(response.statusCode).toBe(502);
      expect([...state.emails.values()].find(r => r.recipient === state.reject).status).toBe("failed");
      state.reject = null;
      await handler(req(), res());
      expect(state.mails.filter(m => m.to === "gaspardnz.contact@gmail.com")).toHaveLength(1);
      expect(state.mails.filter(m => m.to === "eliebakala@gmail.com")).toHaveLength(2);
    } finally { consoleError.mockRestore(); }
  });

  it("rejects caller-supplied recipients or client text and unrelated/missing CRM records", async () => {
    for (const body of [{ leadId: id, to: ["stranger@example.test"] }, { leadId: id, message: "forged" }, { leadId: "invalid" }]) {
      const response = res(); await handler(req(body), response); expect(response.statusCode).toBe(400);
    }
    state.leads.get(id).request_type = "partner_application";
    const response = res(); await handler(req(), response); expect(response.statusCode).toBe(404);
    expect(state.mails).toHaveLength(0);
  });

  it("refuses stale contacts, foreign origins and rate-limited callers", async () => {
    state.leads.get(id).created_at = "2020-01-01T00:00:00Z";
    const stale = res(); await handler(req(), stale); expect(stale.statusCode).toBe(404);
    const foreign = res(); await handler({ ...req(), headers: { origin: "https://attacker.test" } }, foreign); expect(foreign.statusCode).toBe(403);
    state.allowed = false;
    const limited = res(); await handler(req(), limited); expect(limited.statusCode).toBe(429);
    expect(state.mails).toHaveLength(0);
  });

  it("escapes client-controlled HTML and identifies the Paris timezone", () => {
    const mail = formatContactNotification({ ...state.leads.get(id), full_name: '<img src=x onerror="bad()">' });
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
    expect(mail.text).toContain("heure de Paris");
  });
});
