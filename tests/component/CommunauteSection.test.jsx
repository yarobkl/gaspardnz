import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : le bouton du groupe WhatsApp de cette rubrique gardait un lien
// codé en dur (WA_CHANNEL_URL), ignorant le réglage de l'admin (Contenu du
// site → Réseaux sociaux) déjà suivi par CommunityWhatsAppLink. Si Gaspard
// changeait le lien de groupe, ce bouton continuait de pointer vers l'ancien.
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

const CommunauteSection = (await import("../../src/components/sections/CommunauteSection.jsx")).default;

describe("CommunauteSection — le bouton suit le réglage admin", () => {
  beforeEach(() => { fake = createFakeSupabaseTables(cloneFixtures({})); });

  it("suit le lien de groupe enregistré dans l'admin, pas la valeur codée en dur", async () => {
    fake = createFakeSupabaseTables(cloneFixtures({ whatsapp_community: "https://chat.whatsapp.com/NOUVEAU-GROUPE" }));
    render(<CommunauteSection />);
    const link = await screen.findByRole("link");
    await waitFor(() => expect(link).toHaveAttribute("href", "https://chat.whatsapp.com/NOUVEAU-GROUPE"));
  });

  it("reprend le lien par défaut tant que rien n'est enregistré", async () => {
    const { WA_CHANNEL_URL } = await import("../../src/data/styleDuMoisData.js");
    render(<CommunauteSection />);
    await waitFor(() => expect(screen.getByRole("link")).toHaveAttribute("href", WA_CHANNEL_URL));
  });
});
