/**
 * Vercel Function: Send Partner Contact Email
 * Sends the internal notification + client acknowledgement.
 * SMTP gives us a reliable "accepted/sent" state, not inbox delivery/open tracking.
 */
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const requiredEnvVars = ["EMAIL_FROM", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT"];
const DEFAULT_ALLOWED_RECIPIENTS = ["gaspardnz.contact@gmail.com", "eliebakala@gmail.com"];
const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";

export const sanitizeText = (value, maxLength = 2000) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

export const escapeHtml = (value) =>
  sanitizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeEmail = (value) => sanitizeText(value, 320).toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
const parseCsvEmails = (value) => String(value || "").split(",").map(normalizeEmail).filter(Boolean);

const getAllowedRecipients = () => {
  const configured = parseCsvEmails(process.env.ALLOWED_EMAIL_RECIPIENTS || process.env.EMAIL_TO);
  return new Set(configured.length > 0 ? configured : DEFAULT_ALLOWED_RECIPIENTS);
};

export const resolveRecipients = ({ to = [], cc = [] }) => {
  const allowed = getAllowedRecipients();
  const normalizeList = (list) => Array.isArray(list) ? list.map(normalizeEmail).filter(Boolean) : [];
  const requested = [...normalizeList(to), ...normalizeList(cc)];
  if (requested.length === 0) return { ok: false, error: "Destinataire manquant" };
  if (requested.some((email) => !isValidEmail(email))) return { ok: false, error: "Adresse email invalide" };
  if (requested.some((email) => !allowed.has(email))) return { ok: false, error: "Destinataire non autorisé" };
  return {
    ok: true,
    to: normalizeList(to).filter((email) => allowed.has(email)),
    cc: normalizeList(cc).filter((email) => allowed.has(email)),
  };
};

const getAllowedHosts = () => {
  const configured = String(process.env.ALLOWED_ORIGINS || process.env.SITE_URL || "https://gaspardnz.style")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
  const hosts = new Set(["gaspardnz.style", "www.gaspardnz.style", "gaspardnz.vercel.app"]);
  configured.forEach((origin) => { try { hosts.add(new URL(origin).host); } catch {} });
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL);
  return hosts;
};

export const isAllowedOrigin = (origin) => {
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const host = new URL(origin).host.toLowerCase();
    if (getAllowedHosts().has(host)) return true;
    return host.endsWith(".vercel.app") && host.includes("gaspardnz");
  } catch { return false; }
};

const rateLimitStore = new Map();
const isRateLimited = (key) => {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 8;
  const bucket = rateLimitStore.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  rateLimitStore.set(key, recent);
  return recent.length > maxRequests;
};

const validateEnv = () => requiredEnvVars.every((key) => Boolean(process.env[key]));
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT, 10) === 465,
  auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
});

const adminDb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

async function createEmailLog(db, { recipient, subject, templateKey, metadata }) {
  if (!db) return null;
  const { data, error } = await db.from("email_messages").insert({
    provider: "smtp",
    recipient: normalizeEmail(recipient),
    subject: sanitizeText(subject, 200),
    template_key: templateKey,
    status: "queued",
    metadata: metadata || {},
  }).select("id").single();
  if (error) { console.warn("Email log insert failed", error.message); return null; }
  return data?.id || null;
}

async function updateEmailLog(db, id, patch) {
  if (!db || !id) return;
  const { error } = await db.from("email_messages").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) console.warn("Email log update failed", error.message);
}

const formatInternalEmailBody = (data, isComingSoon) => {
  const header = isComingSoon ? "NOUVELLE DEMANDE PALAIS GROUPE (À finaliser avec le groupe)" : "NOUVELLE DEMANDE DE CONTACT";
  return `${header}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nINFORMATIONS CLIENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNom: ${sanitizeText(data.clientName, 140)}\nEmail: ${sanitizeText(data.clientEmail, 320)}\nTéléphone: ${sanitizeText(data.clientPhone, 80)}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDÉTAILS DE L'ÉVÉNEMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nType d'événement: ${sanitizeText(data.eventType, 140)}\nDate prévue: ${sanitizeText(data.eventDate, 80)}\nPartenaire concerné: ${sanitizeText(data.partnerName || data.partnerId || "Gaspard NZ", 160)}\n\nMessage du client:\n${sanitizeText(data.message, 2000)}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${isComingSoon ? "ACTION REQUISE" : "SUIVI"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${isComingSoon ? "Gaspard doit contacter Palais Groupe directement et finaliser la mise en relation.\nPalais Groupe ne reçoit pas cet email automatique." : "Contacter directement le client pour suite."}\n\nTimestamp: ${new Date(data.timestamp || Date.now()).toLocaleString("fr-FR")}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

const formatClientEmailBody = (data) => `Bonjour ${sanitizeText(data.clientName, 80)},\n\nMerci pour votre demande via Gaspard NZ.\n\nVotre demande a bien été transmise à Gaspard. Il reviendra vers vous rapidement pour qualifier votre besoin et organiser la suite.\n\nRécapitulatif :\n- Partenaire / service : ${sanitizeText(data.partnerName || data.partnerId || "Gaspard NZ", 160)}\n- Type d'événement : ${sanitizeText(data.eventType || "Non précisé", 140)}\n- Date prévue : ${sanitizeText(data.eventDate || "Non précisée", 80)}\n\nSi vous souhaitez ajouter une précision, vous pouvez répondre directement à cet email.\n\nGaspard NZ\nStyliste, habilleur & maître de cérémonie\nhttps://gaspardnz.style`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAllowedOrigin(req.headers.origin)) return res.status(403).json({ error: "Origin not allowed" });

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(clientIp)) return res.status(429).json({ error: "Trop de demandes, réessayez plus tard" });

  const { to, cc, subject, partnerId, partnerName, clientName, clientEmail, clientPhone, eventType, eventDate, message, timestamp, isComingSoon } = req.body || {};
  const recipients = resolveRecipients({ to, cc });
  if (!recipients.ok) return res.status(400).json({ error: recipients.error });
  if (!isValidEmail(clientEmail) || !sanitizeText(clientName, 140)) return res.status(400).json({ error: "Données client incomplètes" });
  if (!validateEnv()) return res.status(503).json({ error: "Email service not configured" });

  const db = adminDb();
  const safeSubject = sanitizeText(subject || "Nouvelle demande de contact", 160);
  const internalRecipient = recipients.to[0];
  const internalLogId = await createEmailLog(db, {
    recipient: internalRecipient,
    subject: safeSubject,
    templateKey: "partner_contact_internal",
    metadata: { cc: recipients.cc, partner_id: partnerId || null, partner_name: partnerName || null },
  });
  const clientLogId = await createEmailLog(db, {
    recipient: clientEmail,
    subject: "Votre demande a bien été reçue - Gaspard NZ",
    templateKey: "partner_contact_client_ack",
    metadata: { partner_id: partnerId || null, partner_name: partnerName || null },
  });

  try {
    const transporter = createTransporter();
    const emailBody = formatInternalEmailBody({ partnerId, partnerName, clientName, clientEmail, clientPhone, eventType, eventDate, message, timestamp }, isComingSoon);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipients.to.join(", "),
      cc: recipients.cc.length ? recipients.cc.join(", ") : undefined,
      subject: safeSubject,
      text: emailBody,
      html: emailBody.split("\n").map(escapeHtml).join("<br>"),
      replyTo: normalizeEmail(clientEmail),
    });
    await updateEmailLog(db, internalLogId, {
      status: "sent",
      provider_message_id: info.messageId || null,
      sent_at: new Date().toISOString(),
      metadata: { cc: recipients.cc, accepted: info.accepted || [], rejected: info.rejected || [], partner_id: partnerId || null },
    });

    const clientBody = formatClientEmailBody({ partnerId, partnerName, clientName, eventType, eventDate });
    const clientInfo = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: normalizeEmail(clientEmail),
      subject: "Votre demande a bien été reçue - Gaspard NZ",
      text: clientBody,
      html: clientBody.split("\n").map(escapeHtml).join("<br>"),
      replyTo: process.env.EMAIL_FROM,
    });
    await updateEmailLog(db, clientLogId, {
      status: "sent",
      provider_message_id: clientInfo.messageId || null,
      sent_at: new Date().toISOString(),
      metadata: { accepted: clientInfo.accepted || [], rejected: clientInfo.rejected || [], partner_id: partnerId || null },
    });

    return res.status(200).json({ success: true, message: "Email envoyé avec succès", messageId: info.messageId, clientMessageId: clientInfo.messageId });
  } catch (error) {
    const failedAt = new Date().toISOString();
    await Promise.all([
      updateEmailLog(db, internalLogId, { status: "failed", error_message: sanitizeText(error?.message || "SMTP error", 1000), failed_at: failedAt }),
      updateEmailLog(db, clientLogId, { status: "failed", error_message: sanitizeText(error?.message || "SMTP error", 1000), failed_at: failedAt }),
    ]);
    console.error("Email error", error?.message || error);
    return res.status(500).json({ success: false, error: "Erreur lors de l'envoi de l'email" });
  }
}
