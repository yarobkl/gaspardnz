import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Gaspard travaille à Paris (UTC+2 l'été). En UTC, fuseau par défaut des
// tests, une conversion d'heure fausse passe inaperçue : on force donc le
// fuseau réel. Node relit process.env.TZ à chaque changement.
const previousTZ = process.env.TZ;
beforeAll(() => { process.env.TZ = "Europe/Paris"; });
afterAll(() => { if (previousTZ === undefined) delete process.env.TZ; else process.env.TZ = previousTZ; });

const BOOKING = {
  id: "b1", lead_id: null, provider: "site", status: "confirmed", title: "Essayage",
  starts_at: "2026-09-27T18:45:00.000Z", ends_at: "2026-09-27T19:45:00.000Z", notes: "", source: "site",
  metadata: { invitee_name: "Aïcha Benali" }, created_at: "2026-09-20T10:00:00.000Z",
};
const PROMO = {
  id: "p1", title: "-15% mariage", subtitle: "", description: "", image_url: "", cta_label: "Découvrir", cta_url: "",
  placement: "home", status: "active", starts_at: "2026-09-14T16:51:00.000Z", ends_at: "2026-10-14T16:51:00.000Z",
  priority: 1, published: true, created_at: "2026-09-01T10:00:00.000Z",
};

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminBookings = (await import("../../src/components/Admin/AdminBookings.jsx")).default;
const AdminPromotions = (await import("../../src/components/Admin/AdminPromotions.jsx")).default;
const { toDateTimeLocal, fromDateTimeLocal } = await import("../../src/components/Admin/dateTimeLocal.js");

beforeEach(() => {
  fake = createFakeSupabaseTables({ bookings: [{ ...BOOKING }], integration_settings: [], promotions: [{ ...PROMO }] });
});

describe("champs date/heure en heure locale (Europe/Paris)", () => {
  it("convertit dans les deux sens sans décalage", () => {
    expect(toDateTimeLocal("2026-09-27T18:45:00.000Z")).toBe("2026-09-27T20:45");
    expect(fromDateTimeLocal("2026-09-27T20:45")).toBe("2026-09-27T18:45:00.000Z");
    expect(toDateTimeLocal(null)).toBe("");
    expect(fromDateTimeLocal("")).toBeNull();
  });

  it("Réservations : la fiche affiche la même heure que le tableau et relit la saisie telle quelle", async () => {
    const user = userEvent.setup();
    render(<AdminBookings user={{ role: "owner" }} />);
    await user.click(await screen.findByText("Aïcha Benali"));
    const start = screen.getByLabelText("Début");
    expect(start).toHaveValue("2026-09-27T20:45");

    await user.clear(start);
    await user.type(start, "2026-10-15T14:30");
    await user.tab();
    await waitFor(() => expect(fake.state.bookings[0].starts_at).toBe("2026-10-15T12:30:00.000Z"));
    expect(screen.getByLabelText("Début")).toHaveValue("2026-10-15T14:30");
  });

  it("Promotions : ouvrir puis enregistrer sans rien changer ne décale pas les dates", async () => {
    const user = userEvent.setup();
    render(<AdminPromotions />);
    const row = (await screen.findByText("-15% mariage")).closest("tr");
    for (let i = 0; i < 2; i += 1) {
      await user.click(within(row).getByRole("button", { name: "Modifier" }));
      expect(screen.getByLabelText("Début")).toHaveValue("2026-09-14T18:51");
      await user.click(screen.getByRole("button", { name: "Enregistrer" }));
      await screen.findByText("Promotion enregistrée.");
    }
    expect(fake.state.promotions[0].starts_at).toBe("2026-09-14T16:51:00.000Z");
    expect(fake.state.promotions[0].ends_at).toBe("2026-10-14T16:51:00.000Z");
  });
});
