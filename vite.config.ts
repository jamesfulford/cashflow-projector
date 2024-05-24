import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const plugins = [react()];

export default defineConfig({
  build: {
    target: "es2021",
  },
  test: {
    environment: "jsdom",
  },
  base: "/cashflow-projector",
  plugins,
});
