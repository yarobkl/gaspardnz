import { notificationAdminDb } from "../apns.js";

// A device token belongs to one installation of this app. No public read access
// to the registry is granted; the service role is used only on the server.
export default async function handler(req, res) {
  if (!["POST", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Méthode non autorisée" });
  const token = req.body?.deviceToken;
  if (typeof token !== "string" || !/^[a-f0-9]{64,}$/i.test(token)) return res.status(400).json({ error: "Appareil invalide" });
  let db;
  try { db = notificationAdminDb(); } catch { return res.status(503).json({ error: "Notifications indisponibles" }); }
  if (req.method === "DELETE") {
    const { error } = await db.from("push_subscriptions").update({ marketing_opt_in: false, revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("provider_subscription_id", token).eq("provider", "apns");
    return error ? res.status(503).json({ error: "Désactivation impossible" }) : res.json({ active: false });
  }
  if (req.body?.consent !== true) return res.status(400).json({ error: "Consentement requis" });
  const now = new Date().toISOString();
  const { error } = await db.from("push_subscriptions").upsert({ provider: "apns", provider_subscription_id: token, platform: "ios", marketing_opt_in: true, consented_at: now, revoked_at: null, updated_at: now }, { onConflict: "provider_subscription_id" });
  return error ? res.status(503).json({ error: "Activation impossible" }) : res.json({ active: true });
}
