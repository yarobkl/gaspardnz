import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

const FIXTURES = { news_posts: [], partners: [] };
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([t, rows]) => [t, rows.map((r) => ({ ...r }))]));
const fake = createFakeSupabaseTables(cloneFixtures());

fake.supabase.storage = {
  from: () => ({
    upload: async () => ({ error: null }),
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

const image = (name) => new File(["contenu"], name, { type: "image/jpeg" });
const getGalleryInput = () => [...document.querySelectorAll(".gnz-field")]
  .find((l) => l.textContent.trim().startsWith("Galerie photos"))
  ?.querySelector('input[type="file"]');

beforeEach(() => {
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

describe("Actualités — galerie de plusieurs photos", () => {
  it("enregistre le mode plein cadre et la focale de l'actualité sans remplacer ses métadonnées", async () => {
    const user=userEvent.setup();
    render(<AdminContent user={{role:"owner"}}/>);
    await user.click(screen.getByRole("button",{name:"Actualités"}));
    await user.click(await screen.findByRole("button",{name:"Ajouter"}));
    await user.type(screen.getByRole("textbox",{name:"Titre"}),"Style éditorial premium");
    await user.selectOptions(screen.getByLabelText("Présentation de la couverture"),"cover");
    const slider=screen.getByLabelText("Position verticale de la couverture");
    fireEvent.change(slider,{target:{value:"18"}});
    expect(slider).toHaveValue("18");
    await user.click(screen.getByRole("button",{name:"Enregistrer"}));
    await waitFor(()=>expect(fake.state.news_posts).toHaveLength(1));
    expect(fake.state.news_posts[0].metadata).toMatchObject({
      cover_mode:"cover",cover_focus:"center 18%",
    });
  });

  it("ajoute plusieurs photos à la galerie puis permet d'en retirer une", async () => {
    const user = userEvent.setup();
    render(<AdminContent user={{ role: "owner" }} />);
    await user.click(screen.getByRole("button", { name: "Actualités" }));
    await user.click(await screen.findByRole("button", { name: "Ajouter" }));

    await user.upload(getGalleryInput(), [image("miss-congo-1.jpg"), image("miss-congo-2.jpg")]);

    // Vignettes décoratives (alt="") : pas de rôle ARIA "img" à cibler,
    // on compte directement les éléments <img> rendus.
    await screen.findAllByRole("button", { name: "Retirer cette photo" });
    expect(document.querySelectorAll(".gnz-field img")).toHaveLength(2);

    await userEvent.click(screen.getAllByRole("button", { name: "Retirer cette photo" })[0]);
    expect(document.querySelectorAll(".gnz-field img")).toHaveLength(1);
  });
});
