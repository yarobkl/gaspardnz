import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : MobileHomeCompact affichait <HeritageMobile /> en permanence,
// EN PLUS de la même section rendue une seconde fois quand la tuile "La
// Maison" du menu était ouverte (App.jsx) — le contenu apparaissait deux
// fois d'affilée sur la page. Heritage doit se comporter comme toutes les
// autres tuiles (Journal, Vidéos, Mariage...) : invisible tant qu'on ne
// l'ouvre pas depuis le menu.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const MobileHomeCompact = (await import("../../src/components/MobileHomeCompact.jsx")).default;

describe("MobileHomeCompact — n'affiche plus « La Maison » en double", () => {
  it("ne rend aucun contenu Héritage tant que sa tuile n'a pas été ouverte", async () => {
    render(
      <Suspense fallback={null}>
        <MobileHomeCompact activeSection={null} onSelect={() => {}} />
      </Suspense>,
    );
    await screen.findByText("Explorer l’univers");
    expect(screen.queryByText("L'Inspirateur")).not.toBeInTheDocument();
  });
});
