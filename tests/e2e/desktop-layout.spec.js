import { test, expect } from "@playwright/test";
import { acceptCookies } from "./helpers.js";

test.describe("Mise en page desktop (1440px)", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("Style Journal reste dans une grille contenue, pas une bande pleine largeur", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Style Journal" }).or(page.getByText("Style Journal", { exact: true })).first();
    await heading.scrollIntoViewIfNeeded();
    const firstPhoto = page.locator("article img").first();
    await expect(firstPhoto).toBeVisible();
    const box = await firstPhoto.boundingBox();
    // Les photos de cette section faisaient auparavant toute la largeur de
    // l'écran (aucune grille, aucune limite de largeur) : une vignette de
    // grille ne doit jamais approcher la largeur du viewport.
    expect(box.width).toBeLessThan(500);
  });

  test("la page ne se retrouve pas démesurément haute", async ({ page }) => {
    // Repère grossier contre une régression du type "plus aucune grille
    // desktop" : la page complète faisait plus de 25000px de haut avant les
    // correctifs de mise en page desktop.
    const height = await page.evaluate(() => document.body.scrollHeight);
    expect(height).toBeLessThan(20000);
  });
});
