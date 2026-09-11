import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// Ces vérifications portent sur l'ARTEFACT construit, pas sur les sources.
// Elles exigent donc un build préalable : `npm run test:bundle` s'en charge.
// Elles sont volontairement hors de `npm run test:unit`, que la CI exécute
// AVANT le build — les y laisser ferait échouer la CI sur un dist/ absent.

// Ce que la source dit et ce que le bundle contient sont deux choses
// différentes : on vérifie l'artefact réellement embarqué dans l'application.
describe("bundle réellement embarqué", () => {
  const built = existsSync("dist/assets");
  const files = built
    ? readdirSync("dist/assets").filter((f) => f.endsWith(".js"))
        .map((f) => readFileSync(`dist/assets/${f}`, "utf8"))
    : [];

  it("dist/ existe — sinon ces vérifications ne prouvent rien", () => {
    expect(built, "lancez « npm run build:app » avant cette suite").toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });

  // Les motifs cherchent une CLÉ, pas une mention. `@supabase/supabase-js`
  // contient par exemple `startsWith("sb_secret_")` pour reconnaître le type
  // d'une clé : un scanner qui signale ça crie au loup et finit ignoré.
  it.each([
    ["clé secrète Supabase", /sb_secret_[A-Za-z0-9_-]{10,}/],
    ["jeton service_role", /"role"\s*:\s*"service_role"|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./],
    ["mot de passe SMTP", /SMTP_PASSWORD\s*[:=]\s*["'][^"']{4,}/],
    ["clé privée", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ])("ne contient pas de %s", (_label, pattern) => {
    const guilty = files.filter((content) => pattern.test(content));
    expect(guilty).toHaveLength(0);
  });

  it("contient bien la clé publishable, seule clé légitime côté client", () => {
    expect(files.some((content) => content.includes("sb_publishable_"))).toBe(true);
  });
});
