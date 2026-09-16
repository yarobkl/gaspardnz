/**
 * Vercel Function: Stripe Webhook — confirmation d'achat du lookbook
 *
 * Reçoit checkout.session.completed depuis Stripe, vérifie la signature,
 * puis envoie au client l'email contenant le lien du PDF actuellement déposé
 * dans l'admin (site_settings.lookbook.pdf_url — voir AdminContent.jsx).
 *
 * La signature Stripe est la SEULE preuve d'authenticité de cet endpoint :
 * contrairement à api/send-email.js (formulaire public), il n'y a ici ni
 * honeypot ni limite de fréquence anti-bot, parce qu'un visiteur normal
 * n'atteint jamais cette route — seul Stripe, muni du secret partagé, peut
 * produire une signature valide. Une signature absente ou invalide est
 * refusée avant toute autre lecture de la requête.
 *
 * Prérequis (non configurés tant que Gaspard n'a pas de compte Stripe) :
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * Réutilisés depuis l'infrastructure email existante :
 *   EMAIL_FROM, EMAIL_PASSWORD, SMTP_HOST, SMTP_PORT, SUPABASE_SERVICE_ROLE_KEY
 */
import getRawBody from "raw-body";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const TEMPLATE_KEY = "lookbook_purchase";

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT, 10) === 465,
  auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
});

const adminDb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const formatLookbookEmailBody = (pdfUrl) =>
  `Bonjour,\n\nMerci pour votre achat du Lookbook Gaspard NZ !\n\nVous pouvez le télécharger ici :\n${pdfUrl}\n\nSi le lien ne fonctionne pas, répondez directement à cet email.\n\nGaspard NZ\nStyliste, habilleur & maître de cérémonie\nhttps://gaspardnz.style`;

// Ne bloque que sur un envoi déjà RÉUSSI : une tentative précédemment échouée
// (SMTP indisponible, etc.) ne doit jamais empêcher la relance de Stripe
// d'aboutir — sinon un client ayant payé pourrait ne jamais rien recevoir.
async function alreadySent(db, sessionId) {
  if (!db || !sessionId) return false;
  const { data } = await db.from("email_messages").select("id")
    .eq("template_key", TEMPLATE_KEY).eq("status", "sent")
    .contains("metadata", { stripe_session_id: sessionId }).limit(1);
  return Boolean(data?.length);
}

async function logEmail(db, { recipient, sessionId, status, providerMessageId, errorMessage }) {
  if (!db) return;
  const now = new Date().toISOString();
  await db.from("email_messages").insert({
    provider: "smtp",
    recipient,
    subject: "Votre lookbook Gaspard NZ",
    template_key: TEMPLATE_KEY,
    status,
    provider_message_id: providerMessageId || null,
    error_message: errorMessage || null,
    sent_at: status === "sent" ? now : null,
    failed_at: status === "failed" ? now : null,
    metadata: { stripe_session_id: sessionId },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecretKey) {
    console.error("Webhook Stripe appelé mais non configuré (clés manquantes)");
    return res.status(503).json({ error: "Webhook not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).json({ error: "Missing signature" });

  let rawBody;
  try { rawBody = await getRawBody(req); }
  catch { return res.status(400).json({ error: "Invalid request body" }); }

  const stripe = new Stripe(stripeSecretKey);
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.warn("Signature Stripe invalide", err?.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // On répond vite et on ignore poliment le reste : Stripe envoie de
  // nombreux types d'évènements sur le même endpoint si on n'en filtre pas
  // la souscription précisément dans le tableau de bord.
  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) {
    console.error("checkout.session.completed sans email client", session.id);
    return res.status(200).json({ received: true, error: "missing_email" });
  }

  const db = adminDb();

  if (await alreadySent(db, session.id)) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  const { data: settingRow } = db
    ? await db.from("site_settings").select("value").eq("key", "lookbook").maybeSingle()
    : { data: null };
  const pdfUrl = settingRow?.value?.pdf_url;
  if (!pdfUrl) {
    console.error("Paiement reçu mais aucun PDF déposé dans l'admin", session.id);
    await logEmail(db, { recipient: customerEmail, sessionId: session.id, status: "failed", errorMessage: "Aucun PDF déposé côté admin" });
    // 200, pas 500 : ce n'est pas transitoire, une relance de Stripe ne
    // réglera rien tant que Gaspard n'a pas déposé de fichier.
    return res.status(200).json({ received: true, error: "no_pdf_configured" });
  }

  try {
    const transporter = createTransporter();
    const body = formatLookbookEmailBody(pdfUrl);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: "Votre lookbook Gaspard NZ",
      text: body,
      html: body.split("\n").map(escapeHtml).join("<br>"),
      replyTo: process.env.EMAIL_FROM,
    });
    await logEmail(db, { recipient: customerEmail, sessionId: session.id, status: "sent", providerMessageId: info.messageId });
    return res.status(200).json({ received: true, sent: true });
  } catch (err) {
    await logEmail(db, { recipient: customerEmail, sessionId: session.id, status: "failed", errorMessage: err?.message });
    console.error("Envoi du lookbook échoué", err?.message);
    // 500 : Stripe réessaiera plus tard — voulu si l'échec est transitoire
    // (SMTP momentanément indisponible).
    return res.status(500).json({ error: "Email send failed" });
  }
}
