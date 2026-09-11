// Outils communs aux vérifications navigateur.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

export const BASE = process.env.BASE || "http://127.0.0.1:4210";

function resolveChromiumPath() {
  const explicit = process.env.CHROMIUM_PATH;
  if (explicit) {
    if (!existsSync(explicit)) {
      throw new Error(`CHROMIUM_PATH pointe vers un fichier introuvable : ${explicit}`);
    }
    return explicit;
  }

  for (const command of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    try {
      const candidate = execFileSync("which", [command], { encoding: "utf8" }).trim();
      if (candidate && existsSync(candidate)) return candidate;
    } catch { /* commande absente */ }
  }

  for (const candidate of [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ]) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    "Chromium/Chrome introuvable. Installez Chromium ou définissez CHROMIUM_PATH avant npm run test:e2e.",
  );
}

export const launch = () => chromium.launch({
  executablePath: resolveChromiumPath(),
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// Coupe toute requête sortante : sans cela, chaque page attend des polices et
// des scripts externes qui ne peuvent pas aboutir dans un conteneur isolé, et
// la suite prend plusieurs minutes au lieu de quelques secondes.
export async function isolate(page) {
  await page.route(/.*/, (route) => {
    const url = route.request().url();
    const local = url.startsWith(BASE) || url.startsWith("data:") || url.startsWith("blob:")
      || url.startsWith("about:");
    return local ? route.continue() : route.abort();
  });
}

export function reporter() {
  const results = [];
  return {
    record(id, label, expected, actual, pass) {
      results.push({ id, pass });
      console.log(`${pass ? "✅" : "❌"} ${id} — ${label}\n     attendu : ${expected}\n     observé : ${actual}`);
    },
    finish() {
      const failed = results.filter((r) => !r.pass);
      console.log("\n──────── SYNTHÈSE ────────");
      console.log(`${results.length - failed.length}/${results.length} conformes`);
      if (failed.length) console.log("ÉCHECS : " + failed.map((f) => f.id).join(", "));
      process.exit(failed.length ? 1 : 0);
    },
  };
}
