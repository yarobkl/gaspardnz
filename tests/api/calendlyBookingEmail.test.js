// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ sendMail: vi.fn(), close: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: calls.sendMail, close: calls.close }) } }));
import { sendCalendlyBookingNotification } from "../../api/_lib/booking-email.js";

function mockDb(existing = null) {
  const chain = {
    select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
    async maybeSingle() { return { data: existing, error: null }; },
    async single() { return { data: { id: "mail-1" }, error: null }; },
  };
  const inserts = [], updates = [];
  return {
    inserts, updates,
    from() { return {
      ...chain,
      insert(row) { inserts.push(row); return chain; },
      update(row) { updates.push(row); return { eq: async () => ({ error: null }) }; },
    }; },
  };
}
const item = {
  bookingId: "booking-1", created: true,
  event: { name: "Entretien", start_time: "2026-11-10T10:00:00Z" },
  invitee: { name: "Cliente", email: "client@example.com" },
};
beforeEach(() => {
  Object.assign(process.env, { EMAIL_FROM: "sender@example.com", EMAIL_PASSWORD: "test", SMTP_HOST: "smtp.example.com", SMTP_PORT: "587" });
  calls.sendMail.mockReset().mockResolvedValue({ messageId: "smtp-1", accepted: ["gaspardnz.contact@gmail.com"] });
  calls.close.mockReset();
});
describe("Calendly CRM notifications", () => {
  it("notifies a new booking and logs its booking ID", async () => {
    const db=mockDb();
    expect(await sendCalendlyBookingNotification(db,item)).toBe("sent");
    expect(db.inserts[0]).toMatchObject({ booking_id:"booking-1",status:"queued" });
    expect(db.updates.at(-1)).toMatchObject({ status:"sent" });
    expect(calls.sendMail).toHaveBeenCalledTimes(1);
  });
  it("avoids duplicate sends for an already processed booking", async () => {
    const db=mockDb({id:"mail-1",status:"sent"});
    expect(await sendCalendlyBookingNotification(db,{...item,created:false})).toBe("skipped");
    expect(calls.sendMail).not.toHaveBeenCalled();
  });
  it("records SMTP auth failures without losing a booking", async () => {
    const db=mockDb({id:"mail-1",status:"failed"});
    calls.sendMail.mockRejectedValue({responseCode:535});
    expect(await sendCalendlyBookingNotification(db,{...item,created:false})).toBe("failed");
    expect(db.updates.at(-1)).toMatchObject({status:"failed",error_message:"SMTP 535 : identifiants refusés"});
  });
  it("does not send historical bookings the CRM already knows", async () => {
    const db=mockDb();
    expect(await sendCalendlyBookingNotification(db,{...item,created:false})).toBe("skipped");
    expect(db.inserts).toHaveLength(0);
  });
});
