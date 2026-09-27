import { afterEach, describe, expect, it, vi } from "vitest";
import { isInAppBrowser } from "../../src/utils/inAppBrowser.js";

describe("isInAppBrowser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("détecte le navigateur intégré de TikTok", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) musical_ly_2024001 JsSdk/1.0" });
    expect(isInAppBrowser()).toBe(true);
  });

  it("détecte le navigateur intégré d'Instagram", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Instagram 300.0.0" });
    expect(isInAppBrowser()).toBe(true);
  });

  it("ne détecte rien pour un vrai Safari mobile", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
    expect(isInAppBrowser()).toBe(false);
  });
});
