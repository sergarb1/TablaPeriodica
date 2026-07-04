<script setup lang="ts">
import { computed } from 'vue'
import { useProgress } from '@/composables/useProgress'
import { useElement } from '@/composables/useElement'
import { useI18n } from 'vue-i18n'
import achievementsData from '@/data/achievements.json'
import type { AchievementData } from '@/types'

const { progress } = useProgress()
const { getAll } = useElement()
const { t, locale } = useI18n()

const achievements = achievementsData as AchievementData[]

const p = () => progress.value

const overallPct = computed(() => Math.round((p().studiedElements.length / 118) * 100))
const level = computed(() => Math.floor(p().totalXp / 500) + 1)
const nextLevelXp = computed(() => level.value * 500)
const currentLevelXp = computed(() => (level.value - 1) * 500)
const levelProgress = computed(() => {
  const range = nextLevelXp.value - currentLevelXp.value
  const current = p().totalXp - currentLevelXp.value
  return Math.round((current / range) * 100)
})

const accuracy = computed(() => {
  const pr = p()
  const total = pr.totalCorrect + pr.totalIncorrect
  if (total === 0) return 0
  return Math.round((pr.totalCorrect / total) * 100)
})

const unlockedAchievements = computed(() => {
  return achievements.filter(a => p().unlockedAchievements.includes(a.id))
})

const lockedAchievements = computed(() => {
  return achievements.filter(a => !p().unlockedAchievements.includes(a.id))
})

function achievementName(a: AchievementData) {
  return locale.value === 'es' ? a.nameEs : a.nameEn
}

function achievementDesc(a: AchievementData) {
  return locale.value === 'es' ? a.descriptionEs : a.descriptionEn
}

function trophyIcon(icon: string) {
  const icons: Record<string, string> = {
    star: '⭐', book: '📖', flask: '🔬', trophy: '🏆', lightning: '⚡',
    crown: '👑', fire: '🔥', inferno: '🔥', target: '🎯', brain: '🧠',
    level_up: '⬆️', legend: '💫', gamepad: '🎮', champion: '🏅'
  }
  return icons[icon] || '🏆'
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">{{ t('progress.title') }}</h1>

    <div v-motion :initial="{ scale: 0.95, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="400" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('progress.level') }} {{ level }}</span>
        <span class="text-sm text-slate-500">{{ progress.totalXp }} / {{ nextLevelXp }} XP</span>
      </div>
      <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all duration-500" :style="{ width: levelProgress + '%' }" />
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="50" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
        <p class="text-2xl font-bold text-blue-500">{{ progress.totalXp }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ t('progress.xp') }}</p>
      </div>
      <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="100" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
        <p class="text-2xl font-bold text-mint-500">{{ progress.studiedElements.length }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ t('progress.elementsStudied') }}</p>
      </div>
      <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="150" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
        <p class="text-2xl font-bold text-amber-500">{{ progress.streak }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ t('home.streak') }}</p>
      </div>
      <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="200" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
        <p class="text-2xl font-bold text-purple-500">{{ overallPct }}%</p>
        <p class="text-xs text-slate-500 mt-1">{{ t('learn.completed') }}</p>
      </div>
    </div>

    <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-8">
      <h2 class="font-semibold text-slate-900 dark:text-white mb-4">{{ t('progress.stats') }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><span class="text-xs text-slate-400">{{ t('learn.correct') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ progress.totalCorrect }}</p></div>
        <div><span class="text-xs text-slate-400">{{ t('learn.incorrect') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ progress.totalIncorrect }}</p></div>
        <div><span class="text-xs text-slate-400">{{ t('progress.quizzesCompleted') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ progress.completedQuizzes.length }}</p></div>
        <div><span class="text-xs text-slate-400">{{ t('progress.correctAnswers') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ accuracy }}%</p></div>
        <div><span class="text-xs text-slate-400">{{ t('learn.minutesStudied') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ progress.studyTimeMinutes }}</p></div>
        <div><span class="text-xs text-slate-400">{{ t('games.title') }}</span><p class="text-lg font-semibold text-slate-900 dark:text-white">{{ progress.gamesPlayed }}</p></div>
      </div>
    </div>

    <div v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="300">
      <h2 class="font-semibold text-slate-900 dark:text-white mb-4">{{ t('progress.achievements') }} ({{ unlockedAchievements.length }}/{{ achievements.length }})</h2>
      <div class="grid gap-2 sm:grid-cols-2">
        <div v-for="a in unlockedAchievements" :key="a.id" class="flex items-center gap-3 p-3 rounded-xl bg-mint-50 dark:bg-mint-950/20 border border-mint-200/50 dark:border-mint-800/30">
          <span class="text-xl">{{ trophyIcon(a.icon) }}</span>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ achievementName(a) }}</p>
            <p class="text-xs text-slate-500">{{ achievementDesc(a) }}</p>
          </div>
        </div>
        <div v-for="a in lockedAchievements" :key="a.id" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-50">
          <span class="text-xl">🔒</span>
          <div>
            <p class="text-sm font-medium text-slate-400 dark:text-slate-500">{{ achievementName(a) }}</p>
            <p class="text-xs text-slate-400">{{ achievementDesc(a) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
