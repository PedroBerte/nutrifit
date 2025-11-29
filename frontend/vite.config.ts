import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["favicon.svg", "vite.svg"],
      injectRegister: false, // Desabilita o registro automático (registramos manualmente no login)
      strategies: "injectManifest",
      injectManifest: {
        swSrc: "public/sw.js",
        swDest: "dist/sw.js",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp}"],
        globIgnores: ["**/node_modules/**/*"],
      },
      manifest: {
        name: "Nutrifit",
        short_name: "Nutrifit",
        description: "Aplicativo para treinos e dietas",
        theme_color: "#21A15D",
        background_color: "#27523B",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "vite.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "vite.svg", sizes: "512x512", type: "image/svg+xml" },
          {
            src: "vite.svg",
            sizes: "512x512", 
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
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
});
