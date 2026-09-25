import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel (trouvé en QA interactive) : le fichier téléchargé prenait le nom
// settings.lookbookFilename — le nom du fichier tel que déposé par Gaspard
// depuis son ordinateur (souvent un export illisible type
// "83716_BE_0_75093_6302400982.pdf"), utile pour lui dans l'admin, jamais
// pensé pour un visiteur qui télécharge.
const fake = createFakeSupabaseTables({
  site_settings: [{ key: "lookbook", value: { pdf_url: "https://example.test/lookbook.pdf", pdf_filename: "83716_BE_0_75093_6302400982.pdf" }, is_public: true }],
});
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));
vi.mock("../../src/utils/downloadFile.js", () => ({
  downloadFile: vi.fn(async () => {}),
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;
const { downloadFile } = await import("../../src/utils/downloadFile.js");

describe("Téléchargement du lookbook — nom de fichier lisible", () => {
  it("télécharge toujours sous \"lookbook-gaspardnz.pdf\", jamais le nom d'origine déposé par Gaspard", async () => {
    render(<NavMobile />);
    fireEvent.click(screen.getByLabelText("Ouvrir le menu"));
    fireEvent.click(await screen.findByRole("button", { name: /lookbook/i }));

    await vi.waitFor(() => expect(downloadFile).toHaveBeenCalled());
    const [, filename] = downloadFile.mock.calls[0];
    expect(filename).toBe("lookbook-gaspardnz.pdf");
  });
});
