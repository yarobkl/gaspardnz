import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Le total et les sous-totaux ne sont JAMAIS un champ saisi : ils se
// recalculent en sommant les articles réellement enregistrés (voir
// services/packagePricing.js). Ces tests vérifient que l'interface reflète
// toujours cette somme, y compris juste après un ajout ou une suppression.
const PACKAGE = {
  id: "p1", slug: "prestige", name: "Formule Prestige", subtitle: "Premium",
  description: "Une allure complète.", price: null, currency: "EUR",
  cta_label: "Réserver", published: true, featured: false, sort_order: 0, deleted_at: null,
};
const GROUP = { id: "g1", package_id: "p1", label: "Look Mairie", tag: null, sort_order: 0 };
const ITEMS = [
  { id: "i1", group_id: "g1", label: "Costume", price: 300, price_is_from: false, sort_order: 0 },
  { id: "i2", group_id: "g1", label: "Chemise", price: 50, price_is_from: false, sort_order: 1 },
];

const cloneFixtures = () => ({
  packages: [{ ...PACKAGE }],
  package_groups: [{ ...GROUP }],
  package_items: ITEMS.map((i) => ({ ...i })),
});

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminFormulesPricing = (await import("../../src/components/Admin/AdminFormulesPricing.jsx")).default;

const setupFake = () => { fake = createFakeSupabaseTables(cloneFixtures()); };

const expandPrestige = async (user) => {
  await user.click(await screen.findByRole("button", { name: /Formule Prestige/ }));
};

describe("Éditeur du détail des formules", () => {
  beforeEach(() => setupFake());

  it("affiche le sous-total et le total calculés à partir des articles, pas un champ séparé", async () => {
    const user = userEvent.setup();
    render(<AdminFormulesPricing />);
    await expandPrestige(user);
    // 300 + 50 = 350, jamais un total codé en dur.
    expect(await screen.findByText(/Sous-total · 350/)).toBeInTheDocument();
    expect(screen.getByText(/Total de la formule/).closest("div")).toHaveTextContent("350");
  });

  it("ajouter un article recalcule immédiatement le total (le point central de la demande)", async () => {
    const user = userEvent.setup();
    render(<AdminFormulesPricing />);
    await expandPrestige(user);
    await screen.findByText(/Sous-total · 350/);

    const addForm = screen.getByRole("button", { name: "+ Ajouter un article" }).closest("form");
    await user.type(within(addForm).getByPlaceholderText("Nom de l'article"), "Cravate");
    await user.type(within(addForm).getByPlaceholderText("Prix"), "30");
    await user.click(within(addForm).getByRole("button", { name: "+ Ajouter un article" }));

    await waitFor(() => expect(fake.state.package_items).toHaveLength(3));
    // 300 + 50 + 30 = 380 : recalculé, pas resté à 350.
    expect(await screen.findByText(/Sous-total · 380/)).toBeInTheDocument();
  });

  it("retirer un article recalcule le total à la baisse", async () => {
    const user = userEvent.setup();
    render(<AdminFormulesPricing />);
    await expandPrestige(user);
    const chemiseRow = screen.getByDisplayValue("Chemise").closest(".gnz-pricing-item");
    await user.click(within(chemiseRow).getByRole("button", { name: "Retirer" }));

    await waitFor(() => expect(fake.state.package_items).toHaveLength(1));
    expect(await screen.findByText(/Sous-total · 300/)).toBeInTheDocument();
  });

  it("met une formule à la corbeille sans la supprimer réellement, puis la restaure", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<AdminFormulesPricing />);
    await screen.findByText("Formule Prestige");

    await user.click(screen.getByRole("button", { name: "Corbeille" }));
    await waitFor(() => expect(fake.state.packages[0].deleted_at).not.toBeNull());
    // Toujours dans la base (pas de DELETE) : seulement marquée, et déplacée
    // dans la section Corbeille de l'écran.
    expect(fake.state.packages).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Formule Prestige/ })).not.toBeInTheDocument();
    expect(await screen.findByText("Corbeille")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Restaurer" }));
    await waitFor(() => expect(fake.state.packages[0].deleted_at).toBeNull());
    expect(await screen.findByRole("button", { name: /Formule Prestige/ })).toBeInTheDocument();
  });

  it("crée une nouvelle formule vide, prête à recevoir des menus", async () => {
    const user = userEvent.setup();
    render(<AdminFormulesPricing />);
    await user.click(await screen.findByRole("button", { name: "+ Nouvelle formule" }));
    await user.type(screen.getByLabelText("Nom"), "Formule Découverte");
    await user.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(fake.state.packages).toHaveLength(2));
    expect(await screen.findByText("Formule Découverte")).toBeInTheDocument();
  });
});
