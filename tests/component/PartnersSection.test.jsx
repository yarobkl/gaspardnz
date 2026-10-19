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
  it("préremplit le métier, enregistre la candidature et tente l'email", async () => {
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
    await user.selectOptions(screen.getByRole("combobox", { name: /Ville/ }), "Versailles (78)");
    expect(screen.getByRole("combobox", { name: /Ville/ })).toHaveValue("Versailles (78)");
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(await screen.findByText(/Votre candidature a été enregistrée/)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    await vi.waitFor(() => expect(supabaseModule.sendPublicEventWithRetry).toHaveBeenCalledWith("lead", expect.objectContaining({
      full_name: "Awa Diop", email: "awa@events.fr", request_type: "partner_application",
      metadata: expect.objectContaining({ trade: "Wedding Planner", company: "Awa Events", city: "Versailles (78)" }),
    })));
    await vi.waitFor(() => expect(fetchMock.mock.calls.find(([url]) => url === "/api/send-email")).toBeDefined());
    const emailCall = fetchMock.mock.calls.find(([url]) => url === "/api/send-email");
    expect(JSON.parse(emailCall[1].body)).toMatchObject({
      kind: "partner_application", clientName: "Awa Diop", clientEmail: "awa@events.fr",
    });
    vi.unstubAllGlobals();
  }, 20000);
});

// La confirmation "enregistrée" ne doit jamais apparaître tant que
// l'écriture CRM n'a pas réussi.
describe("Partenaires — « Devenir partenaire » attend le CRM", () => {
  it("n'affiche pas un succès pendant un enregistrement en attente", async () => {
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
    await user.selectOptions(screen.getByRole("combobox", { name: /Ville/ }), "Versailles (78)");
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(screen.queryByText(/Votre candidature a été enregistrée/)).not.toBeInTheDocument();
    expect(screen.getByText("Enregistrement…")).toBeInTheDocument();
    vi.unstubAllGlobals();
  }, 20000);
});

// Demandé par l'utilisateur : la catégorie "Animation / Divertissement" est
// renommée "Maître de Cérémonie (MC)", et une nouvelle catégorie
// "Retoucheur" est ajoutée (retouches des vêtements achetés chez Gaspardnz).
describe("Partenaires — nouvelles catégories Maître de Cérémonie et Retoucheur", () => {
  it("affiche « Maître de Cérémonie (MC) » avec le sigle MC dans le médaillon (pas « MD »)", async () => {
    fake = createFakeSupabaseTables({
      partners: [{ id: "p4", slug: "mc-slot", name: "À venir", category: "Maître de Cérémonie (MC)", published: true, status: "active", sort_order: 0, metadata: { placeholder: true } }],
    });
    render(<PartnersSection />);
    expect(await screen.findByText("Maître de Cérémonie (MC)")).toBeInTheDocument();
    expect(screen.getByText("MC")).toBeInTheDocument();
  });

  it("affiche une catégorie « Retoucheur » avec son propre appel à candidature", async () => {
    fake = createFakeSupabaseTables({
      partners: [{ id: "p5", slug: "retoucheur-slot", name: "À venir", category: "Retoucheur", published: true, status: "active", sort_order: 0, metadata: { placeholder: true } }],
    });
    render(<PartnersSection />);
    expect(await screen.findByText("Retoucheur")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Devenir partenaire" })).toBeInTheDocument();
  });
});
