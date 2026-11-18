// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = vi.hoisted(() => ({ tables: {}, pushes: [] }));
vi.mock("../../server/apns.js", () => ({
  notificationAdminDb: () => makeDb(),
  sendApns: vi.fn(async (payload) => {
    memory.pushes.push(payload);
    return { ok: true, status: 200 };
  }),
}));

const campaignId = "7aa65d11-1586-4455-bcef-501c56c22a08";
const deviceToken = "a".repeat(64);

function makeDb() {
  const db = {
    auth: { getUser: async () => ({ data: { user: { email: "owner@example.test" } } }) },
    from: (table) => {
      let filters = [], patch, insertion, upsertion, limit;
      const query = {
        select: () => query,
        eq: (key, value) => { filters.push([key, value]); return query; },
        is: (key, value) => { filters.push([key, value]); return query; },
        order: () => query,
        limit: (value) => { limit = value; return query; },
        update: (value) => { patch = value; return query; },
        insert: (value) => { insertion = value; return query; },
        upsert: (value) => { upsertion = value; return query; },
        maybeSingle: async () => { const result = execute(); return { data: result.data?.[0] || null, error: result.error }; },
        single: async () => { const result = execute(); return { data: result.data?.[0] || null, error: result.error }; },
        then: (resolve, reject) => Promise.resolve(execute()).then(resolve, reject),
      };
      function execute() {
        const rows = memory.tables[table] || [];
        if (insertion) {
          const inserted = { id: `${table}-${rows.length + 1}`, ...insertion };
          rows.push(inserted);
          return { data: [inserted], error: null };
        }
        if (upsertion) {
          const found = rows.find(row => row.slug === upsertion.slug);
          const inserted = found || { id: `news-${rows.length + 1}`, ...upsertion };
          if (!found) rows.push(inserted);
          return { data: [inserted], error: null };
        }
        let matching = rows.filter(row => filters.every(([key, value]) => row[key] === value));
        if (patch) matching.forEach(row => Object.assign(row, patch));
        if (limit !== undefined) matching = matching.slice(0, limit);
        return { data: matching, error: null };
      }
      return query;
    },
  };
  return db;
}

import handler from "../../server/notifications/send-campaign.js";

const req = () => ({ method: "POST", headers: { authorization: "Bearer admin-session" }, body: { id: campaignId } });
const res = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } });

beforeEach(() => {
  memory.pushes = [];
  memory.tables = {
    admin_access: [{ email: "owner@example.test", role: "owner", active: true }],
    notification_campaigns: [{ id: campaignId, category: "actualite", title: "Nouvelle vidéo", body: "Un look de Gaspard", status: "draft", created_at: "2026-11-18T12:00:00Z", target_url: "https://www.tiktok.com/@gaspardnz/video/123" }],
    news_posts: [], push_subscriptions: [], notification_deliveries: [],
  };
});

describe("publishing before APNs delivery", () => {
  it("keeps a permanent news article even when nobody has opted in", async () => {
    const response = res();
    await handler(req(), response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ published: true, sent: 0, remaining: 0 });
    expect(memory.tables.news_posts).toHaveLength(1);
    expect(memory.tables.news_posts[0]).toMatchObject({ published: true, title: "Nouvelle vidéo" });
    expect(memory.tables.notification_campaigns[0].status).toBe("sent");
  });

  it("sends the exact TikTok link and saves its announcement in Actualités", async () => {
    memory.tables.push_subscriptions.push({ id: "subscriber-1", provider: "apns", platform: "ios", provider_subscription_id: deviceToken, marketing_opt_in: true, revoked_at: null });
    const response = res();
    await handler(req(), response);
    expect(response.body).toMatchObject({ sent: 1, failed: 0, remaining: 0 });
    expect(memory.pushes).toEqual([expect.objectContaining({
      deviceToken,
      url: "https://www.tiktok.com/@gaspardnz/video/123",
      newsSlug: `notification-${campaignId}`,
    })]);
    expect(memory.tables.news_posts[0].metadata.link_url).toBe("https://www.tiktok.com/@gaspardnz/video/123");
    expect(memory.tables.notification_deliveries[0].status).toBe("sent");
  });
});
