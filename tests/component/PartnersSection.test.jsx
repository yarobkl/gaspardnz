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
