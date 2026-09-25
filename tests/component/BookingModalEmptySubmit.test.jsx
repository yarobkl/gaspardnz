import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive) : le bouton "Continuer" était en
// dehors du <form> et se contentait d'un onClick={() => ok && setStep(2)} —
// avec des champs vides, le clic ne faisait rigoureusement rien : aucun
// message, aucun focus, aucune indication. Le bouton est maintenant un vrai
// <button type="submit"> à l'intérieur du <form>, qui déclenche la
// validation native du navigateur sur les champs required.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const BookingModal = (await import("../../src/components/BookingModal.jsx")).default;

describe("BookingModal — le bouton Continuer est un vrai bouton de formulaire", () => {
  it("ne passe pas à l'étape 2 avec des champs vides (validation native, pas un silence total)", () => {
    render(<BookingModal isOpen onClose={() => {}} />);
    const button = screen.getByRole("button", { name: /continuer/i });
    expect(button).toHaveAttribute("type", "submit");
    expect(button.closest("form")).not.toBeNull();

    fireEvent.click(button);
    expect(screen.queryByText("Choisissez")).not.toBeInTheDocument();
    // La validation native aurait empêché le formulaire d'être valide.
    const form = button.closest("form");
    expect(form.checkValidity()).toBe(false);
  });

  it("passe à l'étape 2 une fois les champs remplis", () => {
    render(<BookingModal isOpen onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: "Marc Ferrand" } });
    fireEvent.change(screen.getByLabelText(/projet/i), { target: { value: "Mariage" } });
    fireEvent.change(screen.getByLabelText(/besoin/i), { target: { value: "Costume complet" } });

    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));
    expect(screen.getByText("Choisissez")).toBeInTheDocument();
  });
});
