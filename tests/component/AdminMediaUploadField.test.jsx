import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

const FIXTURES = {
  partners: [{ id: "p1", slug: "palais-groupe", name: "Palais Groupe", category: "Photographe", description: "", logo_url: "", website_url: "", email: "", phone: "", address: "", status: "active", commission_percent: null, client_discount_percent: null, published: true, featured: false, sort_order: 0 }],
  promotions: [],
  vip_clients: [],
  wedding_inspirations: [],
  style_month: [],
  content_albums: [],
};
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([t, rows]) => [t, rows.map((r) => ({ ...r }))]));
const fake = createFakeSupabaseTables(cloneFixtures());

const uploadCalls = [];
fake.supabase.storage = {
  from: () => ({
    upload: async (path) => { uploadCalls.push(path); return { error: null }; },
    getPublicUrl: (path) => ({ data: { publicUrl: `https://example.test/site-media/${path}` } }),
  }),
};

vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminContent = (await import("../../src/components/Admin/AdminContent.jsx")).default;
const AdminPromotions = (await import("../../src/components/Admin/AdminPromotions.jsx")).default;
const AdminVIPClients = (await import("../../src/components/Admin/AdminVIPClients.jsx")).default;
const AdminWeddingInspiration = (await import("../../src/components/Admin/AdminWeddingInspiration.jsx")).default;
const AdminStyleMonth = (await import("../../src/components/Admin/AdminStyleMonth.jsx")).default;
const AdminAlbums = (await import("../../src/components/Admin/AdminAlbums.jsx")).default;

const image = (name = "photo.jpg") => new File(["contenu"], name, { type: "image/jpeg" });

// MediaUploadField regroupe un champ texte ET un champ fichier sous un même
// <label> : l'association implicite label/champ que getByLabelText attend
// devient ambiguë. On cible directement la structure, comme pour les tests
// précédents sur Médias & photos.
const getUploadInput = (labelText) => [...document.querySelectorAll("label.gnz-field")]
  .find((l) => l.textContent.trim().startsWith(labelText))
  ?.querySelector('input[type="file"]');

beforeEach(() => {
  uploadCalls.length = 0;
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

describe("Partenaires — logo", () => {
  it("importe une photo et remplit automatiquement le champ URL", async () => {
    const user = userEvent.setup();
    render(<AdminContent />);
    await user.click(await screen.findByRole("button", { name: "Partenaires" }));
    await user.click(await screen.findByRole("button", { name: "Ajouter" }));
    const input = getUploadInput("Logo");
    await user.upload(input, image("logo.jpg"));
    const urlField = await screen.findByDisplayValue(/site-media\/partners\//);
    expect(urlField).toBeInTheDocument();
    expect(uploadCalls[0]).toMatch(/^partners\//);
  });
});

describe("Promotions — image", () => {
  it("importe une photo taguée dans la rubrique promotions", async () => {
    const user = userEvent.setup();
    render(<AdminPromotions />);
    const input = getUploadInput("Image");
    await user.upload(input, image());
    await screen.findByDisplayValue(/site-media\/promotions\//);
    expect(uploadCalls[0]).toMatch(/^promotions\//);
  });
});

describe("Clients VIP — photo principale", () => {
  it("importe et tague la rubrique vip", async () => {
    const user = userEvent.setup();
    render(<AdminVIPClients />);
    const input = getUploadInput("Photo principale");
    await user.upload(input, image());
    await screen.findByDisplayValue(/site-media\/vip\//);
    expect(uploadCalls[0]).toMatch(/^vip\//);
  });
});

describe("Wedding Inspiration — photo principale", () => {
  it("importe et tague la rubrique wedding", async () => {
    const user = userEvent.setup();
    render(<AdminWeddingInspiration />);
    const input = getUploadInput("Photo principale");
    await user.upload(input, image());
    await screen.findByDisplayValue(/site-media\/wedding\//);
    expect(uploadCalls[0]).toMatch(/^wedding\//);
  });
});

describe("Style du mois — photo principale", () => {
  it("importe et tague la rubrique style-month", async () => {
    const user = userEvent.setup();
    render(<AdminStyleMonth />);
    const input = getUploadInput("Photo principale");
    await user.upload(input, image());
    await screen.findByDisplayValue(/site-media\/style-month\//);
    expect(uploadCalls[0]).toMatch(/^style-month\//);
  });
});

describe("Galerie & Showroom — photo d'un item d'album", () => {
  it("tague la rubrique selon l'album choisi (galerie ou showroom)", async () => {
    const user = userEvent.setup();
    render(<AdminAlbums />);
    await user.click(screen.getByRole("combobox"));
    await user.selectOptions(screen.getByRole("combobox"), "showroom");
    await user.click(screen.getByRole("button", { name: "Ajouter une photo" }));
    const input = getUploadInput("Photo");
    await user.upload(input, image());
    await screen.findByDisplayValue(/site-media\/showroom\//);
    expect(uploadCalls[0]).toMatch(/^showroom\//);
  });
});
