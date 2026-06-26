import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Read caching for field/offline use: serve the freshest API data when
        // online, fall back to the last cached response when offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/api/v1/"),
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "astrobsm-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: "ASTROBSM Academy & Sales Intelligence",
        short_name: "ASTROBSM Academy",
        description:
          "Education, training and sales intelligence platform for Bonnesante Medicals wound-care products.",
        theme_color: "#1e2a78",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "brand/astrobsm-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      }
    })
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  build: {
    // Split stable third-party code into long-cached vendor chunks so app
    // updates don't force users to re-download React/router/icons.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
