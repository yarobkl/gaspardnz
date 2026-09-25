import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive, 360px) : "Télécharger gratuitement"
// (letterSpacing 0.4em + padding généreux) passait sur deux lignes dès les
// petits écrans.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const FormulesSection = (await import("../../src/components/sections/FormulesSection.jsx")).default;

describe("FormulesSection — le bouton lookbook reste sur une ligne", () => {
  it("n'autorise pas le retour à la ligne du texte du bouton", async () => {
    fake = createFakeSupabaseTables({ packages: [] });
    render(<FormulesSection onContact={() => {}} />);
    const button = await screen.findByRole("button", { name: "Télécharger gratuitement" });
    expect(button).toHaveStyle({ whiteSpace: "nowrap" });
  });
});
