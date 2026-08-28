import {
  discoverAnalyticsProperty,
  discoverSearchConsoleSite,
  exchangeGoogleCode,
  getAdminClient,
  getExpectedGoogleEmail,
  getGoogleAccountEmail,
  getOrigin,
  storeGoogleCredentials,
  updateGoogleIntegrationDiscovery,
} from "../_lib/google.js";

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", location);
  res.end();
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const state = String(req.query?.state || "");
  const code = String(req.query?.code || "");
  const oauthError = String(req.query?.error || "");

  try {
    const supabase = getAdminClient();
    if (!state) return redirect(res, `${origin}/admin/seo?google=error&reason=state_missing`);

    const { data: stateRow, error: stateError } = await supabase
      .from("oauth_states")
      .select("state,provider,admin_email,redirect_to,expires_at")
      .eq("state", state)
      .eq("provider", "google")
      .maybeSingle();
    if (stateError || !stateRow || new Date(stateRow.expires_at).getTime() < Date.now()) {
      return redirect(res, `${origin}/admin/seo?google=error&reason=state_invalid`);
    }
    await supabase.from("oauth_states").delete().eq("state", state);

    if (oauthError || !code) {
      return redirect(res, `${origin}${stateRow.redirect_to || "/admin/seo"}?google=error&reason=${encodeURIComponent(oauthError || "code_missing")}`);
    }

    const tokens = await exchangeGoogleCode(req, code);
    const accountEmail = await getGoogleAccountEmail(tokens.access_token);
    const expectedEmail = await getExpectedGoogleEmail(supabase);
    if (expectedEmail && accountEmail && accountEmail !== expectedEmail) {
      return redirect(res, `${origin}${stateRow.redirect_to || "/admin/seo"}?google=error&reason=wrong_account&account=${encodeURIComponent(accountEmail)}`);
    }

    await storeGoogleCredentials(supabase, tokens, accountEmail || expectedEmail || stateRow.admin_email);
    const [analytics, searchConsole] = await Promise.all([
      discoverAnalyticsProperty(tokens.access_token),
      discoverSearchConsoleSite(tokens.access_token),
    ]);
    await updateGoogleIntegrationDiscovery(supabase, {
      accountEmail: accountEmail || expectedEmail || stateRow.admin_email,
      analytics,
      searchConsole,
    });

    const suffix = analytics && searchConsole ? "connected" : "partial";
    return redirect(res, `${origin}${stateRow.redirect_to || "/admin/seo"}?google=${suffix}`);
  } catch (error) {
    console.error("Google OAuth callback", error?.message || error);
    return redirect(res, `${origin}/admin/seo?google=error&reason=${encodeURIComponent(error?.message || "oauth_failed")}`);
  }
}
