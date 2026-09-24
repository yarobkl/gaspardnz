import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bugs réels : un clic sur le fond fermait la fenêtre ET effaçait les trois
// champs déjà remplis (reset() combinait les deux) ; Échap ne fermait pas
// la fenêtre ; le fond était en zIndex 500, sous le chatbot (600) et la
// barre de navigation (700), qui restaient cliquables par-dessus.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const BookingModal = (await import("../../src/components/BookingModal.jsx")).default;

const setup = () => { fake = createFakeSupabaseTables({ site_settings: [] }); };

describe("BookingModal", () => {
  it("un clic sur le fond ferme la fenêtre sans effacer la saisie en cours", async () => {
    setup();
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<BookingModal isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/nom/i), "Marc Ferrand");

    // Le fond est le premier élément du portail (position: fixed, inset 0).
    const backdrop = document.querySelector('[style*="position: fixed"]');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Rouvrir (isOpen redevient true) doit retrouver le texte déjà tapé.
    rerender(<BookingModal isOpen={false} onClose={onClose} />);
    rerender(<BookingModal isOpen onClose={onClose} />);
    expect(screen.getByLabelText(/nom/i)).toHaveValue("Marc Ferrand");
  });

  it("la touche Échap ferme la fenêtre", async () => {
    setup();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BookingModal isOpen onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
