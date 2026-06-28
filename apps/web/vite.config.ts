import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "brand/apple-touch-icon.png",
        "brand/astrobsm-icon.svg"
      ],
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
              // Give larger responses (e.g. product lists with inline images)
              // time to arrive on slow mobile links before falling back to
              // cache. When fully offline, fetch rejects immediately, so the
              // cached copy is still served without waiting this long.
              networkTimeoutSeconds: 20,
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
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "brand/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "brand/astrobsm-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
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
