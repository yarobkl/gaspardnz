import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// La répartition « un couturier ne voit que ses commandes » est imposée par
// RLS côté base (déjà vérifiée dans scripts/rls-harness/06-tailoring-*) : ce
// fichier ne la re-teste pas. Il vérifie ce que ce composant doit faire une
// fois que la base lui a déjà rendu les bonnes lignes.
const STAFF_ORDER = {
  id: "o1", order_number: "CMD-2026-0001", client_name: "Jean Dupont",
  client_phone: "0611223344", client_email: "jean@example.com",
  tailor_email: "couturier-a@test.local", status: "nouvelle",
  measurements: { tour_poitrine: "102", tour_taille_veste: "88" },
  notes: "Costume trois pièces pour un mariage.", tailor_notes: "",
  created_by: "gaspard@test.local", created_at: "2026-09-01T10:00:00.000Z",
};

const cloneFixtures = (rows) => ({
  tailoring_orders: rows.map((r) => ({ ...r })),
  admin_access: [{ id: "t1", email: "couturier-a@test.local", display_name: "Atelier Dupont", role: "couturier", active: true }],
});

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminTailoringOrders = (await import("../../src/components/Admin/AdminTailoringOrders.jsx")).default;

const setupFake = (rows) => { fake = createFakeSupabaseTables(cloneFixtures(rows)); };

describe("Commandes sur-mesure — vue personnel (Gaspard)", () => {
  beforeEach(() => setupFake([STAFF_ORDER]));

  it("affiche toutes les commandes, avec la colonne couturier", async () => {
    render(<AdminTailoringOrders user={{ role: "owner" }} />);
    expect(await screen.findByText("CMD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("couturier-a@test.local")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nouvelle commande" })).toBeInTheDocument();
  });

  it("crée une commande avec les mesures saisies, assignée au bon couturier", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "owner" }} />);
    await user.click(await screen.findByRole("button", { name: "Nouvelle commande" }));

    await user.type(screen.getByLabelText("Nom du client"), "Client Test");
    // La liste des couturiers se charge de façon asynchrone (listTailors) :
    // attendre que l'option existe avant de la sélectionner.
    await screen.findByRole("option", { name: "Atelier Dupont" });
    await user.selectOptions(screen.getByLabelText("Couturier assigné"), "couturier-a@test.local");
    await user.type(screen.getByLabelText(/Tour de poitrine/), "104");
    await user.click(screen.getByRole("button", { name: "Créer et transmettre" }));

    await waitFor(() => expect(fake.state.tailoring_orders).toHaveLength(2));
    const created = fake.state.tailoring_orders.find((o) => o.client_name === "Client Test");
    expect(created.tailor_email).toBe("couturier-a@test.local");
    expect(created.measurements.tour_poitrine).toBe("104");
  });

  it("ne propose pas de bouton pour faire avancer le statut (réservé au couturier)", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "owner" }} />);
    await user.click(await screen.findByRole("button", { name: "Voir" }));
    expect(await screen.findByDisplayValue("Jean Dupont")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Commencer|Marquer terminée/ })).not.toBeInTheDocument();
  });
});

describe("Commandes sur-mesure — vue couturier", () => {
  beforeEach(() => setupFake([STAFF_ORDER]));

  it("ne propose ni création de commande ni colonne couturier", async () => {
    render(<AdminTailoringOrders user={{ role: "couturier" }} />);
    expect(await screen.findByText("CMD-2026-0001")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nouvelle commande" })).not.toBeInTheDocument();
    expect(screen.queryByText("couturier-a@test.local")).not.toBeInTheDocument();
  });

  it("peut faire avancer le statut d'une commande, jusqu'à la validation finale", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "couturier" }} />);
    await user.click(await screen.findByRole("button", { name: "Voir" }));

    await user.click(await screen.findByRole("button", { name: "Commencer" }));
    await waitFor(() => expect(fake.state.tailoring_orders[0].status).toBe("en_cours"));

    await user.click(await screen.findByRole("button", { name: "Marquer terminée" }));
    await waitFor(() => expect(fake.state.tailoring_orders[0].status).toBe("terminee"));
  });

  it("peut ajouter ses propres notes, mais les mesures restent en lecture seule", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "couturier" }} />);
    await user.click(await screen.findByRole("button", { name: "Voir" }));

    expect(screen.getByDisplayValue("Jean Dupont")).toBeDisabled();

    const notes = screen.getByLabelText("Vos notes de travail");
    await user.type(notes, "Premier essayage prévu vendredi.");
    notes.blur();

    await waitFor(() => expect(fake.state.tailoring_orders[0].tailor_notes).toBe("Premier essayage prévu vendredi."));
  });

  it("affiche un bouton pour imprimer la fiche de mesures", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "couturier" }} />);
    await user.click(await screen.findByRole("button", { name: "Voir" }));
    expect(await screen.findByRole("button", { name: "Imprimer la fiche" })).toBeInTheDocument();
  });
});
