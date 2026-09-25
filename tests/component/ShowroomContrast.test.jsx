import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive, WCAG) : le bouton "Explorer le
// catalogue" affichait un texte doré (#b8973e) sur le fond crème de la
// section (#f5f0e8) — un contraste d'environ 2.6:1, bien en dessous du
// 4.5:1 requis pour un texte de cette taille (WCAG AA), donc peu lisible.
const fake = createFakeSupabaseTables({ content_albums: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const ShowroomMobile = (await import("../../src/components/ShowroomMobile.jsx")).default;

describe("ShowroomMobile — contraste du bouton « Explorer le catalogue »", () => {
  it("utilise un texte sombre lisible sur fond crème, pas le doré peu contrasté", async () => {
    render(<ShowroomMobile />);
    const button = await screen.findByRole("button", { name: /explorer le catalogue/i });
    expect(button).toHaveStyle({ color: "rgb(28, 18, 8)" });
  });
});
