import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const StyleDuMoisSection = (await import("../../src/components/sections/StyleDuMoisSection.jsx")).default;

describe("Style du mois — transition entre photos d'un même look", () => {
  it("passe à la bonne photo en cliquant sur une vignette, avec un vrai remount (transition animée, pas un saut instantané)", async () => {
    fake = createFakeSupabaseTables({
      style_month: [{
        id: "s1", title: "Test style", description: "", starts_at: "2020-01-01", ends_at: null, published: true,
        cover_url: "https://example.test/style-1.jpg",
        album: ["https://example.test/style-1.jpg", "https://example.test/style-2.jpg"],
      }],
    });
    const user = userEvent.setup();
    render(<StyleDuMoisSection />);
    const firstNode = await screen.findByAltText("Test style");
    expect(firstNode).toHaveAttribute("src", "https://example.test/style-1.jpg");

    await user.click(screen.getByRole("button", { name: "Voir Test style photo 2" }));

    // AnimatePresence mode="wait" attend la fin de l'animation de sortie
    // (350ms) avant de monter la nouvelle photo : délai réel, pas un artefact
    // de test, d'où le timeout plus large.
    await expect.poll(() => screen.getByAltText("Test style").getAttribute("src"), { timeout: 1000 }).toBe("https://example.test/style-2.jpg");
    // Un vrai remount (key={activeSrc} sous AnimatePresence), pas juste une
    // mutation du même <img> en place.
    expect(screen.getByAltText("Test style")).not.toBe(firstNode);
  });
});
