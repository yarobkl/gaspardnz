// @vitest-environment node
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

const calls = vi.hoisted(() => ({
  getUser: vi.fn(), maybeSingle: vi.fn(), verify: vi.fn(), close: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: calls.getUser },
    from: () => ({ select: () => ({ eq() { return this; }, maybeSingle: calls.maybeSingle }) }),
  }),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ verify: calls.verify, close: calls.close }) },
}));
import handler from "../../api/email-health.js";

const response = () => ({
  code: 0, body: null, setHeader() { return this; },
  status(code) { this.code = code; return this; },
  json(body) { this.body = body; return this; },
});
const keys = ["EMAIL_FROM", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT", "SUPABASE_SERVICE_ROLE_KEY"];
const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
beforeEach(() => {
  for (const key of keys) process.env[key] = "test-value";
  process.env.SMTP_PORT = "587";
  calls.getUser.mockReset().mockResolvedValue({ data: { user: { email: "ADMIN@EXAMPLE.COM" } }, error: null });
  calls.maybeSingle.mockReset().mockResolvedValue({ data: { active: true, role: "admin" }, error: null });
  calls.verify.mockReset().mockResolvedValue(true);
  calls.close.mockReset();
});
afterEach(() => {
  for (const key of keys) saved[key] === undefined ? delete process.env[key] : (process.env[key] = saved[key]);
});
describe("Admin-only email health probe", () => {
  it("rejects non-admin requests before probing SMTP", async () => {
    const res = response();
    await handler({ method: "GET", headers: {} }, res);
    expect(res.code).toBe(401);
    expect(calls.verify).not.toHaveBeenCalled();
  });
  it("reports missing server variables without exposing values", async () => {
    delete process.env.EMAIL_PASSWORD;
    const res = response();
    await handler({ method: "GET", headers: { authorization: "Bearer token" } }, res);
    expect(res.code).toBe(503);
    expect(res.body.missing).toEqual(["EMAIL_PASSWORD"]);
    expect(calls.verify).not.toHaveBeenCalled();
  });
  it("verifies SMTP without sending a message", async () => {
    const res = response();
    await handler({ method: "GET", headers: { authorization: "Bearer token" } }, res);
    expect(res.code).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(calls.verify).toHaveBeenCalledOnce();
    expect(calls.close).toHaveBeenCalledOnce();
  });
  it("reports refused credentials without echoing raw errors", async () => {
    calls.verify.mockRejectedValue({ responseCode: 535, message: "SECRET should not leak" });
    const res = response();
    await handler({ method: "GET", headers: { authorization: "Bearer token" } }, res);
    expect(res.code).toBe(503);
    expect(res.body.smtpCode).toBe(535);
    expect(JSON.stringify(res.body)).not.toContain("SECRET");
  });
  it("forbids a viewer", async () => {
    calls.maybeSingle.mockResolvedValue({data: {active: true, role: "viewer"}, error: null});
    const res = response();
    await handler({ method: "GET", headers: { authorization: "Bearer token" } }, res);
    expect(res.code).toBe(403);
    expect(calls.verify).not.toHaveBeenCalled();
  });
  it("forbids a non-admin session", async () => {
    calls.maybeSingle.mockResolvedValue({ data: null, error: null });
    const res = response();
    await handler({ method: "GET", headers: { authorization: "Bearer token" } }, res);
    expect(res.code).toBe(403);
    expect(calls.verify).not.toHaveBeenCalled();
  });
});
