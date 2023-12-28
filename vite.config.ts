import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zipPack from "vite-plugin-zip-pack";

export default defineConfig({
  plugins: [
    react(),
    zipPack({
      inDir: "./python",
      outDir: "./public",
    }),
  ],
});
