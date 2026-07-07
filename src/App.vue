<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useLocale } from '@/composables/useLocale'

const { isDark, toggle } = useTheme()
const { setLocale, currentLocale } = useLocale()
const logoUrl = computed(() => import.meta.env.BASE_URL + 'logo.png')
const isNavOpen = ref(false)

const icons: Record<string, string> = {
  grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
  trending: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  gamepad: 'M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z',
  compass: 'M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l-3.448 4.138m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-4.138 3.448m0 0a9.014 9.014 0 009.424 0m-9.424 0a9.027 9.027 0 01-1.306-1.652 9.027 9.027 0 01-1.306-1.652m0 0l3.448-4.138m-3.448 4.138a9.014 9.014 0 010-9.424',
  trophy: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.022 6.022 0 01-2.77-.896',
}

const navLinks = [
  { to: '/table', label: 'app.tableLabel', icon: 'grid' },
  { to: '/trends', label: 'app.trends', icon: 'trending' },
  { to: '/learn', label: 'app.learn', icon: 'book' },
  { to: '/games', label: 'app.play', icon: 'gamepad' },
  { to: '/guide', label: 'app.guide', icon: 'compass' },
  { to: '/progress', label: 'app.progress', icon: 'trophy' },
]

function iconPath(name: string): string {
  return icons[name] || icons.grid
}

function closeNav() {
  isNavOpen.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Skip to content link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-mint-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
      {{ $t('common.skipToContent') }}
    </a>
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fullscreen-hidden" role="banner">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <router-link to="/" class="flex items-center gap-2 font-display font-bold shrink-0" aria-label="Aprende la tabla periódica — Inicio">
          <img :src="logoUrl" alt="Aprende la tabla periódica" class="h-8 sm:h-9 w-auto object-contain" />
        </router-link>

        <!-- Desktop nav -->
        <nav class="hidden sm:flex items-center gap-1" aria-label="{{ $t('common.mainNav') }}">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to" class="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-mint-100 dark:bg-slate-800 hover:bg-mint-200 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-mint-500 active:bg-mint-300 dark:active:bg-slate-600 transition-colors">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path :d="iconPath(link.icon)" /></svg>
            {{ $t(link.label) }}
          </router-link>
        </nav>

        <div class="flex items-center gap-1 shrink-0">
          <button @click="toggle" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-mint-500" :title="isDark ? 'Light mode' : 'Dark mode'" :aria-label="isDark ? $t('common.light') : $t('common.dark')">
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>
          <div class="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 ml-1 pl-2" role="tablist" :aria-label="$t('common.languageSelect')">
            <button @click="setLocale('es')" :class="['px-2.5 py-1.5 text-xs rounded font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mint-500', currentLocale === 'es' ? 'bg-mint-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']" role="tab" :aria-selected="currentLocale === 'es'" aria-label="Español">ES</button>
            <button @click="setLocale('ca')" :class="['px-2.5 py-1.5 text-xs rounded font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mint-500', currentLocale === 'ca' ? 'bg-mint-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']" role="tab" :aria-selected="currentLocale === 'ca'" aria-label="Valencià">CA</button>
            <button @click="setLocale('en')" :class="['px-2.5 py-1.5 text-xs rounded font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mint-500', currentLocale === 'en' ? 'bg-mint-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']" role="tab" :aria-selected="currentLocale === 'en'" aria-label="English">EN</button>
          </div>
          <!-- Mobile hamburger -->
          <button @click="isNavOpen = !isNavOpen" class="sm:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 focus-visible:outline-2 focus-visible:outline-mint-500" :aria-label="$t(isNavOpen ? 'common.close' : 'common.menu')" :aria-expanded="isNavOpen">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path v-if="!isNavOpen" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav dropdown -->
      <transition name="slide-down">
        <div v-if="isNavOpen" class="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg" role="navigation" :aria-label="$t('common.mainNav')">
          <div class="px-4 py-3 flex flex-col gap-1">
            <router-link v-for="link in navLinks" :key="link.to" :to="link.to" @click="closeNav" class="flex items-center gap-2 px-3 py-3 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-mint-100 dark:bg-slate-800 hover:bg-mint-200 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-mint-500 active:bg-mint-300 dark:active:bg-slate-600 transition-colors">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path :d="iconPath(link.icon)" /></svg>
              {{ $t(link.label) }}
            </router-link>
          </div>
        </div>
      </transition>
    </header>

    <main id="main-content" class="flex-1" role="main">
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
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to, .slide-down-leave-from {
  max-height: 400px;
  opacity: 1;
}
:global(.table-fullscreen) .fullscreen-hidden {
  display: none !important;
}
:global(.table-fullscreen) main {
  padding: 0;
}
</style>
