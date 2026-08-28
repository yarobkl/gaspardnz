import crypto from "node:crypto";
import { createGoogleAuthorizationUrl, json, requireAdmin } from "../_lib/google.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return json(res, admin.status, { error: admin.error });

    await admin.supabase.rpc("cleanup_expired_oauth_states");
    const state = crypto.randomBytes(32).toString("hex");
    const redirectTo = String(req.body?.redirectTo || "/admin/seo").startsWith("/admin")
      ? String(req.body?.redirectTo || "/admin/seo")
      : "/admin/seo";
    const { error } = await admin.supabase.from("oauth_states").insert({
      state,
      provider: "google",
      admin_email: admin.user.email.toLowerCase(),
      redirect_to: redirectTo,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (error) throw error;

    return json(res, 200, { url: createGoogleAuthorizationUrl(req, state) });
  } catch (error) {
    const status = error?.code === "CONFIG_MISSING" ? 503 : 500;
    return json(res, status, { error: error?.message || "Connexion Google impossible" });
  }
}
