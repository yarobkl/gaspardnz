// Lance le serveur de preview, exécute toutes les vérifications navigateur,
// puis arrête le serveur. Prérequis : `npm run build`.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4210);
const BASE = `http://127.0.0.1:${PORT}`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function serverReady(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch { /* pas encore prêt */ }
    await wait(300);
  }
  return false;
}

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  cwd: join(HERE, "..", ".."), stdio: "ignore", detached: true,
});

let failures = 0;
try {
  if (!await serverReady()) {
    console.error(`Le serveur de preview n'a pas démarré sur ${BASE}. Avez-vous lancé « npm run build » ?`);
    process.exitCode = 1;
  } else {
    const scripts = readdirSync(HERE)
      .filter((f) => f.endsWith(".mjs") && f !== "run-all.mjs" && !f.startsWith("_"))
      .sort();

    for (const script of scripts) {
      console.log(`\n════ ${script} ════`);
      const child = spawn(process.execPath, [join(HERE, script)], {
        stdio: "inherit", env: { ...process.env, BASE },
      });
      const [code] = await once(child, "exit");
      if (code !== 0) failures += 1;
    }

    console.log(`\n════════ RÉSULTAT E2E ════════`);
    console.log(failures === 0
      ? "Toutes les vérifications navigateur sont conformes."
      : `${failures} script(s) en échec.`);
    process.exitCode = failures === 0 ? 0 : 1;
  }
} finally {
  try { process.kill(-preview.pid, "SIGTERM"); } catch { /* déjà arrêté */ }
}
