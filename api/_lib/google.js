import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://imvjudhhtcdmtyhfhksm.supabase.co";
const GA_MEASUREMENT_ID = "G-N283W7662X";
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

export function getServerConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  };
}

export function assertServerConfig() {
  const config = getServerConfig();
  const missing = [];
  if (!config.serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!config.googleClientId) missing.push("GOOGLE_CLIENT_ID");
  if (!config.googleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (missing.length) {
    const error = new Error(`Configuration serveur manquante: ${missing.join(", ")}`);
    error.code = "CONFIG_MISSING";
    throw error;
  }
  return config;
}

export function getAdminClient() {
  const config = assertServerConfig();
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "gaspardnz.style").split(",")[0].trim();
  return `${proto}://${host}`;
}

export function getGoogleRedirectUri(req) {
  return process.env.GOOGLE_REDIRECT_URI || `${getOrigin(req)}/api/google/callback`;
}

export function json(res, status, payload) {
  res.status(status).setHeader("Cache-Control", "no-store").json(payload);
}

export async function requireAdmin(req) {
  const supabase = getAdminClient();
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Session administrateur requise" };

  const { data: userResult, error: authError } = await supabase.auth.getUser(token);
  const user = userResult?.user;
  if (authError || !user?.email) return { ok: false, status: 401, error: "Session invalide" };

  const { data: access, error: accessError } = await supabase
    .from("admin_access")
    .select("email,role,display_name,active")
    .eq("email", user.email.toLowerCase())
    .eq("active", true)
    .maybeSingle();
  if (accessError || !access) return { ok: false, status: 403, error: "Accès administrateur refusé" };

  return { ok: true, supabase, user, access };
}

export function createGoogleAuthorizationUrl(req, state) {
  const config = assertServerConfig();
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: getGoogleRedirectUri(req),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_SCOPES.join(" "),
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(req, code) {
  const config = assertServerConfig();
  const body = new URLSearchParams({
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: getGoogleRedirectUri(req),
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || payload.error || "Échange OAuth Google impossible");
  return payload;
}

export async function refreshGoogleToken(refreshToken) {
  const config = assertServerConfig();
  const body = new URLSearchParams({
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || payload.error || "Rafraîchissement du jeton Google impossible");
  return payload;
}

export async function googleFetch(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.error_description || payload?.error || `Google API ${response.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return payload;
}

export async function getGoogleAccountEmail(accessToken) {
  const payload = await googleFetch("https://openidconnect.googleapis.com/v1/userinfo", accessToken);
  return String(payload?.email || "").toLowerCase();
}

export async function getExpectedGoogleEmail(supabase) {
  const { data } = await supabase
    .from("integration_settings")
    .select("account_label")
    .eq("provider", "google_analytics")
    .maybeSingle();
  return String(data?.account_label || "").toLowerCase();
}

export async function discoverAnalyticsProperty(accessToken) {
  const summaries = await googleFetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", accessToken);
  const candidates = [];
  for (const account of summaries?.accountSummaries || []) {
    for (const property of account?.propertySummaries || []) {
      const propertyName = String(property?.property || "");
      const propertyId = propertyName.split("/").pop();
      if (!propertyId) continue;
      let streams = {};
      try {
        streams = await googleFetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}/dataStreams?pageSize=200`, accessToken);
      } catch {
        streams = {};
      }
      for (const stream of streams?.dataStreams || []) {
        const measurementId = stream?.webStreamData?.measurementId || null;
        candidates.push({
          account: account?.displayName || account?.account || null,
          propertyId,
          propertyName: property?.displayName || propertyName,
          streamId: String(stream?.name || "").split("/").pop() || null,
          streamName: stream?.displayName || null,
          defaultUri: stream?.webStreamData?.defaultUri || null,
          measurementId,
        });
      }
    }
  }
  return candidates.find((item) => item.measurementId === GA_MEASUREMENT_ID)
    || candidates.find((item) => String(item.defaultUri || "").includes("gaspardnz.style"))
    || null;
}

export async function discoverSearchConsoleSite(accessToken) {
  const payload = await googleFetch("https://www.googleapis.com/webmasters/v3/sites", accessToken);
  const entries = payload?.siteEntry || [];
  const preferred = ["https://gaspardnz.style/", "https://gaspardnz.style", "sc-domain:gaspardnz.style"];
  for (const candidate of preferred) {
    const found = entries.find((item) => String(item.siteUrl || "").toLowerCase() === candidate.toLowerCase());
    if (found) return found;
  }
  return entries.find((item) => String(item.siteUrl || "").includes("gaspardnz.style")) || null;
}

export async function storeGoogleCredentials(supabase, tokens, accountEmail) {
  const expiresAt = tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000).toISOString() : null;
  const current = await supabase.from("integration_credentials").select("refresh_token").eq("provider", "google").maybeSingle();
  const refreshToken = tokens.refresh_token || current.data?.refresh_token || null;
  const row = {
    provider: "google",
    access_token: tokens.access_token,
    refresh_token: refreshToken,
    token_type: tokens.token_type || "Bearer",
    expires_at: expiresAt,
    scope: tokens.scope || GOOGLE_SCOPES.join(" "),
    metadata: { account_email: accountEmail },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("integration_credentials").upsert(row, { onConflict: "provider" });
  if (error) throw error;
  return row;
}

export async function getValidGoogleAccessToken(supabase) {
  const { data: creds, error } = await supabase.from("integration_credentials").select("*").eq("provider", "google").maybeSingle();
  if (error || !creds?.refresh_token) throw new Error("Google n'est pas encore autorisé.");
  const expires = creds.expires_at ? new Date(creds.expires_at).getTime() : 0;
  if (creds.access_token && expires > Date.now() + 60_000) return creds.access_token;
  const refreshed = await refreshGoogleToken(creds.refresh_token);
  await storeGoogleCredentials(supabase, { ...refreshed, refresh_token: creds.refresh_token }, creds.metadata?.account_email || null);
  return refreshed.access_token;
}

export async function updateGoogleIntegrationDiscovery(supabase, { accountEmail, analytics, searchConsole }) {
  const now = new Date().toISOString();
  const updates = [];
  updates.push(supabase.from("integration_settings").upsert({
    provider: "google_analytics",
    status: analytics ? "connected" : "error",
    account_label: accountEmail,
    property_id: analytics?.propertyId || null,
    stream_id: analytics?.streamId || null,
    site_url: analytics?.defaultUri || "https://gaspardnz.style",
    metadata: analytics ? { measurement_id: analytics.measurementId, property_name: analytics.propertyName, stream_name: analytics.streamName, account_name: analytics.account } : {},
    last_error: analytics ? null : `Aucune propriété GA4 liée à ${GA_MEASUREMENT_ID} n'a été trouvée.`,
    updated_at: now,
  }, { onConflict: "provider" }));
  updates.push(supabase.from("integration_settings").upsert({
    provider: "google_search_console",
    status: searchConsole ? "connected" : "error",
    account_label: accountEmail,
    site_url: searchConsole?.siteUrl || "https://gaspardnz.style",
    metadata: searchConsole ? { permission_level: searchConsole.permissionLevel || null } : {},
    last_error: searchConsole ? null : "Aucune propriété Search Console GaspardNZ n'a été trouvée.",
    updated_at: now,
  }, { onConflict: "provider" }));
  const results = await Promise.all(updates);
  const failure = results.find((item) => item.error)?.error;
  if (failure) throw failure;
}

export async function markIntegrationSync(supabase, provider, error = null) {
  await supabase.from("integration_settings").update({
    last_sync_at: error ? undefined : new Date().toISOString(),
    last_error: error ? String(error).slice(0, 1000) : null,
    status: error ? "error" : "connected",
    updated_at: new Date().toISOString(),
  }).eq("provider", provider);
}
