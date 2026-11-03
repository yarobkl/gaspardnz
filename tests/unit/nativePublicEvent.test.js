import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  platform: vi.fn(() => "ios"),
  post: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: mocks.platform },
  CapacitorHttp: { post: mocks.post },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({}),
}));

import { publicEventEndpoint, sendPublicEvent } from "../../src/services/supabaseClient.js";

beforeEach(() => {
  mocks.platform.mockReturnValue("ios");
  mocks.post.mockResolvedValue({ status: 201, data: { ok: true, id: "test-lead-id" } });
});

describe("public-event on Capacitor iOS", () => {
  it("uses native HTTP to bypass WebView CORS restrictions", async () => {
    const browserFetch = vi.fn();
    vi.stubGlobal("fetch", browserFetch);
    const payload = { full_name: "Test", source: "Application GaspardNZ iOS" };
    const result = await sendPublicEvent("lead", payload);
    expect(result).toEqual({ ok: true, id: "test-lead-id" });
    expect(browserFetch).not.toHaveBeenCalled();
    expect(mocks.post).toHaveBeenCalledWith(expect.objectContaining({
      url: publicEventEndpoint,
      data: { type: "lead", payload },
      headers: expect.objectContaining({ "Content-Type": "application/json", apikey: expect.any(String) }),
    }));
  });

  it("returns a safe failed result for errors, rather than claiming CRM success", async () => {
    mocks.post.mockResolvedValueOnce({ status: 403, data: { error: "Forbidden" } });
    expect(await sendPublicEvent("lead", {})).toEqual({ ok: false, status: 403 });
    mocks.post.mockRejectedValueOnce(new Error("offline"));
    expect(await sendPublicEvent("lead", {})).toEqual({ ok: false, status: 0 });
  });

  it("preserves the browser fetch path for the public website", async () => {
    mocks.platform.mockReturnValue("web");
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, id: "site-id" }) }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendPublicEvent("lead", { channel: "web" })).toEqual({ ok: true, id: "site-id" });
    expect(fetchMock).toHaveBeenCalledWith(publicEventEndpoint, expect.objectContaining({ method: "POST" }));
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
