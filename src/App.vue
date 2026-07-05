<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useLocale } from '@/composables/useLocale'

const { isDark, toggle } = useTheme()
const { setLocale, currentLocale } = useLocale()
const logoUrl = computed(() => import.meta.env.BASE_URL + 'logo.png')

const navLinks = [
  { to: '/table', label: 'app.explore' },
  { to: '/learn', label: 'app.learn' },
  { to: '/games', label: 'app.play' },
  { to: '/guide', label: 'app.guide' },
  { to: '/progress', label: 'app.progress' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fullscreen-hidden">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <router-link to="/" class="flex items-center gap-2 font-display font-bold shrink-0">
            <img :src="logoUrl" alt="Aprende la tabla periódica" class="h-8 sm:h-9 w-auto object-contain" />
          </router-link>

        <nav class="flex items-center gap-1 overflow-x-auto overflow-y-hidden">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to" class="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {{ $t(link.label) }}
          </router-link>
        </nav>

        <div class="flex items-center gap-1 shrink-0">
          <button @click="toggle" class="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" :title="isDark ? 'Light mode' : 'Dark mode'">
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>
          <div class="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 ml-1 pl-2">
            <button @click="setLocale('es')" :class="['px-2.5 py-1.5 text-xs rounded font-medium transition-colors', currentLocale === 'es' ? 'bg-mint-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">ES</button>
            <button @click="setLocale('en')" :class="['px-2.5 py-1.5 text-xs rounded font-medium transition-colors', currentLocale === 'en' ? 'bg-mint-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">EN</button>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 py-4 fullscreen-hidden">
      <div class="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div class="flex flex-wrap items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
          <span>✅ 100% gratuita</span>
          <span>🔒 Tus datos no salen de este dispositivo</span>
          <span>📖 Licencias libres</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-2 text-slate-400 dark:text-slate-500">
          <span>© {{ new Date().getFullYear() }} Aprende la tabla periódica — Sergi García Barea</span>
          <div class="flex items-center gap-3">
            <a href="https://github.com/sergarb1/TablaPeriodica/blob/main/LICENSE" target="_blank" rel="noopener" class="hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline">AGPL v3</a>
            <a href="https://github.com/sergarb1/TablaPeriodica/blob/main/LICENSE-CONTENT" target="_blank" rel="noopener" class="hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline">CC BY-SA 4.0</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
:global(.table-fullscreen) .fullscreen-hidden {
  display: none !important;
}
:global(.table-fullscreen) main {
  padding: 0;
}
</style>
