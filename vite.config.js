import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

export default defineConfig({
  plugins: [react()],
  base: isCapacitor ? "/" : "/",
  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("react")) return "react-vendor";
        },
      },
    },
  },
});
