import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive) : un titre saisi dans l'admin ("Akwaba
// Gaspard NZ !") pouvait couper juste avant le "!", le laissant seul en
// début de ligne suivante. Convention typographique française : espace
// insécable avant !, ?, :, ; — uniquement en français.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const ActualitesSection = (await import("../../src/components/sections/ActualitesSection.jsx")).default;
const { LangCtx } = await import("../../src/context.jsx");

const POST = {
  id: "n1", title: "Akwaba Gaspard NZ !", excerpt: "", body: "Texte.",
  cover_url: "https://example.test/photo.jpg", gallery: [], metadata: {},
  published: true, published_at: "2026-05-01T00:00:00.000Z",
};

describe("ActualitesSection — espace insécable avant la ponctuation française", () => {
  it("remplace l'espace avant ! par une insécable en français", async () => {
    // Le normaliseur par défaut de testing-library ramène   à une
    // espace normale avant comparaison (\s matche l'insécable) : un match
    // par texte ne peut donc pas distinguer les deux. On lit le textContent
    // brut du titre pour vérifier le caractère réellement rendu.
    fake = createFakeSupabaseTables({ news_posts: [{ ...POST, locale: "FR" }] });
    render(
      <LangCtx.Provider value={{ lang: "FR", setLang: () => {} }}>
        <ActualitesSection />
      </LangCtx.Provider>,
    );
    // La donnée de démo statique EN partage aussi le mot "Akwaba" — on
    // attend d'abord un marqueur unique à la ligne seedée ici pour être sûr
    // que la vraie réponse Supabase (pas le repli transitoire) est affichée.
    await screen.findByText("Texte.");
    const heading = screen.getByRole("heading", { name: /akwaba/i });
    expect(heading.textContent).toBe("Akwaba Gaspard NZ !");
  });

  it("ne touche pas au titre dans les autres langues", async () => {
    fake = createFakeSupabaseTables({ news_posts: [{ ...POST, title: "Akwaba Gaspard NZ !", locale: "EN" }] });
    render(
      <LangCtx.Provider value={{ lang: "EN", setLang: () => {} }}>
        <ActualitesSection />
      </LangCtx.Provider>,
    );
    await screen.findByText("Texte.");
    const heading = screen.getByRole("heading", { name: /akwaba/i });
    expect(heading.textContent).toBe("Akwaba Gaspard NZ !");
  });
});
