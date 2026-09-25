import { test, expect } from "@playwright/test";
import { acceptCookies } from "./helpers.js";

test.describe("Menu principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("s'ouvre et propose les entrées attendues", async ({ page }) => {
    await page.getByLabel("Ouvrir le menu").click();
    await expect(page.getByRole("button", { name: "Style Journal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Vidéos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Galerie clients" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Communauté" })).toBeVisible();
  });

  test("les libellés se traduisent quand on change de langue", async ({ page }) => {
    await page.getByLabel("Ouvrir le menu").click();
    await expect(page.getByRole("button", { name: "Style Journal" })).toBeVisible();
    await page.getByLabel(/langue actuelle/i).click();
    await page.getByRole("button", { name: "ZH", exact: true }).click();

    // Changer de langue ne referme pas le menu (seul le sous-menu des
    // langues se ferme) : les libellés se traduisent dans le panneau déjà
    // ouvert, sans qu'il faille rouvrir le menu.
    await expect(page.getByRole("button", { name: "风格日志" })).toBeVisible();
    await expect(page.getByRole("button", { name: "视频", exact: true })).toBeVisible();
    await expect(page.getByText("Style Journal")).toHaveCount(0);
  });
});

test.describe("Contraste et jour/nuit sur téléphone étroit", () => {
  test.use({ viewport: { width: 380, height: 844 } });

  test("les deux bascules sont accessibles dans le menu quand la barre du haut les masque", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await page.getByLabel("Ouvrir le menu").click();
    const contrast = page.getByRole("button", { name: "Activer le contraste élevé" });
    const dayNight = page.getByRole("button", { name: /Passer en mode (jour|nuit)/ });
    await expect(contrast).toBeVisible();
    await expect(dayNight).toBeVisible();
  });
});
