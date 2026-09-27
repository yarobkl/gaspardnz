import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Demandé par l'utilisateur : le petit intitulé au-dessus du titre
// d'accueil disait "Maison Gaspardnz", un raccourci de rédaction — renommé
// en "Showroom Gaspardnz", cohérent avec le reste du site (nav_showroom).
// jsdom n'implémente pas HTMLMediaElement.play()/load() ; redéfini dans
// beforeEach (pas au niveau du module) car restoreMocks:true
// (vitest.config.js) efface la config mockResolvedValue avant chaque test.
beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.load = vi.fn();
});

const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const HeroMobile = (await import("../../src/components/HeroMobile.jsx")).default;

describe("HeroMobile — intitulé renommé en Showroom", () => {
  it("affiche « Showroom Gaspardnz », plus « Maison Gaspardnz »", async () => {
    render(<HeroMobile onScrollDown={() => {}} />);
    expect(await screen.findByText(/Showroom Gaspardnz/)).toBeInTheDocument();
    expect(screen.queryByText(/Maison Gaspardnz/)).not.toBeInTheDocument();
  });
});
