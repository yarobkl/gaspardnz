import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Les points cliquables (Style du mois) se saisissaient dans un textarea en
// mini-langage "X|Y|Libellé", une ligne par point : le seul champ de tout
// l'admin à demander de taper une syntaxe plutôt que de remplir des champs.
// Remplacé par des champs normaux (X, Y, Libellé) avec ajout/retrait, sur le
// modèle déjà utilisé pour les photos d'album.
const fake = createFakeSupabaseTables({
  style_month: [{ id: "s1", title: "Costume terracotta", description: "", cover_url: "", album: [], hotspots: [{ x: 68, y: 38, label: "Veste terracotta" }], starts_at: null, ends_at: null, published: true, metadata: {} }],
});
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));
const AdminStyleMonth = (await import("../../src/components/Admin/AdminStyleMonth.jsx")).default;

describe("Style du mois — points cliquables en champs normaux", () => {
  it("charge les points existants dans des champs X / Y / Libellé, pas un textarea", async () => {
    const user = userEvent.setup();
    render(<AdminStyleMonth />);
    await user.click(await screen.findByRole("button", { name: "Modifier" }));

    expect(screen.queryByPlaceholderText("68|38|Veste terracotta")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("68")).toBeInTheDocument();
    expect(screen.getByDisplayValue("38")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Veste terracotta")).toBeInTheDocument();
  });

  it("ajouter un point puis l'enregistrer l'envoie dans hotspots, sous forme structurée", async () => {
    const user = userEvent.setup();
    render(<AdminStyleMonth />);
    await user.click(await screen.findByRole("button", { name: "Modifier" }));

    await user.click(screen.getByRole("button", { name: "Ajouter un point" }));
    const labelInputs = screen.getAllByPlaceholderText("Veste terracotta");
    await user.type(labelInputs[labelInputs.length - 1], "Boutons dorés");

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await screen.findByText("Style du mois mis à jour sur le site.");

    const saved = fake.state.style_month.find((row) => row.id === "s1");
    expect(saved.hotspots).toEqual(expect.arrayContaining([
      { x: 68, y: 38, label: "Veste terracotta" },
      { x: 50, y: 50, label: "Boutons dorés" },
    ]));
    expect(saved.hotspots).toHaveLength(2);
  });

  it("retirer un point l'enlève bien de la liste enregistrée", async () => {
    const user = userEvent.setup();
    render(<AdminStyleMonth />);
    await user.click(await screen.findByRole("button", { name: "Modifier" }));

    const before = fake.state.style_month.find((row) => row.id === "s1").hotspots.length;
    await user.click(screen.getAllByRole("button", { name: "Retirer" })[0]);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await screen.findByText("Style du mois mis à jour sur le site.");

    const saved = fake.state.style_month.find((row) => row.id === "s1");
    expect(saved.hotspots).toHaveLength(before - 1);
  });
});
