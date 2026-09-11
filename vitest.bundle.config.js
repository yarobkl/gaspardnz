import { defineConfig } from "vitest/config";

// Vérifications portant sur l'artefact construit. Séparées de la configuration
// principale parce qu'elles exigent un `dist/` à jour, alors que la CI exécute
// les tests AVANT le build.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/bundle/**/*.test.js"],
  },
});
