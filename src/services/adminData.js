import { supabase } from "./supabaseClient.js";

const nowIso = () => new Date().toISOString();

export function buildPeriod(days = 7) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const previousTo = new Date(from);
  const previousFrom = new Date(previousTo.getTime() - days * 86400000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    previousFrom: previousFrom.toISOString(),
    previousTo: previousTo.toISOString(),
  };
}

export function percentChange(current = 0, previous = 0) {
  const a = Number(current || 0);
  const b = Number(previous || 0);
  if (b === 0) return a === 0 ? 0 : null;
  return Number((((a - b) / b) * 100).toFixed(1));
}

export async function getDashboardData(days = 7) {
  const period = buildPeriod(days);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const [currentRpc, previousRpc, trafficRpc, leads, activity, integrations, activeVisitors] = await Promise.all([
    supabase.rpc("dashboard_kpis", { p_from: period.from, p_to: period.to }),
    supabase.rpc("dashboard_kpis", { p_from: period.previousFrom, p_to: period.previousTo }),
    supabase.rpc("traffic_sources", { p_from: period.from, p_to: period.to }),
    supabase.from("leads").select("id,full_name,email,phone,request_type,source,channel,status,estimated_value,currency,created_at").gte("created_at", period.from).lt("created_at", period.to).order("created_at", { ascending: false }).limit(8),
    supabase.from("activity_log").select("id,event_type,entity_type,entity_id,title,description,actor_email,created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("integration_settings").select("provider,status,account_label,property_id,stream_id,site_url,last_sync_at,last_error,metadata").order("provider"),
    supabase.from("visitors").select("id", { count: "exact", head: true }).gte("last_seen_at", fiveMinutesAgo),
  ]);

  const firstError = [currentRpc, previousRpc, trafficRpc, leads, activity, integrations, activeVisitors].find((r) => r?.error)?.error;
  if (firstError) throw firstError;

  const current = currentRpc.data || {};
  const previous = previousRpc.data || {};
  const compareKeys = ["visitors", "sessions", "leads", "confirmed_bookings", "customers", "revenue", "whatsapp_clicks"];
  const changes = Object.fromEntries(compareKeys.map((key) => [key, percentChange(current[key], previous[key])]));

  return {
    period,
    current,
    previous,
    changes,
    traffic: trafficRpc.data || [],
    recentLeads: leads.data || [],
    activity: activity.data || [],
    integrations: integrations.data || [],
    activeVisitors: activeVisitors.count || 0,
  };
}

export function subscribeDashboard(onChange) {
  const channel = supabase
    .channel("gnz-admin-dashboard")
    .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "email_messages" }, onChange)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function listLeads({ status = "all", search = "", limit = 100 } = {}) {
  let query = supabase
    .from("leads")
    .select("id,full_name,email,phone,request_type,message,source,channel,campaign,status,estimated_value,currency,assigned_to,metadata,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status !== "all") query = query.eq("status", status);
  if (search.trim()) {
    const q = search.trim().replace(/[,%()]/g, " ");
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateLead(id, patch) {
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().single();
  if (error) throw error;
  await supabase.from("activity_log").insert({
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: id,
    title: "Prospect mis à jour",
    description: data.full_name || data.email || data.phone || "Prospect",
  });
  return data;
}

export async function addLeadNote(leadId, body) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("crm_notes").insert({
    lead_id: leadId,
    body,
    created_by: user?.user?.email || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function listBookings(limit = 100) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id,lead_id,customer_id,provider,external_id,status,starts_at,ends_at,title,notes,source,metadata,created_at,updated_at,leads(full_name,email,phone)")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function updateBooking(id, patch) {
  const { data, error } = await supabase.from("bookings").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function listPromotions() {
  const { data, error } = await supabase.from("promotions").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function savePromotion(input) {
  const payload = {
    title: input.title,
    subtitle: input.subtitle || null,
    description: input.description || null,
    image_url: input.image_url || null,
    cta_label: input.cta_label || null,
    cta_url: input.cta_url || null,
    placement: input.placement || "home",
    status: input.status || "draft",
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    priority: Number(input.priority || 0),
    published: Boolean(input.published),
  };
  const query = input.id
    ? supabase.from("promotions").update(payload).eq("id", input.id)
    : supabase.from("promotions").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  await supabase.from("activity_log").insert({
    event_type: input.id ? "promotion_updated" : "promotion_created",
    entity_type: "promotion",
    entity_id: data.id,
    title: input.id ? "Promotion modifiée" : "Nouvelle promotion",
    description: data.title,
  });
  return data;
}

export async function removePromotion(id) {
  const { error } = await supabase.from("promotions").update({ published: false, status: "archived" }).eq("id", id);
  if (error) throw error;
}

export async function listMedia(section = "all") {
  let query = supabase.from("media_assets").select("*").order("section_key").order("sort_order");
  if (section !== "all") query = query.eq("section_key", section);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function uploadMedia(file, sectionKey, options = {}) {
  const safeName = String(file.name || "media").replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  const storagePath = `${sectionKey}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("site-media").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(storagePath);
  const { data, error } = await supabase.from("media_assets").insert({
    section_key: sectionKey,
    title: options.title || file.name,
    alt_text: options.altText || "",
    media_type: file.type?.startsWith("video/") ? "video" : file.type === "application/pdf" ? "document" : "image",
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    published: options.published !== false,
    sort_order: Number(options.sortOrder || 0),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMedia(asset) {
  if (asset.storage_path) await supabase.storage.from("site-media").remove([asset.storage_path]);
  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) throw error;
}

export async function listEmails(limit = 100) {
  const { data, error } = await supabase
    .from("email_messages")
    .select("id,recipient,subject,provider,provider_message_id,status,error_message,queued_at,sent_at,delivered_at,opened_at,clicked_at,failed_at,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function listContentTable(table) {
  const allowed = new Set(["site_settings", "site_content", "packages", "partners", "news_posts", "vip_clients", "wedding_inspirations", "style_month"]);
  if (!allowed.has(table)) throw new Error("Unsupported content table");
  const { data, error } = await supabase.from(table).select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertRow(table, row, conflict) {
  const allowed = new Set(["site_settings", "site_content", "packages", "partners", "news_posts", "vip_clients", "wedding_inspirations", "style_month"]);
  if (!allowed.has(table)) throw new Error("Unsupported content table");
  const clean = { ...row };
  Object.keys(clean).forEach((key) => clean[key] === undefined && delete clean[key]);
  let query = supabase.from(table).upsert(clean, conflict ? { onConflict: conflict } : undefined);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function getIntegrationSettings() {
  const { data, error } = await supabase.from("integration_settings").select("*").order("provider");
  if (error) throw error;
  return data || [];
}

export async function getGoogleSnapshots(provider, days = 28) {
  const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("external_metric_snapshots")
    .select("provider,metric_date,dimension_key,dimension_value,metrics,fetched_at")
    .eq("provider", provider)
    .gte("metric_date", from)
    .order("metric_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("key,value,is_public,description,updated_at").order("key");
  if (error) throw error;
  return Object.fromEntries((data || []).map((row) => [row.key, row]));
}

export async function saveSiteSetting(key, value, description = "") {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("site_settings").upsert({
    key,
    value,
    description,
    is_public: true,
    updated_at: nowIso(),
    updated_by: user?.user?.email || null,
  }, { onConflict: "key" }).select().single();
  if (error) throw error;
  return data;
}
