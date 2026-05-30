import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/activities": "http://localhost:3000",
      "/feed": "http://localhost:3000",
      "/me": "http://localhost:3000",
    },
  },
});
