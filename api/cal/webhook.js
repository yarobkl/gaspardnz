import getRawBody from "raw-body";
import { createClient } from "@supabase/supabase-js";
import { normalizeCalBooking, verifyCalSignature } from "../../server/cal-com-webhook.js";

// Cal.com signs the exact bytes, not Vercel's parsed JSON representation.
export const config = { api: { bodyParser: false } };

function respond(res, status, body) {
  return res.status(status).setHeader("Cache-Control", "no-store").json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 16 || !key) return respond(res, 503, { error: "Intégration Cal.com non configurée" });

  let rawBody;
  try {
    rawBody = await getRawBody(req, { limit: "64kb", length: req.headers["content-length"] });
  } catch {
    return respond(res, 413, { error: "Payload invalide ou trop volumineux" });
  }
  if (!verifyCalSignature(rawBody, req.headers["x-cal-signature-256"], secret)) {
    return respond(res, 401, { error: "Signature Cal.com invalide" });
  }

  let event;
  try { event = JSON.parse(rawBody.toString("utf8")); }
  catch { return respond(res, 400, { error: "JSON invalide" }); }
  const booking = normalizeCalBooking(event);
  if (!booking) return respond(res, 422, { error: "Événement de réservation invalide ou non pris en charge" });

  const db = createClient(process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co", key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // This server-only SQL function locks the Cal booking before altering CRM
  // state. Retries and out-of-order deliveries cannot regress its status.
  const { data, error } = await db.rpc("apply_verified_cal_booking", {
    p_booking_uid: booking.bookingUid,
    p_trigger: booking.eventType,
    p_occurred_at: booking.occurredAt,
    p_status: booking.status,
    p_start_at: booking.start,
    p_end_at: booking.end,
    p_service: booking.serviceTitle,
    p_email: booking.email,
    p_name: booking.fullName,
  });
  if (error) {
    console.error("Cal.com webhook persistence failure", error.code || "database_error");
    return respond(res, 503, { error: "Synchronisation temporairement indisponible" });
  }
  return respond(res, 200, { ok: true, applied: data?.applied === true });
}
