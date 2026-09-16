import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// scrollToAdminEditor() déclenche le défilement via requestAnimationFrame :
// il faut laisser passer une frame avant de vérifier qu'il a eu lieu.
const waitForAnimationFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// Fixtures de départ : un élément « visible » par table. Les tests vérifient
// le comportement RÉEL du bouton bascule — via les vraies fonctions de
// src/services/adminData.js exécutées contre cette fausse base — pas une
// supposition sur ce que le code est censé faire.
const FIXTURES = {
  partners: [{ id: "p1", slug: "palais-groupe", name: "Palais Groupe", category: "Événementiel", description: "", logo_url: "", website_url: "", email: "", phone: "", address: "", status: "active", commission_percent: null, client_discount_percent: null, published: true, featured: false, sort_order: 0 }],
  packages: [{ id: "k1", slug: "sur-mesure", name: "Sur-mesure", subtitle: "", description: "", price: 100, currency: "EUR", cta_label: "Réserver", published: true, featured: false, sort_order: 0, features: [] }],
  news_posts: [{ id: "n1", slug: "annonce", title: "Une annonce", excerpt: "", body: "", cover_url: "", published: true, published_at: new Date().toISOString(), locale: "FR", gallery: [] }],
  promotions: [{ id: "pr1", title: "Soldes de saison", subtitle: "", description: "", image_url: "", cta_label: "", cta_url: "", placement: "home", status: "active", starts_at: null, ends_at: null, priority: 0, published: true }],
  content_albums: [{ id: "a1", section_key: "gallery", slug: "showroom", title: "Showroom", description: "", published: true, sort_order: 0, items: [] }],
  vip_clients: [{ id: "v1", name: "Client X", city: "Paris", event_label: "Mariage", photo_url: "", album: [], published: true, sort_order: 0 }],
  wedding_inspirations: [{ id: "w1", title: "Look Bleu Nuit", description: "", color_label: "", style_label: "", occasion_label: "", cover_url: "", album: [], published: true, sort_order: 0 }],
  style_month: [{ id: "s1", title: "Septembre", description: "", cover_url: "", album: [], hotspots: [], starts_at: null, ends_at: null, published: true, metadata: {} }],
  media_assets: [{ id: "m1", section_key: "gallery", title: "Photo showroom", alt_text: "", media_type: "image", storage_path: "gallery/x.jpg", public_url: "https://example/x.jpg", published: true, sort_order: 0 }],
};
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([table, rows]) => [table, rows.map((r) => ({ ...r }))]));

const fake = createFakeSupabaseTables(cloneFixtures());

vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminContent = (await import("../../src/components/Admin/AdminContent.jsx")).default;
const AdminPromotions = (await import("../../src/components/Admin/AdminPromotions.jsx")).default;
const AdminAlbums = (await import("../../src/components/Admin/AdminAlbums.jsx")).default;
const AdminVIPClients = (await import("../../src/components/Admin/AdminVIPClients.jsx")).default;
const AdminWeddingInspiration = (await import("../../src/components/Admin/AdminWeddingInspiration.jsx")).default;
const AdminStyleMonth = (await import("../../src/components/Admin/AdminStyleMonth.jsx")).default;
const AdminMedia = (await import("../../src/components/Admin/AdminMedia.jsx")).default;

let scrollSpy;
beforeEach(() => {
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
  scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
});

// ---------------------------------------------------------------------------
// Contenu du site (Partenaires) — l'exemple donné explicitement.
// ---------------------------------------------------------------------------
describe("Contenu du site — Partenaires", () => {
  it("masque puis réaffiche un partenaire en un clic, sans passer par le formulaire", async () => {
    const user = userEvent.setup();
    render(<AdminContent />);
    await user.click(await screen.findByRole("button", { name: "Partenaires" }));

    expect(await screen.findByText("Palais Groupe")).toBeInTheDocument();
    expect(screen.getByText("Publié")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(screen.getByText("Masqué")).toBeInTheDocument();
    expect(fake.state.partners[0].published).toBe(false);

    // Le formulaire d'édition n'a pas été ouvert par le seul clic sur la bascule.
    expect(screen.getByText("Cliquez sur « Ajouter » ou « Modifier ».")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Afficher" }));
    expect(await screen.findByRole("button", { name: "Masquer" })).toBeInTheDocument();
    expect(fake.state.partners[0].published).toBe(true);
  });

  it("fait défiler vers le formulaire au clic sur « Modifier » (correctif mobile)", async () => {
    const user = userEvent.setup();
    render(<AdminContent />);
    await user.click(await screen.findByRole("button", { name: "Partenaires" }));
    await user.click(await screen.findByRole("button", { name: "Modifier" }));
    // Le formulaire s'est bien ouvert avec les données de la ligne cliquée.
    expect(await screen.findByDisplayValue("Palais Groupe")).toBeInTheDocument();
    await waitForAnimationFrame();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("fait défiler vers le formulaire au clic sur « Ajouter »", async () => {
    const user = userEvent.setup();
    render(<AdminContent />);
    await user.click(await screen.findByRole("button", { name: "Formules" }));
    await user.click(await screen.findByRole("button", { name: "Ajouter" }));
    await waitForAnimationFrame();
    expect(scrollSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Le reste des rubriques : même comportement partout, sans exception.
// ---------------------------------------------------------------------------
describe("Promotions", () => {
  it("bascule la visibilité indépendamment de « Retirer »", async () => {
    const user = userEvent.setup();
    render(<AdminPromotions />);
    expect(await screen.findByText("Soldes de saison")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(fake.state.promotions[0].published).toBe(false);
    expect(screen.getByRole("button", { name: "Retirer" })).toBeInTheDocument();
  });
});

describe("Galerie & Showroom", () => {
  it("bascule la visibilité d'un album", async () => {
    const user = userEvent.setup();
    render(<AdminAlbums />);
    expect(await screen.findByText("Showroom")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(fake.state.content_albums[0].published).toBe(false);
  });
});

describe("Clients VIP", () => {
  it("bascule la visibilité d'un client", async () => {
    const user = userEvent.setup();
    render(<AdminVIPClients />);
    expect(await screen.findByText("Client X")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(fake.state.vip_clients[0].published).toBe(false);
  });
});

describe("Wedding Inspiration", () => {
  it("bascule la visibilité d'une inspiration", async () => {
    const user = userEvent.setup();
    render(<AdminWeddingInspiration />);
    expect(await screen.findByText("Look Bleu Nuit")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(fake.state.wedding_inspirations[0].published).toBe(false);
  });
});

describe("Style du mois", () => {
  it("bascule la visibilité d'un style", async () => {
    const user = userEvent.setup();
    render(<AdminStyleMonth />);
    expect(await screen.findByText("Septembre")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(fake.state.style_month[0].published).toBe(false);
  });
});

describe("Médias & photos", () => {
  it("expose désormais une bascule (absente jusqu'ici, seule « Supprimer » existait)", async () => {
    const user = userEvent.setup();
    render(<AdminMedia />);
    expect(await screen.findByText("Photo showroom")).toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(await screen.findByRole("button", { name: "Afficher" })).toBeInTheDocument();
    expect(screen.getByText("Masqué")).toBeInTheDocument();
    expect(fake.state.media_assets[0].published).toBe(false);
    // « Supprimer » reste présent et distinct : masquer n'est pas détruire.
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
  });
});
