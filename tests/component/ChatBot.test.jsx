import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Le bouton flottant de l'assistant doit montrer, à chaque nouvelle visite,
// qu'il peut être déplacé (chute depuis le haut de l'écran + petit
// balancement latéral en atterrissant) — mais pas se rejouer à chaque simple
// actualisation de la page dans la même visite (sessionStorage, pas
// localStorage), et retenir en permanence la position où le visiteur l'a
// glissé (localStorage, lui, pour de vrai).
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
    sessionStorage.clear();
  });

  it("première visite : part de très haut (hors écran) avant de retomber, et marque l'intro comme vue pour cette visite", async () => {
    render(<ChatBot />);
    const fab = screen.getByRole("button", { name: FAB_LABEL });
    // Avant toute animation, le bouton doit être positionné bien au-dessus
    // de l'écran — c'est ce qui permet la chute, pas un simple fondu.
    expect(fab.style.transform).toMatch(/translateY\(-\d{3,}/);

    // La chute (~1.1s) puis le balancement (~0.7s) sont des délais réels de
    // framer-motion, pas un artefact de test, d'où le timeout large.
    await expect.poll(() => sessionStorage.getItem("gnz-chatbot-fab-intro-seen"), { timeout: 4000 }).toBe("1");
  });

  it("même visite, page actualisée (intro déjà vue dans la session) : réapparaît directement à la position mémorisée, sans rejouer la chute", () => {
    sessionStorage.setItem("gnz-chatbot-fab-intro-seen", "1");
    localStorage.setItem("gnz-chatbot-fab-pos", JSON.stringify({ x: 5, y: 10 }));
    render(<ChatBot />);
    const fab = screen.getByRole("button", { name: FAB_LABEL });
    expect(fab.style.transform).toContain("translateY(10px)");
    expect(fab.style.transform).not.toMatch(/translateY\(-\d{3,}/);
  });

  it("nouvelle visite (nouvelle session, mais position déjà glissée avant) : la chute se rejoue, puis retombe à la position mémorisée", async () => {
    // sessionStorage vide (nouvelle visite) mais localStorage garde la
    // position d'une visite précédente : la chute doit rejouer, ET
    // atterrir sur la position mémorisée, pas la position par défaut.
    localStorage.setItem("gnz-chatbot-fab-pos", JSON.stringify({ x: 5, y: 10 }));
    render(<ChatBot />);
    const fab = screen.getByRole("button", { name: FAB_LABEL });
    expect(fab.style.transform).toMatch(/translateY\(-\d{3,}/);

    await expect.poll(() => fab.style.transform, { timeout: 4000 }).toContain("translateY(10px)");
    expect(sessionStorage.getItem("gnz-chatbot-fab-intro-seen")).toBe("1");
  });
});
