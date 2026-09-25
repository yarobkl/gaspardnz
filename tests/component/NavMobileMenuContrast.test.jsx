import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bugs réels (trouvés en QA interactive) : le menu ouvert (fond crème) avait
// deux textes bien en dessous du contraste WCAG, indépendamment de tout
// réglage — la bascule "contraste élevé" du site ne les touche pas puisque
// ce panneau n'est pas dans #gnz-app-root section (seul élément filtré) :
// 1. Le sous-titre du lookbook actif (doré sur crème, ~2.4:1).
// 2. Les langues non actives (texte sombre à 30% d'opacité, ~2:1).
const fake = createFakeSupabaseTables({
  site_settings: [{ key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf" }, is_public: true }],
});
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;

describe("NavMobile — contraste du menu ouvert", () => {
  it("le libellé Lookbook actif utilise un texte sombre lisible, pas le doré peu contrasté", async () => {
    render(<NavMobile />);
    fireEvent.click(screen.getByLabelText("Ouvrir le menu"));
    const lookbookButton = await screen.findByRole("button", { name: /lookbook/i });
    expect(lookbookButton).toHaveStyle({ color: "rgb(28, 18, 8)" });
  });

  it("les langues non actives restent lisibles (pas 30% d'opacité)", async () => {
    render(<NavMobile />);
    fireEvent.click(screen.getByLabelText("Ouvrir le menu"));
    const enButton = await screen.findByLabelText("Passer en EN");
    expect(enButton).toHaveStyle({ color: "rgba(28, 18, 8, 0.55)" });
  });
});
