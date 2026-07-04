<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { getFamily, getByNumber } = useElement()
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
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-8" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{{ t('learn.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ t('learn.subtitle') }}</p>
    </div>

    <div v-motion :initial="{ scale: 0.95, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }" :duration="400" :delay="100" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('progress.title') }}</span>
        <span class="text-sm text-slate-500">{{ totalStudied }} / 118</span>
      </div>
      <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full transition-all duration-500" :style="{ width: overallPct + '%' }" />
      </div>
      <p class="text-xs text-slate-400 mt-2">{{ overallPct }}% {{ t('learn.completed') }}</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="(lesson, i) in lessons" :key="lesson!.id" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="150 + i * 50" @click="router.push('/table?family=' + lesson!.id)" class="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" :style="{ borderColor: lesson!.color + '40', backgroundColor: lesson!.color + '08' }">
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
