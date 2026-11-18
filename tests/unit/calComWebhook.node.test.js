import { test } from "vitest";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { normalizeCalBooking, verifyCalSignature } from "../../server/cal-com-webhook.js";

const secret = "a-private-example-webhook-secret-for-tests";
const eventTime = "2026-11-18T12:00:00.000Z";
const clock = new Date("2026-11-18T12:10:00.000Z");

const event = (triggerEvent = "BOOKING_CREATED", payload = {}) => ({
  triggerEvent,
  createdAt: eventTime,
  payload: {
    uid: "cal_uid_abc-42",
    type: "Conseil en image",
    title: "Private: Client Name with Gaspard",
    status: "ACCEPTED",
    startTime: "2026-11-20T13:30:00Z",
    endTime: "2026-11-20T14:30:00Z",
    attendees: [{ email: "client@example.com", name: "Client Privé" }],
    ...payload,
  },
});

test("accepts only a valid HMAC of the exact raw body", () => {
  const bytes = Buffer.from(JSON.stringify(event()));
  const signature = createHmac("sha256", secret).update(bytes).digest("hex");
  assert.equal(verifyCalSignature(bytes, signature, secret), true);
  assert.equal(verifyCalSignature(bytes, `sha256=${signature}`, secret), true);
  assert.equal(verifyCalSignature(Buffer.from(`${bytes}\n`), signature, secret), false);
  assert.equal(verifyCalSignature(bytes, "not-a-signature", secret), false);
  assert.equal(verifyCalSignature(bytes, signature, "short"), false);
});

test("normalizes a real confirmed Cal.com event without displaying private title", () => {
  const value = normalizeCalBooking(event(), clock);
  assert.equal(value.bookingUid, "cal_uid_abc-42");
  assert.equal(value.status, "confirmed");
  assert.equal(value.start, "2026-11-20T13:30:00.000Z");
  assert.equal(value.serviceTitle, "Conseil en image");
  assert.equal(value.email, "client@example.com");
  assert.ok(!value.serviceTitle.includes("Client Name"));
});

test("does not mark pending bookings as confirmed", () => {
  assert.equal(normalizeCalBooking(event("BOOKING_REQUESTED"), clock).status, "requested");
  assert.equal(normalizeCalBooking(event("BOOKING_CREATED", { status: "PENDING" }), clock).status, "requested");
});

test("supports cancellation without timestamps and rescheduled confirmation", () => {
  const cancelled = normalizeCalBooking(event("BOOKING_CANCELLED", { startTime: null, endTime: null }), clock);
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.start, null);
  assert.equal(normalizeCalBooking(event("BOOKING_RESCHEDULED"), clock).status, "confirmed");
});

test("rejects missing identity, invalid appointments, unsupported events and stale calls", () => {
  assert.equal(normalizeCalBooking(event("PAYMENT_CREATED"), clock), null);
  assert.equal(normalizeCalBooking(event("BOOKING_CREATED", { uid: "" }), clock), null);
  assert.equal(normalizeCalBooking(event("BOOKING_CREATED", { endTime: "2026-11-20T11:00:00Z" }), clock), null);
  assert.equal(normalizeCalBooking({ ...event(), createdAt: "2020-01-01T12:00:00Z" }, clock), null);
  assert.equal(normalizeCalBooking(event("BOOKING_CREATED", { uid: "../admin" }), clock), null);
});
