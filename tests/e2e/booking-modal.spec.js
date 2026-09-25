import { test, expect } from "@playwright/test";
import { acceptCookies } from "./helpers.js";

test.describe("Modale de réservation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await page.getByLabel("Ouvrir le menu").click();
    await page.getByRole("button", { name: "Rendez-vous" }).click();
  });

  test("bloque le passage à l'étape 2 avec des champs vides (validation native)", async ({ page }) => {
    await page.getByRole("button", { name: /continuer/i }).click();
    await expect(page.getByText("Choisissez")).toHaveCount(0);
  });

  test("le parcours complet mène au choix Calendly / WhatsApp", async ({ page }) => {
    await page.getByLabel(/votre nom/i).fill("Marc Ferrand");
    await page.getByLabel(/type de projet/i).fill("Mariage");
    await page.getByLabel(/votre besoin/i).fill("Costume complet pour la cérémonie");
    await page.getByRole("button", { name: /continuer/i }).click();

    await expect(page.getByText("Choisissez")).toBeVisible();
    await expect(page.getByText(/prendre rendez-vous/i)).toBeVisible();
    await expect(page.getByText(/discuter via whatsapp/i)).toBeVisible();
  });

  test("un clic sur le fond ferme la fenêtre sans effacer la saisie en cours", async ({ page }) => {
    await page.getByLabel(/votre nom/i).fill("Marc Ferrand");
    // Le fond est le premier élément du portail (position fixed, plein écran).
    await page.locator('div[style*="position: fixed"][style*="inset: 0px"]').first().click({ position: { x: 5, y: 5 } });
    await expect(page.getByLabel(/votre nom/i)).toHaveCount(0);

    await page.getByLabel("Ouvrir le menu").click();
    await page.getByRole("button", { name: "Rendez-vous" }).click();
    await expect(page.getByLabel(/votre nom/i)).toHaveValue("Marc Ferrand");
  });
});
