import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { importPKCS8, SignJWT } from "npm:jose@5.10.0";

// Job privé : appelé uniquement par pg_cron avec un jeton stocké dans Vault.
// Ne jamais exposer la clé service_role ni ce jeton aux clients web/iOS.
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

type Post = { id: string; slug: string; title: string; excerpt: string | null; published: boolean; metadata: Record<string, unknown> | null };
type Campaign = { id: string; title: string; body: string; target_url: string | null; status: string; news_post_id: string };
type Subscriber = { id: string; provider_subscription_id: string };

function apnsConfigReady() {
  return ["APNS_PRIVATE_KEY", "APNS_KEY_ID", "APNS_ISSUER_ID"].every((key) => Boolean(Deno.env.get(key)));
}

async function makeAppleToken() {
  let raw = String(Deno.env.get("APNS_PRIVATE_KEY") || "").replace(/\\n/g, "\n").trim();
  if (!raw.includes("BEGIN PRIVATE KEY")) {
    raw = new TextDecoder().decode(Uint8Array.from(atob(raw.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  }
  const key = await importPKCS8(raw, "ES256");
  return new SignJWT({}).setProtectedHeader({ alg: "ES256", kid: Deno.env.get("APNS_KEY_ID")! })
    .setIssuer(Deno.env.get("APNS_ISSUER_ID")!).setIssuedAt().setExpirationTime("20m").sign(key);
}

async function sendApple(deviceToken: string, title: string, body: string, url: string, jwt: string) {
  const primary = Deno.env.get("APNS_ENVIRONMENT") === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const secondary = primary === "api.push.apple.com" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const send = async (host: string) => {
    const response = await fetch(`https://${host}/3/device/${encodeURIComponent(deviceToken)}`, {
      method: "POST", headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": Deno.env.get("APNS_BUNDLE_ID") || "com.gaspardnz.app",
        "apns-push-type": "alert", "apns-priority": "10", "content-type": "application/json",
      },
      body: JSON.stringify({ aps: { alert: { title, body }, sound: "default" }, url }),
      signal: AbortSignal.timeout(8000),
    });
    const detail = response.ok ? "" : await response.text().catch(() => "");
    return { ok: response.ok, status: response.status, detail: detail.slice(0, 160) };
  };
  let result = await send(primary);
  if (!result.ok && /BadDeviceToken|BadEnvironmentKeyInToken/.test(result.detail)) result = await send(secondary);
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  // Le secret est généré en base et n'est jamais présent dans le dépôt.
  const key = req.headers.get("x-editorial-scheduler-token") || "";
  if (!/^[a-f0-9]{64}$/i.test(key)) return reply({ error: "unauthorized" }, 401);
  const { data: allowed, error: accessError } = await db.rpc("verify_editorial_scheduler_token", { p_token: key });
  if (accessError || allowed !== true) return reply({ error: "unauthorized" }, 401);

  const now = new Date().toISOString();
  let published = 0, campaignsCreated = 0, sent = 0, failed = 0;
  // La comparaison lexicographique fonctionne pour l'ISO UTC normalisé.
  const { data: duePosts, error: postsError } = await db.from("news_posts")
    .select("id,slug,title,excerpt,published,metadata")
    .not("metadata->>scheduled_at", "is", null)
    .lte("metadata->>scheduled_at", now)
    .limit(200);
  if (postsError) return reply({ error: "news_lookup_failed" }, 503);

  for (const post of (duePosts || []) as Post[]) {
    const schedule = String(post.metadata?.scheduled_at || "");
    if (!Number.isFinite(Date.parse(schedule)) || Date.parse(schedule) > Date.now()) continue;
    if (!post.published) {
      const { data: claimed, error: updateError } = await db.from("news_posts")
        .update({ published: true, published_at: now })
        .eq("id", post.id).eq("published", false).select("id").maybeSingle();
      if (updateError) continue;
      if (claimed) published++;
    }
    if (post.metadata?.auto_notify !== true) continue;
    // Unicité de news_post_id : un article ne produit qu'une seule campagne.
    const { data: inserted, error: campaignError } = await db.from("notification_campaigns").upsert({
      news_post_id: post.id, category: "actualite", title: post.title.slice(0, 120),
      body: String(post.excerpt || "Découvrez notre nouveau conseil dans le journal GaspardNZ.").slice(0, 240),
      target_url: "https://gaspardnz.style/actualites", audience: "opted_in",
      status: "scheduled", scheduled_at: schedule,
    }, { onConflict: "news_post_id", ignoreDuplicates: true }).select("id");
    if (!campaignError && inserted?.length) campaignsCreated += inserted.length;
  }

  const { data: campaigns, error: campaignListError } = await db.from("notification_campaigns")
    .select("id,title,body,target_url,status,news_post_id")
    .not("news_post_id", "is", null).in("status", ["scheduled", "sending"])
    .lte("scheduled_at", now).limit(15);
  if (campaignListError) return reply({ published, error: "campaign_lookup_failed" }, 503);
  if (!campaigns?.length) return reply({ published, campaignsCreated, sent, failed, apnsConfigured: apnsConfigReady() });

  const { data: subscribers, error: subscriptionError } = await db.from("push_subscriptions")
    .select("id,provider_subscription_id").eq("provider", "apns").eq("platform", "ios")
    .eq("marketing_opt_in", true).is("revoked_at", null).limit(5000);
  if (subscriptionError) return reply({ published, campaignsCreated, error: "subscription_lookup_failed" }, 503);
  const ready = apnsConfigReady();
  let jwt = "";
  if (ready && (subscribers || []).length) {
    try { jwt = await makeAppleToken(); } catch { return reply({ published, campaignsCreated, error: "apns_configuration_invalid" }, 503); }
  }
  if (!ready && (subscribers || []).length) return reply({ published, campaignsCreated, error: "apns_not_configured" }, 503);

  for (const campaign of campaigns as Campaign[]) {
    if (campaign.status === "scheduled") {
      const { data: claimed } = await db.from("notification_campaigns")
        .update({ status: "sending" }).eq("id", campaign.id).eq("status", "scheduled")
        .select("id").maybeSingle();
      if (!claimed) continue;
    }
    const { data: delivered, error: deliveryError } = await db.from("notification_deliveries")
      .select("subscription_id,status").eq("campaign_id", campaign.id);
    if (deliveryError) continue;
    const attempted = new Set((delivered || []).map((item) => item.subscription_id));
    const pending = ((subscribers || []) as Subscriber[]).filter((item) => !attempted.has(item.id));
    for (const subscriber of pending.slice(0, 8)) {
      // Enregistrer avant APNs empêche les doublons, même si le job redémarre.
      const { error: lockError } = await db.from("notification_deliveries").insert({
        campaign_id: campaign.id, subscription_id: subscriber.id, status: "queued",
      });
      if (lockError) continue;
      let result = { ok: false, status: 0, detail: "send_failed" };
      try {
        result = await sendApple(subscriber.provider_subscription_id, campaign.title, campaign.body, campaign.target_url || "https://gaspardnz.style/actualites", jwt);
      } catch { /* échec réseau, conserver la trace */ }
      await db.from("notification_deliveries").update({
        status: result.ok ? "sent" : "failed",
        error_code: result.ok ? null : String(result.status || result.detail).slice(0, 100),
        attempted_at: new Date().toISOString(),
      }).eq("campaign_id", campaign.id).eq("subscription_id", subscriber.id);
      if (result.ok) sent++; else failed++;
      if (!result.ok && (result.status === 410 || (result.status === 400 && /BadDeviceToken|Unregistered/.test(result.detail)))) {
        await db.from("push_subscriptions").update({ marketing_opt_in: false, revoked_at: new Date().toISOString() }).eq("id", subscriber.id);
      }
    }
    if (pending.length <= 8) {
      const { data: finalDeliveries } = await db.from("notification_deliveries").select("status").eq("campaign_id", campaign.id);
      if (!(finalDeliveries || []).some((item) => item.status === "queued")) {
        await db.from("notification_campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", campaign.id).eq("status", "sending");
      }
    }
  }
  return reply({ published, campaignsCreated, sent, failed });
});
