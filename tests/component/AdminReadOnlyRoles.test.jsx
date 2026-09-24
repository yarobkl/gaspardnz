import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// RLS (supabase/migrations/20260910120100_rbac_restrictive_policies.sql)
// réserve l'écriture de leads, bookings, crm_notes et site_settings au rôle
// admin et au-dessus. L'interface proposait pourtant ces formulaires à un
// lecteur seul ou à un éditeur : la modification semblait prise à l'écran
// puis échouait côté serveur avec un message technique.
const LEAD = {
  id: "l1", full_name: "Aïcha Benali", email: "aicha@test.local", phone: null, request_type: "booking_intent",
  message: "", source: "site", channel: "web", status: "new", estimated_value: null, metadata: {},
  created_at: "2026-09-20T10:00:00.000Z",
};
const BOOKING = {
  id: "b1", provider: "site", status: "requested", title: "Essayage", starts_at: null, ends_at: null, notes: "",
  source: "site", metadata: { invitee_name: "Nadia Traoré" }, created_at: "2026-09-20T10:00:00.000Z",
};

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminCRM = (await import("../../src/components/Admin/AdminCRM.jsx")).default;
const AdminBookings = (await import("../../src/components/Admin/AdminBookings.jsx")).default;
const AdminContent = (await import("../../src/components/Admin/AdminContent.jsx")).default;

beforeEach(() => {
  fake = createFakeSupabaseTables({
    leads: [{ ...LEAD }], bookings: [{ ...BOOKING }], integration_settings: [],
    site_settings: [{ key: "contact", value: { email: "contact@test.local" }, is_public: true }],
  });
});

describe("fiches en lecture seule selon le rôle", () => {
  it.each(["viewer", "editor"])("CRM : un compte %s consulte la fiche sans pouvoir la modifier", async (role) => {
    const user = userEvent.setup();
    render(<AdminCRM user={{ role }} />);
    await user.click(await screen.findByText("Aïcha Benali"));
    expect(screen.getByText(/Lecture seule/)).toBeInTheDocument();
    expect(screen.getByLabelText("Statut")).toBeDisabled();
    expect(screen.getByLabelText("Nom")).toBeDisabled();
  });

  it("CRM : un administrateur garde la fiche modifiable", async () => {
    const user = userEvent.setup();
    render(<AdminCRM user={{ role: "admin" }} />);
    await user.click(await screen.findByText("Aïcha Benali"));
    expect(screen.queryByText(/Lecture seule/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Statut"), "contacted");
    await screen.findByText("Modification enregistrée en temps réel.");
    expect(fake.state.leads[0].status).toBe("contacted");
  });

  it("Réservations : un éditeur consulte sans pouvoir modifier", async () => {
    const user = userEvent.setup();
    render(<AdminBookings user={{ role: "editor" }} />);
    await user.click(await screen.findByText("Nadia Traoré"));
    expect(screen.getByLabelText("Statut")).toBeDisabled();
    expect(screen.getByLabelText("Début")).toBeDisabled();
  });

  it("Contenu › Général : lecture seule pour un éditeur, modifiable pour un administrateur", async () => {
    const { unmount } = render(<AdminContent user={{ role: "editor" }} />);
    expect(await screen.findByText(/ne peuvent être modifiées que par un administrateur/)).toBeInTheDocument();
    expect((await screen.findAllByRole("button", { name: "Enregistrer" }))[0]).toBeDisabled();
    unmount();

    render(<AdminContent user={{ role: "admin" }} />);
    expect((await screen.findAllByRole("button", { name: "Enregistrer" }))[0]).toBeEnabled();
    expect(screen.queryByText(/ne peuvent être modifiées que par un administrateur/)).not.toBeInTheDocument();
  });
});
