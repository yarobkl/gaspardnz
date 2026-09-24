import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel signalé en prod : un partenaire masqué depuis l'admin (published:
// false) réapparaissait par intermittence. Cause : usePublicCollection()
// traitait "aucune ligne publiée" comme un échec et basculait sur la liste
// de démo statique (src/data/partners.js), qui contient ce même partenaire
// sans savoir qu'il a été masqué. Un « Palais Groupe » masqué doit donc
// rester invisible même quand c'est la SEULE ligne de la table.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: vi.fn(async () => ({ ok: true })),
  sendPublicEventWithRetry: vi.fn(async () => ({ ok: true, id: "lead-1" })),
}));

const PartnersSection = (await import("../../src/components/sections/PartnersSection.jsx")).default;

describe("Partenaires — un partenaire masqué ne doit jamais réapparaître via le repli statique", () => {
  it("n'affiche pas un partenaire masqué, même s'il est le seul de la table (résultat Supabase vide, pas une panne)", async () => {
    fake = createFakeSupabaseTables({
      partners: [{ id: "p1", slug: "palais-groupe", name: "Palais Groupe", category: "Lieu Événement", published: false, featured: true, status: "active", sort_order: 0 }],
    });
    render(<PartnersSection />);
    expect((await screen.findAllByText("Nos Partenaires")).length).toBeGreaterThan(0);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.queryByText("Palais Groupe")).not.toBeInTheDocument();
  });
});

// Les catégories encore sans partenaire (« À venir ») deviennent un appel
// aux professionnels : bouton « Devenir partenaire » qui ouvre un formulaire
// dédié, métier prérempli, enregistré dans le CRM puis envoyé par email.
describe("Partenaires — une catégorie à pourvoir ouvre le formulaire « Devenir partenaire »", () => {
  it("préremplit le métier, enregistre la candidature et envoie l'email", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const supabaseModule = await import("../../src/services/supabaseClient.js");
    fake = createFakeSupabaseTables({
      partners: [{ id: "p2", slug: "wedding-planner-slot", name: "À venir", category: "Wedding Planner", published: true, status: "active", sort_order: 0, metadata: { placeholder: true } }],
    });
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PartnersSection />);

    expect(await screen.findByText("Nous recherchons un partenaire")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Devenir partenaire" }));

    const dialog = await screen.findByRole("dialog");
    expect(screen.getByLabelText(/Métier/)).toHaveValue("Wedding Planner");
    await user.type(screen.getByLabelText(/Votre nom/), "Awa Diop");
    await user.type(screen.getByLabelText(/Entreprise/), "Awa Events");
    await user.selectOptions(screen.getByRole("combobox", { name: /Ville/ }), "Lyon (69)");
    expect(screen.getByRole("combobox", { name: /Ville/ })).toHaveValue("Lyon (69)");
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(await screen.findByText(/Votre candidature a bien été envoyée/)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    await vi.waitFor(() => expect(supabaseModule.sendPublicEventWithRetry).toHaveBeenCalledWith("lead", expect.objectContaining({
      full_name: "Awa Diop", email: "awa@events.fr", request_type: "partner_application",
      metadata: expect.objectContaining({ trade: "Wedding Planner", company: "Awa Events", city: "Lyon (69)" }),
    })));
    // Emails en pause (EMAIL_NOTIFICATIONS_ENABLED = false) : la candidature
    // part uniquement dans le CRM, aucun appel à l'envoi d'email.
    expect(fetchMock.mock.calls.find(([url]) => url === "/api/send-email")).toBeUndefined();
    vi.unstubAllGlobals();
  });
});

// Cas réel en prod : sur 4G l'envoi prenait plusieurs secondes, puis
// affichait une erreur quand l'email échouait. Le visiteur doit voir la
// confirmation immédiatement, l'enregistrement se fait en arrière-plan.
describe("Partenaires — « Devenir partenaire » confirme sans attendre le réseau", () => {
  it("affiche la confirmation tout de suite, même si l'enregistrement est encore en cours", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const supabaseModule = await import("../../src/services/supabaseClient.js");
    supabaseModule.sendPublicEventWithRetry.mockImplementationOnce(() => new Promise(() => {}));
    fake = createFakeSupabaseTables({
      partners: [{ id: "p3", slug: "dj-slot", name: "À venir", category: "DJ / Musique", published: true, status: "active", sort_order: 0, metadata: { placeholder: true } }],
    });
    const user = userEvent.setup();
    render(<PartnersSection />);

    await user.click(await screen.findByRole("button", { name: "Devenir partenaire" }));
    await user.type(screen.getByLabelText(/Votre nom/), "Awa Diop");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    // « Autre ville » : saisie libre pour un professionnel hors de France
    // ou dans une ville trop petite pour la liste.
    await user.selectOptions(screen.getByRole("combobox", { name: /Ville/ }), "Autre ville…");
    await user.type(screen.getByPlaceholderText("Nom de votre ville"), "Genève");
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(screen.getByText(/Votre candidature a bien été envoyée/)).toBeInTheDocument();
    vi.unstubAllGlobals();
    expect(screen.queryByText(/Erreur/)).not.toBeInTheDocument();
  });
});
