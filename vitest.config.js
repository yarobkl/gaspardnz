import { defineConfig } from "vitest/config";

export default defineConfig({
  // Le JSX est transformé par esbuild en runtime automatique. Sans cette
  // option, les fichiers de test sont compilés en React.createElement et
  // échouent sur « React is not defined ».
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    // tests/bundle/ exige un build préalable : exécuté par `npm run test:bundle`.
    include: ["tests/unit/**/*.test.{js,jsx}", "tests/component/**/*.test.{js,jsx}"],
    // Les vérifications Playwright vivent dans scripts/browser-checks/ et
    // tournent via `npm run test:e2e`, pas dans le runner unitaire.
    exclude: ["node_modules/**", "dist/**", "scripts/**"],
    restoreMocks: true,
    clearMocks: true,
  },
});
