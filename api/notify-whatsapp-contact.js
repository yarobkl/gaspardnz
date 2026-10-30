import { createHash } from "node:crypto";
import { adminDb, consumePersistentRateLimit, createTransporter, escapeHtml, isAllowedOrigin, resolveRecipients, sanitizeText, updateEmailLog, validateEnv } from "./send-email.js";

// Destinations are fixed on the server. The browser only supplies an opaque
// CRM ID, never email addresses or a fabricated client/message to forward.
const RECIPIENTS = ["gaspardnz.contact@gmail.com", "eliebakala@gmail.com"];
const TEMPLATE = "whatsapp_contact_internal_v1";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function notificationId(leadId, recipient) {
  const hash = createHash("sha256").update(`${TEMPLATE}:${leadId}:${recipient}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function formatContactNotification(lead) {
  const name = sanitizeText(lead.full_name, 80);
  const phone = sanitizeText(lead.phone, 30);
  const project = sanitizeText(lead.metadata?.project_label || "Projet non précisé", 150);
  const details = sanitizeText(lead.metadata?.project_details || "", 300);
  const date = new Date(lead.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
  const whatsapp = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const text = `NOUVELLE DEMANDE CLIENT — GASPARDNZ\n\nPrénom : ${name}\nTéléphone : ${phone}\nPays : ${sanitizeText(lead.metadata?.country_code, 10)} (${sanitizeText(lead.metadata?.calling_code, 10)})\nProjet : ${project}${details ? `\nPrécisions : ${details}` : ""}\nReçue le : ${date} (heure de Paris)\nSource : site GaspardNZ — Parler à Gaspard\n\nMessage préparé par le client :\n${sanitizeText(lead.message, 2000)}\n\nContacter le prospect sur WhatsApp : ${whatsapp}\nRetrouver la demande dans le CRM : https://gaspardnz.style/admin\n\nLes coordonnées ont été validées sur le site. L’envoi du message WhatsApp par le client n’est pas confirmé.`;
  return {
    subject: sanitizeText(`Nouvelle demande — ${name} — ${project}`, 180),
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7">${text.split("\n").map(escapeHtml).join("<br>")}<p><a href="${whatsapp}" style="display:inline-block;padding:12px 18px;background:#b8973e;color:#1c1208;text-decoration:none">Contacter le prospect sur WhatsApp</a></p></div>`,
  };
}

async function claimNotification(db, lead, recipient, subject) {
  const id = notificationId(lead.id, recipient);
  const row = { id, lead_id: lead.id, provider: "smtp", recipient, subject, template_key: TEMPLATE, status: "queued", metadata: { lead_id: lead.id } };
  const inserted = await db.from("email_messages").insert(row).select("id").single();
  if (!inserted.error) return { id, send: true };
  if (inserted.error.code !== "23505") throw new Error("notification_log_unavailable");
  // The deterministic primary key prevents duplicate sends, including two
  // concurrent requests or a retry after a lost HTTP response.
  const existing = await db.from("email_messages").select("id,status,created_at,updated_at").eq("id", id).single();
  if (existing.error) throw new Error("notification_log_unavailable");
  if (existing.data.status === "sent" || existing.data.status === "delivered") return { id, send: false, sent: true };
  const age = Date.now() - new Date(existing.data.updated_at || existing.data.created_at).getTime();
  if (existing.data.status === "queued" && age < 120_000) return { id, send: false, sent: false };
  // Compare-and-set: only one retry can claim a failed/stale notification.
  const claimed = await db.from("email_messages").update({ status: "queued", updated_at: new Date().toISOString() })
    .eq("id", id).eq("status", existing.data.status).eq("updated_at", existing.data.updated_at).select("id").maybeSingle();
  if (claimed.error) throw new Error("notification_log_unavailable");
  return { id, send: Boolean(claimed.data), sent: false };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAllowedOrigin(req.headers.origin)) return res.status(403).json({ error: "Origin not allowed" });
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => key !== "leadId") || !uuid.test(body.leadId || "")) return res.status(400).json({ error: "Invalid contact request" });
  if (!validateEnv()) return res.status(503).json({ success: false, error: "Email service not configured" });
  const recipients = resolveRecipients({ to: RECIPIENTS });
  if (!recipients.ok) return res.status(503).json({ success: false, error: "Notification recipients not configured" });
  const db = adminDb();
  const ip = sanitizeText(req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown", 200);
  for (const rule of [
    { key: `ip:${ip}`, action: "whatsapp_notification_ip", limit: 8, windowSeconds: 600 },
    { key: "global", action: "whatsapp_notification_global", limit: 120, windowSeconds: 600 },
  ]) {
    const rate = await consumePersistentRateLimit(db, rule);
    if (!rate.ok) return res.status(503).json({ success: false, error: "Anti-abuse protection unavailable" });
    if (!rate.allowed) { res.setHeader("Retry-After", String(rule.windowSeconds)); return res.status(429).json({ success: false, error: "Too many requests" }); }
  }
  try {
    const { data: lead, error } = await db.from("leads").select("id,full_name,phone,request_type,message,metadata,created_at").eq("id", body.leadId).single();
    const age = Date.now() - new Date(lead?.created_at).getTime();
    if (error || !lead || lead.request_type !== "whatsapp_contact" || !Number.isFinite(age) || age > 86400000 || age < -60000) return res.status(404).json({ success: false, error: "Contact unavailable" });
    const content = formatContactNotification(lead);
    const transporter = createTransporter();
    const results = await Promise.allSettled(RECIPIENTS.map(async recipient => {
      const claim = await claimNotification(db, lead, recipient, content.subject);
      if (!claim.send) return claim.sent === true;
      try {
        const info = await transporter.sendMail({ from: process.env.EMAIL_FROM, to: recipient, ...content });
        const accepted = (info.accepted || []).some(email => String(email).toLowerCase() === recipient);
        if (!accepted) throw new Error("SMTP recipient not accepted");
        await updateEmailLog(db, claim.id, { status: "sent", provider_message_id: info.messageId || null, sent_at: new Date().toISOString(), error_message: null, failed_at: null });
        return true;
      } catch (error) {
        await updateEmailLog(db, claim.id, { status: "failed", failed_at: new Date().toISOString(), error_message: sanitizeText(error.message, 1000) });
        console.error("WhatsApp contact notification failed", sanitizeText(error.message, 300));
        return false;
      }
    }));
    if (!results.every(result => result.status === "fulfilled" && result.value === true)) return res.status(502).json({ success: false, error: "Notification email not accepted" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("WhatsApp notification service failed", sanitizeText(error.message, 300));
    return res.status(503).json({ success: false, error: "Notification service unavailable" });
  }
}
