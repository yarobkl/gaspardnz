import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Galerie de photos par partenaire : pas encore affichée sur le site public
// (RLS déjà vérifiée dans scripts/rls-harness/08-partner-photos-*), juste la
// gestion admin — ajouter, retirer, sans jamais toucher au partenaire lui-même.
const PHOTO = { id: "ph1", partner_id: "p1", photo_url: "https://example.test/gateau-1.jpg", caption: "Pièce montée", sort_order: 0 };

const cloneFixtures = (photos) => ({ partner_photos: photos.map((p) => ({ ...p })) });

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const PartnerPhotosManager = (await import("../../src/components/Admin/PartnerPhotosManager.jsx")).default;

const setupFake = (photos = []) => { fake = createFakeSupabaseTables(cloneFixtures(photos)); };

describe("Photos de prestations d'un partenaire", () => {
  beforeEach(() => setupFake([PHOTO]));

  it("affiche les photos déjà enregistrées pour ce partenaire", async () => {
    render(<PartnerPhotosManager partnerId="p1" partnerName="Pâtissier Test" />);
    expect(await screen.findByAltText("Pièce montée")).toBeInTheDocument();
    expect(screen.getByText(/Pas encore affichées sur le site/)).toBeInTheDocument();
  });

  it("importe une nouvelle photo et l'ajoute à la liste", async () => {
    const user = userEvent.setup();
    render(<PartnerPhotosManager partnerId="p1" partnerName="Pâtissier Test" />);
    await screen.findByAltText("Pièce montée");

    const file = new File(["fake"], "gateau-2.jpg", { type: "image/jpeg" });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    await waitFor(() => expect(fake.state.partner_photos).toHaveLength(2));
    expect(fake.state.partner_photos[1].partner_id).toBe("p1");
  });

  it("retire une photo après confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<PartnerPhotosManager partnerId="p1" partnerName="Pâtissier Test" />);
    await screen.findByAltText("Pièce montée");

    await user.click(screen.getByRole("button", { name: "Retirer cette photo" }));
    await waitFor(() => expect(fake.state.partner_photos).toHaveLength(0));
    expect(screen.queryByAltText("Pièce montée")).not.toBeInTheDocument();
  });

  it("n'appelle rien si la confirmation de suppression est annulée", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<PartnerPhotosManager partnerId="p1" partnerName="Pâtissier Test" />);
    await screen.findByAltText("Pièce montée");

    await user.click(screen.getByRole("button", { name: "Retirer cette photo" }));
    expect(fake.state.partner_photos).toHaveLength(1);
  });
});
