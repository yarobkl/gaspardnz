import { createHmac, timingSafeEqual } from "node:crypto";

const acceptedEvents = new Set([
  "BOOKING_CREATED",
  "BOOKING_CONFIRMED",
  "BOOKING_REQUESTED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
  "BOOKING_REJECTED",
]);

const tidy = (value, length) => String(value ?? "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, length);

export function verifyCalSignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof secret !== "string" || secret.length < 16) return false;
  const supplied = String(signature || "").replace(/^sha256=/i, "").trim();
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(supplied, "hex"));
}

function timestamp(value) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

export function normalizeCalBooking(event, now = new Date()) {
  if (!event || typeof event !== "object" || Array.isArray(event)) return null;
  const trigger = tidy(event.triggerEvent, 40);
  if (!acceptedEvents.has(trigger)) return null;
  const payload = event.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const bookingUid = tidy(payload.uid || payload.bookingUid || payload.bookingId, 128);
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(bookingUid)) return null;
  const occurredAt = timestamp(event.createdAt);
  if (!occurredAt) return null;
  const drift = Math.abs(now.getTime() - new Date(occurredAt).getTime());
  if (drift > 7 * 24 * 60 * 60 * 1000) return null;

  const calStatus = tidy(payload.status, 40).toUpperCase();
  const status = ["BOOKING_CANCELLED", "BOOKING_REJECTED"].includes(trigger) ||
    ["CANCELLED", "CANCELED", "REJECTED"].includes(calStatus)
    ? "cancelled"
    : trigger === "BOOKING_REQUESTED" || ["PENDING", "REQUESTED", "AWAITING_HOST"].includes(calStatus)
      ? "requested"
      : "confirmed";

  const start = timestamp(payload.startTime || payload.start);
  const end = timestamp(payload.endTime || payload.end);
  if (status !== "cancelled" && (!start || !end || new Date(end) <= new Date(start))) return null;

  // Do not use payload.title: it can contain attendee names. The Live Activity
  // should never display a person's identity or arbitrary Cal.com form text.
  const service = tidy(
    payload.type || payload.eventType?.title || payload.eventType?.slug || "Conseil en image",
    100,
  );
  const guest = Array.isArray(payload.attendees) ? payload.attendees[0] : null;
  const email = tidy(guest?.email, 320).toLowerCase();
  const fullName = tidy(guest?.name, 160);

  return {
    bookingUid,
    eventType: trigger,
    occurredAt,
    status,
    start,
    end,
    serviceTitle: service || "Conseil en image",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    fullName: fullName || null,
  };
}
