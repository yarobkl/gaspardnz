import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (signalé par l'utilisateur, avec le lookbook, comme un des
// éléments illogiques du menu) : un point doré pulsant ("nouveauté à
// regarder") s'affichait en permanence sur le bouton SHOP — alors que la
// boutique n'affiche qu'un écran statique "bientôt disponible", jamais de
// contenu neuf à découvrir.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;

describe("NavMobile — pas de point « nouveauté » sur un bouton Boutique toujours en « bientôt disponible »", () => {
  it("n'affiche aucun badge pulsant sur le bouton SHOP", () => {
    render(<NavMobile />);
    const shopButton = screen.getByLabelText("Ouvrir la boutique");
    expect(shopButton.querySelector('[style*="border-radius: 50%"]')).toBeNull();
  });
});
