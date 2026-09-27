import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// jsdom n'implémente pas HTMLMediaElement.play()/load() : sans ça, l'effet
// de lecture automatique de la vidéo d'accueil lève une erreur "not
// implemented" que tests/setup.js transforme en échec de test. Redéfini dans
// beforeEach (pas au niveau du module) car restoreMocks:true (vitest.config.js)
// efface la config mockResolvedValue avant chaque test.
beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.load = vi.fn();
});

// Bug réel signalé par un utilisateur : le lien ouvert depuis TikTok reste
// bloqué sur la vidéo d'accueil, impossible de faire défiler la page. Le
// navigateur intégré de TikTok calcule mal 100dvh sur cette section plein
// écran ; on bascule sur une hauteur mesurée en JS (fiable partout), limitée
// à 92% pour laisser apparaître le haut de la section suivante.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const HeroMobile = (await import("../../src/components/HeroMobile.jsx")).default;

const getHeroSection = () => screen.getByText(/GASPARD/).closest("section");

describe("HeroMobile — hauteur adaptée aux navigateurs intégrés (TikTok, Instagram...)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("utilise 100dvh dans un navigateur normal", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1" });
    render(<HeroMobile onScrollDown={() => {}} />);
    expect(getHeroSection()).toHaveStyle({ height: "100dvh" });
  });

  it("bascule sur une hauteur mesurée en pixels (92% de la fenêtre) depuis le navigateur intégré de TikTok", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) musical_ly_2024001 JsSdk/1.0" });
    vi.stubGlobal("innerHeight", 800);
    render(<HeroMobile onScrollDown={() => {}} />);
    expect(getHeroSection()).toHaveStyle({ height: "736px" });
  });
});
