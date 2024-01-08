import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    target: "es2021",
  },
  base: "/solomon-app",
  plugins: [react()],
});
