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
const TEXT_ONLY_POST = {
  id: "n3", title: "Une annonce sans image", excerpt: "", body: "Un simple texte.",
  cover_url: "", gallery: [], metadata: { tag: "Annonce" },
  published: true, locale: "FR", published_at: "2026-06-01T00:00:00.000Z",
};

beforeEach(() => {
  fake = createFakeSupabaseTables({ news_posts: [{ ...PHOTO_POST }, { ...VIDEO_POST }, { ...TEXT_ONLY_POST }] });
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

  it("applique le même ratio à une carte photo et à une carte vidéo, sans jamais couper une photo", async () => {
    render(<ActualitesSection />);
    const img = await screen.findByAltText("Un instant à Paris");
    const video = document.querySelector("video");
    // Même hauteur de carte (même ratio) des deux côtés...
    expect(img.style.aspectRatio).toBe(video.style.aspectRatio);
    // ...mais une photo de groupe grand angle recadrée en "cover" coupait la
    // moitié des personnes : les photos restent entières ("contain"), seule
    // la vidéo (déjà cadrée pour ce format) garde "cover".
    expect(img.style.objectFit).toBe("contain");
    expect(video.style.objectFit).toBe("cover");
  });

  it("affiche quand même une date sur un article sans photo ni vidéo", async () => {
    render(<ActualitesSection />);
    await screen.findByText("Une annonce sans image");
    // juin 2026, dérivé de published_at faute de metadata.date_label
    expect(screen.getByText(/Annonce · Paris · juin 2026/i)).toBeInTheDocument();
  });
});

describe("Actualités — sous-titres attachés à la bonne vidéo", () => {
  it("n'attache pas les sous-titres du JT Sape à une autre vidéo déposée depuis l'admin", async () => {
    // Bug réel : un <track> pointant vers /captions/jt-sape-fr.vtt était
    // ajouté à TOUTE vidéo d'actualité, quel que soit son contenu réel.
    render(<ActualitesSection />);
    await screen.findByText("Une séquence en coulisses");
    const video = document.querySelector("video");
    expect(video.querySelector("track")).toBeNull();
  });

  it("garde les sous-titres sur la vidéo du JT Sape elle-même", async () => {
    const { JT_SAPE_VIDEO_URL } = await import("../../src/data/actualitesData.js");
    fake = createFakeSupabaseTables({
      news_posts: [{ ...VIDEO_POST, id: "n-jt", title: "JT de la sape", metadata: { video_url: JT_SAPE_VIDEO_URL } }],
    });
    render(<ActualitesSection />);
    await screen.findByText("JT de la sape");
    const video = document.querySelector("video");
    expect(video.querySelector("track")).toHaveAttribute("src", "/captions/jt-sape-fr.vtt");
  });
});

describe("Actualités — repli sur le français quand la langue du visiteur n'a rien de publié", () => {
  it("affiche les articles français plutôt qu'une section vide (flèches et compteur sans contenu)", async () => {
    // Bug réel : usePublicCollection traite "zéro ligne publiée" comme une
    // vraie réponse (pas un échec), à raison — mais ActualitesSection
    // gardait quand même son titre, ses flèches et un compteur "01 / 00"
    // sans la moindre actualité en chinois.
    fake = createFakeSupabaseTables({ news_posts: [{ ...PHOTO_POST, locale: "FR" }] });
    const { LangCtx } = await import("../../src/context.jsx");
    render(
      <LangCtx.Provider value={{ lang: "ZH", setLang: () => {} }}>
        <ActualitesSection />
      </LangCtx.Provider>,
    );
    expect(await screen.findByText("Un instant à Paris")).toBeInTheDocument();
  });
});
