import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bugs réels (trouvés en QA interactive, desktop) :
// 1. Le rail horizontal des cartes n'avait pas d'alignItems : par défaut
//    ("stretch"), chaque carte était étirée à la hauteur de la plus grande,
//    laissant une zone vide en bas des cartes plus courtes.
// 2. Sur une actualité à plusieurs photos, le texte lieu/date (bottom:28px)
//    tombait en plein dans la zone de clic de 44px des points de
//    pagination (12 à 56px) — le petit trait doré du point actif
//    traversait visuellement le texte.
const fake = createFakeSupabaseTables({
  news_posts: [
    {
      id: "n1", locale: "FR", published: true, published_at: "2025-05-01",
      title: "Titre court", body: "Texte.",
      metadata: { location: "Abidjan, Côte d'Ivoire", date_label: "Mai 2025" },
      gallery: ["https://example.test/photo-1.jpg", "https://example.test/photo-2.jpg"],
    },
  ],
});
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const ActualitesSection = (await import("../../src/components/sections/ActualitesSection.jsx")).default;

describe("ActualitesSection — mise en page desktop", () => {
  it("le rail de cartes n'étire pas les cartes à la même hauteur (alignItems: start)", async () => {
    render(<ActualitesSection />);
    await screen.findByText("Titre court");
    const rail = document.querySelector('div[style*="grid-auto-flow"]');
    expect(rail).toHaveStyle({ alignItems: "start" });
  });

  it("le texte lieu/date d'une actualité à plusieurs photos ne chevauche pas les points de pagination", async () => {
    render(<ActualitesSection />);
    const location = await screen.findByText(/Abidjan, Côte d'Ivoire/);
    const wrapper = location.closest("div");
    expect(wrapper).toHaveStyle({ bottom: "54px" });
  });
});
