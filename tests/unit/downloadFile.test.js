import { describe, expect, it, vi } from "vitest";
import { downloadFile } from "../../src/utils/downloadFile.js";

// Bug réel (signalé par un utilisateur sur iPhone/Safari) : l'ancienne
// version (fetch + blob + clic différé après un await) était silencieusement
// ignorée par Safari iOS, qui ne reconnaît plus le clic comme un geste
// utilisateur une fois passé par une attente asynchrone. Le paramètre
// "download" de Supabase Storage déclenche un vrai téléchargement natif,
// nommé côté serveur (Content-Disposition), sans dépendre d'un geste
// utilisateur différé — fonctionne partout, y compris Safari iOS.
describe("downloadFile", () => {
  it("navigue vers l'URL avec le paramètre download=<nom de fichier>, sans fetch ni blob", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await downloadFile("https://example.test/storage/lookbook.pdf", "lookbook-gaspardnz.pdf");

    expect(clickSpy).toHaveBeenCalled();
    const link = clickSpy.mock.contexts[0];
    expect(link.href).toBe("https://example.test/storage/lookbook.pdf?download=lookbook-gaspardnz.pdf");

    clickSpy.mockRestore();
  });

  it("ajoute le paramètre avec un « & » si l'URL contient déjà une query string", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await downloadFile("https://example.test/storage/lookbook.pdf?token=abc", "lookbook-gaspardnz.pdf");

    const link = clickSpy.mock.contexts[0];
    expect(link.href).toBe("https://example.test/storage/lookbook.pdf?token=abc&download=lookbook-gaspardnz.pdf");

    clickSpy.mockRestore();
  });

  it("rejette proprement si aucune URL n'est fournie, sans planter", async () => {
    await expect(downloadFile("", "fichier.pdf")).rejects.toThrow();
  });
});
