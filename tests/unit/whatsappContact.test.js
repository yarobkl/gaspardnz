import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, context } = vi.hoisted(() => ({ send: vi.fn(), context: vi.fn(() => ({})) }));
vi.mock("../../src/services/supabaseClient.js", () => ({ sendPublicEvent: send }));
vi.mock("../../src/services/siteTracking.js", () => ({ getTrackingContext: context }));
let service;
beforeEach(async () => {
  vi.resetModules();
  send.mockReset();
  context.mockReturnValue({});
  service = await import("../../src/services/whatsappContact.js");
});

describe("WhatsApp prospect capture", () => {
  it("normalizes French and international phones, rejecting ambiguous or invalid inputs", () => {
    expect(service.normalizeContactPhone("06 12 34 56 78")).toBe("+33612345678");
    expect(service.normalizeContactPhone("0033 6 12 34 56 78")).toBe("+33612345678");
    expect(service.normalizeContactPhone("+242 06 123 45 67")).toBe("+242061234567");
    for (const value of ["", "123", "call +33612345678", "+0 123456789", "+336123456789012345"]) {
      expect(service.normalizeContactPhone(value)).toBe("");
    }
  });

  it("creates a CRM prospect without email or analytics consent and does not claim a message was sent", async () => {
    send.mockResolvedValue({ ok: true, id: "lead-1" });
    const result = await service.submitWhatsappContact({ projectType: "wedding", firstName: " Élodie ", phone: "06 12 34 56 78" });
    expect(result.id).toBe("lead-1");
    expect(send).toHaveBeenCalledWith("lead", expect.objectContaining({
      full_name: "Élodie", phone: "+33612345678", source: "Site GaspardNZ", channel: "whatsapp", request_type: "whatsapp_contact",
      metadata: expect.objectContaining({ country_code: "FR", calling_code: "+33", project_type: "wedding", project_label: "Mariage — stylisme et habillage", entry_point: "parler_a_gaspard", whatsapp_message_status: "unknown", contact_notice_version: "2026-10-30" }),
    }));
    const payload = send.mock.calls[0][1];
    expect(payload.message).toContain("je m’appelle Élodie");
    expect(payload.message).toContain("pour mon mariage");
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("status", "client");
    expect(localStorage.length).toBe(0);
  });

  it("preserves optional attribution without replacing the website origin", async () => {
    context.mockReturnValue({ source: "Google", campaign: "wedding" });
    send.mockResolvedValue({ ok: true, id: "lead-2" });
    await service.submitWhatsappContact({ projectType: "wedding", firstName: "Marc", phone: "+33612345678" });
    expect(send.mock.calls[0][1]).toMatchObject({ source: "Site GaspardNZ", campaign: "wedding", metadata: { acquisition_source: "Google" } });
  });

  it("coalesces simultaneous submissions and reuses a successful save", async () => {
    let resolve;
    send.mockReturnValue(new Promise(r => { resolve = r; }));
    const a = service.submitWhatsappContact({ projectType: "wedding", firstName: "Marc", phone: "06 12 34 56 78" });
    const b = service.submitWhatsappContact({ projectType: "wedding", firstName: "Marc", phone: "+33612345678" });
    expect(send).toHaveBeenCalledTimes(1);
    resolve({ ok: true, id: "lead-3" });
    await Promise.all([a, b]);
    await service.submitWhatsappContact({ projectType: "wedding", firstName: "Marc", phone: "+33612345678" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("fails closed on an unconfirmed save, then permits an explicit retry", async () => {
    send.mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce({ ok: true }).mockResolvedValue({ ok: true, id: "lead-retry" });
    const data = { firstName: "Marc", phone: "+33612345678", projectType: "wedding" };
    await expect(service.submitWhatsappContact(data)).rejects.toThrow("contact_save_failed");
    await expect(service.submitWhatsappContact(data)).rejects.toThrow("contact_save_failed");
    await expect(service.submitWhatsappContact(data)).resolves.toMatchObject({ id: "lead-retry" });
  });

  it("does not transmit missing names or invalid phone numbers", async () => {
    for (const data of [{ firstName: " ", phone: "+33612345678" }, { firstName: "Marc", phone: "123" }, { firstName: "a".repeat(81), phone: "+33612345678" }]) {
      await expect(service.submitWhatsappContact({ ...data, projectType: "wedding" })).rejects.toThrow("invalid_contact");
    }
    expect(send).not.toHaveBeenCalled();
  });
});
