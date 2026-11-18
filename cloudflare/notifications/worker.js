import { createClient } from "@supabase/supabase-js";
import { ensureCampaignNews, campaignDestination } from "../../server/notifications/campaign-news.js";
import { safeNotificationUrl } from "../../src/utils/notificationLinks.js";

// Same contracts as the existing /api/notifications/* Vercel routes.
// This Worker never receives Apple or Supabase secrets from a browser.
const publicOrigin = "https://gaspardnz.style";
const allowedOrigins = new Set([
  publicOrigin,
  "https://www.gaspardnz.style",
  "capacitor://localhost",
  "http://localhost",
  // Exact Vercel preview hosts for the Cloudflare/APNs validation branch.
  // Keep this list restricted: it protects the admin API from arbitrary web origins.
  "https://gaspardnz-git-feature-gnz-cloudflare-t-b09b34-yarobkls-projects.vercel.app",
  "https://gaspardnz-cg881f7ry-yarobkls-projects.vercel.app",
]);
const categories = new Set(["arrivage", "promotion", "evenement", "showroom", "service", "actualite", "rappel", "personnalise"]);
const uuid = value => typeof value === "string" && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
const deviceTokenValid = value => typeof value === "string" && /^[\da-f]{64,}$/i.test(value);
let cachedApnsToken = null;
let cachedApnsUntil = 0;
let cachedApnsKeyId = null;

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function client(env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase secret missing");
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authorized(request, db, roles = ["owner", "admin"]) {
  const token = request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;
  const { data, error } = await db.auth.getUser(token);
  const email = !error && data?.user?.email?.toLowerCase();
  if (!email) return false;
  const { data: access } = await db.from("admin_access").select("role,active").eq("email", email).maybeSingle();
  return access?.active === true && roles.includes(access.role);
}

function base64url(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i++) result += String.fromCharCode(bytes[i]);
  return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function apnsJwt(env) {
  if (!env.APNS_PRIVATE_KEY || !env.APNS_KEY_ID || !(env.APNS_ISSUER_ID || env.APPLE_TEAM_ID)) {
    throw new Error("APNs secrets missing");
  }
  if (cachedApnsToken && cachedApnsKeyId === env.APNS_KEY_ID && Date.now() < cachedApnsUntil) return cachedApnsToken;
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: env.APNS_KEY_ID })));
  const payload = base64url(new TextEncoder().encode(JSON.stringify({ iss: env.APNS_ISSUER_ID || env.APPLE_TEAM_ID, iat: now })));
  const message = `${header}.${payload}`;
  const pem = env.APNS_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const decoded = atob(pem);
  const keyBytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyBytes, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(message)));
  cachedApnsToken = `${message}.${base64url(signature)}`;
  cachedApnsUntil = Date.now() + 40 * 60_000;
  cachedApnsKeyId = env.APNS_KEY_ID;
  return cachedApnsToken;
}

async function sendApns(env, { deviceToken, title, body, url, newsSlug }) {
  if (!deviceTokenValid(deviceToken)) throw new Error("Invalid iOS token");
  const host = env.APNS_ENVIRONMENT === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  // Cloudflare's fetch transport negotiates with Apple's HTTPS endpoint.
  // Must be validated with a real APNs 200 response before production cutover.
  const response = await fetch(`https://${host}/3/device/${deviceToken}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${await apnsJwt(env)}`,
      "apns-topic": env.APNS_BUNDLE_ID || "com.gaspardnz.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aps: { alert: { title, body }, sound: "default" },
      ...(url ? { url } : {}),
      ...(newsSlug ? { news_slug: newsSlug } : {}),
    }),
  });
  return { ok: response.status === 200, status: response.status, reason: (await response.text()).slice(0, 400) };
}

async function subscription(request, db, body) {
  if (!["POST", "DELETE"].includes(request.method)) return reply({ error: "Méthode non autorisée" }, 405);
  if (!deviceTokenValid(body.deviceToken)) return reply({ error: "Appareil invalide" }, 400);
  if (request.method === "DELETE") {
    const { error } = await db.from("push_subscriptions").update({ marketing_opt_in: false, revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("provider_subscription_id", body.deviceToken).eq("provider", "apns");
    return error ? reply({ error: "Désactivation impossible" }, 503) : reply({ active: false });
  }
  if (body.consent !== true) return reply({ error: "Consentement requis" }, 400);
  const now = new Date().toISOString();
  const { error } = await db.from("push_subscriptions").upsert({
    provider: "apns", provider_subscription_id: body.deviceToken, platform: "ios",
    marketing_opt_in: true, consented_at: now, revoked_at: null, updated_at: now,
  }, { onConflict: "provider_subscription_id" });
  return error ? reply({ error: "Activation impossible" }, 503) : reply({ active: true });
}

async function campaigns(request, db, body) {
  if (!(await authorized(request, db, ["owner", "admin", "editor"]))) return reply({ error: "Accès administrateur refusé" }, 403);
  if (request.method === "GET") {
    const { data, error } = await db.from("notification_campaigns").select("id,category,title,body,image_url,target_url,audience,status,scheduled_at,sent_at,created_at").order("created_at", { ascending: false }).limit(100);
    const { count } = await db.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("provider", "apns").eq("marketing_opt_in", true).is("revoked_at", null);
    return error ? reply({ error: "Table notifications indisponible" }, 503) : reply({ campaigns: data, subscribers: count ?? 0 });
  }
  if (request.method !== "POST") return reply({ error: "Méthode non autorisée" }, 405);
  if (body.source_news_id !== undefined) {
    if (!uuid(body.source_news_id)) return reply({ error: "Actualité invalide" }, 400);
    const { data: article, error: articleError } = await db.from("news_posts").select("id,slug,title,excerpt,body,cover_url,published").eq("id", body.source_news_id).eq("published", true).maybeSingle();
    if (articleError || !article) return reply({ error: "Actualité publiée introuvable" }, 404);
    const { data: existing } = await db.from("notification_campaigns").select("id,status").eq("id", article.id).maybeSingle();
    if (existing) return reply({ campaign: existing, already_exists: true });
    const { data, error } = await db.from("notification_campaigns").insert({
      id: article.id, category: "actualite", title: article.title.slice(0, 120),
      body: String(article.excerpt || article.body || article.title).trim().slice(0, 500),
      image_url: article.cover_url, target_url: `${publicOrigin}/actualites?article=${encodeURIComponent(article.slug)}`,
      audience: "opted_in", status: "draft",
    }).select("id,status").single();
    if (error?.code === "23505") return reply({ campaign: { id: article.id, status: "sending" }, already_exists: true });
    return error ? reply({ error: "Campagne de cette actualité indisponible" }, 503) : reply({ campaign: data }, 201);
  }
  const title = String(body.title || "").trim(), message = String(body.body || "").trim();
  if (!categories.has(body.category) || !title || title.length > 120 || !message || message.length > 500) return reply({ error: "Catégorie, titre ou message invalide" }, 400);
  if (body.audience && body.audience !== "opted_in") return reply({ error: "Audience non autorisée" }, 400);
  const target = body.target_url ? safeNotificationUrl(body.target_url) : null;
  if (body.target_url && (!target || target.length > 2048)) return reply({ error: "Lien HTTPS invalide" }, 400);
  let image = null;
  if (body.image_url) {
    try {
      const url = new URL(body.image_url, publicOrigin);
      if (url.protocol !== "https:" || !["gaspardnz.style", "www.gaspardnz.style"].includes(url.hostname)) throw new Error();
      image = url.href;
    } catch { return reply({ error: "Image hors du site interdite" }, 400); }
  }
  const status = String(body.status || "draft");
  if (!["draft", "scheduled"].includes(status)) return reply({ error: "Statut invalide" }, 400);
  const scheduled = status === "scheduled" ? new Date(body.scheduled_at || "") : null;
  if (scheduled && (!Number.isFinite(scheduled.getTime()) || scheduled.getTime() < Date.now() + 60_000)) return reply({ error: "Date invalide" }, 400);
  const { data, error } = await db.from("notification_campaigns").insert({
    category: body.category, title, body: message, image_url: image,
    target_url: target, audience: "opted_in", status, scheduled_at: scheduled?.toISOString() || null,
  }).select("id,status").single();
  return error ? reply({ error: "Impossible d'enregistrer la campagne" }, 503) : reply({ campaign: data }, 201);
}

async function sendCampaign(request, env, db, body) {
  if (request.method !== "POST") return reply({ error: "Méthode non autorisée" }, 405);
  if (!(await authorized(request, db))) return reply({ error: "Accès refusé" }, 403);
  if (!uuid(body.id)) return reply({ error: "Campagne invalide" }, 400);
  const { data: campaign, error: campaignError } = await db.from("notification_campaigns").select("id,category,title,body,image_url,target_url,status,created_at").eq("id", body.id).maybeSingle();
  if (campaignError || !campaign) return reply({ error: "Campagne introuvable" }, 404);
  if (!["draft", "sending"].includes(campaign.status)) return reply({ error: "Campagne déjà terminée" }, 409);
  if (campaign.status === "draft") {
    const { data: claim, error } = await db.from("notification_campaigns").update({ status: "sending" }).eq("id", body.id).eq("status", "draft").select("id").maybeSingle();
    if (error || !claim) return reply({ error: "Campagne déjà prise en charge" }, 409);
  }
  let article;
  try { article = await ensureCampaignNews(db, campaign); }
  catch (error) { return reply({ error: error.message }, 503); }
  const { data: subscribers, error: subscriberError } = await db.from("push_subscriptions").select("id,provider_subscription_id").eq("provider", "apns").eq("platform", "ios").eq("marketing_opt_in", true).is("revoked_at", null).order("id");
  if (subscriberError) return reply({ error: "Abonnements indisponibles" }, 503);
  if (!subscribers?.length) {
    await db.from("notification_campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", body.id).eq("status", "sending");
    return reply({ sent: 0, failed: 0, remaining: 0, published: true, message: "Actualité publiée. Aucun iPhone abonné." });
  }
  const { data: deliveries, error: deliveryError } = await db.from("notification_deliveries").select("subscription_id,status").eq("campaign_id", body.id);
  if (deliveryError) return reply({ error: "Suivi des envois indisponible" }, 503);
  const completed = new Set((deliveries || []).map(item => item.subscription_id));
  const pending = subscribers.filter(item => !completed.has(item.id));
  const batch = pending.slice(0, 8);
  let sent = 0, failed = 0;
  for (const subscriber of batch) {
    const { error: lock } = await db.from("notification_deliveries").insert({ campaign_id: body.id, subscription_id: subscriber.id, status: "queued" });
    if (lock) continue;
    let result;
    try { result = await sendApns(env, { deviceToken: subscriber.provider_subscription_id, title: campaign.title, body: campaign.body, url: campaignDestination(campaign, article), newsSlug: article.slug }); }
    catch { result = { ok: false, status: 0, reason: "APNs unavailable" }; }
    const now = new Date().toISOString();
    await db.from("notification_deliveries").update({ status: result.ok ? "sent" : "failed", error_code: result.ok ? null : String(result.status || result.reason).slice(0, 100), attempted_at: now }).eq("campaign_id", body.id).eq("subscription_id", subscriber.id);
    if (result.ok) sent++; else failed++;
    if (result.status === 410 || (result.status === 400 && /BadDeviceToken|Unregistered/.test(result.reason || ""))) {
      await db.from("push_subscriptions").update({ marketing_opt_in: false, revoked_at: now }).eq("id", subscriber.id);
    }
  }
  const remaining = Math.max(0, pending.length - batch.length);
  if (!remaining) await db.from("notification_campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", body.id).eq("status", "sending");
  return reply({ sent, failed, remaining, published: true });
}

async function sha256(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function createPair(request, db) {
  if (request.method !== "POST") return reply({ error: "Méthode non autorisée" }, 405);
  if (!(await authorized(request, db))) return reply({ error: "Accès refusé" }, 403);
  const code = [...crypto.getRandomValues(new Uint8Array(24))].map(byte => byte.toString(16).padStart(2, "0")).join("");
  const expires = new Date(Date.now() + 10 * 60_000).toISOString();
  const { error } = await db.from("notification_test_pairings").insert({ code_hash: await sha256(code), expires_at: expires });
  return error ? reply({ error: "Appairage indisponible" }, 503) : reply({ code, expires_at: expires });
}

async function pairDevice(request, db, body) {
  if (request.method !== "POST") return reply({ error: "Méthode non autorisée" }, 405);
  if (typeof body.code !== "string" || !/^[a-f0-9]{48}$/.test(body.code) || !deviceTokenValid(body.deviceToken)) return reply({ error: "Données invalides" }, 400);
  const hash = await sha256(body.code);
  const { data: pairing, error: lookupError } = await db.from("notification_test_pairings").select("code_hash,expires_at,used_at").eq("code_hash", hash).maybeSingle();
  if (lookupError) return reply({ error: "Service indisponible" }, 503);
  if (!pairing || pairing.used_at || new Date(pairing.expires_at).getTime() < Date.now()) return reply({ error: "Code expiré ou utilisé" }, 403);
  const now = new Date().toISOString();
  const { data: claimed, error: claimError } = await db.from("notification_test_pairings").update({ used_at: now }).eq("code_hash", hash).is("used_at", null).gt("expires_at", now).select("code_hash").maybeSingle();
  if (claimError || !claimed) return reply({ error: "Code déjà utilisé" }, 409);
  const { error } = await db.from("notification_test_devices").upsert({ id: "owner-iphone", device_token: body.deviceToken, updated_at: now }, { onConflict: "id" });
  return error ? reply({ error: "Enregistrement impossible" }, 503) : reply({ success: true });
}

async function testPush(request, env, db, body) {
  if (request.method !== "POST") return reply({ error: "Méthode non autorisée" }, 405);
  if (!(await authorized(request, db))) return reply({ error: "Accès refusé" }, 403);
  const { data: paired, error: pairError } = await db.from("notification_test_devices").select("device_token").eq("id", "owner-iphone").maybeSingle();
  if (pairError) return reply({ error: "Registre indisponible" }, 503);
  const { data: fallback, error: fallbackError } = paired?.device_token ? { data: null, error: null } : await db.from("push_subscriptions").select("provider_subscription_id").eq("provider", "apns").eq("platform", "ios").eq("marketing_opt_in", true).is("revoked_at", null).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (fallbackError) return reply({ error: "Registre indisponible" }, 503);
  const token = paired?.device_token || fallback?.provider_subscription_id;
  if (!token) return reply({ error: "Aucun iPhone abonné" }, 409);
  if (!deviceTokenValid(token) || typeof body.title !== "string" || !body.title.trim() || body.title.length > 120 || typeof body.body !== "string" || !body.body.trim() || body.body.length > 500) return reply({ error: "Paramètres de test invalides" }, 400);
  try {
    const result = await sendApns(env, { deviceToken: token, title: body.title.trim(), body: body.body.trim() });
    return reply({ success: result.ok, apnsStatus: result.status, reason: result.reason }, result.ok ? 200 : 502);
  } catch { return reply({ error: "Envoi Apple impossible" }, 503); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = origin && allowedOrigins.has(origin) ? origin : null;
    const withCors = response => {
      if (!cors) return response;
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", cors);
      headers.set("Vary", "Origin");
      headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      return new Response(response.body, { status: response.status, headers });
    };
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: cors ? 204 : 403 }));
    if (origin && !cors) return reply({ error: "Origine refusée" }, 403);
    if (url.pathname === "/health") return withCors(reply({ ok: true, service: "gaspardnz-notifications" }));
    const action = url.pathname === "/api/admin-notifications" ? "admin-notifications" : url.pathname.match(/^\/api\/notifications\/([a-z-]+)$/)?.[1];
    const routes = new Set(["admin-notifications", "send-campaign", "push-subscription", "admin-push-pair", "push-test-device", "admin-notification-test"]);
    if (!routes.has(action)) return withCors(reply({ error: "Route inconnue" }, 404));
    let body = {};
    if (request.method === "POST" || request.method === "DELETE") {
      try {
        if (Number(request.headers.get("Content-Length") || 0) > 16_384) return withCors(reply({ error: "Requête trop volumineuse" }, 413));
        body = await request.json();
        if (!body || typeof body !== "object" || Array.isArray(body) || JSON.stringify(body).length > 16_384) throw new Error();
      } catch { return withCors(reply({ error: "JSON invalide" }, 400)); }
    }
    let db;
    try { db = client(env); } catch { return withCors(reply({ error: "Service non configuré" }, 503)); }
    try {
      const response = action === "admin-notifications" ? await campaigns(request, db, body)
        : action === "send-campaign" ? await sendCampaign(request, env, db, body)
        : action === "push-subscription" ? await subscription(request, db, body)
        : action === "admin-push-pair" ? await createPair(request, db)
        : action === "push-test-device" ? await pairDevice(request, db, body)
        : await testPush(request, env, db, body);
      return withCors(response);
    } catch { return withCors(reply({ error: "Service temporairement indisponible" }, 503)); }
  },
};
