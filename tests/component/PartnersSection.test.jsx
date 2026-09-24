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
  sendPublicEvent: vi.fn(async () => ({ ok: true, id: "lead-1" })),
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
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(await screen.findByText(/Votre candidature a bien été envoyée/)).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(supabaseModule.sendPublicEvent).toHaveBeenCalledWith("lead", expect.objectContaining({
      full_name: "Awa Diop", email: "awa@events.fr", request_type: "partner_application",
      metadata: expect.objectContaining({ trade: "Wedding Planner", company: "Awa Events" }),
    }));
    const emailCall = fetchMock.mock.calls.find(([url]) => url === "/api/send-email");
    expect(JSON.parse(emailCall[1].body)).toMatchObject({ kind: "partner_application", trade: "Wedding Planner", company: "Awa Events", clientName: "Awa Diop" });
    vi.unstubAllGlobals();
  });
});

// Cas réel en prod : la candidature était enregistrée dans le CRM mais
// l'email échouait (identifiants SMTP refusés). Le professionnel voyait une
// erreur, renvoyait le formulaire et créait des doublons. Et sur 4G, le
// premier appel au CRM pouvait se perdre.
describe("Partenaires — « Devenir partenaire » résiste aux pannes", () => {
  it("affiche le succès si le CRM a enregistré, même quand l'email échoue, et réessaie le CRM une fois", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const supabaseModule = await import("../../src/services/supabaseClient.js");
    supabaseModule.sendPublicEvent.mockClear();
    supabaseModule.sendPublicEvent
      .mockResolvedValueOnce({ ok: false, status: 0 })
      .mockResolvedValueOnce({ ok: true, id: "lead-2" });
    fake = createFakeSupabaseTables({
      partners: [{ id: "p3", slug: "dj-slot", name: "À venir", category: "DJ / Musique", published: true, status: "active", sort_order: 0, metadata: { placeholder: true } }],
    });
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({ error: "Erreur lors de l'envoi de l'email" }) })));
    const user = userEvent.setup();
    render(<PartnersSection />);

    await user.click(await screen.findByRole("button", { name: "Devenir partenaire" }));
    await user.type(screen.getByLabelText(/Votre nom/), "Awa Diop");
    await user.type(screen.getByLabelText(/Email/), "awa@events.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(await screen.findByText(/Votre candidature a bien été envoyée/)).toBeInTheDocument();
    const leadCalls = supabaseModule.sendPublicEvent.mock.calls.filter(([type]) => type === "lead");
    expect(leadCalls).toHaveLength(2);
    vi.unstubAllGlobals();
  });
});
