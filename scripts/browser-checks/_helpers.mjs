// Outils communs aux vérifications navigateur.
import { chromium } from "playwright-core";

export const BASE = process.env.BASE || "http://127.0.0.1:4210";

export const launch = () => chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
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
