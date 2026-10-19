// Relance manuelle et contrôlée d'une notification INTERNE échouée.
// Jamais de réenvoi d'accusé client sans action explicite et dédiée.
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const DB_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const ADMIN_TO = "gaspardnz.contact@gmail.com";
const ADMIN_CC = "eliebakala@gmail.com";
const INTERNAL = new Set(["partner_application_internal", "partner_contact_internal", "calendly_booking_internal"]);
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value, max = 200) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const reply = (res, status, body) => res.status(status).setHeader("Cache-Control", "no-store").json(body);

export default async function handler(req, res) {
  if (req.method !== "POST") return reply(res, 405, { ok: false, reason: "Method not allowed" });
  const id = clean(req.body?.emailId, 60);
  if (!ID_RE.test(id)) return reply(res, 400, { ok: false, reason: "Identifiant invalide" });
  const token = String(req.headers?.authorization || "").replace(/^Bearer /, "").trim();
  if (!String(req.headers?.authorization || "").startsWith("Bearer ") || !token || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return reply(res, 401, { ok: false, reason: "Session administrateur requise" });

  const db = createClient(DB_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth?.user?.email) return reply(res, 401, { ok: false, reason: "Session invalide" });
    const { data: access, error: accessError } = await db.from("admin_access")
      .select("role,active").eq("email", auth.user.email.toLowerCase()).eq("active", true).maybeSingle();
    if (accessError || !access || !["admin", "owner"].includes(access.role))
      return reply(res, 403, { ok: false, reason: "Permission insuffisante" });

    const { data: msg, error: msgError } = await db.from("email_messages")
      .select("id,status,template_key,lead_id,booking_id,metadata").eq("id", id).maybeSingle();
    if (msgError || !msg || msg.status !== "failed" || !INTERNAL.has(msg.template_key))
      return reply(res, 409, { ok: false, reason: "Notification non relançable" });
    const attempts = Math.max(0, Number(msg.metadata?.retry_count || 0));
    if (attempts >= 3) return reply(res, 429, { ok: false, reason: "Trois relances déjà effectuées" });

    let subject = "", body = "";
    if (msg.template_key === "calendly_booking_internal" && msg.booking_id) {
      const { data: booking } = await db.from("bookings")
        .select("id,title,starts_at,metadata").eq("id", msg.booking_id).maybeSingle();
      if (!booking) return reply(res, 422, { ok: false, reason: "Réservation introuvable" });
      subject = "Réservation Calendly - relance de notification";
      body = [
        "Notification de réservation à retrouver dans le CRM",
        `Client : ${clean(booking.metadata?.invitee_name, 160)}`,
        `Contact : ${clean(booking.metadata?.invitee_email, 250)}`,
        `Événement : ${clean(booking.title, 180)}`,
        `Date : ${clean(booking.starts_at, 40)}`,
      ].join("\n");
    } else if (msg.lead_id && ["partner_contact_internal", "partner_application_internal"].includes(msg.template_key)) {
      const { data: lead } = await db.from("leads")
        .select("id,full_name,email,phone,request_type,message,metadata").eq("id", msg.lead_id).maybeSingle();
      if (!lead) return reply(res, 422, { ok: false, reason: "Contact CRM introuvable" });
      subject = msg.template_key === "partner_application_internal"
        ? "Candidature partenaire - relance de notification" : "Demande partenaire - relance de notification";
      body = [
        "Demande conservée dans le CRM — notification relancée",
        `Nom : ${clean(lead.full_name, 160)}`,
        `Email : ${clean(lead.email, 250)}`,
        `Téléphone : ${clean(lead.phone, 70)}`,
        `Type : ${clean(lead.request_type, 140)}`,
        `Message : ${clean(lead.message, 2000)}`,
      ].join("\n");
    } else {
      return reply(res, 422, { ok: false, reason: "Ancien email sans référence CRM fiable : relance manuelle nécessaire" });
    }

    const required = ["EMAIL_FROM", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT"];
    if (required.some(key => !process.env[key]))
      return reply(res, 503, { ok: false, reason: "Configuration SMTP indisponible" });

    // Verrou optimiste : un seul admin peut relancer cet échec à la fois.
    const metadata = { ...(msg.metadata || {}), retry_count: attempts + 1, retry_at: new Date().toISOString() };
    const { data: claimed, error: claimError } = await db.from("email_messages")
      .update({ status: "queued", error_message: null, metadata })
      .eq("id", id).eq("status", "failed").select("id").maybeSingle();
    if (claimError || !claimed) return reply(res, 409, { ok: false, reason: "Notification déjà en traitement" });

    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      await db.from("email_messages").update({ status:"failed", error_message:"Port SMTP invalide", failed_at:new Date().toISOString() }).eq("id",id);
      return reply(res, 503, { ok: false, reason: "Port SMTP invalide" });
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
    });
    try {
      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM, to: ADMIN_TO, cc: ADMIN_CC, subject, text: body,
      });
      await db.from("email_messages").update({
        status: "sent", provider_message_id: result.messageId || null,
        sent_at: new Date().toISOString(), error_message: null, failed_at: null,
      }).eq("id", id);
      return reply(res, 200, { ok: true, reason: "Relance SMTP acceptée — vérifier la boîte de réception" });
    } catch (error) {
      const reason = error?.responseCode === 535
        ? "SMTP 535 : identifiants refusés"
        : error?.code === "ETIMEDOUT" ? "SMTP : délai expiré" : "SMTP : envoi impossible";
      await db.from("email_messages").update({
        status: "failed", error_message: reason, failed_at: new Date().toISOString(),
      }).eq("id", id);
      return reply(res, 503, { ok: false, reason });
    } finally {
      transporter.close?.();
    }
  } catch {
    return reply(res, 503, { ok: false, reason: "Relance indisponible" });
  }
}
