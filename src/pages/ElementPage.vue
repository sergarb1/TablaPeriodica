<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'
import BohrModel from '@/components/BohrModel.vue'
import OrbitalDiagram from '@/components/OrbitalDiagram.vue'
import type { ElementData } from '@/types'

const route = useRoute()
const router = useRouter()
const { getByNumber, getNeighbors } = useElement()
const { markElementStudied } = useProgress()
const { t, locale } = useI18n()

const element = computed(() => {
  const id = Number(route.params.id)
  const el = getByNumber(id)
  if (el) markElementStudied(id)
  return el
})

const neighbors = computed(() => {
  if (!element.value) return []
  return getNeighbors(element.value).filter(Boolean) as ElementData[]
})

const name = computed(() => {
  if (!element.value) return ''
  return locale.value === 'es' ? element.value.nameEs : element.value.nameEn
})

const discovered = computed(() => {
  if (!element.value) return ''
  const discoverer = locale.value === 'es' ? element.value.discovererEs : element.value.discovererEn
  return `${discoverer} (${element.value.yearDiscovered})`
})

const nameOrigin = computed(() => {
  if (!element.value) return ''
  return locale.value === 'es' ? element.value.nameOriginEs : element.value.nameOriginEn
})

const curiosity = computed(() => {
  if (!element.value) return ''
  return locale.value === 'es' ? element.value.curiosityEs : element.value.curiosityEn
})

const uses = computed(() => {
  if (!element.value) return ''
  return locale.value === 'es' ? element.value.usesEs : element.value.usesEn
})

const risks = computed(() => {
  if (!element.value) return ''
  return locale.value === 'es' ? element.value.risksEs : element.value.risksEn
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <template v-if="element">
    <button @click="router.back()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-mint-700 dark:text-mint-300 bg-mint-100 dark:bg-mint-950/30 hover:bg-mint-200 dark:hover:bg-mint-900/50 mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('app.back') }}
    </button>

    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-8">
      <BohrModel :electron-shells="element.electronShells" :symbol="element.symbol" :color="element.color" :size="180" />

      <div class="flex-1 text-center sm:text-left">
        <h1 class="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-1">{{ name }}</h1>
        <p class="text-lg text-slate-500 dark:text-slate-400">{{ element.atomicMass }} u</p>
        <div class="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
          <span class="px-3 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: element.color + '20', color: element.color }">
            {{ element.familyEs }} / {{ element.familyEn }}
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {{ element.stateEs }} / {{ element.stateEn }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t('element.atomicNumber') }}</span>
        <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ element.atomicNumber }}</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t('element.group') }}</span>
        <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ element.group ?? '-' }}</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t('element.period') }}</span>
        <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ element.period }}</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t('element.block') }}</span>
        <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ element.block.toUpperCase() }}</p>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-8">
      <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ t('element.electronConfiguration') }}</h3>
      <p class="text-base font-mono font-semibold text-mint-600 dark:text-mint-400 mb-3">{{ element.electronConfiguration }}</p>
      <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
        <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{{ t('element.orbitals') }}</h4>
        <OrbitalDiagram :configuration="element.electronConfiguration" />
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div v-if="element.electronegativity" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.electronegativity') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.electronegativity }}</p>
      </div>
      <div v-if="element.atomicRadius" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.atomicRadius') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.atomicRadius }} pm</p>
      </div>
      <div v-if="element.ionizationEnergy" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.ionizationEnergy') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.ionizationEnergy }} eV</p>
      </div>
      <div v-if="element.density" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.density') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.density }} g/cm³</p>
      </div>
      <div v-if="element.meltingPoint" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.meltingPoint') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.meltingPoint }} K</p>
      </div>
      <div v-if="element.boilingPoint" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.boilingPoint') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.boilingPoint }} K</p>
      </div>
      <div v-if="element.oxidationStates" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.oxidationStates') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.oxidationStates }}</p>
      </div>
      <div v-if="element.valence.length" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
        <span class="text-xs text-slate-400">{{ t('element.valence') }}</span>
        <p class="font-semibold text-slate-900 dark:text-white">{{ element.valence.join(', ') }}</p>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-8">
      <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ t('element.discovery') }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ discovered }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-500 mt-1 italic">{{ nameOrigin }}</p>
    </div>

    <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 mb-8">
      <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ t('element.curiosity') }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ curiosity }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ t('element.uses') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ uses }}</p>
      </div>
      <div class="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ t('element.risks') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ risks }}</p>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="font-semibold text-slate-900 dark:text-white mb-3">{{ t('element.neighbors') }}</h3>
      <div class="flex gap-2 flex-wrap">
        <div v-for="n in neighbors" :key="n.atomicNumber" @click="router.push('/element/' + n.atomicNumber)" class="w-16 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 hover:shadow-md active:scale-95" :style="{ backgroundColor: n.color + '30' }">
          <span class="font-bold text-sm" :style="{ color: n.color }">{{ n.symbol }}</span>
          <span class="text-[0.6rem] text-slate-500 dark:text-slate-400">{{ n.atomicNumber }}</span>
        </div>
      </div>
    </div>
    </template>
    <template v-else>
      <div class="py-20 text-center">
        <p class="text-slate-400 text-lg">{{ t('element.notFound') || 'Element not found' }}</p>
        <router-link to="/table" class="inline-block mt-4 px-6 py-2 rounded-xl bg-mint-500 text-white text-sm">{{ t('app.back') }}</router-link>
      </div>
    </template>
  </div>
</template>
