import { isGaspardNewsUrl } from "../../src/utils/notificationLinks.js";

// L'article est créé AVANT l'envoi APNs : un push perdu n'efface jamais
// l'annonce, et un nouvel essai ne crée pas de doublon dans Actualités.
export async function ensureCampaignNews(db, campaign) {
  const linkedArticle = campaign.target_url && isGaspardNewsUrl(campaign.target_url)
    ? new URL(campaign.target_url).searchParams.get("article")
      || new URL(campaign.target_url).searchParams.get("slug")
      || new URL(campaign.target_url).searchParams.get("id")
    : null;

  if (linkedArticle) {
    const { data: existing, error } = await db.from("news_posts")
      .select("id,slug").eq("slug", linkedArticle).eq("published", true).maybeSingle();
    if (error) throw new Error("Actualité liée indisponible");
    if (existing) return existing;
  }

  const slug = `notification-${campaign.id}`;
  const { data: publishedBefore, error: lookupError } = await db.from("news_posts")
    .select("id,slug").eq("slug", slug).maybeSingle();
  if (lookupError) throw new Error("Actualités indisponibles");
  if (publishedBefore) return publishedBefore;
  const categoryNames = {
    arrivage: "Nouvel arrivage", promotion: "Promotion", evenement: "Événement",
    showroom: "Showroom", service: "Service", actualite: "Actualité",
    rappel: "Rappel", personnalise: "Annonce",
  };
  const { data, error } = await db.from("news_posts").upsert({
    slug,
    locale: "FR",
    title: campaign.title,
    excerpt: campaign.body,
    body: campaign.body,
    cover_url: campaign.image_url || null,
    published: true,
    published_at: new Date().toISOString(),
    metadata: {
      tag: categoryNames[campaign.category] || "Actualité",
      notification_campaign_id: campaign.id,
      ...(campaign.target_url && !isGaspardNewsUrl(campaign.target_url)
        ? { link_url: campaign.target_url } : {}),
    },
  }, { onConflict: "slug" }).select("id,slug").single();
  if (error || !data) throw new Error("Impossible de publier cette notification dans Actualités");
  return data;
}

export function campaignDestination(campaign, article) {
  return campaign.target_url || `https://gaspardnz.style/actualites?article=${encodeURIComponent(article.slug)}`;
}
