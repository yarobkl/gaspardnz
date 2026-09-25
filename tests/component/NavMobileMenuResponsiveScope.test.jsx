import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Demandé par l'utilisateur : le menu hamburger complet (14 entrées) fait
// doublon avec la grille de tuiles "Explorer l'univers" (MobileHomeCompact.jsx),
// mais CETTE grille n'existe que sur mobile (<=767px, useCompactMobile) — le
// bureau n'a aucune autre navigation et doit garder le menu complet. Seuls
// Rendez-vous, Showroom et le lookbook n'ont pas de tuile équivalente et
// restent donc dans le menu mobile.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;

const mockViewport = (matchesCompact) => {
  const original = window.matchMedia;
  window.matchMedia = (query) => ({
    matches: query === "(max-width: 767px)" ? matchesCompact : false,
    media: query, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  });
  return () => { window.matchMedia = original; };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NavMobile — le menu s'adapte selon qu'une grille de tuiles existe déjà (mobile) ou non (bureau)", () => {
  it("sur mobile (<=767px) : seuls Rendez-vous, Showroom et le lookbook restent, le reste est sur la grille de tuiles", async () => {
    const restore = mockViewport(true);
    try {
      render(<NavMobile />);
      fireEvent.click(screen.getByLabelText("Ouvrir le menu"));

      expect(await screen.findByText("Rendez-vous")).toBeInTheDocument();
      expect(screen.getByText("Showroom")).toBeInTheDocument();
      expect(screen.getByText("Lookbook")).toBeInTheDocument();

      expect(screen.queryByText("Biographie")).not.toBeInTheDocument();
      expect(screen.queryByText("Formules")).not.toBeInTheDocument();
      expect(screen.queryByText("Style Journal")).not.toBeInTheDocument();
      expect(screen.queryByText("Galerie")).not.toBeInTheDocument();
      expect(screen.queryByText("Vidéos")).not.toBeInTheDocument();
      expect(screen.queryByText("Nos Partenaires")).not.toBeInTheDocument();
      expect(screen.queryByText("Actualités")).not.toBeInTheDocument();
      expect(screen.queryByText("Galerie clients")).not.toBeInTheDocument();
      expect(screen.queryByText("Style du Mois")).not.toBeInTheDocument();
      expect(screen.queryByText("Communauté")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("sur bureau (>767px, pas de grille de tuiles) : le menu complet reste affiché", async () => {
    const restore = mockViewport(false);
    try {
      render(<NavMobile />);
      fireEvent.click(screen.getByLabelText("Ouvrir le menu"));

      expect(await screen.findByText("Rendez-vous")).toBeInTheDocument();
      expect(screen.getByText("Showroom")).toBeInTheDocument();
      expect(screen.getByText("Lookbook")).toBeInTheDocument();
      expect(screen.getByText("Biographie")).toBeInTheDocument();
      expect(screen.getByText("Formules")).toBeInTheDocument();
      expect(screen.getByText("Style Journal")).toBeInTheDocument();
      expect(screen.getByText("Communauté")).toBeInTheDocument();
    } finally {
      restore();
    }
  });
});
