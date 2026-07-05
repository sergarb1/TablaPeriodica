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
const logoUrl = computed(() => import.meta.env.BASE_URL + 'logo.png')

const dailyNum = computed(() => (new Date().getDate() % 118) + 1)
const dailyElement = computed(() => getByNumber(dailyNum.value))
const dailyName = computed(() => {
  if (!dailyElement.value) return ''
  return locale.value === 'es' ? dailyElement.value.nameEs : dailyElement.value.nameEn
})

const level = computed(() => Math.floor(progress.value.totalXp / 500) + 1)
const xpInLevel = computed(() => progress.value.totalXp % 500)
const xpToNext = computed(() => 500 - xpInLevel.value)
const xpPercent = computed(() => (xpInLevel.value / 500) * 100)

const studiedCount = computed(() => progress.value.studiedElements.length)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-4 sm:py-6">
    <div class="text-center mb-4 sm:mb-6">
      <img :src="logoUrl" alt="Aprende la tabla periódica" class="h-16 sm:h-28 w-auto object-contain mx-auto mb-4" v-motion :initial="{ scale: 0.8, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="400" />
    </div>

    <!-- Big CTA -->
    <div v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="500" :delay="100" class="mb-4 sm:mb-6">
      <button @click="router.push('/table')" class="w-full group relative overflow-hidden p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-500 dark:from-mint-500 dark:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />
        <div class="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span class="text-3xl sm:text-4xl">🧪</span>
          <div class="text-center sm:text-left">
            <p class="text-base sm:text-xl font-bold">{{ t('home.ctaTitle') }}</p>
            <p class="text-[0.65rem] sm:text-sm text-white/80 mt-0.5">{{ t('home.ctaSubtitle') }}</p>
          </div>
          <svg class="w-5 h-5 sm:w-7 sm:h-7 text-white/60 shrink-0 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </div>
      </button>
    </div>

    <!-- 3 feature cards -->
    <div class="grid gap-2 sm:gap-3 sm:grid-cols-3 mb-4 sm:mb-6">
      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" @click="router.push('/table')" class="group relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <h2 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-0.5">{{ t('app.explore') }}</h2>
          <p class="text-[0.65rem] sm:text-xs text-slate-500 dark:text-slate-400">{{ t('home.exploreDesc') }}</p>
          <span class="inline-block mt-1.5 text-[0.55rem] font-medium text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{{ t('home.elementsCount') }}</span>
        </div>
      </button>

      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="300" @click="router.push('/learn')" class="group relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-mint-50 to-mint-100 dark:from-mint-950/40 dark:to-mint-900/20 border border-mint-200/50 dark:border-mint-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-mint-500/10 flex items-center justify-center mb-2">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-mint-600 dark:text-mint-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h2 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-0.5">{{ t('app.learn') }}</h2>
          <p class="text-[0.65rem] sm:text-xs text-slate-500 dark:text-slate-400">{{ t('home.learnDesc') }}</p>
          <span class="inline-block mt-1.5 text-[0.55rem] font-medium text-mint-600 bg-mint-100 dark:bg-mint-900/40 px-2 py-0.5 rounded-full">{{ t('common.details') || 'Guía + Flashcards' }}</span>
        </div>
      </button>

      <button v-motion :initial="{ y: 30, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="400" @click="router.push('/games')" class="group relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div class="relative z-10">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-0.5">{{ t('app.play') }}</h2>
          <p class="text-[0.65rem] sm:text-xs text-slate-500 dark:text-slate-400">{{ t('home.playDesc') }}</p>
          <span class="inline-block mt-1.5 text-[0.55rem] font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">3 {{ t('home.elements') || 'juegos' }}</span>
        </div>
      </button>
    </div>

    <!-- Progress + Daily Element -->
    <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="400" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 mb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <!-- XP + Level -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-mint-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('home.streak') }} <strong class="text-slate-900 dark:text-white">{{ progress.streak }}</strong> {{ t('home.days') }}</p>
            </div>
          </div>
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('home.level') }} {{ level }}</span>
              <span class="text-[0.55rem] text-slate-400">{{ xpInLevel }}/500 XP</span>
            </div>
            <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-mint-400 to-emerald-500 rounded-full transition-all duration-500" :style="{ width: xpPercent + '%' }" />
            </div>
          </div>
        </div>

        <!-- Daily element -->
        <div v-if="dailyElement" @click="router.push('/element/' + dailyNum)" class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow shrink-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ backgroundColor: dailyElement.color + '30' }">
            <span class="font-bold text-xs" :style="{ color: dailyElement.color }">{{ dailyElement.symbol }}</span>
          </div>
          <div>
            <span class="text-[0.5rem] text-slate-400">{{ t('home.dailyElement') }}</span>
            <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ dailyName }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Studied counter -->
    <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="500" class="text-center">
      <p class="text-[0.65rem] text-slate-400">{{ studiedCount }}/118 {{ t('home.elements') }} {{ t('home.learnDesc') }}</p>
    </div>
  </div>
</template>
