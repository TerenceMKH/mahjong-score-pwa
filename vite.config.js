import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // Same as above manifest.json content
        short_name: "Mahjong Score",
        name: "台灣麻將番數記錄",
        icons: [
          { src: "logo192.png", type: "image/png", sizes: "192x192" },
          { src: "logo512.png", type: "image/png", sizes: "512x512" }
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff"
      }
    })
  ],
  base: '/',
});