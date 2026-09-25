import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Repéré en QA interactive : le texte d'un message pouvait toucher le bord
// de sa bulle. Cause plausible : maxWidth:"80%" sans overflowWrap — un mot
// sans espace assez long (URL, email collé) déborde au lieu de se couper.
const fake = createFakeSupabaseTables({});
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const ChatBot = (await import("../../src/components/ChatBot.jsx")).default;

describe("ChatBot — les bulles de message ne débordent pas sur un mot long", () => {
  it("autorise la coupure d'un mot trop long pour rester dans la bulle", async () => {
    const user = userEvent.setup();
    render(<ChatBot />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir l'assistant Gaspard NZ" }));

    const input = screen.getByRole("textbox");
    await user.type(input, "https://exemple-tres-long-sans-aucun-espace-pour-tester.test/chemin");
    fireEvent.keyDown(input, { key: "Enter" });

    const bubble = await screen.findByText(/exemple-tres-long/);
    expect(bubble.closest("div")).toHaveStyle({ overflowWrap: "anywhere" });
  });
});
