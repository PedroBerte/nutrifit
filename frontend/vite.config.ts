import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["favicon.svg"],
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
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
      },
    }),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5052,
    allowedHosts: [
      'apinutrifit.mujapira.com',
      'nutrifit.mujapira.com'
    ],
    hmr: {
      host: 'apinutrifit.mujapira.com',
      clientPort: 443,
      protocol: 'wss'
    }
  },
  preview: {
    host: true,
    port: 5052,
    allowedHosts: ['apinutrifit.mujapira.com', 'nutrifit.mujapira.com']
  }
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
