// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { campaignDestination, ensureCampaignNews } from "../../server/notifications/campaign-news.js";

const id = "8d809a0f-9dbf-4c23-9041-44c58ad0d3a7";
const makeDb = () => {
  const upsert = vi.fn(() => ({ select: () => ({ single: async () => ({
    data: { id: "19a2ef88-c9bc-465d-9e8f-6cfd47e382b9", slug: `notification-${id}` }, error: null,
  }) }) }));
  const select = vi.fn(() => {
    let slug;
    const query = {
      eq: (key, value) => { if (key === "slug") slug = value; return query; },
      maybeSingle: async () => ({ data: slug === "un-vrai-article" ? { id, slug } : null, error: null }),
    };
    return query;
  });
  return { upsert, select, db: { from: () => ({ upsert, select }) } };
};

describe("durable notification publications", () => {
  it("publishes a normal notification as an article before pushing", async () => {
    const { db, upsert } = makeDb();
    const campaign = { id, category: "actualite", title: "Nouvelle collection", body: "Découvrez le look du mois", created_at: "2026-11-18T12:00:00Z" };
    const article = await ensureCampaignNews(db, campaign);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      slug: `notification-${id}`, published: true, locale: "FR", title: campaign.title,
      metadata: expect.objectContaining({ notification_campaign_id: id }),
    }), { onConflict: "slug" });
    expect(campaignDestination(campaign, article))
      .toBe(`https://gaspardnz.style/actualites?article=notification-${id}`);
  });

  it("keeps an external TikTok URL on the article and uses it as push destination", async () => {
    const { db, upsert } = makeDb();
    const campaign = { id, category: "actualite", title: "Nouvelle vidéo", body: "Voir le look", target_url: "https://www.tiktok.com/@gaspardnz/video/123" };
    const article = await ensureCampaignNews(db, campaign);
    expect(upsert.mock.calls[0][0].metadata.link_url).toBe(campaign.target_url);
    expect(campaignDestination(campaign, article)).toBe(campaign.target_url);
  });

  it("reuses an existing admin article without creating a duplicate", async () => {
    const { db, upsert } = makeDb();
    const campaign = { id, category: "actualite", title: "Article du journal", body: "Résumé", target_url: "https://gaspardnz.style/actualites?article=un-vrai-article" };
    const article = await ensureCampaignNews(db, campaign);
    expect(article.slug).toBe("un-vrai-article");
    expect(upsert).not.toHaveBeenCalled();
  });
});
