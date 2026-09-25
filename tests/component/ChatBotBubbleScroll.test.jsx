import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive) : la bulle "Une question ?" apparaît
// 10s après l'arrivée, toujours au même endroit fixe (bas-droite) — sans
// tenir compte du défilement, elle recouvrait le bouton "Voir tous les
// looks" de la Galerie quand le visiteur y était déjà rendu à ce moment-là.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const ChatBot = (await import("../../src/components/ChatBot.jsx")).default;
const BUBBLE_TEXT_LABEL = /une question/i;

const setScrollY = (value) => {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value });
};

describe("ChatBot — la bulle ne s'affiche pas quand le visiteur a déjà défilé loin", () => {
  beforeEach(() => {
    fake = createFakeSupabaseTables({});
    vi.useFakeTimers();
    setScrollY(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("n'affiche pas la bulle si le visiteur a déjà défilé au-delà du haut de page", () => {
    render(<ChatBot />);
    setScrollY(900);
    act(() => { vi.advanceTimersByTime(10100); });
    expect(screen.queryByText(BUBBLE_TEXT_LABEL)).not.toBeInTheDocument();
  });

  it("affiche la bulle si le visiteur est toujours en haut de page", () => {
    render(<ChatBot />);
    act(() => { vi.advanceTimersByTime(10100); });
    expect(screen.getByText(BUBBLE_TEXT_LABEL)).toBeInTheDocument();
  });
});
