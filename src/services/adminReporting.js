import { supabase } from "./supabaseClient.js";
import { buildPeriod } from "./adminData.js";

export async function getReportingData(days = 7) {
  const period = buildPeriod(days);
  const [timeseries, funnel, acquisition, topPages] = await Promise.all([
    supabase.rpc("dashboard_timeseries", { p_from: period.from, p_to: period.to }),
    supabase.rpc("conversion_funnel", { p_from: period.from, p_to: period.to }),
    supabase.rpc("acquisition_breakdown", { p_from: period.from, p_to: period.to }),
    supabase.rpc("top_pages", { p_from: period.from, p_to: period.to, p_limit: 10 }),
  ]);
  const failed = [timeseries, funnel, acquisition, topPages].find((item) => item.error);
  if (failed?.error) throw failed.error;
  return {
    timeseries: timeseries.data || [],
    funnel: funnel.data || {},
    acquisition: acquisition.data || [],
    topPages: topPages.data || [],
  };
}

export async function getEmailSummary(days = 30) {
  const { from, to } = buildPeriod(days);
  const { data, error } = await supabase
    .from("email_messages")
    .select("status,created_at")
    .gte("created_at", from)
    .lt("created_at", to);
  if (error) throw error;
  const counts = { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 };
  for (const row of data || []) {
    counts.total += 1;
    if (["sent", "delivered", "opened", "clicked"].includes(row.status)) counts.sent += 1;
    if (["delivered", "opened", "clicked"].includes(row.status)) counts.delivered += 1;
    if (["opened", "clicked"].includes(row.status)) counts.opened += 1;
    if (row.status === "clicked") counts.clicked += 1;
    if (["failed", "bounced"].includes(row.status)) counts.failed += 1;
  }
  const rate = (value, base) => base ? Number(((value / base) * 100).toFixed(1)) : 0;
  return {
    ...counts,
    deliveryRate: rate(counts.delivered, counts.sent),
    openRate: rate(counts.opened, counts.delivered),
    clickRate: rate(counts.clicked, counts.delivered),
    failureRate: rate(counts.failed, counts.total),
  };
}
