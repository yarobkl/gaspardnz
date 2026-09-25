import { test, expect } from "@playwright/test";

test("la page d'accueil charge sans erreur console", async ({ page }) => {
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  await page.goto("/");
  await expect(page.getByText("Gaspardnz", { exact: false }).first()).toBeVisible();
  const realErrors = errors.filter((e) => !/favicon|net::ERR_|WebSocket|Failed to fetch/i.test(e));
  expect(realErrors, realErrors.join("\n")).toEqual([]);
});
