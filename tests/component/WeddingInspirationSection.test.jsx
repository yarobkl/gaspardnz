import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("passe à la bonne photo d'un même look en cliquant sur une vignette (transition animée, pas un saut instantané)", async () => {
    fake = createFakeSupabaseTables({
      wedding_inspirations: [{
        id: "w1", title: "Test look", description: "", color_label: "", style_label: "", occasion_label: "",
        cover_url: "", published: true, sort_order: 0,
        album: [{ src: "https://example.test/photo-1.jpg" }, { src: "https://example.test/photo-2.jpg" }],
      }],
    });
    const user = userEvent.setup();
    render(<WeddingInspirationSection />);
    const firstNode = await screen.findByAltText("Test look");
    expect(firstNode).toHaveAttribute("src", "https://example.test/photo-1.jpg");

    await user.click(screen.getByRole("button", { name: "Voir Test look photo 2" }));

    // AnimatePresence mode="wait" attend la fin de l'animation de sortie
    // (350ms) avant de monter la nouvelle photo : délai réel, pas un artefact
    // de test, d'où le timeout plus large.
    await expect.poll(() => screen.getByAltText("Test look").getAttribute("src"), { timeout: 1000 }).toBe("https://example.test/photo-2.jpg");
    // Un vrai remount (key={activeSrc} sous AnimatePresence), pas juste une
    // mutation du même <img> en place : sans ça, la transition n'existe pas
    // vraiment, seul le résultat final serait correct.
    expect(screen.getByAltText("Test look")).not.toBe(firstNode);
  });
});
