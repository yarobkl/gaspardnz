import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Formules — lookbook : reflète les mêmes réglages que le menu (NavMobile)", () => {
  // Bug réel (signalé par l'utilisateur) : ce bouton restait désactivé en
  // dur quoi qu'il arrive dans les réglages — un visiteur voyait le
  // téléchargement "disponible et gratuit" dans le menu hamburger
  // (NavMobile.jsx, qui lit bien settings.lookbookPdfUrl/lookbookHidden),
  // puis "bientôt disponible" ici pour exactement le même fichier.
  it("active le bouton dès qu'un PDF est déposé et non masqué, sans mention « bientôt disponible »", async () => {
    fake = createFakeSupabaseTables({
      packages: [],
      site_settings: [{ key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf", pdf_filename: "lookbook.pdf" }, is_public: true }],
    });
    render(<FormulesSection onContact={() => {}} />);
    const button = await screen.findByRole("button", { name: "Télécharger gratuitement" });
    expect(button).not.toBeDisabled();
    expect(screen.queryByText("À venir")).not.toBeInTheDocument();
  });

  it("reste désactivé avec la mention de disponibilité tant qu'aucun PDF n'est déposé", async () => {
    fake = createFakeSupabaseTables({ packages: [], site_settings: [] });
    render(<FormulesSection onContact={() => {}} />);
    const button = await screen.findByRole("button", { name: "Télécharger gratuitement" });
    expect(button).toBeDisabled();
    expect(await screen.findByText("À venir")).toBeInTheDocument();
  });

  it("reste désactivé si l'admin masque volontairement le lookbook, même avec un PDF déposé", async () => {
    fake = createFakeSupabaseTables({
      packages: [],
      site_settings: [
        { key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf" }, is_public: true },
        { key: "payment", value: { lookbook_hidden: true, lookbook_hidden_message: "Bientôt disponible" }, is_public: true },
      ],
    });
    render(<FormulesSection onContact={() => {}} />);
    expect(await screen.findByRole("button", { name: "Télécharger gratuitement" })).toBeDisabled();
    expect(await screen.findByText("Bientôt disponible")).toBeInTheDocument();
  });
});
