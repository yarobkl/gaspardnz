import { notificationAdminDb, sendApns } from "../apns.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  const token = String(req.headers.authorization || "").match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: "Authentification requise" });
  let db;
  try { db = notificationAdminDb(); } catch { return res.status(503).json({ error: "Service non configuré" }); }
  const { data: session } = await db.auth.getUser(token);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return res.status(401).json({ error: "Session invalide" });
  const { data: access } = await db.from("admin_access").select("role,active").eq("email", email).maybeSingle();
  if (!access?.active || !["owner", "admin"].includes(access.role)) return res.status(403).json({ error: "Accès refusé" });
  const id = req.body?.id;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Campagne invalide" });
  const { data: campaign, error: campaignError } = await db.from("notification_campaigns").select("id,title,body,target_url,status").eq("id", id).maybeSingle();
  if (campaignError || !campaign) return res.status(404).json({ error: "Campagne introuvable" });
  if (!["draft", "sending"].includes(campaign.status)) return res.status(409).json({ error: "Campagne déjà terminée" });
  if (campaign.status === "draft") {
    const { data: claimed, error } = await db.from("notification_campaigns").update({ status: "sending" }).eq("id", id).eq("status", "draft").select("id").maybeSingle();
    if (error || !claimed) return res.status(409).json({ error: "Campagne déjà prise en charge" });
  }
  const { data: subscribers, error: subscribersError } = await db.from("push_subscriptions").select("id,provider_subscription_id").eq("provider", "apns").eq("platform", "ios").eq("marketing_opt_in", true).is("revoked_at", null).order("id");
  if (subscribersError) return res.status(503).json({ error: "Abonnements indisponibles" });
  if (!subscribers?.length) return res.status(409).json({ error: "Aucun iPhone n’a accepté les notifications pour le moment" });
  const { data: deliveries, error: deliveriesError } = await db.from("notification_deliveries").select("subscription_id,status").eq("campaign_id", id);
  if (deliveriesError) return res.status(503).json({ error: "Suivi des envois indisponible" });
  const done = new Set((deliveries || []).map(row => row.subscription_id));
  const pending = (subscribers || []).filter(row => !done.has(row.id));
  const batch = pending.slice(0, 8);
  let sent = 0, failed = 0;
  for (const subscriber of batch) {
    const { error: lockError } = await db.from("notification_deliveries").insert({ campaign_id: id, subscription_id: subscriber.id, status: "queued" });
    if (lockError) continue; // The unique key prevents duplicate deliveries.
    let result;
    try { result = await sendApns({ deviceToken: subscriber.provider_subscription_id, title: campaign.title, body: campaign.body, url: campaign.target_url || "https://gaspardnz.style/rendez-vous" }); }
    catch { result = { ok: false, status: 0, reason: "APNs unavailable" }; }
    await db.from("notification_deliveries").update({ status: result.ok ? "sent" : "failed", error_code: result.ok ? null : String(result.status || result.reason).slice(0, 100), attempted_at: new Date().toISOString() }).eq("campaign_id", id).eq("subscription_id", subscriber.id);
    if (result.ok) sent++; else failed++;
    if (result.status === 410 || result.status === 400 && /BadDeviceToken|Unregistered/.test(result.reason || "")) await db.from("push_subscriptions").update({ marketing_opt_in: false, revoked_at: new Date().toISOString() }).eq("id", subscriber.id);
  }
  const remaining = Math.max(0, pending.length - batch.length);
  if (!remaining) await db.from("notification_campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id).eq("status", "sending");
  return res.json({ sent, failed, remaining });
}
