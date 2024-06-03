import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const plugins = [react()];

export default defineConfig({
  build: {
    target: "es2021",
    chunkSizeWarningLimit: 991, // ag-grid-community
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // split each dependency (ish) into separate chunks for great caching even across updates
          if (id.includes("node_modules")) {
            const moduleName = (id.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            ) || [])[1];
            return moduleName.replace("@", "");
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
  },
  plugins,
});
