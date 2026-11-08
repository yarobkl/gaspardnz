import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { consumePersistentRateLimit } from "./send-email.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const clean = (value, max = 2000) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const json = (res, status, payload) => res.status(status).setHeader("Cache-Control", "no-store").json(payload);
const db = () => createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

async function getAdmin(req, client) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data } = await client.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: access } = await client.from("admin_access").select("email,role,active").eq("email", email).eq("active", true).maybeSingle();
  return access && ["owner", "admin"].includes(access.role) ? access : null;
}

async function availability(req, res, client) {
  const isAdmin = Boolean(await getAdmin(req, client));
  if (req.method === "GET") {
    const from = clean(req.query?.from || new Date().toISOString().slice(0, 10), 10);
    const select = isAdmin ? "id,service_date,is_open,max_clients,slots,notes" : "id,service_date,is_open,max_clients,slots";
    const { data, error } = await client.from("booking_availability").select(select).gte("service_date", from).order("service_date");
    if (error) throw error;
    const { data: bookings, error: bookingsError } = await client.from("bookings").select("starts_at,status").in("status", ["requested", "confirmed"]).gte("starts_at", `${from}T00:00:00Z`);
    if (bookingsError) throw bookingsError;
    const counts = (bookings || []).reduce((map, booking) => {
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(booking.starts_at));
      map[date] = (map[date] || 0) + 1;
      return map;
    }, {});
    const rows = (data || []).map((item) => ({ ...item, booked_clients: counts[item.service_date] || 0, remaining_clients: Math.max(0, item.max_clients - (counts[item.service_date] || 0)) })).filter((item) => isAdmin || (item.is_open && item.remaining_clients > 0));
    return json(res, 200, { availability: rows });
  }
  if (req.method !== "POST" || !isAdmin) return json(res, 401, { error: "Session administrateur requise" });
  const body = req.body || {};
  const date = clean(body.service_date, 10);
  const maxClients = Number(body.max_clients);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: "Date invalide" });
  if (!Number.isInteger(maxClients) || maxClients < 1 || maxClients > 100) return json(res, 400, { error: "Nombre de clients invalide" });
  const slots = Array.isArray(body.slots) ? body.slots.map((slot) => clean(slot, 5)).filter((slot) => /^\d{2}:\d{2}$/.test(slot)).slice(0, 12) : [];
  if (!slots.length) return json(res, 400, { error: "Au moins un créneau est nécessaire" });
  const { data, error } = await client.from("booking_availability").upsert({ service_date: date, is_open: body.is_open !== false, max_clients: maxClients, slots, notes: clean(body.notes, 500) || null, updated_at: new Date().toISOString() }, { onConflict: "service_date" }).select().single();
  if (error) throw error;
  return json(res, 200, { availability: data });
}

async function requestBooking(req, res, client) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = req.body || {};
  const fields = { full_name: clean(body.full_name, 160), email: clean(body.email, 320).toLowerCase(), phone: clean(body.phone, 80), project: clean(body.project, 160), need: clean(body.need, 1800), service_date: clean(body.service_date, 10), slot: clean(body.slot, 5) };
  if (!fields.full_name || !validEmail(fields.email) || !/^\d{4}-\d{2}-\d{2}$/.test(fields.service_date) || !/^\d{2}:\d{2}$/.test(fields.slot)) return json(res, 400, { error: "Merci de compléter les informations demandées" });
  const ip = clean(req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown", 200);
  for (const rule of [{ key: `booking-ip:${ip}`, action: "booking_request_ip", limit: 6, windowSeconds: 600 }, { key: `booking-email:${fields.email}`, action: "booking_request_email", limit: 4, windowSeconds: 3600 }]) {
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

async function confirmBooking(req, res, client) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!await getAdmin(req, client)) return json(res, 401, { error: "Session administrateur requise" });
  const bookingId = clean(req.body?.booking_id, 80);
  if (!bookingId) return json(res, 400, { error: "Réservation manquante" });
  const { data: booking, error: bookingError } = await client.from("bookings").select("id,status,starts_at,ends_at,title,notes,lead_id,leads(full_name,email,phone)").eq("id", bookingId).single();
  if (bookingError || !booking) return json(res, 404, { error: "Réservation introuvable" });
  const lead = booking.leads;
  if (!lead?.email) return json(res, 400, { error: "Le client n’a pas d’adresse email" });
  if (booking.status === "confirmed") return json(res, 200, { ok: true, booking: { id: booking.id, status: booking.status, starts_at: booking.starts_at, ends_at: booking.ends_at }, email_sent: false, already_confirmed: true });
  const { data: updated, error: updateError } = await client.from("bookings").update({ status: "confirmed", updated_at: new Date().toISOString() }).eq("id", bookingId).select("id,status,starts_at,ends_at").single();
  if (updateError) return json(res, 500, { error: "Impossible de confirmer la réservation" });
  const configured = Boolean(process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD && process.env.SMTP_HOST && process.env.SMTP_PORT);
  if (configured) {
    try {
      const start = new Date(booking.starts_at);
      const date = start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
      const time = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
      const address = clean(process.env.SHOWROOM_ADDRESS || "L’adresse du showroom vous sera communiquée directement par GaspardNZ.", 500);
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD } });
      await transporter.sendMail({ from: process.env.EMAIL_FROM, to: lead.email, subject: "Votre rendez-vous GaspardNZ est confirmé", text: `Bonjour ${clean(lead.full_name, 160)},\n\nVotre rendez-vous avec GaspardNZ est confirmé.\n\nDate : ${date}\nHeure : ${time}\nLieu : ${address}\n\nPour toute question, répondez à cet email.\n\nGaspardNZ\nS’habiller autrement.` });
    } catch (emailError) { console.error("Confirmation email error", emailError); return json(res, 200, { ok: true, booking: updated, warning: "Rendez-vous confirmé, mais l’email n’a pas pu être envoyé.", email_sent: false }); }
  }
  return json(res, 200, { ok: true, booking: updated, email_sent: configured });
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: "Service indisponible" });
  const client = db();
  try {
    const route = clean(req.query?.route || req.body?.route, 30);
    if (route === "availability") return await availability(req, res, client);
    if (route === "request") return await requestBooking(req, res, client);
    if (route === "confirm") return await confirmBooking(req, res, client);
    return json(res, 404, { error: "Route de réservation inconnue" });
  } catch (error) {
    console.error("Booking API error", error);
    return json(res, 500, { error: "Erreur interne du service de réservation" });
  }
}
