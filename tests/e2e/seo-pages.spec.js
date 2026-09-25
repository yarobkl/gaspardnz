import { test, expect } from "@playwright/test";

const SEO_ROUTES = [
  "/conseil-image-homme-paris",
  "/styliste-mariage-homme-paris",
  "/services",
  "/a-propos",
  "/actualites",
];

test.describe("Pages SEO — accessibles directement, pied de page légal", () => {
  for (const route of SEO_ROUTES) {
    test(`${route} charge et renvoie vers les pages légales`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("link", { name: "Mentions légales" })).toHaveAttribute("href", "/mentions-legales.html");
      await expect(page.getByRole("link", { name: "Confidentialité" })).toHaveAttribute("href", "/confidentialite.html");
      await expect(page.getByRole("link", { name: "CGV" })).toHaveAttribute("href", "/cgv.html");
    });
  }
});

test("le footer de la page d'accueil renvoie vers /conseil-image-homme-paris", async ({ page }) => {
  await page.goto("/");
  const accept = page.getByText("TOUT ACCEPTER", { exact: true }).first();
  if (await accept.isVisible({ timeout: 3000 }).catch(() => false)) await accept.click();
  const link = page.getByRole("link", { name: "Conseil en image" });
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveAttribute("href", "/conseil-image-homme-paris");
});
