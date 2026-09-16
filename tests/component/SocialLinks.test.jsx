import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Les réglages "sociaux" enregistrés dans l'admin, distincts des adresses
// codées en dur dans src/constants.js (utilisées seulement en repli).
const CUSTOM = {
  instagram: "https://instagram.com/nouveau-compte",
  tiktok: "https://tiktok.com/@nouveau-compte",
  facebook: "https://facebook.com/nouvelle-page",
  youtube: "https://youtube.com/@nouvelle-chaine",
};

const FIXTURES = { site_settings: [{ key: "social_links", value: CUSTOM, is_public: true }] };
const cloneFixtures = () => ({ site_settings: FIXTURES.site_settings.map((r) => ({ ...r })) });
const fake = createFakeSupabaseTables(cloneFixtures());

vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const FooterMobile = (await import("../../src/components/FooterMobile.jsx")).default;

beforeEach(() => {
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

// useSettings() rend d'abord les adresses par défaut, puis se met à jour une
// fois le chargement Supabase terminé (effet asynchrone) : il faut attendre
// ce second rendu, pas seulement que l'élément existe dans le DOM.
const waitForHref = async (label, href) => {
  await waitFor(() => expect(screen.getByLabelText(label)).toHaveAttribute("href", href), { timeout: 3000 });
};

describe("Réseaux sociaux — pied de page", () => {
  it("suit les liens enregistrés dans l'admin, pas les adresses codées en dur", async () => {
    render(<FooterMobile />);
    await waitForHref("Instagram Gaspard NZ", CUSTOM.instagram);
    await waitForHref("TikTok Gaspard NZ", CUSTOM.tiktok);
    await waitForHref("Facebook Gaspard NZ", CUSTOM.facebook);
    await waitForHref("YouTube Gaspard NZ", CUSTOM.youtube);
  });

  it("affiche une icône Facebook — absente jusqu'ici", async () => {
    render(<FooterMobile />);
    expect(await screen.findByLabelText("Facebook Gaspard NZ")).toBeInTheDocument();
  });

  it("revient sur les adresses par défaut si rien n'est enregistré dans l'admin", async () => {
    fake.state.site_settings = [];
    const { SOCIAL_LINKS } = await import("../../src/constants.js");
    render(<FooterMobile />);
    expect(await screen.findByLabelText("Facebook Gaspard NZ")).toHaveAttribute("href", SOCIAL_LINKS.facebook);
    expect(await screen.findByLabelText("YouTube Gaspard NZ")).toHaveAttribute("href", SOCIAL_LINKS.youtube);
  });
});
