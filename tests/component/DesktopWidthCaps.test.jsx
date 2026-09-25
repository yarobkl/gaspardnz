import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive, desktop 1440px) : la vignette
// Showroom et la grille Instagram n'avaient aucune limite de largeur — elles
// s'étiraient sur toute la largeur de l'écran (contrairement aux sections
// déjà corrigées en Phase 2 : Style Journal, Mariage, Style du mois).
const fake = createFakeSupabaseTables({ content_albums: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const ShowroomMobile = (await import("../../src/components/ShowroomMobile.jsx")).default;
const InstagramSection = (await import("../../src/components/sections/InstagramSection.jsx")).default;

describe("Largeur plafonnée sur bureau — Showroom et Instagram", () => {
  it("ShowroomMobile : la vignette album a une largeur maximale", async () => {
    render(<ShowroomMobile />);
    const label = await screen.findByText("GASPARDNZ · ALBUM");
    const showcase = label.closest('div[style*="cursor: pointer"]');
    expect(showcase).toHaveStyle({ maxWidth: "900px" });
  });

  it("InstagramSection : la grille de photos a une largeur maximale", () => {
    render(<InstagramSection />);
    const grid = document.querySelector('div[style*="grid-template-columns"]');
    expect(grid).toHaveStyle({ maxWidth: "900px" });
  });
});
