import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// jsdom n'implémente pas la lecture vidéo : sans ce mock, .play() déclenche
// une erreur jsdom "not implemented" que tests/setup.js transforme en échec
// de test (tout console.error inattendu fait échouer le test).
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const ActualitesSection = (await import("../../src/components/sections/ActualitesSection.jsx")).default;

// Des titres différents de la démo statique (fallback initial de
// usePublicCollection avant que la vraie réponse Supabase n'arrive) :
// sinon un findByText peut matcher la carte de démo transitoire au lieu
// de la vraie ligne seedée ici, et fausser le test.
const PHOTO_POST = {
  id: "n1", title: "Un instant à Paris", excerpt: "", body: "Premier paragraphe.\n\nDeuxième paragraphe, plus long.",
  cover_url: "https://example.test/paris.jpg", gallery: [], metadata: {},
  published: true, locale: "FR", published_at: "2026-05-01T00:00:00.000Z",
};
const VIDEO_POST = {
  id: "n2", title: "Une séquence en coulisses", excerpt: "", body: "Premier paragraphe.\n\nDeuxième paragraphe, plus long.",
  cover_url: "", gallery: [], metadata: { video_url: "https://example.test/coulisses.mp4" },
  published: true, locale: "FR", published_at: "2026-05-02T00:00:00.000Z",
};

beforeEach(() => {
  fake = createFakeSupabaseTables({ news_posts: [{ ...PHOTO_POST }, { ...VIDEO_POST }] });
});

describe("Actualités — bouton adapté au contenu, taille uniforme", () => {
  it("propose « Ouvrir l'article » sur une publication photo", async () => {
    render(<ActualitesSection />);
    await screen.findByText("Un instant à Paris");
    expect(screen.getByRole("button", { name: /Ouvrir l'article/ })).toBeInTheDocument();
  });

  it("propose « Regarder la vidéo complète » sur une publication vidéo, et lance vraiment la lecture", async () => {
    const user = userEvent.setup();
    render(<ActualitesSection />);
    await screen.findByText("Une séquence en coulisses");
    const cta = screen.getByRole("button", { name: /Regarder la vidéo complète/ });
    expect(cta).toBeInTheDocument();

    await user.click(cta);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("applique le même format (ratio et découpe) à une carte photo et à une carte vidéo", async () => {
    render(<ActualitesSection />);
    const img = await screen.findByAltText("Un instant à Paris");
    const video = document.querySelector("video");
    expect(img.style.aspectRatio).toBe(video.style.aspectRatio);
    expect(img.style.objectFit).toBe(video.style.objectFit);
  });
});
