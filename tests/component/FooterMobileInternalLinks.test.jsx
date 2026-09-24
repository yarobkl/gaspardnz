import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : /conseil-image-homme-paris a sa propre page SEO
// (ImageConsultingSeoPage.jsx, routée dans main.jsx) mais aucun lien nulle
// part sur le site n'y menait — ni dans le footer, ni dans le repli
// noscript d'index.html — invisible pour les visiteurs et les moteurs de
// recherche malgré son contenu dédié.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const FooterMobile = (await import("../../src/components/FooterMobile.jsx")).default;

describe("FooterMobile — lien vers la page conseil en image", () => {
  it("propose un lien réel vers /conseil-image-homme-paris", () => {
    render(<FooterMobile />);
    const link = screen.getByText("Conseil en image");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/conseil-image-homme-paris");
  });
});
