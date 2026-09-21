import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Même classe de bug que Partenaires/VIP : une inspiration mariage masquée
// depuis l'admin ne doit jamais être remplacée par la liste de démo
// statique (src/data/weddingInspirationData.js).
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const WeddingInspirationSection = (await import("../../src/components/sections/WeddingInspirationSection.jsx")).default;

describe("Inspirations mariage — aucun repli figé quand rien n'est publié", () => {
  it("n'affiche pas la liste de démo quand la seule inspiration réelle est masquée", async () => {
    fake = createFakeSupabaseTables({
      wedding_inspirations: [{ id: "w1", title: "Test masqué", description: "", color_label: "", style_label: "", occasion_label: "", cover_url: "", album: [], published: false, sort_order: 0 }],
    });
    const { container } = render(<WeddingInspirationSection />);
    await new Promise((resolve) => setTimeout(resolve, 30));
    // "Inspiration look Mariage" est le premier titre de la démo statique FR.
    expect(screen.queryByText("Inspiration look Mariage")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
