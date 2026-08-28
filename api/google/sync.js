import { getValidGoogleAccessToken, googleFetch, json, markIntegrationSync, requireAdmin } from "../_lib/google.js";

const isoDate = (date) => date.toISOString().slice(0, 10);
const numberValue = (value) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

function dateRange(days) {
  const safeDays = Math.min(180, Math.max(1, Number(days || 28)));
  const end = new Date();
  const start = new Date(end.getTime() - (safeDays - 1) * 86400000);
  return { startDate: isoDate(start), endDate: isoDate(end), days: safeDays };
}

async function upsertSnapshots(supabase, rows) {
  if (!rows.length) return;
  for (let index = 0; index < rows.length; index += 500) {
    const chunk = rows.slice(index, index + 500);
    const { error } = await supabase.from("external_metric_snapshots").upsert(chunk, {
      onConflict: "provider,metric_date,dimension_key,dimension_value",
    });
    if (error) throw error;
  }
}

function gaRowsToSnapshots(report, dimensionKey, fallbackDate) {
  const dimensionHeaders = (report?.dimensionHeaders || []).map((item) => item.name);
  const metricHeaders = (report?.metricHeaders || []).map((item) => item.name);
  return (report?.rows || []).map((row) => {
    const dimensions = Object.fromEntries(dimensionHeaders.map((name, index) => [name, row.dimensionValues?.[index]?.value || ""]));
    const metrics = Object.fromEntries(metricHeaders.map((name, index) => [name, numberValue(row.metricValues?.[index]?.value)]));
    const rawDate = dimensions.date || fallbackDate;
    const metricDate = /^\d{8}$/.test(rawDate)
      ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
      : fallbackDate;
    const dimensionValue = dimensionKey === "all"
      ? "all"
      : dimensions[dimensionKey] || dimensions.pagePath || dimensions.sessionDefaultChannelGroup || dimensions.country || dimensions.deviceCategory || "(non défini)";
    return {
      provider: "google_analytics",
      metric_date: metricDate,
      dimension_key: dimensionKey,
      dimension_value: String(dimensionValue).slice(0, 1000),
      metrics,
      fetched_at: new Date().toISOString(),
    };
  });
}

async function runGaReport(accessToken, propertyId, body) {
  return googleFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function syncAnalytics(supabase, accessToken, range) {
  const { data: integration, error } = await supabase
    .from("integration_settings")
    .select("property_id")
    .eq("provider", "google_analytics")
    .maybeSingle();
  if (error || !integration?.property_id) throw new Error("Propriété GA4 GaspardNZ non identifiée.");

  const dateRanges = [{ startDate: range.startDate, endDate: range.endDate }];
  const metrics = [
    { name: "activeUsers" },
    { name: "newUsers" },
    { name: "sessions" },
    { name: "screenPageViews" },
    { name: "eventCount" },
    { name: "engagedSessions" },
    { name: "engagementRate" },
    { name: "averageSessionDuration" },
  ];
  const [daily, traffic, pages, countries, devices] = await Promise.all([
    runGaReport(accessToken, integration.property_id, { dateRanges, dimensions: [{ name: "date" }], metrics, limit: "1000" }),
    runGaReport(accessToken, integration.property_id, { dateRanges, dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagedSessions" }], limit: "5000" }),
    runGaReport(accessToken, integration.property_id, { dateRanges, dimensions: [{ name: "date" }, { name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "engagementRate" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "10000" }),
    runGaReport(accessToken, integration.property_id, { dateRanges, dimensions: [{ name: "date" }, { name: "country" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], limit: "5000" }),
    runGaReport(accessToken, integration.property_id, { dateRanges, dimensions: [{ name: "date" }, { name: "deviceCategory" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], limit: "5000" }),
  ]);

  const rows = [
    ...gaRowsToSnapshots(daily, "all", range.endDate),
    ...gaRowsToSnapshots(traffic, "sessionDefaultChannelGroup", range.endDate),
    ...gaRowsToSnapshots(pages, "pagePath", range.endDate),
    ...gaRowsToSnapshots(countries, "country", range.endDate),
    ...gaRowsToSnapshots(devices, "deviceCategory", range.endDate),
  ];

  try {
    const realtime = await googleFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(integration.property_id)}:runRealtimeReport`, accessToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }, { name: "eventCount" }] }),
    });
    const metricHeaders = (realtime?.metricHeaders || []).map((item) => item.name);
    const metricValues = realtime?.rows?.[0]?.metricValues || [];
    rows.push({
      provider: "google_analytics",
      metric_date: range.endDate,
      dimension_key: "realtime",
      dimension_value: "all",
      metrics: Object.fromEntries(metricHeaders.map((name, index) => [name, numberValue(metricValues[index]?.value)])),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("GA4 realtime unavailable", error?.message || error);
  }

  await supabase.from("external_metric_snapshots").delete()
    .eq("provider", "google_analytics")
    .gte("metric_date", range.startDate)
    .lte("metric_date", range.endDate);
  await upsertSnapshots(supabase, rows);
  await markIntegrationSync(supabase, "google_analytics");
  return { rows: rows.length, propertyId: integration.property_id };
}

function gscRowsToSnapshots(report, dimensionKey, fallbackDate) {
  return (report?.rows || []).map((row) => {
    const keys = row.keys || [];
    const date = /^\d{4}-\d{2}-\d{2}$/.test(keys[0] || "") ? keys[0] : fallbackDate;
    const valueIndex = /^\d{4}-\d{2}-\d{2}$/.test(keys[0] || "") ? 1 : 0;
    const dimensionValue = dimensionKey === "all" ? "all" : keys[valueIndex] || "(non défini)";
    return {
      provider: "google_search_console",
      metric_date: date,
      dimension_key: dimensionKey,
      dimension_value: String(dimensionValue).slice(0, 1000),
      metrics: {
        clicks: numberValue(row.clicks),
        impressions: numberValue(row.impressions),
        ctr: numberValue(row.ctr),
        position: numberValue(row.position),
      },
      fetched_at: new Date().toISOString(),
    };
  });
}

async function runSearchConsole(accessToken, siteUrl, body) {
  return googleFetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function syncSearchConsole(supabase, accessToken, range) {
  const { data: integration, error } = await supabase
    .from("integration_settings")
    .select("site_url")
    .eq("provider", "google_search_console")
    .maybeSingle();
  if (error || !integration?.site_url) throw new Error("Propriété Search Console GaspardNZ non identifiée.");
  const base = { startDate: range.startDate, endDate: range.endDate, dataState: "all" };
  const [daily, queries, pages, countries, devices] = await Promise.all([
    runSearchConsole(accessToken, integration.site_url, { ...base, dimensions: ["date"], rowLimit: 1000 }),
    runSearchConsole(accessToken, integration.site_url, { ...base, dimensions: ["date", "query"], rowLimit: 5000 }),
    runSearchConsole(accessToken, integration.site_url, { ...base, dimensions: ["date", "page"], rowLimit: 5000 }),
    runSearchConsole(accessToken, integration.site_url, { ...base, dimensions: ["date", "country"], rowLimit: 5000 }),
    runSearchConsole(accessToken, integration.site_url, { ...base, dimensions: ["date", "device"], rowLimit: 5000 }),
  ]);
  const rows = [
    ...gscRowsToSnapshots(daily, "all", range.endDate),
    ...gscRowsToSnapshots(queries, "query", range.endDate),
    ...gscRowsToSnapshots(pages, "page", range.endDate),
    ...gscRowsToSnapshots(countries, "country", range.endDate),
    ...gscRowsToSnapshots(devices, "device", range.endDate),
  ];
  await supabase.from("external_metric_snapshots").delete()
    .eq("provider", "google_search_console")
    .gte("metric_date", range.startDate)
    .lte("metric_date", range.endDate);
  await upsertSnapshots(supabase, rows);
  await markIntegrationSync(supabase, "google_search_console");
  return { rows: rows.length, siteUrl: integration.site_url };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const admin = await requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });
  const range = dateRange(req.body?.days || 28);
  try {
    const accessToken = await getValidGoogleAccessToken(admin.supabase);
    const result = {};
    try { result.analytics = await syncAnalytics(admin.supabase, accessToken, range); }
    catch (error) { await markIntegrationSync(admin.supabase, "google_analytics", error?.message || error); result.analytics = { error: error?.message || "GA4 sync failed" }; }
    try { result.searchConsole = await syncSearchConsole(admin.supabase, accessToken, range); }
    catch (error) { await markIntegrationSync(admin.supabase, "google_search_console", error?.message || error); result.searchConsole = { error: error?.message || "Search Console sync failed" }; }
    const failed = Boolean(result.analytics?.error && result.searchConsole?.error);
    return json(res, failed ? 502 : 200, { ok: !failed, range, ...result });
  } catch (error) {
    return json(res, error?.code === "CONFIG_MISSING" ? 503 : 500, { error: error?.message || "Synchronisation Google impossible" });
  }
}
