<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProgress } from '@/composables/useProgress'
import { useElement } from '@/composables/useElement'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { progress } = useProgress()
const { getByNumber } = useElement()
const { t, locale } = useI18n()

const dailyNum = computed(() => (new Date().getDate() % 118) + 1)

const dailyElement = computed(() => getByNumber(dailyNum.value))

const dailyName = computed(() => {
  if (!dailyElement.value) return ''
  return locale.value === 'es' ? dailyElement.value.nameEs : dailyElement.value.nameEn
})

const level = computed(() => Math.floor(progress.value.totalXp / 500) + 1)
const xpToNext = computed(() => 500 - (progress.value.totalXp % 500))
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10 sm:py-16">
    <div class="text-center mb-10 sm:mb-14">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mint-100 dark:bg-mint-900/30 mb-6" v-motion :initial="{ scale: 0 }" :visible="{ scale: 1 }" :duration="400">
        <svg class="w-8 h-8 text-mint-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      </div>
      <h1 class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="500">{{ t('app.title') }}</h1>
      <p class="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="500" :delay="100">{{ t('app.subtitle') }}</p>
    </div>

    <!-- Big CTA -->
    <div v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="500" :delay="100" class="mb-8">
      <button @click="router.push('/table')" class="w-full group relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-500 dark:from-mint-500 dark:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span class="text-5xl">🧪</span>
          <div class="text-center sm:text-left">
            <p class="text-2xl sm:text-3xl font-bold">{{ locale === 'es' ? '¡Vamos a la tabla periódica!' : 'Let\'s go to the periodic table!' }}</p>
            <p class="text-sm text-white/80 mt-1">{{ locale === 'es' ? 'Explora 118 elementos, sus propiedades y curiosidades' : 'Explore 118 elements, their properties and curiosities' }}</p>
          </div>
          <svg class="w-8 h-8 text-white/60 shrink-0 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3 mb-10">
      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" @click="router.push('/table')" class="group relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4"><svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-1">{{ t('app.explore') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.exploreDesc') }}</p>
        </div>
      </button>

      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="300" @click="router.push('/learn')" class="group relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-mint-50 to-mint-100 dark:from-mint-950/40 dark:to-mint-900/20 border border-mint-200/50 dark:border-mint-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-xl bg-mint-500/10 flex items-center justify-center mb-4"><svg class="w-6 h-6 text-mint-600 dark:text-mint-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-1">{{ t('app.learn') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.learnDesc') }}</p>
        </div>
      </button>

      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="400" @click="router.push('/games')" class="group relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4"><svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-1">{{ t('app.play') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.playDesc') }}</p>
        </div>
      </button>
    </div>

    <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="400" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-8">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-mint-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <div><span class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.streak') }}</span><p class="font-bold text-slate-900 dark:text-white">{{ progress.streak }} {{ t('home.days') }}</p></div>
          </div>
          <div class="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div><span class="text-sm text-slate-500 dark:text-slate-400">Nivel {{ level }}</span><p class="font-bold text-slate-900 dark:text-white">{{ progress.totalXp }} XP</p></div>
          </div>
        </div>

        <div v-if="dailyElement" @click="router.push('/element/' + dailyNum)" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: dailyElement.color + '30' }">
            <span class="font-bold text-sm" :style="{ color: dailyElement.color }">{{ dailyElement.symbol }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400">{{ t('home.dailyElement') }}</span>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ dailyName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
