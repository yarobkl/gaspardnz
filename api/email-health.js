// Accessible uniquement à un administrateur authentifié.
// Effectue un SMTP VERIFY (sans envoyer de message et sans exposer de secrets).
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const REQUIRED_ENV = ["EMAIL_FROM", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT", "SUPABASE_SERVICE_ROLE_KEY"];
const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const reply = (res, status, body) => res.status(status).setHeader("Cache-Control", "no-store").json(body);

export default async function handler(req, res) {
  if (req.method !== "GET") return reply(res, 405, { ok: false, reason: "Method not allowed" });
  const authorization = String(req.headers?.authorization || "");
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(res, 401, { ok: false, reason: "Accès administrateur requis" });
  try {
    const db = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth?.user?.email) return reply(res, 401, { ok: false, reason: "Session invalide" });
    const { data: access, error: accessError } = await db.from("admin_access")
      .select("active,role").eq("email", auth.user.email.toLowerCase()).eq("active", true).maybeSingle();
    if (accessError || !access || !["admin", "owner"].includes(access.role)) return reply(res, 403, { ok: false, reason: "Compte non autorisé" });

    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
    if (missing.length) return reply(res, 503, { ok: false, reason: "Configuration du serveur incomplète", missing });

    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return reply(res, 503, { ok: false, reason: "Port SMTP invalide" });
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    try {
      await transporter.verify();
      return reply(res, 200, { ok: true, reason: "Connexion et authentification SMTP acceptées" });
    } catch (error) {
      // Ne jamais afficher error.message : certains pilotes incluent les identifiants.
      const smtpCode = Number.isInteger(error?.responseCode) ? error.responseCode : null;
      const reason = smtpCode === 535 ? "Identifiants SMTP refusés par le serveur"
        : error?.code === "ETIMEDOUT" ? "Connexion SMTP expirée"
        : "Connexion SMTP impossible";
      return reply(res, 503, { ok: false, reason, smtpCode });
    } finally {
      transporter.close?.();
    }
  } catch {
    return reply(res, 503, { ok: false, reason: "Diagnostic serveur indisponible" });
  }
}
