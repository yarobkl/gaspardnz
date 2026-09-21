import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

const FIXTURES = { site_settings: [] };
const cloneFixtures = () => Object.fromEntries(Object.entries(FIXTURES).map(([t, rows]) => [t, rows.map((r) => ({ ...r }))]));
const fake = createFakeSupabaseTables(cloneFixtures());

// uploadMedia() passe par supabase.storage, que la fausse base ne simule pas :
// on ne recrée que la petite partie utilisée ici (upload + URL publique).
fake.supabase.storage = {
  from: () => ({
    upload: async () => ({ error: null }),
    getPublicUrl: () => ({ data: { publicUrl: "https://example.test/site-media/lookbook/nouveau.pdf" } }),
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

const pdfFile = (name = "lookbook-2026.pdf") => new File(["%PDF-1.4 contenu simulé"], name, { type: "application/pdf" });

// Le bouton d'import est un <label> habillé, pas un <button> : aucun rôle
// ARIA "button" à cibler, on prend directement l'entrée fichier qu'il porte.
// L'onglet "Général" comporte désormais un second champ fichier (photo de
// fond de connexion, accept="image/*") : on cible celui du lookbook par son
// accept="application/pdf", propre à ce champ précis.
const getFileInput = () => document.querySelector('input[type="file"][accept="application/pdf"]');

beforeEach(() => {
  const fresh = cloneFixtures();
  for (const table of Object.keys(fake.state)) delete fake.state[table];
  Object.assign(fake.state, fresh);
});

describe("Fichier du lookbook", () => {
  it("prévient tant qu'aucun fichier n'est déposé", async () => {
    render(<AdminContent />);
    expect(await screen.findByText(/Aucun fichier déposé pour l'instant/)).toBeInTheDocument();
    expect(screen.getByText("Déposer le PDF du lookbook")).toBeInTheDocument();
  });

  it("refuse un fichier qui n'est pas un PDF", async () => {
    render(<AdminContent />);
    await screen.findByText("Déposer le PDF du lookbook");
    // userEvent.upload() respecte l'attribut accept="application/pdf" du champ
    // (comme un vrai sélecteur de fichiers) et refuserait silencieusement un
    // .jpg avant même d'atteindre le composant. On simule ici le cas où ce
    // filtre est contourné (glisser-déposer, ancien navigateur) : le contrôle
    // fait par handleFile() doit alors être la vraie barrière.
    fireEvent.change(getFileInput(), { target: { files: [new File(["x"], "photo.jpg", { type: "image/jpeg" })] } });
    expect(await screen.findByText("Le fichier doit être un PDF.")).toBeInTheDocument();
    expect(fake.state.media_assets ?? []).toHaveLength(0);
  });

  it("dépose un PDF, l'enregistre comme média et met à jour le pointeur des réglages", async () => {
    const user = userEvent.setup();
    render(<AdminContent />);
    await screen.findByText("Déposer le PDF du lookbook");
    await user.upload(getFileInput(), pdfFile());

    expect(await screen.findByText(/lookbook-2026\.pdf/)).toBeInTheDocument();
    expect(screen.getByText("Remplacer le fichier")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voir le fichier actuel/ })).toHaveAttribute(
      "href", "https://example.test/site-media/lookbook/nouveau.pdf",
    );

    // Ce que lira l'envoi automatique après paiement : le pointeur réel en base.
    const setting = fake.state.site_settings.find((r) => r.key === "lookbook");
    expect(setting?.value?.pdf_url).toBe("https://example.test/site-media/lookbook/nouveau.pdf");
    expect(setting?.value?.pdf_filename).toBe("lookbook-2026.pdf");

    const asset = fake.state.media_assets.find((r) => r.section_key === "lookbook");
    expect(asset?.media_type).toBe("document");
    expect(asset?.published).toBe(true);
  });

  it("remplacer dépose un nouveau fichier sans supprimer l'ancien", async () => {
    fake.state.site_settings = [{ key: "lookbook", value: { pdf_url: "https://example.test/ancien.pdf", pdf_filename: "ancien.pdf", updated_at: "2026-01-01T00:00:00.000Z" } }];
    fake.state.media_assets = [{ id: "old-1", section_key: "lookbook", title: "ancien.pdf", media_type: "document", storage_path: "lookbook/ancien.pdf", public_url: "https://example.test/ancien.pdf", published: true }];

    const user = userEvent.setup();
    render(<AdminContent />);
    expect(await screen.findByText(/ancien\.pdf/)).toBeInTheDocument();

    await screen.findByText("Remplacer le fichier");
    await user.upload(getFileInput(), pdfFile("lookbook-2027.pdf"));

    expect(await screen.findByText(/lookbook-2027\.pdf/)).toBeInTheDocument();
    // L'ancien média reste en base : rien n'a été supprimé.
    expect(fake.state.media_assets.some((r) => r.id === "old-1")).toBe(true);
    expect(fake.state.media_assets.length).toBe(2);
  });
});
