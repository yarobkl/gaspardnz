import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

/** Admin-only read-only SMTP preflight: no message is sent and secrets are never returned. */
const required = ["EMAIL_FROM","EMAIL_PASSWORD","SMTP_HOST","SMTP_PORT","SUPABASE_SERVICE_ROLE_KEY"];
const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
export const classifySmtpError = (err) => {
  const code = String(err?.code || "").toUpperCase();
  if (Number(err?.responseCode) === 535 || code === "EAUTH") return "authentication_rejected";
  if (code.includes("CERT") || code === "ETLS") return "tls_error";
  if (["ETIMEDOUT","ESOCKET","ECONNECTION","ECONNREFUSED","ENOTFOUND","EAI_AGAIN"].includes(code)) return "network_error";
  return "smtp_error";
};
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée." });
  const authorization = String(req.headers?.authorization || "");
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Connexion administrateur requise." });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: "Diagnostic serveur indisponible." });
  try {
    const db = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data: identity, error: authError } = await db.auth.getUser(token);
    const email = String(identity?.user?.email || "").toLowerCase();
    if (authError || !email) return res.status(401).json({ error: "Session invalide." });
    const { data: admin, error: accessError } = await db.from("admin_access").select("role,active").eq("email",email).eq("active",true).maybeSingle();
    if (accessError || !admin || !["owner","admin"].includes(admin.role)) return res.status(403).json({ error: "Accès administrateur requis." });
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) return res.status(200).json({ smtpStatus:"missing_configuration", missing, emailSent:false });
    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return res.status(200).json({ smtpStatus:"invalid_port", emailSent:false });
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user:process.env.EMAIL_FROM, pass:process.env.EMAIL_PASSWORD },
      connectionTimeout:10000, greetingTimeout:10000, socketTimeout:10000,
    });
    try {
      await transport.verify();
      return res.status(200).json({ smtpStatus:"ready", emailSent:false });
    } catch (err) {
      console.warn("SMTP preflight:",classifySmtpError(err));
      return res.status(200).json({ smtpStatus:classifySmtpError(err), emailSent:false });
    } finally { transport.close?.(); }
  } catch {
    console.error("SMTP preflight internal failure");
    return res.status(503).json({ error:"Diagnostic temporairement indisponible." });
  }
}
