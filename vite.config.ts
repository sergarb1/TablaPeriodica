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
      includeAssets: ['logo.png', 'logoCuadrado.png', 'favicon.svg', 'icons/*.svg'],
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
          { src: 'logoCuadrado.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'logoCuadrado.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'quimica-visual-v3',
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
