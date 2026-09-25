import { test, expect } from "@playwright/test";
import { acceptCookies } from "./helpers.js";

test.describe("Chatbot", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await page.getByRole("button", { name: "Ouvrir l'assistant Gaspard NZ" }).click();
  });

  test("répond à un message et propose un bouton WhatsApp", async ({ page }) => {
    await page.getByRole("textbox").fill("whatsapp");
    await page.keyboard.press("Enter");

    // Le chatbot simule un délai de frappe aléatoire de 900 à 1300ms avant
    // d'afficher sa réponse — délai réel, pas un artefact de test.
    await expect(page.getByRole("button", { name: "Ouvrir WhatsApp" })).toBeVisible({ timeout: 5000 });
  });

  test("ouvre les rubriques du site depuis les réponses rapides", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Les formules" })).toBeVisible();
    await page.getByRole("button", { name: "Les formules" }).click();
    // La navigation ferme le chatbot et défile jusqu'à la section Formules.
    await expect(page.getByRole("heading", { name: "NOS FORMULES" })).toBeVisible({ timeout: 5000 });
  });
});
