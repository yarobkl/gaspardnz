import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug signalé en prod : sur une connexion lente ou un album jamais consulté
// (rien en cache navigateur), ouvrir l'album affichait un cadre noir figé
// tant que la photo n'avait pas fini de charger — indiscernable d'une page
// cassée. Il faut un vrai indicateur de chargement, pas un silence noir.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const VIPSection = (await import("../../src/components/sections/VIPSection.jsx")).default;

describe("Album VIP — indicateur de chargement au lieu d'un cadre noir figé", () => {
  it("affiche un indicateur tant que la photo n'est pas chargée, puis la révèle une fois l'évènement load reçu", async () => {
    fake = createFakeSupabaseTables({
      vip_clients: [{
        id: "v1", name: "Boris", city: "Paris", published: true, sort_order: 0,
        photo_url: "https://example.test/boris-01.jpg",
        album: ["https://example.test/boris-01.jpg", "https://example.test/boris-02.jpg"],
      }],
    });
    const user = userEvent.setup();
    render(<VIPSection />);

    await screen.findByText("Boris");
    await user.click(screen.getByRole("button", { name: /voir l'album/i }));

    const dialog = await screen.findByRole("dialog");
    const img = dialog.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.test/boris-01.jpg");

    // Avant le chargement réel de l'image : invisible (opacity 0), avec un
    // indicateur de chargement affiché à la place — jamais juste du noir.
    expect(img.style.opacity).toBe("0");
    expect(dialog.textContent).not.toBe("");
    const spinnerDots = Array.from(dialog.querySelectorAll("div")).filter(
      (el) => el.style.borderRadius === "50%" && el.style.width === "7px"
    );
    expect(spinnerDots.length).toBeGreaterThan(0);

    // Une fois l'évènement "load" reçu (photo réellement arrivée), l'image
    // devient visible.
    fireEvent.load(img);
    expect(img.style.opacity).toBe("1");
  });
});
