import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : les bascules "contraste élevé" et "mode jour/nuit" de la barre
// du haut disparaissent sur les téléphones les plus étroits (≤430px,
// compactNav) pour faire de la place — sans repli, ces réglages devenaient
// impossibles à atteindre sur ces écrans, alors qu'ils restent proposés
// normalement sur tous les autres.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;

const setNarrowViewport = () => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 380 });
};

describe("NavMobile — contraste et jour/nuit restent accessibles sur téléphone étroit", () => {
  it("propose les deux bascules dans le menu quand la barre du haut les masque (compactNav)", async () => {
    setNarrowViewport();
    const onToggleContrast = vi.fn();
    const onToggleDark = vi.fn();
    render(<NavMobile onToggleContrast={onToggleContrast} onToggleDark={onToggleDark} highContrast={false} lightMode={false} />);

    fireEvent.click(screen.getByLabelText("Ouvrir le menu"));

    fireEvent.click(await screen.findByText("Activer le contraste élevé"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onToggleContrast).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText("Ouvrir le menu"));
    fireEvent.click(await screen.findByText("Passer en mode jour"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onToggleDark).toHaveBeenCalledTimes(1);
  });
});
