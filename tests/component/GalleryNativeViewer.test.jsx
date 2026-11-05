import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

const fake = createFakeSupabaseTables({ content_albums: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const GalleryMobile = (await import("../../src/components/GalleryMobile.jsx")).default;

afterEach(() => { document.body.style.overflow = ""; fake.state.content_albums = []; });

describe("galerie native", () => {
  it("ouvre la photo choisie en entier, navigue et restaure l'écran après fermeture", () => {
    render(<GalleryMobile native />);
    const tiles = screen.getAllByRole("button").filter((button) => button.querySelector("img"));
    fireEvent.click(tiles[1]);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByText("02 / 15")).toBeInTheDocument();
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", expect.stringContaining("elegance-blanche.jpg"));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(within(dialog).getByRole("button", { name: /next|suivant/i }));
    expect(within(dialog).getByText("03 / 15")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(within(dialog).getByText("02 / 15")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(tiles[1]).toHaveFocus();
  });

  it("filtre les photos déjà enregistrées en Mariage, Événements et Looks sans toucher aux autres catégories", async () => {
    fake.state.content_albums = [{
      id: "gallery-test",
      published: true,
      section_key: "gallery",
      items: [
        { src: "/images/existing-wedding.jpg", label: "Tenue de mariage", category: "Mariage" },
        { src: "/images/existing-event.jpg", label: "Tenue de gala", category: "Événements" },
        { src: "/images/existing-look.jpg", label: "Look parisien", category: "Looks" },
      ],
    }];
    render(<GalleryMobile native />);
    const filters = screen.getByRole("group", { name: "Filtrer la galerie" });
    const all = within(filters).getByRole("button", { name: "Tout" });
    const wedding = within(filters).getByRole("button", { name: "Mariage" });
    const events = within(filters).getByRole("button", { name: "Événements" });
    const looks = within(filters).getByRole("button", { name: "Looks" });
    expect(all).toHaveAttribute("aria-pressed", "true");

    expect(await screen.findByRole("button", { name: "Tenue de mariage" })).toBeInTheDocument();
    fireEvent.click(wedding);
    expect(wedding).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tenue de mariage" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tenue de gala" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tenue de mariage" }));
    const viewer = screen.getByRole("dialog");
    expect(within(viewer).getByText("01 / 01")).toBeInTheDocument();
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", "/images/existing-wedding.jpg");
    fireEvent.click(within(viewer).getByRole("button", { name: /fermer/i }));

    fireEvent.click(events);
    expect(screen.getByRole("button", { name: "Tenue de gala" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tenue de mariage" })).not.toBeInTheDocument();
    fireEvent.click(looks);
    expect(screen.getByRole("button", { name: "Look parisien" })).toBeInTheDocument();
    fireEvent.click(all);
    expect(screen.getByRole("button", { name: "Tenue de mariage" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tenue de gala" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Look parisien" })).toBeInTheDocument();
  });

  it("conserve les filtres cliquables lorsqu'une catégorie n'a encore aucune photo publiée", async () => {
    fake.state.content_albums = [{
      id: "gallery-looks-only",
      published: true, section_key: "gallery",
      items: [{ src: "/images/existing-look.jpg", label: "Look quotidien" }],
    }];
    render(<GalleryMobile native />);
    expect(await screen.findByRole("button", { name: "Look quotidien" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mariage" }));
    expect(screen.getByRole("status")).toHaveTextContent("Aucune photo dans cette catégorie");
    expect(screen.queryByRole("button", { name: "Look quotidien" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tout" }));
    expect(screen.getByRole("button", { name: "Look quotidien" })).toBeInTheDocument();
  });

  it("change de photo au balayage horizontal, sans réagir au défilement vertical", () => {
    render(<GalleryMobile native />);
    fireEvent.click(screen.getAllByRole("button").find((button) => button.querySelector("img")));
    const dialog = screen.getByRole("dialog");
    const stage = within(dialog).getByRole("img").parentElement;
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 200 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 100, clientY: 205 }] });
    expect(within(dialog).getByText("02 / 15")).toBeInTheDocument();
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 200 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 180, clientY: 80 }] });
    expect(within(dialog).getByText("02 / 15")).toBeInTheDocument();
  });
});
