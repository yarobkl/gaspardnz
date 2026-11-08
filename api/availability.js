import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const clean = (value, max = 2000) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const json = (res, status, payload) => res.status(status).setHeader("Cache-Control", "no-store").json(payload);
const db = () => createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function admin(req, client) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data } = await client.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: access } = await client.from("admin_access").select("email,role,active").eq("email", email).eq("active", true).maybeSingle();
  return access && ["owner", "admin"].includes(access.role) ? access : null;
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: "Service indisponible" });
  const client = db();
  try {
    const isAdmin = Boolean(await admin(req, client));
    if (req.method === "GET") {
      const from = clean(req.query?.from || new Date().toISOString().slice(0, 10), 10);
      const select = isAdmin ? "id,service_date,is_open,max_clients,slots,notes" : "id,service_date,is_open,max_clients,slots";
      const { data, error } = await client.from("booking_availability").select(select).gte("service_date", from).order("service_date");
      if (error) throw error;
      const dates = (data || []).map((item) => item.service_date);
      const { data: bookings, error: bookingsError } = dates.length
        ? await client.from("bookings").select("starts_at,status").in("status", ["requested", "confirmed"]).gte("starts_at", `${from}T00:00:00Z`)
        : { data: [], error: null };
      if (bookingsError) throw bookingsError;
      const counts = (bookings || []).reduce((map, booking) => {
        const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(booking.starts_at));
        map[date] = (map[date] || 0) + 1;
        return map;
      }, {});
      const availability = (data || []).map((item) => ({ ...item, booked_clients: counts[item.service_date] || 0, remaining_clients: Math.max(0, item.max_clients - (counts[item.service_date] || 0)) })).filter((item) => isAdmin || (item.is_open && item.remaining_clients > 0));
      return json(res, 200, { availability });
    }
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    if (!isAdmin) return json(res, 401, { error: "Session administrateur requise" });
    const body = req.body || {};
    const date = clean(body.service_date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: "Date invalide" });
    const maxClients = Number(body.max_clients);
    if (!Number.isInteger(maxClients) || maxClients < 1 || maxClients > 100) return json(res, 400, { error: "Nombre de clients invalide" });
    const payload = {
      service_date: date,
      is_open: body.is_open !== false,
      max_clients: maxClients,
      slots: Array.isArray(body.slots) ? body.slots.map((slot) => clean(slot, 5)).filter((slot) => /^\d{2}:\d{2}$/.test(slot)).slice(0, 12) : [],
      notes: clean(body.notes, 500) || null,
      updated_at: new Date().toISOString(),
    };
    if (!payload.slots.length) return json(res, 400, { error: "Au moins un créneau est nécessaire" });
    const { data, error } = await client.from("booking_availability").upsert(payload, { onConflict: "service_date" }).select().single();
    if (error) throw error;
    return json(res, 200, { availability: data });
  } catch (error) {
    console.error("Availability error", error);
    return json(res, 500, { error: "Impossible de gérer les disponibilités" });
  }
}
