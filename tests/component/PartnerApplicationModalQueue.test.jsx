import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getQueuedPartnerApplications } from "../../src/services/partnerApplicationQueue.js";
import { FRENCH_CITIES } from "../../src/data/frenchCities.js";

// Bug réel : handleSubmit n'attendait jamais le résultat de
// submitPartnerApplication — un échec des 3 tentatives réseau (visiteur
// hors ligne, Supabase indisponible) faisait perdre la candidature en
// silence, sans qu'aucune trace n'en reste nulle part.
vi.mock("../../src/services/partnerApplication.js", () => ({
  submitPartnerApplication: vi.fn(async () => ({ success: false, error: "Erreur réseau" })),
}));

const PartnerApplicationModal = (await import("../../src/components/PartnerApplicationModal.jsx")).default;

describe("PartnerApplicationModal — file d'attente locale après échec réseau", () => {
  it("met la candidature en file d'attente locale quand l'envoi échoue", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    render(<PartnerApplicationModal isOpen onClose={() => {}} />);

    await user.type(screen.getByLabelText(/métier/i), "Traiteur");
    await user.type(screen.getByLabelText(/votre nom/i), "Jean Test");
    await user.selectOptions(screen.getByLabelText("Ville *"), `${FRENCH_CITIES[0][0]} (${FRENCH_CITIES[0][1]})`);
    await user.type(screen.getByLabelText(/email/i), "jean@test.fr");

    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    await expect.poll(() => getQueuedPartnerApplications(), { timeout: 1000 }).toHaveLength(1);
    expect(getQueuedPartnerApplications()[0].data).toMatchObject({ name: "Jean Test", email: "jean@test.fr" });
  });
});
