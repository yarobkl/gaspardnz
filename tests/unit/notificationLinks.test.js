import { describe, expect, it } from "vitest";
import { isGaspardNewsUrl, safeNotificationUrl } from "../../src/utils/notificationLinks.js";

describe("notification target links", () => {
  it("accepts direct TikTok links and an article deep link", () => {
    expect(safeNotificationUrl("https://www.tiktok.com/@gaspardnz/video/123"))
      .toBe("https://www.tiktok.com/@gaspardnz/video/123");
    expect(isGaspardNewsUrl("https://gaspardnz.style/actualites?article=mon-article")).toBe(true);
  });

  it("rejects non-HTTPS, credentials and local network destinations", () => {
    for (const url of ["javascript:alert(1)", "http://tiktok.com/video/1",
      "https://user:pass@example.com", "https://localhost/path", "https://127.0.0.1/path",
      "https://192.168.1.3/private", "https://10.0.0.8/private", "https://[::1]/private"])
      expect(safeNotificationUrl(url)).toBe(null);
  });
});
