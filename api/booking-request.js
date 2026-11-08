import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { consumePersistentRateLimit } from "./send-email.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const clean = (value, max = 2000) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const json = (res, status, payload) => res.status(status).setHeader("Cache-Control", "no-store").json(payload);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = req.body || {};
  const fields = { full_name: clean(body.full_name, 160), email: clean(body.email, 320).toLowerCase(), phone: clean(body.phone, 80), project: clean(body.project, 160), need: clean(body.need, 1800), service_date: clean(body.service_date, 10), slot: clean(body.slot, 5) };
  if (!fields.full_name || !validEmail(fields.email) || !/^\d{4}-\d{2}-\d{2}$/.test(fields.service_date) || !/^\d{2}:\d{2}$/.test(fields.slot)) return json(res, 400, { error: "Merci de compléter les informations demandées" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: "Service indisponible" });
  const client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const ip = clean(req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown", 200);
  for (const rule of [
    { key: `booking-ip:${ip}`, action: "booking_request_ip", limit: 6, windowSeconds: 600 },
    { key: `booking-email:${fields.email}`, action: "booking_request_email", limit: 4, windowSeconds: 3600 },
  ]) {
    const result = await consumePersistentRateLimit(client, rule);
    if (!result.ok) return json(res, 503, { error: "Protection anti-abus temporairement indisponible" });
    if (!result.allowed) return json(res, 429, { error: "Trop de demandes, réessayez plus tard" });
  }
  const { data, error } = await client.rpc("create_booking_request", { p_full_name: fields.full_name, p_email: fields.email, p_phone: fields.phone || null, p_project: fields.project || null, p_need: fields.need || null, p_service_date: fields.service_date, p_slot: fields.slot });
  if (error || !data?.ok) return json(res, 409, { error: data?.error || "Ce créneau n’est plus disponible" });

  const gaspard = process.env.GASPARD_BOOKING_EMAIL || "gaspardnz.contact@gmail.com";
  const admin = process.env.ADMIN_BOOKING_EMAIL || "eliebakala@gmail.com";
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD && process.env.SMTP_HOST && process.env.SMTP_PORT) {
    try {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD } });
      await transporter.sendMail({ from: process.env.EMAIL_FROM, to: gaspard, cc: admin, replyTo: fields.email, subject: `Nouvelle demande showroom — ${fields.full_name}`, text: `Nouvelle demande de rendez-vous showroom\n\nClient : ${fields.full_name}\nEmail : ${fields.email}\nTéléphone : ${fields.phone || "Non précisé"}\nDate demandée : ${fields.service_date}\nCréneau : ${fields.slot}\nProjet : ${fields.project || "Non précisé"}\nBesoin : ${fields.need || "Non précisé"}\n\nStatut : en attente de confirmation manuelle.` });
    } catch (emailError) { console.error("Booking email error", emailError); }
  }
  return json(res, 200, { ok: true, booking_id: data.booking_id, message: "Votre demande a bien été envoyée. Elle sera confirmée manuellement." });
}
