import { defineConfig } from "vite";

const BACKEND_URL = "http://127.0.0.1:8000";

export default defineConfig({
  server: {
    proxy: {
      // This keeps browser requests same-origin during development and avoids CORS issues.
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
