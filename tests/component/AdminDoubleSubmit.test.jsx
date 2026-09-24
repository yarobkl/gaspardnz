import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Un double-clic (réflexe courant sur mobile ou avec une souris fatiguée)
// ne doit jamais créer deux fois la même chose. Les écritures sont
// ralenties ici comme sur un vrai réseau : c'est pendant ce délai que le
// second clic arrivait et partait en doublon.
const LEAD = {
  id: "l1", full_name: "Aïcha Benali", email: "aicha@test.local", phone: null, request_type: "booking_intent",
  message: "", source: "instagram", channel: "instagram", status: "new", estimated_value: null,
  metadata: {}, created_at: "2026-09-20T10:00:00.000Z",
};
const TAILOR = { id: "t1", email: "atelier@test.local", display_name: "Atelier Dupont", role: "couturier", active: true };

let fake;
const slowInsertsOn = (tables) => {
  const realFrom = fake.supabase.from;
  fake.supabase.from = (table) => {
    const query = realFrom(table);
    if (!tables.includes(table)) return query;
    const realSingle = query.single;
    query.single = () => new Promise((resolve) => setTimeout(() => resolve(realSingle()), 60));
    return query;
  };
};

vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminCRM = (await import("../../src/components/Admin/AdminCRM.jsx")).default;
const AdminTailoringOrders = (await import("../../src/components/Admin/AdminTailoringOrders.jsx")).default;

beforeEach(() => {
  fake = createFakeSupabaseTables({ leads: [{ ...LEAD }], crm_notes: [], tailoring_orders: [], admin_access: [{ ...TAILOR }] });
  slowInsertsOn(["crm_notes", "tailoring_orders"]);
});

describe("double-clic sur les boutons d'enregistrement", () => {
  it("CRM : « Ajouter la note » double-cliqué n'ajoute qu'une seule note", async () => {
    const user = userEvent.setup();
    render(<AdminCRM user={{ role: "owner" }} />);
    await user.click(await screen.findByText("Aïcha Benali"));
    await user.type(screen.getByPlaceholderText(/Compte rendu d'appel/), "Rappeler jeudi");
    await user.dblClick(screen.getByRole("button", { name: "Ajouter la note" }));

    await screen.findByText("Note ajoutée au dossier.");
    expect(fake.state.crm_notes).toHaveLength(1);
  });

  it("Commandes : « Créer et transmettre » double-cliqué ne transmet qu'une commande", async () => {
    const user = userEvent.setup();
    render(<AdminTailoringOrders user={{ role: "owner" }} />);
    await user.click(await screen.findByRole("button", { name: "Nouvelle commande" }));
    await user.type(screen.getByLabelText("Nom du client"), "Yanis Belkacem");
    await screen.findByRole("option", { name: "Atelier Dupont" });
    await user.selectOptions(screen.getByLabelText("Couturier assigné"), "atelier@test.local");
    await user.dblClick(screen.getByRole("button", { name: "Créer et transmettre" }));

    await screen.findByText("Commande créée et transmise au couturier.");
    await waitFor(() => expect(screen.queryByRole("button", { name: /Créer et transmettre|Transmission/ })).not.toBeInTheDocument());
    expect(fake.state.tailoring_orders).toHaveLength(1);
  });
});
