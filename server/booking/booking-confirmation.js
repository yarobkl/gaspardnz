import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const clean = (value, max = 2000) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const json = (res, status, payload) => res.status(status).setHeader("Cache-Control", "no-store").json(payload);

const getAdmin = async (req, db) => {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: access } = await db.from("admin_access").select("email,role,active").eq("email", email).eq("active", true).maybeSingle();
  return access && ["owner", "admin"].includes(access.role) ? access : null;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: "Service indisponible" });
  const db = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  if (!await getAdmin(req, db)) return json(res, 401, { error: "Session administrateur requise" });
  const bookingId = clean(req.body?.booking_id, 80);
  if (!bookingId) return json(res, 400, { error: "Réservation manquante" });

  const { data: booking, error: bookingError } = await db.from("bookings").select("id,status,starts_at,ends_at,title,notes,lead_id,leads(full_name,email,phone)").eq("id", bookingId).single();
  if (bookingError || !booking) return json(res, 404, { error: "Réservation introuvable" });
  const lead = booking.leads;
  if (!lead?.email) return json(res, 400, { error: "Le client n’a pas d’adresse email" });
  if (booking.status === "confirmed") return json(res, 200, { ok: true, booking: { id: booking.id, status: booking.status, starts_at: booking.starts_at, ends_at: booking.ends_at }, email_sent: false, already_confirmed: true });
  const { data: updated, error: updateError } = await db.from("bookings").update({ status: "confirmed", updated_at: new Date().toISOString() }).eq("id", bookingId).select("id,status,starts_at,ends_at").single();
  if (updateError) return json(res, 500, { error: "Impossible de confirmer la réservation" });

  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD && process.env.SMTP_HOST && process.env.SMTP_PORT) {
    try {
      const start = new Date(booking.starts_at);
      const date = start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
      const time = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
      const address = clean(process.env.SHOWROOM_ADDRESS || "L’adresse du showroom vous sera communiquée directement par GaspardNZ.", 500);
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD } });
      await transporter.sendMail({ from: process.env.EMAIL_FROM, to: lead.email, subject: "Votre rendez-vous GaspardNZ est confirmé", text: `Bonjour ${clean(lead.full_name, 160)},\n\nVotre rendez-vous avec GaspardNZ est confirmé.\n\nDate : ${date}\nHeure : ${time}\nLieu : ${address}\n\nPour toute question, répondez à cet email.\n\nGaspardNZ\nS’habiller autrement.` });
    } catch (emailError) {
      console.error("Confirmation email error", emailError);
      return json(res, 200, { ok: true, booking: updated, warning: "Rendez-vous confirmé, mais l’email n’a pas pu être envoyé." });
    }
  }
  return json(res, 200, { ok: true, booking: updated, email_sent: Boolean(process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD && process.env.SMTP_HOST && process.env.SMTP_PORT) });
}
