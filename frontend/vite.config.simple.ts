import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5052,
    allowedHosts: ["apinutrifit.mujapira.com", "nutrifit.mujapira.com"],
    hmr: { host: "apinutrifit.mujapira.com", clientPort: 443, protocol: "wss" },
  },

  preview: {
    host: true,
    port: 5052,
    allowedHosts: ["apinutrifit.mujapira.com", "nutrifit.mujapira.com"],
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  build: {
    // Garantir que o sw.js seja copiado como asset estático
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      external: ['sw.js'],
    },
  },
});