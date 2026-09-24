import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminContent = (await import("../../src/components/Admin/AdminContent.jsx")).default;
const AdminWeddingInspiration = (await import("../../src/components/Admin/AdminWeddingInspiration.jsx")).default;

const SPOTS = [{ x: 68, y: 38, label: "Veste terracotta" }, { x: 62, y: 88, label: "Richelieu marron" }];
const INSPIRATION = {
  id: "w1", title: "Inspiration look Mariage", description: "Album terracotta", color_label: "Terracotta",
  style_label: "Élégant", occasion_label: "Mariage", cover_url: "https://img.test/1.jpg",
  album: [{ src: "https://img.test/1.jpg", spots: SPOTS }, { src: "https://img.test/2.jpg", spots: [] }],
  published: true, sort_order: 0, updated_at: "2026-09-01T10:00:00.000Z",
};

beforeEach(() => {
  fake = createFakeSupabaseTables({
    site_settings: [
      { key: "contact", value: { email: "contact@test.local", whatsapp: "+33600000000" }, is_public: true },
      { key: "social_links", value: { instagram: "https://instagram.com/gnz" }, is_public: true },
    ],
    wedding_inspirations: [{ ...INSPIRATION, album: INSPIRATION.album.map((p) => ({ ...p })) }],
  });
  // Le vrai Supabase renvoie du JSON neuf à chaque lecture ; la fausse base
  // renvoie ses propres objets. Sans cette copie, un rechargement garderait
  // les mêmes références et masquerait la réinitialisation des formulaires.
  const realFrom = fake.supabase.from;
  fake.supabase.from = (table) => {
    const query = realFrom(table);
    const realThen = query.then;
    query.then = (resolve, reject) => realThen((result) => resolve(structuredClone(result)), reject);
    return query;
  };
});

const card = (title) => screen.getByText(title, { selector: ".gnz-card-title strong" }).closest("article");

describe("Contenu › Général", () => {
  it("enregistrer une carte n'efface pas la saisie en cours d'une autre carte", async () => {
    const user = userEvent.setup();
    render(<AdminContent user={{ role: "owner" }} />);
    await screen.findByDisplayValue("+33600000000");
    const whatsapp = within(card("Contact")).getByLabelText("WhatsApp");
    await user.clear(whatsapp);
    await user.type(whatsapp, "+33 6 99 99 99 99");

    const social = card("Réseaux sociaux");
    await user.type(within(social).getByLabelText("TikTok"), "https://tiktok.com/@gnz");
    await user.click(within(social).getByRole("button", { name: "Enregistrer" }));
    await screen.findByText("Contenu mis à jour.");

    expect(fake.state.site_settings.find((r) => r.key === "social_links").value.tiktok).toBe("https://tiktok.com/@gnz");
    expect(within(card("Contact")).getByLabelText("WhatsApp")).toHaveValue("+33 6 99 99 99 99");
  });
});

describe("Wedding Inspiration", () => {
  it("modifier une inspiration conserve les points cliquables de ses photos", async () => {
    const user = userEvent.setup();
    render(<AdminWeddingInspiration />);
    const row = (await screen.findByText("Inspiration look Mariage")).closest("tr");
    await user.click(within(row).getByRole("button", { name: "Modifier" }));
    const description = screen.getByLabelText("Description");
    await user.clear(description);
    await user.type(description, "Album terracotta, revu");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(fake.state.wedding_inspirations[0].description).toBe("Album terracotta, revu"));
    const saved = fake.state.wedding_inspirations[0];
    expect(saved.description).toBe("Album terracotta, revu");
    expect(saved.album).toEqual([{ src: "https://img.test/1.jpg", spots: SPOTS }, { src: "https://img.test/2.jpg", spots: [] }]);
  });

  it("une photo ajoutée à l'album part sans point, les autres gardent les leurs", async () => {
    const user = userEvent.setup();
    render(<AdminWeddingInspiration />);
    const row = (await screen.findByText("Inspiration look Mariage")).closest("tr");
    await user.click(within(row).getByRole("button", { name: "Modifier" }));
    await user.type(screen.getByLabelText(/Album/), "\nhttps://img.test/3.jpg");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(fake.state.wedding_inspirations[0].album).toHaveLength(3));
    expect(fake.state.wedding_inspirations[0].album).toEqual([
      { src: "https://img.test/1.jpg", spots: SPOTS },
      { src: "https://img.test/2.jpg", spots: [] },
      { src: "https://img.test/3.jpg", spots: [] },
    ]);
  });
});
