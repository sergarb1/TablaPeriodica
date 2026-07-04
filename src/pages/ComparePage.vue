<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import elementsData from '@/data/elements.json'
import type { ElementData } from '@/types'

const { t, locale } = useI18n()
const elements = elementsData as ElementData[]

const searchA = ref('')
const searchB = ref('')
const elA = ref<ElementData | null>(null)
const elB = ref<ElementData | null>(null)
const showDropdownA = ref(false)
const showDropdownB = ref(false)

const resultsA = computed(() => {
  if (!searchA.value) return elements.slice(0, 5)
  const q = searchA.value.toLowerCase()
  return elements.filter(e => e.symbol.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q) || (e.nameEs && e.nameEs.toLowerCase().includes(q)) || e.atomicNumber.toString().includes(q)).slice(0, 8)
})
const resultsB = computed(() => {
  if (!searchB.value) return elements.slice(0, 5)
  const q = searchB.value.toLowerCase()
  return elements.filter(e => e.symbol.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q) || (e.nameEs && e.nameEs.toLowerCase().includes(q)) || e.atomicNumber.toString().includes(q)).slice(0, 8)
})

function selectA(el: ElementData) { elA.value = el; searchA.value = locale.value === 'es' ? (el.nameEs || el.nameEn) : el.nameEn; showDropdownA.value = false }
function selectB(el: ElementData) { elB.value = el; searchB.value = locale.value === 'es' ? (el.nameEs || el.nameEn) : el.nameEn; showDropdownB.value = false }
function blurA() { setTimeout(() => showDropdownA.value = false, 200) }
function blurB() { setTimeout(() => showDropdownB.value = false, 200) }

const properties: { key: keyof ElementData; label: string; unit: string; format?: string }[] = [
  { key: 'atomicNumber', label: 'Z', unit: '' },
  { key: 'atomicMass', label: 'Mass', unit: ' u', format: 'number' },
  { key: 'electronegativity', label: 'EN', unit: '' },
  { key: 'atomicRadius', label: 'Radius', unit: ' pm' },
  { key: 'ionizationEnergy', label: 'IE', unit: ' eV' },
  { key: 'density', label: 'Density', unit: ' g/cm³' },
  { key: 'meltingPoint', label: 'M.P.', unit: ' K' },
  { key: 'boilingPoint', label: 'B.P.', unit: ' K' },
]

function getVal(el: ElementData | null, key: keyof ElementData): number | null {
  if (!el) return null
  const v = el[key]
  if (typeof v === 'number') return v
  return null
}

function maxVal(key: keyof ElementData): number {
  let max = 0
  if (elA.value) { const v = getVal(elA.value, key); if (v && v > max) max = v }
  if (elB.value) { const v = getVal(elB.value, key); if (v && v > max) max = v }
  return max || 1
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-6" v-motion :initial="{ y: -10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <router-link to="/table" class="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">&larr; {{ t('app.back') }}</router-link>
      <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('app.compare') }}</h1>
    </div>

    <!-- Selectors -->
    <div class="grid sm:grid-cols-2 gap-4 mb-8">
      <div class="relative">
        <label class="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">Element A</label>
        <input v-model="searchA" @focus="showDropdownA = true" @blur="blurA" placeholder="Search..." class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
        <div v-if="showDropdownA && resultsA.length" class="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg max-h-60 overflow-y-auto">
          <button v-for="el in resultsA" :key="el.atomicNumber" @click="selectA(el)" class="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-xs transition-colors">
            <span class="font-mono font-bold text-slate-700 dark:text-slate-300 w-8">{{ el.symbol }}</span>
            <span class="text-slate-500 dark:text-slate-400">{{ locale === 'es' ? el.nameEs : el.nameEn }}</span>
            <span class="text-slate-400 ml-auto">{{ el.atomicNumber }}</span>
          </button>
        </div>
      </div>
      <div class="relative">
        <label class="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">Element B</label>
        <input v-model="searchB" @focus="showDropdownB = true" @blur="blurB" placeholder="Search..." class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
        <div v-if="showDropdownB && resultsB.length" class="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg max-h-60 overflow-y-auto">
          <button v-for="el in resultsB" :key="el.atomicNumber" @click="selectB(el)" class="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-xs transition-colors">
            <span class="font-mono font-bold text-slate-700 dark:text-slate-300 w-8">{{ el.symbol }}</span>
            <span class="text-slate-500 dark:text-slate-400">{{ locale === 'es' ? el.nameEs : el.nameEn }}</span>
            <span class="text-slate-400 ml-auto">{{ el.atomicNumber }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Comparison table -->
    <div v-if="elA && elB" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <div class="grid sm:grid-cols-3 gap-4 mb-6 text-center">
        <div class="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-900/20 border border-sky-200/50 dark:border-sky-800/30">
          <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center mx-auto mb-2">
            <span class="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">{{ elA.symbol }}</span>
          </div>
          <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ searchA }}</p>
          <p class="text-xs text-slate-400">{{ locale === 'es' ? elA.familyEs : elA.familyEn }}</p>
        </div>
        <div class="flex items-center justify-center"><span class="text-2xl text-slate-300">VS</span></div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-900/20 border border-rose-200/50 dark:border-rose-800/30">
          <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center mx-auto mb-2">
            <span class="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">{{ elB.symbol }}</span>
          </div>
          <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ searchB }}</p>
          <p class="text-xs text-slate-400">{{ locale === 'es' ? elB.familyEs : elB.familyEn }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="p in properties" :key="String(p.key)" class="grid sm:grid-cols-3 items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div class="text-center">
            <span v-if="getVal(elA, p.key) !== null" class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ getVal(elA, p.key) }}{{ p.unit }}</span>
            <span v-else class="text-xs text-slate-400">—</span>
          </div>
          <div class="text-center text-xs font-medium text-slate-400">{{ p.label }}</div>
          <div class="text-center">
            <span v-if="getVal(elB, p.key) !== null" class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ getVal(elB, p.key) }}{{ p.unit }}</span>
            <span v-else class="text-xs text-slate-400">—</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-slate-400 text-sm">{{ t('element.searchPlaceholder') || 'Select two elements to compare' }}</p>
    </div>
  </div>
</template>
