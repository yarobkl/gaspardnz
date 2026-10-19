// Notification interne lors de l'import sécurisé d'un nouveau rendez-vous
// Calendly. L'import CRM est conservé même si SMTP échoue.
import nodemailer from "nodemailer";

const ADMIN_TO = "gaspardnz.contact@gmail.com";
const ADMIN_CC = "eliebakala@gmail.com";
const clean = (value, max = 200) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

function mailError(error) {
  if (error?.responseCode === 535) return "SMTP 535 : identifiants refusés";
  if (error?.responseCode) return `SMTP ${error.responseCode} : envoi non accepté`;
  if (error?.code === "ETIMEDOUT") return "SMTP : délai de connexion dépassé";
  return "SMTP : envoi impossible";
}

export async function sendCalendlyBookingNotification(db, { bookingId, created, event, invitee }) {
  if (!bookingId || !invitee || !event) return "skipped";

  // Un événement déjà importé n'est notifié qu'en cas de relance explicite
  // d'une tentative auparavant en échec.
  const { data: existing, error: lookupError } = await db.from("email_messages")
    .select("id,status").eq("booking_id", bookingId).eq("template_key", "calendly_booking_internal")
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (lookupError) return "failed";
  if (!created && !existing) return "skipped";
  if (existing && existing.status !== "failed") return "skipped";

  const subject = "Nouvelle réservation Calendly - Gaspard NZ";
  let messageId = existing?.id;
  if (!messageId) {
    const { data, error } = await db.from("email_messages").insert({
      provider: "smtp", recipient: ADMIN_TO, subject,
      template_key: "calendly_booking_internal", booking_id: bookingId,
      status: "queued", metadata: { source: "calendly_sync" },
    }).select("id").single();
    if (error || !data?.id) return "failed";
    messageId = data.id;
  }

  const mark = async (values) => {
    const { error } = await db.from("email_messages").update({
      ...values, updated_at: new Date().toISOString(),
    }).eq("id", messageId);
    if (error) console.warn("Calendly email status update failed");
  };

  const env = ["EMAIL_FROM", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT"];
  if (env.some((key) => !process.env[key])) {
    await mark({ status: "failed", error_message: "Configuration SMTP manquante", failed_at: new Date().toISOString() });
    return "failed";
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    await mark({ status: "failed", error_message: "Port SMTP invalide", failed_at: new Date().toISOString() });
    return "failed";
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
  });
  const text = [
    "NOUVELLE RÉSERVATION CALENDLY",
    `Client : ${clean(invitee.name, 160) || "Non renseigné"}`,
    `Email : ${clean(invitee.email, 254) || "Non renseigné"}`,
    `Événement : ${clean(event.name, 180) || "Rendez-vous"}`,
    `Date : ${clean(event.start_time, 40)}`,
    "Vérifier le calendrier et le CRM GaspardNZ pour les détails.",
  ].join("\n");
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM, to: ADMIN_TO, cc: ADMIN_CC, subject, text,
      replyTo: clean(invitee.email, 254) || undefined,
    });
    await mark({
      status: "sent", provider_message_id: result.messageId || null,
      sent_at: new Date().toISOString(), error_message: null, failed_at: null,
      metadata: { source: "calendly_sync", accepted: result.accepted || [], rejected: result.rejected || [] },
    });
    return "sent";
  } catch (error) {
    await mark({ status: "failed", error_message: mailError(error), failed_at: new Date().toISOString() });
    return "failed";
  } finally {
    transporter.close?.();
  }
}
