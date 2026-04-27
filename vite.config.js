import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

export default defineConfig({
  plugins: [react()],
  base: isCapacitor ? "/" : "/gaspardnz/",
  build: {
    outDir: "dist",
  },
});
