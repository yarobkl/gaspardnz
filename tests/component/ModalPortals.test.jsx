import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel trouvé lors d'une passe de QA : le mode jour ("lightMode",
// activé par défaut chez beaucoup de visiteurs via prefers-color-scheme)
// applique un CSS filter à chaque <section>, et le mode contraste élevé en
// applique un à <body>. Un `filter` sur un ancêtre crée un bloc de
// positionnement pour ses descendants en position:fixed (comme un
// transform) — un modal "plein écran" rendu à l'intérieur d'une section se
// retrouvait donc positionné par rapport à cette section, pas par rapport à
// l'écran, dès que l'un de ces deux réglages était actif. La correction fait
// sortir ces overlays de l'arbre via un portail (components/ui/Portal.jsx),
// donc ce test vérifie que le modal atterrit bien en enfant direct de
// document.body plutôt qu'à l'intérieur de la <section> qui l'a ouvert,
// même quand cette section porte un filter (simulant le mode jour actif).
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const VIPSection = (await import("../../src/components/sections/VIPSection.jsx")).default;

describe("Album VIP — le modal reste positionné par rapport à l'écran, pas à une section filtrée", () => {
  it("rend le dialogue en dehors de la <section> (via portail), même quand celle-ci a un CSS filter actif", async () => {
    fake = createFakeSupabaseTables({
      vip_clients: [{
        id: "v1", name: "Boris", city: "Paris", published: true, sort_order: 0,
        photo_url: "https://example.test/boris-01.jpg",
        album: ["https://example.test/boris-01.jpg", "https://example.test/boris-02.jpg"],
      }],
    });
    const user = userEvent.setup();
    const { container } = render(<VIPSection />);

    await screen.findByText("Boris");
    const sectionEl = container.querySelector("section");
    expect(sectionEl).toBeTruthy();
    // Simule le mode jour : un filter réel sur l'ancêtre, comme en prod.
    sectionEl.style.filter = "brightness(1.18) saturate(0.82)";

    await user.click(screen.getByRole("button", { name: /voir l'album/i }));

    const dialog = await screen.findByRole("dialog");
    expect(sectionEl.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });
});
