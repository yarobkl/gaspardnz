import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadFile } from "../../src/utils/downloadFile.js";

// La logique de téléchargement en place (blob + <a> temporaire) reste testée
// ici même pendant que le bouton du lookbook est désactivé côté UI, pour ne
// pas perdre la couverture d'une fonctionnalité prête à être réactivée.
describe("downloadFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("récupère le fichier en mémoire et déclenche l'enregistrement sans navigation", async () => {
    const fakeBlob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => fakeBlob }));
    URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await downloadFile("https://example.test/lookbook.pdf", "lookbook.pdf");

    expect(fetch).toHaveBeenCalledWith("https://example.test/lookbook.pdf");
    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("relance une erreur si la réponse n'est pas OK, sans planter", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(downloadFile("https://example.test/absent.pdf", "absent.pdf")).rejects.toThrow();
  });
});
