import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const json = (res, status, payload) => res.status(status).setHeader("Cache-Control", "no-store").json(payload);
const clean = (value, max = 1000) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function serverDb() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
}

async function requireAdmin(req, db) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: access } = await db.from("admin_access").select("email,role,active").eq("email", email).eq("active", true).maybeSingle();
  return access ? { email, role: access.role } : null;
}

async function calendlyFetch(path, token) {
  const response = await fetch(path.startsWith("http") ? path : `https://api.calendly.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.title || `Calendly API ${response.status}`);
  return payload;
}

const uuidFromUri = (uri) => String(uri || "").split("/").filter(Boolean).pop() || null;

async function listScheduledEvents(token, organization, days) {
  const from = new Date(Date.now() - 30 * 86400000).toISOString();
  const to = new Date(Date.now() + Math.max(30, Math.min(Number(days || 180), 365)) * 86400000).toISOString();
  let url = `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(organization)}&min_start_time=${encodeURIComponent(from)}&max_start_time=${encodeURIComponent(to)}&count=100`;
  const all = [];
  for (let page = 0; page < 20 && url; page += 1) {
    const payload = await calendlyFetch(url, token);
    all.push(...(payload.collection || []));
    url = payload.pagination?.next_page || null;
  }
  return all;
}

async function listInvitees(token, eventUri) {
  const eventUuid = uuidFromUri(eventUri);
  if (!eventUuid) return [];
  let url = `https://api.calendly.com/scheduled_events/${encodeURIComponent(eventUuid)}/invitees?count=100`;
  const all = [];
  for (let page = 0; page < 10 && url; page += 1) {
    const payload = await calendlyFetch(url, token);
    all.push(...(payload.collection || []));
    url = payload.pagination?.next_page || null;
  }
  return all;
}

async function upsertLead(db, invitee, event) {
  const email = clean(invitee?.email, 320).toLowerCase();
  const name = clean(invitee?.name, 200);
  let existing = null;
  if (email) {
    const { data } = await db.from("leads").select("id,status,metadata").ilike("email", email).order("created_at", { ascending:false }).limit(1).maybeSingle();
    existing = data || null;
  }
  if (existing?.id) {
    const patch = { updated_at:new Date().toISOString(), metadata:{ ...(existing.metadata || {}), calendly_invitee_uri:invitee.uri, calendly_event_uri:event.uri } };
    if (!["client","lost","archived"].includes(existing.status)) patch.status = "appointment";
    const { data, error } = await db.from("leads").update(patch).eq("id", existing.id).select("id").single();
    if (error) throw error;
    return data.id;
  }
  const { data, error } = await db.from("leads").insert({
    full_name:name || null,
    email:email || null,
    phone:clean(invitee?.text_reminder_number || invitee?.questions_and_answers?.find?.((q) => /phone|téléphone/i.test(q.question || ""))?.answer, 80) || null,
    request_type:"Rendez-vous Calendly",
    message:clean(invitee?.questions_and_answers?.map?.((q) => `${q.question}: ${q.answer}`).join(" · "), 2000) || null,
    source:"Calendly",
    channel:"booking",
    status:"appointment",
    metadata:{ calendly_invitee_uri:invitee?.uri || null, calendly_event_uri:event?.uri || null, calendly_status:invitee?.status || null },
  }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function upsertBooking(db, event, invitee, leadId) {
  const eventId = uuidFromUri(event.uri);
  if (!eventId) return null;
  const inviteeId = uuidFromUri(invitee?.uri);
  const externalId = inviteeId ? `${eventId}:${inviteeId}` : eventId;
  const status = event.status === "canceled" || invitee?.status === "canceled" ? "cancelled" : "confirmed";
  const payload = {
    lead_id:leadId || null,
    provider:"calendly",
    external_id:externalId,
    status,
    starts_at:event.start_time || null,
    ends_at:event.end_time || null,
    title:clean(event.name || "Rendez-vous Calendly", 240),
    source:"Calendly",
    metadata:{ event_uri:event.uri || null, invitee_uri:invitee?.uri || null, invitee_email:invitee?.email || null, invitee_name:invitee?.name || null, event_type:event.event_type || null, location:event.location || null, calendly_status:event.status || null },
  };
  const { data: existing, error: findError } = await db.from("bookings").select("id").eq("provider","calendly").eq("external_id",externalId).maybeSingle();
  if (findError) throw findError;
  if (existing?.id) {
    const { data, error } = await db.from("bookings").update(payload).eq("id",existing.id).select("id").single();
    if (error) throw error;
    return data?.id || null;
  }
  const { data, error } = await db.from("bookings").insert(payload).select("id").single();
  if (error) throw error;
  return data?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error:"Method not allowed" });
  try {
    const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
    if (!token) return json(res, 503, { error:"Calendly n'est pas encore autorisé : CALENDLY_PERSONAL_ACCESS_TOKEN manquant." });
    const db = serverDb();
    const admin = await requireAdmin(req, db);
    if (!admin) return json(res, 401, { error:"Session administrateur requise" });

    const me = await calendlyFetch("/users/me", token);
    const user = me?.resource || {};
    const organization = user.current_organization;
    if (!organization) throw new Error("Organisation Calendly introuvable.");

    const events = await listScheduledEvents(token, organization, req.body?.days || 180);
    let bookings = 0;
    let leads = 0;
    for (const event of events) {
      const invitees = await listInvitees(token, event.uri);
      if (!invitees.length) {
        await upsertBooking(db, event, null, null);
        bookings += 1;
        continue;
      }
      for (const invitee of invitees) {
        const leadId = await upsertLead(db, invitee, event);
        leads += leadId ? 1 : 0;
        await upsertBooking(db, event, invitee, leadId);
        bookings += 1;
      }
    }

    await db.from("integration_settings").upsert({
      provider:"calendly",
      status:"connected",
      account_label:clean(user.name || user.email || "Calendly", 200),
      property_id:uuidFromUri(user.uri),
      site_url:user.scheduling_url || "https://calendly.com/gaspardnz",
      last_sync_at:new Date().toISOString(),
      last_error:null,
      metadata:{ organization_uri:organization, user_uri:user.uri || null, email:user.email || null },
      updated_at:new Date().toISOString(),
    }, { onConflict:"provider" });

    return json(res, 200, { ok:true, events:events.length, bookings, leads, account:user.name || user.email || null });
  } catch (error) {
    try {
      const db = serverDb();
      await db.from("integration_settings").update({ status:"error", last_error:clean(error?.message || error, 1000), updated_at:new Date().toISOString() }).eq("provider","calendly");
    } catch {}
    return json(res, 500, { error:error?.message || "Synchronisation Calendly impossible" });
  }
}