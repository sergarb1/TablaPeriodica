<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { getFamily } = useElement()
const { progress } = useProgress()
const { t, locale } = useI18n()

const families = ['alkali_metal','alkaline_earth','transition_metal','post_transition','metalloid','nonmetal','halogen','noble_gas','lanthanide','actinide']

const FAMILY_ICONS: Record<string, string> = {
  alkali_metal: '⚡',
  alkaline_earth: '🦴',
  transition_metal: '🔩',
  post_transition: '📦',
  metalloid: '💻',
  nonmetal: '💎',
  halogen: '🧪',
  noble_gas: '🎈',
  lanthanide: '🌍',
  actinide: '☢️',
}

const lessons = computed(() => {
  return families.map(fid => {
    const family = getFamily(fid)
    if (!family) return null
    const studied = family.elements.filter(n => progress.value.studiedElements.includes(n)).length
    return {
      id: fid,
      name: locale.value === 'es' ? family.nameEs : family.nameEn,
      color: family.color,
      icon: FAMILY_ICONS[fid] || '⚛️',
      total: family.elements.length,
      studied,
      percent: Math.round((studied / family.elements.length) * 100)
    }
  }).filter(Boolean)
})

const totalStudied = computed(() => progress.value.studiedElements.length)
const overallPct = computed(() => Math.round((totalStudied.value / 118) * 100))

const xpForLevel = (level: number) => level * 100
const currentLevelXp = computed(() => {
  let xp = progress.value.totalXp
  let level = 1
  while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++ }
  return xp
})
const currentLevel = computed(() => {
  let xp = progress.value.totalXp
  let level = 1
  while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++ }
  return level
})
const xpForCurrent = computed(() => xpForLevel(currentLevel.value))
const xpPct = computed(() => Math.round((currentLevelXp.value / xpForCurrent.value) * 100))

const recommended = computed(() => {
  const sorted = [...lessons.value].filter(Boolean).sort((a, b) => a!.percent - b!.percent)
  const worst = sorted[0]
  if (!worst) return null
  if (worst.percent >= 100) return null
  return worst
})

const allDone = computed(() => lessons.value.every(l => l!.percent >= 100))

const unknownElements = computed(() => {
  try {
    const data = JSON.parse(localStorage.getItem('flashcards_unknown') || '[]')
    return data.length
  } catch { return 0 }
})

const quickLinks = [
  { to: '/flashcards', icon: '🃏', labelKey: 'app.flashcards', descKey: 'Your weakest elements' as string, color: 'from-mint-400 to-emerald-400' },
  { to: '/compare', icon: '⚖️', labelKey: 'app.compare', descKey: 'Side-by-side comparison' as string, color: 'from-blue-400 to-indigo-400' },
  { to: '/lab', icon: '🧪', labelKey: 'app.lab', descKey: 'View 3D molecules' as string, color: 'from-purple-400 to-pink-400' },
  { to: '/guide', icon: '🤪', labelKey: 'app.guide', descKey: 'Fun educational guide' as string, color: 'from-orange-400 to-amber-400' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-8" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{{ t('learn.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ t('learn.subtitle') }}</p>
    </div>

    <!-- Overall progress + level + streak -->
    <div v-motion :initial="{ scale: 0.95, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="400" :delay="100" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-mint-500">{{ totalStudied }}</p>
          <p class="text-xs text-slate-400 uppercase tracking-wider">{{ t('progress.elementsStudied') }}</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-amber-500">{{ t('home.level') }} {{ currentLevel }}</p>
          <p class="text-xs text-slate-400 uppercase tracking-wider">{{ progress.totalXp }} XP</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-purple-500">{{ progress.streak }}</p>
          <p class="text-xs text-slate-400 uppercase tracking-wider">{{ t('home.streak') }}</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-500">{{ progress.studyTimeMinutes || 0 }}m</p>
          <p class="text-xs text-slate-400 uppercase tracking-wider">{{ t('learn.minutesStudied') }} {{ t('learn.timeToday') }}</p>
        </div>
      </div>

      <!-- Overall progress bar -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-slate-500">{{ t('progress.title') }}</span>
          <span class="text-xs text-slate-400">{{ totalStudied }} / 118</span>
        </div>
        <div class="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all duration-500" :style="{ width: overallPct + '%' }" />
        </div>
      </div>

      <!-- XP bar -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-slate-500">{{ t('games.score') }} {{ currentLevelXp }}/{{ xpForCurrent }} XP</span>
          <span class="text-xs text-slate-400">{{ t('home.level') }} {{ currentLevel }}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" :style="{ width: xpPct + '%' }" />
        </div>
      </div>
    </div>

    <!-- Recommended family -->
    <div v-if="!allDone && recommended" v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" class="mb-6">
      <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{{ t('learn.recommended') }}</p>
      <button @click="router.push('/table?family=' + recommended!.id)" class="w-full p-4 rounded-xl flex items-center gap-4 border transition-all hover:shadow-md active:scale-[0.99]" :style="{ borderColor: recommended!.color + '40', backgroundColor: recommended!.color + '10' }">
        <span class="text-3xl">{{ recommended!.icon }}</span>
        <div class="text-left">
          <p class="font-semibold text-slate-900 dark:text-white" :style="{ color: recommended!.color }">{{ recommended!.name }}</p>
          <p class="text-xs text-slate-500">{{ recommended!.studied }}/{{ recommended!.total }} · {{ recommended!.percent }}%</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ t('learn.' + (recommended!.studied === 0 ? 'startFamily' : 'continueFamily'), { family: recommended!.name }) }}</p>
        </div>
        <svg class="w-5 h-5 text-slate-400 ml-auto shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- All done -->
    <div v-else-if="allDone" v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" class="mb-6 p-4 rounded-xl bg-mint-50 dark:bg-mint-950/20 border border-mint-200 dark:border-mint-800/30 text-center">
      <p class="text-lg font-bold text-mint-600 dark:text-mint-400">{{ t('learn.allDone') }}</p>
      <p class="text-xs text-slate-500 mt-1">{{ t('learn.allDoneDesc') }}</p>
    </div>

    <!-- Quick links -->
    <div class="grid sm:grid-cols-4 gap-3 mb-8">
      <div v-for="link in quickLinks" :key="link.to" v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="150">
        <router-link :to="link.to" class="block p-3 rounded-xl bg-gradient-to-br border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] text-white" :class="link.color">
          <div class="text-xl mb-1">{{ link.icon }}</div>
          <h3 class="font-semibold text-white text-xs">{{ t(link.labelKey) }}</h3>
        </router-link>
      </div>
    </div>

    <!-- Weak elements -->
    <div v-if="unknownElements > 0" v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="250" class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ t('learn.weakElements') }}</p>
        <p class="text-xs text-slate-500">{{ unknownElements }} {{ t('learn.weakFromFlashcards') }}</p>
      </div>
      <router-link to="/flashcards" class="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors">{{ t('learn.review') }}</router-link>
    </div>
    <div v-else v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="250" class="mb-6 p-4 rounded-xl bg-mint-50 dark:bg-mint-950/20 border border-mint-200 dark:border-mint-800/30 text-center">
      <p class="text-sm font-semibold text-mint-600 dark:text-mint-400">{{ t('learn.onTrack') }}</p>
      <p class="text-xs text-slate-500">{{ t('learn.onTrackDesc') }}</p>
    </div>

    <!-- Family cards -->
    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">{{ t('table.families') }}</h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="(lesson, i) in lessons" :key="lesson!.id" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="200 + i * 50" @click="router.push('/table?family=' + lesson!.id)" class="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" :style="{ borderColor: lesson!.color + '40', backgroundColor: lesson!.color + '08' }">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ lesson!.icon }}</span>
            <h3 class="font-semibold text-slate-900 dark:text-white" :style="{ color: lesson!.color }">{{ lesson!.name }}</h3>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :style="{ backgroundColor: lesson!.color + '20', color: lesson!.color }">
            <template v-if="lesson!.percent === 0">{{ t('learn.notStarted') }}</template>
            <template v-else-if="lesson!.percent === 100">{{ t('learn.complete') }}</template>
            <template v-else>{{ lesson!.studied }}/{{ lesson!.total }}</template>
          </span>
        </div>
        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500" :style="{ width: lesson!.percent + '%', backgroundColor: lesson!.color }" />
        </div>
      </div>
    </div>
  </div>
</template>
