import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

const FIXTURES = {
  media_assets: [
    { id: "m1", section_key: "gallery", title: "Vitrine dorée", alt_text: "Vitrine", media_type: "image", storage_path: "gallery/vitrine.jpg", public_url: "https://example.test/site-media/gallery/vitrine.jpg", published: true, sort_order: 0 },
  ],
};
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([t, rows]) => [t, rows.map((r) => ({ ...r }))]));
const fake = createFakeSupabaseTables(cloneFixtures());

const uploadCalls = [];
fake.supabase.storage = {
  from: () => ({
    upload: async (path, file, opts) => { uploadCalls.push({ path, opts }); return { error: null }; },
    getPublicUrl: () => ({ data: { publicUrl: "https://example.test/site-media/gallery/vitrine.jpg" } }),
  }),
};

vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminMedia = (await import("../../src/components/Admin/AdminMedia.jsx")).default;

const getReplaceInput = () => [...document.querySelectorAll("label")]
  .find((l) => /remplacer/i.test(l.textContent))?.querySelector("input");

beforeEach(() => {
  uploadCalls.length = 0;
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

describe("Médias & photos — Modifier", () => {
  it("modifie le titre et la rubrique sans reuploader de fichier", async () => {
    const user = userEvent.setup();
    render(<AdminMedia />);
    expect(await screen.findByText("Vitrine dorée")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Modifier" }));
    const titleInput = screen.getByDisplayValue("Vitrine dorée");
    await user.clear(titleInput);
    await user.type(titleInput, "Vitrine dorée — hiver 2026");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(await screen.findByText("Vitrine dorée — hiver 2026")).toBeInTheDocument();
    expect(fake.state.media_assets[0].title).toBe("Vitrine dorée — hiver 2026");
    expect(fake.state.media_assets[0].storage_path).toBe("gallery/vitrine.jpg");
    expect(uploadCalls).toHaveLength(0);
  });

  it("annuler ne modifie rien", async () => {
    const user = userEvent.setup();
    render(<AdminMedia />);
    await user.click(await screen.findByRole("button", { name: "Modifier" }));
    const titleInput = screen.getByDisplayValue("Vitrine dorée");
    await user.clear(titleInput);
    await user.type(titleInput, "Autre chose");
    await user.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.getByText("Vitrine dorée")).toBeInTheDocument();
    expect(fake.state.media_assets[0].title).toBe("Vitrine dorée");
  });
});

describe("Médias & photos — Remplacer", () => {
  it("remplace le fichier au même emplacement, donc avec le même lien public", async () => {
    render(<AdminMedia />);
    await screen.findByText("Vitrine dorée");

    fireEvent.change(getReplaceInput(), {
      target: { files: [new File(["contenu"], "vitrine-2.jpg", { type: "image/jpeg" })] },
    });

    expect(await screen.findByText(/lien reste le même/i)).toBeInTheDocument();
    expect(uploadCalls).toHaveLength(1);
    expect(uploadCalls[0].path).toBe("gallery/vitrine.jpg");
    expect(uploadCalls[0].opts.upsert).toBe(true);
    expect(fake.state.media_assets[0].public_url).toBe("https://example.test/site-media/gallery/vitrine.jpg");
    expect(fake.state.media_assets[0].storage_path).toBe("gallery/vitrine.jpg");
  });

  it("ne supprime ni ne crée de nouvelle ligne : une seule reste en base", async () => {
    render(<AdminMedia />);
    await screen.findByText("Vitrine dorée");
    fireEvent.change(getReplaceInput(), {
      target: { files: [new File(["contenu"], "vitrine-2.jpg", { type: "image/jpeg" })] },
    });
    await screen.findByText(/lien reste le même/i);
    expect(fake.state.media_assets).toHaveLength(1);
  });
});
