import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Le bouton flottant de l'assistant doit montrer, à la toute première
// visite, qu'il peut être déplacé (chute depuis le haut de l'écran + petit
// balancement latéral en atterrissant) — puis ne plus rejouer cette
// démonstration, et retenir la position où le visiteur l'a glissé.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const ChatBot = (await import("../../src/components/ChatBot.jsx")).default;
const FAB_LABEL = "Ouvrir l'assistant Gaspard NZ";

describe("Bouton flottant de l'assistant — démonstration \"déplaçable\" + position mémorisée", () => {
  beforeEach(() => {
    fake = createFakeSupabaseTables({});
    localStorage.clear();
  });

  it("première visite : part de très haut (hors écran) avant de retomber, et marque l'intro comme vue", async () => {
    render(<ChatBot />);
    const fab = screen.getByRole("button", { name: FAB_LABEL });
    // Avant toute animation, le bouton doit être positionné bien au-dessus
    // de l'écran — c'est ce qui permet la chute, pas un simple fondu.
    expect(fab.style.transform).toMatch(/translateY\(-\d{3,}/);

    // La chute (~1.1s) puis le balancement (~0.7s) sont des délais réels de
    // framer-motion, pas un artefact de test, d'où le timeout large.
    await expect.poll(() => localStorage.getItem("gnz-chatbot-fab-intro-seen"), { timeout: 4000 }).toBe("1");
  });

  it("visite suivante (intro déjà vue) : réapparaît directement à la position mémorisée, sans rejouer la chute", () => {
    localStorage.setItem("gnz-chatbot-fab-intro-seen", "1");
    localStorage.setItem("gnz-chatbot-fab-pos", JSON.stringify({ x: 5, y: 10 }));
    render(<ChatBot />);
    const fab = screen.getByRole("button", { name: FAB_LABEL });
    expect(fab.style.transform).toContain("translateY(10px)");
    expect(fab.style.transform).not.toMatch(/translateY\(-\d{3,}/);
  });
});
