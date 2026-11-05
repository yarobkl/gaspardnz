import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

afterEach(() => { document.body.style.overflow = ""; fake.state.content_albums = []; fake.state.vip_clients = []; });

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

  it("réutilise les photos des clients VIP Mariage déjà publiées sans doublons, sans inventer de photos", async () => {
    fake.state.content_albums = [{
      id: "gallery-live", section_key: "gallery", published: true,
      items: [{src: "/images/look-original.jpg", label: "Look original", category: "Looks"}],
    }];
    fake.state.vip_clients = [
      {
        name: "Client Mariage Test", event_label: "Mariage", published: true,
        photo_url: "/images/client-mariage.jpg",
        album: ["/images/client-mariage.jpg", "/images/mariage-album-1.jpg", "/images/mariage-album-2.jpg"],
        sort_order: 1,
      },
      {
        name: "Client masqué", event_label: "Mariage", published: false,
        photo_url: "/images/client-masque.jpg", album: ["/images/prive.jpg"],
        sort_order: 2,
      },
      {
        name: "Client Gala", event_label: "Soirée VIP", published: true,
        photo_url: "/images/client-gala.jpg", album: [],
        sort_order: 3,
      },
    ];
    render(<GalleryMobile native />);
    fireEvent.click(screen.getByRole("button", { name: "Mariage" }));
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Client Mariage Test · Mariage" })).toHaveLength(3));
    const tiles = screen.getAllByRole("button", { name: "Client Mariage Test · Mariage" });
    const sources = tiles.map(button => button.querySelector("img")?.getAttribute("src"));
    expect(sources).toEqual([
      "/images/client-mariage.jpg", "/images/mariage-album-1.jpg", "/images/mariage-album-2.jpg",
    ]);
    expect(screen.queryByRole("button", { name: "Client masqué · Mariage" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Client Gala · Soirée VIP" })).not.toBeInTheDocument();

    fireEvent.click(tiles[1]);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("02 / 03")).toBeInTheDocument();
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/images/mariage-album-1.jpg");
    fireEvent.click(within(dialog).getByRole("button", {name: /fermer/i}));
    fireEvent.click(screen.getByRole("button", {name: "Tout"}));
    expect(screen.getByRole("button", {name: "Look original"})).toBeInTheDocument();
  });

  it("respecte le masquage d'un client dans l'administration au prochain chargement", async () => {
    fake.state.content_albums = [{
      id: "gallery-live", section_key: "gallery", published: true,
      items: [{src: "/images/look-original.jpg", label: "Look original", category: "Looks"}],
    }];
    fake.state.vip_clients = [{
      name: "Mariés publiés", event_label: "Mariage", published: true,
      photo_url: "/images/maries.jpg", album: [], sort_order: 1,
    }];
    const view = render(<GalleryMobile native />);
    fireEvent.click(screen.getByRole("button", {name: "Mariage"}));
    expect(await screen.findByRole("button", {name: "Mariés publiés · Mariage"})).toBeInTheDocument();
    view.unmount();
    fake.state.vip_clients[0].published = false;
    render(<GalleryMobile native />);
    fireEvent.click(screen.getByRole("button", {name: "Mariage"}));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Aucune photo dans cette catégorie"));
    expect(screen.queryByRole("button", {name: "Mariés publiés · Mariage"})).not.toBeInTheDocument();
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
