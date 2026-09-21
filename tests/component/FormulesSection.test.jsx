import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Trouvé en auditant tous les boutons du site (npm run test:e2e, hors ligne) :
// une panne ou une lenteur Supabase laissait cette section durablement vide,
// sans message ni moyen de contact, depuis le passage aux données dynamiques.
const PACKAGE = {
  id: "p1", slug: "prestige", name: "Formule Prestige", subtitle: "Premium",
  description: "Une allure complète.", price: null, currency: "EUR",
  cta_label: "Réserver", published: true, featured: false, sort_order: 0, deleted_at: null,
};

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const FormulesSection = (await import("../../src/components/sections/FormulesSection.jsx")).default;

describe("Formules — repli si aucune donnée ne charge", () => {
  it("affiche un message de contact plutôt qu'une section vide quand la base ne répond rien", async () => {
    fake = createFakeSupabaseTables({ packages: [] });
    render(<FormulesSection onContact={() => {}} />);
    expect(await screen.findByText(/momentanément indisponibles/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rendez-vous" })).toBeInTheDocument();
  });

  it("n'affiche PAS le message de repli une fois une vraie formule chargée", async () => {
    fake = createFakeSupabaseTables({ packages: [{ ...PACKAGE }] });
    render(<FormulesSection onContact={() => {}} />);
    expect(await screen.findByText("Formule Prestige")).toBeInTheDocument();
    expect(screen.queryByText(/momentanément indisponibles/)).not.toBeInTheDocument();
  });
});

describe("Formules — lookbook gratuit (Stripe mis de côté)", () => {
  it("télécharge le PDF en place (blob), sans navigation ni nouvel onglet, dès qu'un PDF est déposé", async () => {
    fake = createFakeSupabaseTables({
      packages: [],
      site_settings: [{ key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf", pdf_filename: "lookbook.pdf" }, is_public: true }],
    });

    const fakeBlob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => fakeBlob }));
    // jsdom n'implémente pas ces deux méthodes : on ne peut pas les espionner
    // (spyOn exige qu'elles existent déjà), il faut les poser nous-mêmes.
    URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<FormulesSection onContact={() => {}} />);
    // C'est un <button>, pas un <a href> : rien n'ouvre le PDF directement,
    // c'est le seul moyen d'éviter la navigation cross-origine que le
    // navigateur ferait sur un simple lien vers Supabase Storage.
    const button = await screen.findByRole("button", { name: "Télécharger gratuitement" });
    await user.click(button);

    expect(fetch).toHaveBeenCalledWith("https://example.test/lookbook.pdf");
    expect(clickSpy).toHaveBeenCalled();
    expect(screen.queryByText("À venir")).not.toBeInTheDocument();

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("affiche « À venir » tant qu'aucun PDF n'est déposé", async () => {
    fake = createFakeSupabaseTables({ packages: [], site_settings: [] });
    render(<FormulesSection onContact={() => {}} />);
    expect(await screen.findByText("À venir")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Télécharger gratuitement" })).not.toBeInTheDocument();
  });
});
