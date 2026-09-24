import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const VIPSection = (await import("../../src/components/sections/VIPSection.jsx")).default;

describe("Galerie clients (VIP) — ouverture au clavier et texte d'état", () => {
  it("le bouton « Voir l'album » s'ouvre aussi avec la touche Entrée, pas seulement au clic", async () => {
    // Bug réel : le bouton n'écoutait que onPointerUp, jamais atteint par
    // l'activation clavier standard (Entrée/Espace) d'un <button>.
    fake = createFakeSupabaseTables({
      vip_clients: [{ id: "v1", name: "Boris", city: "Paris", published: true, sort_order: 0, album: ["https://example.test/boris-01.jpg"] }],
    });
    const user = userEvent.setup();
    render(<VIPSection />);

    await screen.findByText("Boris");
    const albumButton = await screen.findByText("Voir l'album");
    albumButton.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("affiche un texte traduit (pas la clé brute) quand l'album ouvert n'a aucune photo valide", async () => {
    // Bug réel : t("no_photos") || "Aucune photo" — la clé no_photos
    // n'existait dans aucune langue, or t() renvoie toujours la clé si elle
    // est absente (jamais une chaîne vide), donc le || ne se déclenchait
    // jamais : le visiteur aurait vu littéralement "no_photos".
    fake = createFakeSupabaseTables({
      vip_clients: [{ id: "v1", name: "Boris", city: "Paris", published: true, sort_order: 0, album: [null] }],
    });
    const user = userEvent.setup();
    render(<VIPSection />);

    await screen.findByText("Boris");
    await user.click(await screen.findByText("Voir l'album"));

    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toContain("Aucune photo");
    expect(dialog.textContent).not.toContain("no_photos");
  });
});
