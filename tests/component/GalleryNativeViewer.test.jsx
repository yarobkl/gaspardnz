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

afterEach(() => { document.body.style.overflow = ""; });

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
