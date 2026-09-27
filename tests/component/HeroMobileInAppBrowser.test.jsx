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

describe("HeroMobile — hauteur adaptée uniquement au navigateur intégré de TikTok", () => {
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

// Bug réel confirmé par capture d'écran : dans le navigateur intégré de
// TikTok, la vidéo d'accueil était happée par le lecteur vidéo plein écran
// natif de l'iPhone (contrôles natifs superposés), une vraie prise de
// contrôle de l'écran, plus seulement un souci de hauteur. Pour ces
// navigateurs, aucune balise <video> n'est insérée : une image fixe la
// remplace, qui ne peut déclencher aucun lecteur natif.
describe("HeroMobile — pas de <video> dans un navigateur intégré (évite le lecteur plein écran natif de l'iPhone)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche la vraie balise <video> dans un navigateur normal", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1" });
    const { container } = render(<HeroMobile onScrollDown={() => {}} />);
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("remplace la vidéo par une image fixe depuis le navigateur intégré de TikTok", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) musical_ly_2024001 JsSdk/1.0" });
    const { container } = render(<HeroMobile onScrollDown={() => {}} />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector('img[src$="hero-poster.jpg"]')).not.toBeNull();
  });

  // Sur demande explicite de l'utilisateur : la photo ne remplace la vidéo
  // QUE dans TikTok. Instagram (et tout autre navigateur) garde la vidéo,
  // même s'il s'agit aussi d'un navigateur intégré.
  it("garde la vraie vidéo dans le navigateur intégré d'Instagram", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Instagram 300.0.0" });
    const { container } = render(<HeroMobile onScrollDown={() => {}} />);
    expect(container.querySelector("video")).not.toBeNull();
  });
});
