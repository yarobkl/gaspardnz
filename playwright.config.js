import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// En environnement sandbox (voir CLAUDE.md / doc d'environnement), Chromium
// est pré-installé à ce chemin fixe pour éviter un téléchargement bloqué par
// le réseau restreint. Ailleurs (poste de dev, CI standard), ce chemin
// n'existe pas : Playwright retombe alors sur son propre Chromium managé,
// installé via `npx playwright install`.
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";
const sandboxChromiumAvailable = existsSync(SANDBOX_CHROMIUM);

const PORT = 4319;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30000,
  webServer: {
    command: `npm run dev -- --port=${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(sandboxChromiumAvailable ? { launchOptions: { executablePath: SANDBOX_CHROMIUM } } : {}),
      },
    },
  ],
});
