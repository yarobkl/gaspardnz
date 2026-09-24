import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : plusieurs boutons WhatsApp du site public sont de simples
// <button onClick={() => window.open(...)}>, sans `href` — le suivi
// analytics (siteTracking.js) déduit "whatsapp_click" en inspectant
// l'attribut href des liens cliqués, donc ces boutons passaient totalement
// inaperçus dans les statistiques de conversion, sans data-track explicite
// ni appel direct à trackSiteEvent.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));
vi.mock("../../src/services/siteTracking.js", () => ({
  trackSiteEvent: vi.fn(async () => ({ ok: true })),
}));

const { HotspotSheet } = await import("../../src/components/ui/PhotoHotspots.jsx");
const ChatBot = (await import("../../src/components/ChatBot.jsx")).default;
const { trackSiteEvent } = await import("../../src/services/siteTracking.js");

describe("Suivi des clics WhatsApp — boutons sans lien réel", () => {
  it("HotspotSheet marque son bouton d'action data-track=whatsapp_click (partagé par Style Journal, Mariage, Style du mois, Galerie)", () => {
    render(
      <HotspotSheet spot={{ label: "Veste" }} onClose={() => {}} actionLabel="Demander" onAction={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Demander" })).toHaveAttribute("data-track", "whatsapp_click");
  });

  it("le chatbot déclenche trackSiteEvent(\"whatsapp_click\") en ouvrant WhatsApp depuis une réponse rapide", async () => {
    const user = userEvent.setup();
    window.open = vi.fn();
    render(<ChatBot />);
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir l'assistant Gaspard NZ" }));

    const input = screen.getByRole("textbox");
    await user.type(input, "whatsapp");
    fireEvent.keyDown(input, { key: "Enter" });

    // Le chatbot simule un délai de frappe aléatoire de 900 à 1300ms avant
    // d'afficher sa réponse (src/components/ChatBot.jsx) : délai réel, pas
    // un artefact de test, d'où le timeout plus large que le défaut (1000ms).
    const waButton = await screen.findByRole("button", { name: "Ouvrir WhatsApp" }, { timeout: 2000 });
    fireEvent.click(waButton);

    expect(window.open).toHaveBeenCalled();
    expect(trackSiteEvent).toHaveBeenCalledWith("whatsapp_click", expect.objectContaining({ metadata: expect.objectContaining({ label: "chatbot" }) }));
  });
});
