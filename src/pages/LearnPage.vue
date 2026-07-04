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

const lessons = computed(() => {
  return families.map(fid => {
    const family = getFamily(fid)
    if (!family) return null
    const studied = family.elements.filter(n => progress.value.studiedElements.includes(n)).length
    return {
      id: fid,
      name: locale.value === 'es' ? family.nameEs : family.nameEn,
      color: family.color,
      total: family.elements.length,
      studied,
      percent: Math.round((studied / family.elements.length) * 100)
    }
  }).filter(Boolean)
})

const totalStudied = computed(() => progress.value.studiedElements.length)
const overallPct = computed(() => Math.round((totalStudied.value / 118) * 100))

const quickLinks = [
  { to: '/flashcards', icon: '🃏', labelKey: 'app.flashcards', desc: 'Repaso rápido con tarjetas / Quick review with cards', color: 'from-mint-400 to-emerald-400' },
  { to: '/compare', icon: '⚖️', labelKey: 'app.compare', desc: 'Compara propiedades lado a lado / Side-by-side comparison', color: 'from-blue-400 to-indigo-400' },
  { to: '/lab', icon: '🧪', labelKey: 'app.lab', desc: 'Visualiza moléculas en 3D / View 3D molecules', color: 'from-purple-400 to-pink-400' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-8" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{{ t('learn.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ t('learn.subtitle') }}</p>
    </div>

    <!-- Overall progress -->
    <div v-motion :initial="{ scale: 0.95, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="400" :delay="100" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('progress.title') }}</span>
        <span class="text-sm text-slate-500">{{ totalStudied }} / 118</span>
      </div>
      <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all duration-500" :style="{ width: overallPct + '%' }" />
      </div>
      <p class="text-xs text-slate-400 mt-2">{{ overallPct }}% {{ t('learn.completed') }}</p>
      <p class="text-xs text-slate-400 mt-1">⏱ {{ progress.studyTimeMinutes || 0 }} min {{ locale === 'es' ? 'estudiados' : 'studied' }}</p>
    </div>

    <!-- Quick links -->
    <div class="grid sm:grid-cols-3 gap-3 mb-8">
      <div v-for="link in quickLinks" :key="link.to" v-motion :initial="{ y: 15, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="150">
        <router-link :to="link.to" class="block p-4 rounded-xl bg-gradient-to-br border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]" :class="'bg-gradient-to-br ' + link.color.replace('from-', 'from-').replace('to-', 'to-')">
          <div class="text-2xl mb-1">{{ link.icon }}</div>
          <h3 class="font-semibold text-white text-sm">{{ t(link.labelKey) }}</h3>
          <p class="text-xs text-white/70 mt-1">{{ link.desc }}</p>
        </router-link>
      </div>
    </div>

    <!-- Family cards -->
    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">{{ t('table.families') }}</h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="(lesson, i) in lessons" :key="lesson!.id" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="200 + i * 50" @click="router.push('/table?family=' + lesson!.id)" class="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" :style="{ borderColor: lesson!.color + '40', backgroundColor: lesson!.color + '08' }">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-slate-900 dark:text-white" :style="{ color: lesson!.color }">{{ lesson!.name }}</h3>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :style="{ backgroundColor: lesson!.color + '20', color: lesson!.color }">{{ lesson!.studied }}/{{ lesson!.total }}</span>
        </div>
        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500" :style="{ width: lesson!.percent + '%', backgroundColor: lesson!.color }" />
        </div>
      </div>
    </div>
  </div>
</template>
