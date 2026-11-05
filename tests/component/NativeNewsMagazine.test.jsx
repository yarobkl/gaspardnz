import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { LangCtx } from "../../src/context.jsx";
import { NativeNews } from "../../src/components/NativeEditorial.jsx";

const published = [
  { id: "live-1", title: "Défilé de GaspardNZ", body: "Une actualité publiée depuis l'administration.", cover_url: "https://example.test/photos/existante-1.jpg", gallery: [], metadata: { tag: "Événement", date_label: "Octobre 2026" }, published: true },
  { id: "live-2", title: "Nouvelle tenue GaspardNZ", body: "Des détails élégants.", cover_url: "https://example.test/photos/existante-2.jpg", gallery: [], metadata: { tag: "Collection", date_label: "Novembre 2026" }, published: true },
  { id: "live-3", title: "Coulisses du showroom", body: "Un moment partagé.", cover_url: "https://example.test/photos/existante-3.jpg", gallery: [], metadata: { tag: "Showroom" }, published: true },
  { id: "live-4", title: "Actualité sans photo", body: "Publication texte.", cover_url: "", gallery: [], metadata: { tag: "Maison" }, published: true },
  { id: "live-5", title: "Rencontre et inspiration", body: "Une histoire de style.", cover_url: "https://example.test/photos/existante-5.jpg", gallery: [], metadata: { tag: "Rencontre" }, published: true },
];

vi.mock("../../src/hooks/usePublicCollection.js", () => ({
  usePublicCollection: () => ({ rows: published, source: "supabase", loading: false }),
}));
vi.mock("../../src/utils/nativeHaptics.js", () => ({ nativeFeedback: vi.fn() }));

function Harness({ initialId }) {
  const [lang, setLang] = useState("FR");
  return <LangCtx.Provider value={{ lang, setLang }}><NativeNews initialId={initialId} /></LangCtx.Provider>;
}
const recent = () => screen.getByRole("region", { name: "Articles récents" });
const carousel = () => screen.getByRole("region", { name: "Actualités à la une" });

describe("Actualités iOS — maquette magazine avec les données existantes", () => {
  it("ne duplique pas Le Journal et garde la vraie image de la publication en couverture", () => {
    render(<Harness />);
    expect(screen.queryByText("Le style se raconte.")).not.toBeInTheDocument();
    expect(carousel().querySelector(".gnz-native-news-feature[aria-label='Défilé de GaspardNZ']")).not.toBeNull();
    const image = carousel().querySelector(".gnz-native-news-feature img");
    expect(image).toHaveAttribute("src", "https://example.test/photos/existante-1.jpg");
    expect(screen.getByRole("region", { name: "Articles récents" })).toBeInTheDocument();
  });

  it("couvre toute la carte avec la photo navy en gardant la focale sur le visage", () => {
    const photo = {
      id: "navy-soiree",
      title: "Une silhouette de soirée au sommet de l’élégance",
      excerpt: "Une silhouette affirmée.",
      body: "La veste navy à fines rayures.",
      cover_url: "/images/veste-navy-soiree.jpg",
      gallery: [],
      metadata: {
        tag: "Style & Élégance",
        date_label: "Novembre 2026",
        cover_mode: "cover",
        cover_focus: "center 25%",
      },
      published: true,
    };
    published.unshift(photo);
    try {
      render(<Harness />);
      const cover = carousel().querySelector(".gnz-native-news-feature");
      expect(cover).toHaveClass("gnz-native-news-feature-full-bleed");
      expect(cover.querySelector(".gnz-native-news-feature-backdrop")).toBeNull();
      expect(cover.querySelector(".gnz-native-news-feature-image")).toHaveStyle({
        objectFit: "cover", objectPosition: "center 25%",
      });
      expect(within(cover).getByText("Style & Élégance")).toBeInTheDocument();
      const recentCover = recent().querySelector(".gnz-native-news-card");
      expect(recentCover.querySelector(".gnz-native-news-card-backdrop")).toBeNull();
      expect(recentCover.querySelector(".gnz-native-news-card-image")).toHaveStyle({
        objectFit: "cover", objectPosition: "center 25%",
      });
      fireEvent.click(recentCover);
      const reader = screen.getByRole("dialog", { name: photo.title });
      expect(within(reader).getByText("La veste navy à fines rayures.")).toBeInTheDocument();
    } finally {
      published.shift();
    }
  });

  it("affiche une grille de deux colonnes et permet Voir tout / Réduire", () => {
    render(<Harness />);
    const grid = recent().querySelector(".gnz-native-news-card-grid");
    expect(grid).toBeInTheDocument();
    expect(grid.querySelectorAll("button.gnz-native-news-card")).toHaveLength(4);
    fireEvent.click(within(recent()).getByRole("button", { name: /Voir tout/ }));
    expect(within(recent()).getByRole("button", { name: /Réduire/ })).toHaveAttribute("aria-expanded", "true");
    expect(grid.querySelectorAll("button.gnz-native-news-card").length).toBeGreaterThan(4);
    fireEvent.click(within(recent()).getByRole("button", { name: /Réduire/ }));
    expect(grid.querySelectorAll("button.gnz-native-news-card")).toHaveLength(4);
  });

  it("préserve entièrement les portraits en utilisant la photo d'origine sur un fond flouté", () => {
    render(<Harness />);
    const hero = carousel().querySelector(".gnz-native-news-feature");
    const original = hero.querySelector(".gnz-native-news-feature-image");
    const backdrop = hero.querySelector(".gnz-native-news-feature-backdrop");
    expect(original).toHaveAttribute("src", "https://example.test/photos/existante-1.jpg");
    expect(backdrop).toHaveAttribute("src", original.getAttribute("src"));
    const firstRecent = recent().querySelector(".gnz-native-news-card");
    expect(firstRecent.querySelector(".gnz-native-news-card-image")).toHaveAttribute("src", original.getAttribute("src"));
    expect(firstRecent.querySelector(".gnz-native-news-card-backdrop")).toHaveAttribute("src", original.getAttribute("src"));
  });

  it("aligne toutes les cartes récentes avec la même structure, avec ou sans photo", () => {
    render(<Harness />);
    const grid = recent().querySelector(".gnz-native-news-card-grid");
    const cards = [...grid.querySelectorAll(".gnz-native-news-card")];
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card.querySelector(".gnz-native-news-card-media")).not.toBeNull();
      expect(card.querySelector(".gnz-native-news-card-body")).not.toBeNull();
      expect(card.querySelector(".gnz-native-news-card-body small")).not.toBeNull();
    }
    expect(cards[3].querySelector(".gnz-native-news-card-without-photo")).not.toBeNull();
  });

  it("change de publication avec les points puis au balayage sans toucher aux photos", async () => {
    render(<Harness />);
    const region = carousel();
    fireEvent.click(within(region).getByRole("button", { name: "Nouvelle tenue GaspardNZ" }));
    expect(region.querySelector(".gnz-native-news-feature[aria-label='Nouvelle tenue GaspardNZ']")).not.toBeNull();
    expect(region.querySelector(".gnz-native-news-feature img[src='https://example.test/photos/existante-2.jpg']")).not.toBeNull();

    fireEvent.touchStart(region, { touches: [{clientX: 260, clientY: 200}] });
    fireEvent.touchEnd(region, { changedTouches: [{clientX: 100, clientY: 205}] });
    await waitFor(() => expect(region.querySelector(".gnz-native-news-feature[aria-label='Coulisses du showroom']")).not.toBeNull());
  });

  it("ouvre les articles de la grille, puis les ferme sans modifier les données", () => {
    render(<Harness />);
    fireEvent.click(within(recent()).getByRole("button", { name: "Actualité sans photo" }));
    const reader = screen.getByRole("dialog", { name: "Actualité sans photo" });
    expect(within(reader).getByText("Publication texte.")).toBeInTheDocument();
    expect(within(reader).queryByRole("img")).not.toBeInTheDocument();
    fireEvent.click(within(reader).getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
