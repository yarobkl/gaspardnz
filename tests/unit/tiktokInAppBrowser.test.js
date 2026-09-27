import { afterEach, describe, expect, it, vi } from "vitest";
import { isTikTokInAppBrowser } from "../../src/utils/tiktokInAppBrowser.js";

// Sur demande explicite de l'utilisateur : la photo de secours ne remplace
// la vidéo d'accueil QUE dans le navigateur intégré de TikTok, jamais dans
// Instagram/Facebook/les autres — ils gardent la vidéo comme un navigateur
// normal.
describe("isTikTokInAppBrowser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("détecte le navigateur intégré de TikTok", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) musical_ly_2024001 JsSdk/1.0" });
    expect(isTikTokInAppBrowser()).toBe(true);
  });

  it("ne détecte PAS Instagram (doit garder la vidéo, sur demande explicite de l'utilisateur)", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Instagram 300.0.0" });
    expect(isTikTokInAppBrowser()).toBe(false);
  });

  it("ne détecte PAS Facebook (doit garder la vidéo)", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) [FBAN/FBIOS;FBAV/450.0]" });
    expect(isTikTokInAppBrowser()).toBe(false);
  });

  it("ne détecte rien pour un vrai Safari mobile", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
    expect(isTikTokInAppBrowser()).toBe(false);
  });
});
