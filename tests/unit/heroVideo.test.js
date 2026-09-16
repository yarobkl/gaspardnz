// @vitest-environment node
import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import { execFileSync } from "node:child_process";

// La vidéo d'accueil a été livrée un temps en 2160x3840 à ~19,7 Mbit/s
// (12 Mo pour 4,9 s) : ce test fige les bornes qui ont réglé le problème,
// pour qu'un futur remplacement du fichier ne le réintroduise pas en silence.
const HERO_VIDEO = "public/hero.mp4";
const MAX_BYTES = 4 * 1024 * 1024; // 4 Mo — la version optimisée pèse ~2,3 Mo.

// ffprobe n'est pas garanti disponible partout où ces tests tournent (poste
// d'un autre développeur, futur runner CI) : on dégrade proprement plutôt que
// de faire échouer toute la suite pour un outil absent sans rapport avec le
// code.
let hasFfprobe = true;
try { execFileSync("ffprobe", ["-version"], { stdio: "ignore" }); } catch { hasFfprobe = false; }

describe("vidéo d'accueil — poids et format", () => {
  it("reste sous 4 Mo", () => {
    const { size } = statSync(HERO_VIDEO);
    expect(size).toBeLessThan(MAX_BYTES);
  });

  it.skipIf(!hasFfprobe)("n'excède pas 1080px de large (inutile pour un fond d'écran de téléphone)", () => {
    const width = Number(execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width", "-of", "csv=p=0", HERO_VIDEO,
    ], { encoding: "utf8" }).trim());
    expect(width).toBeLessThanOrEqual(1080);
  });

  it.skipIf(!hasFfprobe)("ne contient pas de piste audio (vidéo toujours muette)", () => {
    const audioStreams = execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "a",
      "-show_entries", "stream=index", "-of", "csv=p=0", HERO_VIDEO,
    ], { encoding: "utf8" }).trim();
    expect(audioStreams).toBe("");
  });
});
