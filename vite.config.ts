import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  server: {
    proxy: {
      "/api/app": "http://127.0.0.1:5313",
      "/workspace": "http://127.0.0.1:5313",
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Recharts and its d3 dependencies dominate the bundle; splitting them
        // out lets the app shell cache separately from the charting library.
        manualChunks: {
          charts: ["recharts"],
        },
      },
    },
  },
});
