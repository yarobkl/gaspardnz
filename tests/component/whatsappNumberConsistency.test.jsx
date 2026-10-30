import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : plusieurs endroits (App.jsx, StyleDuMoisSection,
// WeddingInspirationSection, MobileHomeCompact) écrivaient en dur le numéro
// WhatsApp de contact (33664826920) au lieu de lire settings.whatsappNumber.
// Si Gaspard change ce numéro depuis l'admin, ces boutons continuaient à
// écrire à l'ancien numéro en silence.
const CUSTOM_NUMBER = "+33611223344";
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true, id: "number-consistency-lead" }),
}));

const WeddingInspirationSection = (await import("../../src/components/sections/WeddingInspirationSection.jsx")).default;
const StyleDuMoisSection = (await import("../../src/components/sections/StyleDuMoisSection.jsx")).default;
const MobileHomeCompact = (await import("../../src/components/MobileHomeCompact.jsx")).default;

const settingsFixture = [{ key: "contact", value: { whatsapp: CUSTOM_NUMBER }, is_public: true }];

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Numéro WhatsApp — une seule source de vérité (settings.whatsappNumber)", () => {
  it("WeddingInspirationSection écrit au numéro configuré dans l'admin, pas au numéro codé en dur", async () => {
    fake = createFakeSupabaseTables({
      site_settings: settingsFixture,
      wedding_inspirations: [{
        id: "w1", title: "Test look", description: "", color_label: "", style_label: "", occasion_label: "",
        cover_url: "", published: true, sort_order: 0,
        album: [{ src: "https://example.test/photo-1.jpg", spots: [{ x: 50, y: 50, label: "Costume" }] }],
      }],
    });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<WeddingInspirationSection />);
    await screen.findByAltText("Test look");

    await user.click(await screen.findByRole("button", { name: "Costume" }));
    await user.click(await screen.findByRole("button", { name: /demander/i }));

    expect(openSpy).toHaveBeenCalled();
    const [url] = openSpy.mock.calls[0];
    expect(url).toContain("33611223344");
    expect(url).not.toContain("33664826920");
  });

  it("StyleDuMoisSection écrit au numéro configuré dans l'admin, pas au numéro codé en dur", async () => {
    fake = createFakeSupabaseTables({
      site_settings: settingsFixture,
      style_month: [{
        id: "s1", title: "Test style", description: "", starts_at: "2020-01-01", ends_at: null, published: true,
        cover_url: "https://example.test/style-1.jpg",
        album: ["https://example.test/style-1.jpg"],
        hotspots: [{ x: 50, y: 50, label: "Veste" }],
        // Sans repli explicite ici, mapRemoteStyle retombe sur les
        // photoSpots de la donnée de démo statique (un vrai comportement de
        // l'app, pas un artefact de test) — vidé pour isoler ce test sur
        // whatsappNumber, pas sur cette mécanique de repli par photo.
        metadata: { photo_hotspots: [] },
      }],
    });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<StyleDuMoisSection />);
    await screen.findByAltText("Test style");

    await user.click(await screen.findByRole("button", { name: "Veste" }, { timeout: 2000 }));
    await user.click(await screen.findByRole("button", { name: /demander/i }));

    expect(openSpy).toHaveBeenCalled();
    const [url] = openSpy.mock.calls[0];
    expect(url).toContain("33611223344");
    expect(url).not.toContain("33664826920");
  });

  it("MobileHomeCompact conserve le numéro configuré après la collecte CRM", async () => {
    fake = createFakeSupabaseTables({ site_settings: settingsFixture });
    const user = userEvent.setup();
    render(<MobileHomeCompact activeSection={null} onSelect={() => {}} />);
    await user.click(await screen.findByRole("button", { name: "Parler à Gaspard" }));
    await screen.findByRole("dialog", { name: "Parler à Gaspard" });
    expect(screen.queryByRole("link", { name: "Continuer sur WhatsApp" })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Votre prénom"), "Marc");
    await user.type(screen.getByLabelText("Votre téléphone"), "06 12 34 56 78");
    await user.selectOptions(screen.getByLabelText("Votre projet"), "wedding");
    await user.click(screen.getByRole("button", { name: "Continuer", exact: true }));
    const waLink = await screen.findByRole("link", { name: "Continuer sur WhatsApp" });
    await expect.poll(() => waLink.getAttribute("href")).toContain("33611223344");
    expect(waLink.getAttribute("href")).not.toContain("33664826920");
    const message = new URL(waLink.href).searchParams.get("text");
    expect(message).toContain("Je viens de consulter votre site");
    expect(message).toContain("Pourriez-vous me recontacter");
  });
});
