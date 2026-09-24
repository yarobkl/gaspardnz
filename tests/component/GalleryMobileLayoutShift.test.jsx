import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : chaque photo de la galerie a un ratio différent (portrait,
// carré...). Avec height:auto, le carrousel changeait de hauteur à chaque
// rotation automatique (toutes les 5s), faisant sauter tout ce qui suit
// (légende, points, boutons) — un vrai saut de mise en page (CLS), pas
// seulement esthétique. Le conteneur doit garder une hauteur fixe (ratio
// figé + objectFit cover), quelle que soit la photo affichée.
const fake = createFakeSupabaseTables({ content_albums: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const GalleryMobile = (await import("../../src/components/GalleryMobile.jsx")).default;

describe("GalleryMobile — pas de saut de mise en page au changement de photo", () => {
  it("garde un ratio d'image fixe sur le conteneur, peu importe la photo affichée", async () => {
    render(<GalleryMobile />);
    const image = await screen.findByRole("img");
    const frame = image.closest("div").parentElement;
    expect(frame).toHaveStyle({ aspectRatio: "4/5" });
    expect(image).toHaveStyle({ objectFit: "cover", height: "100%" });
  });
});
