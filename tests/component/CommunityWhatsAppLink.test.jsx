import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";
import { vi } from "vitest";

// Lien discret vers le GROUPE WhatsApp communautaire (distinct du numéro de
// contact 1:1 utilisé ailleurs sur le site) : n'apparaît que si Gaspard a
// collé un lien dans l'admin, jamais un bouton qui ne mène nulle part.
const cloneFixtures = (socialLinks) => ({
  site_settings: [{ key: "social_links", value: socialLinks, is_public: true }],
});

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const CommunityWhatsAppLink = (await import("../../src/components/CommunityWhatsAppLink.jsx")).default;

const setupFake = (socialLinks) => { fake = createFakeSupabaseTables(cloneFixtures(socialLinks)); };

describe("Raccourci communauté WhatsApp", () => {
  beforeEach(() => setupFake({}));

  it("n'affiche rien tant qu'aucun lien de groupe n'est enregistré", async () => {
    render(<CommunityWhatsAppLink />);
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("affiche le lien vers le groupe une fois enregistré dans l'admin", async () => {
    setupFake({ whatsapp_community: "https://chat.whatsapp.com/ABC123groupe" });
    render(<CommunityWhatsAppLink />);
    await waitFor(() => expect(screen.getByRole("link")).toHaveAttribute("href", "https://chat.whatsapp.com/ABC123groupe"));
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });
});
