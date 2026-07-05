import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/TablaPeriodica/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Aprende la tabla periódica',
        short_name: 'Tabla Periódica',
        description: 'App interactiva, bilingüe y gratuita. 118 elementos, juegos, flashcards, guía educativa y laboratorio de moléculas.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/TablaPeriodica/',
        lang: 'es',
        categories: ['education', 'science', 'chemistry'],
        screenshots: [],
        icons: [
          { src: 'logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https?.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quimica-visual-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
