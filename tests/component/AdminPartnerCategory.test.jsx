import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// « Événementiel » n'appartient PAS à la liste par défaut — cas volontaire :
// un partenaire déjà enregistré avec une catégorie tapée à la main avant
// l'existence du menu déroulant ne doit jamais être effacé au premier affichage.
const FIXTURES = {
  partners: [
    { id: "p1", slug: "palais-groupe", name: "Palais Groupe", category: "Événementiel", description: "", logo_url: "", website_url: "", email: "", phone: "", address: "", status: "active", commission_percent: null, client_discount_percent: null, published: true, featured: false, sort_order: 0 },
    { id: "p2", slug: "studio-lumiere", name: "Studio Lumière", category: "Photographe", description: "", logo_url: "", website_url: "", email: "", phone: "", address: "", status: "active", commission_percent: null, client_discount_percent: null, published: true, featured: false, sort_order: 1 },
  ],
};
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([t, rows]) => [t, rows.map((r) => ({ ...r }))]));

const fake = createFakeSupabaseTables(cloneFixtures());

vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminContent = (await import("../../src/components/Admin/AdminContent.jsx")).default;
const { PartnerFields } = await import("../../src/components/Admin/AdminContent.jsx");

beforeEach(() => {
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

const openPartners = async (user) => {
  render(<AdminContent user={{ role: "owner" }} />);
  await user.click(await screen.findByRole("button", { name: "Partenaires" }));
};

describe("Catégorie de partenaire — liste déroulante extensible", () => {
  it("propose une liste déroulante contenant les catégories par défaut et celles déjà utilisées", async () => {
    const user = userEvent.setup();
    await openPartners(user);
    await user.click(within(await screen.findByText("Studio Lumière").then((n) => n.closest("tr"))).getByRole("button", { name: "Modifier" }));
    const select = await screen.findByRole("combobox", { name: /catégorie/i });
    expect(within(select).getByRole("option", { name: "Photographe" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Wedding Planner" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "+ Ajouter une nouvelle catégorie…" })).toBeInTheDocument();
    expect(select.value).toBe("Photographe");
  });

  it("préserve une catégorie déjà enregistrée mais absente de la liste de choix (test du sous-composant en isolation)", () => {
    // Non reproductible via AdminContent : la liste y est dérivée des mêmes
    // lignes que celle qu'on édite, donc la catégorie éditée y figure toujours
    // par construction. Ce filet de sécurité protège un cas qui n'est pas
    // atteignable aujourd'hui mais le redeviendrait si ce calcul changeait —
    // on teste directement le contrat du sous-composant, pas ce chemin mort.
    render(<PartnerFields form={{ id: "x", category: "Sculpteur de glace" }} setForm={() => {}} categories={["Photographe", "Wedding Planner"]} />);
    expect(screen.queryByRole("combobox", { name: /catégorie/i })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Sculpteur de glace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choisir dans la liste existante" })).toBeInTheDocument();
  });

  it("permet de taper une nouvelle catégorie depuis la liste déroulante", async () => {
    const user = userEvent.setup();
    await openPartners(user);
    await user.click(await screen.findByRole("button", { name: "Ajouter" }));
    const select = await screen.findByRole("combobox", { name: /catégorie/i });
    await user.selectOptions(select, "+ Ajouter une nouvelle catégorie…");
    const input = await screen.findByPlaceholderText("Nouvelle catégorie");
    await user.type(input, "Voiturier");
    expect(input).toHaveValue("Voiturier");
  });

  it("une catégorie tout juste enregistrée réapparaît ensuite dans la liste", async () => {
    fake.state.partners.push({ id: "p3", slug: "valet-services", name: "Valet Services", category: "Voiturier", description: "", logo_url: "", website_url: "", email: "", phone: "", address: "", status: "active", commission_percent: null, client_discount_percent: null, published: true, featured: false, sort_order: 2 });
    const user = userEvent.setup();
    await openPartners(user);
    await user.click(await screen.findByRole("button", { name: "Ajouter" }));
    const select = await screen.findByRole("combobox", { name: /catégorie/i });
    expect(within(select).getByRole("option", { name: "Voiturier" })).toBeInTheDocument();
  });
});
