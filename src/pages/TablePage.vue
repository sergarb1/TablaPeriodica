<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useI18n } from 'vue-i18n'
import ElementTile from '@/components/ElementTile.vue'
import type { ElementData } from '@/types'

const route = useRoute()
const router = useRouter()
const { getAll, search, getFamily } = useElement()
const { t } = useI18n()

const allElements = getAll()
const query = ref('')
const projectorMode = ref(false)
const selectedFamily = ref<string | null>((route.query.family as string) || null)

const families = ['nonmetal','noble_gas','alkali_metal','alkaline_earth','transition_metal','post_transition','metalloid','halogen','lanthanide','actinide']

const FAMILY_LABEL: Record<string, string> = {
  nonmetal: 'nonmetal',
  noble_gas: 'nobleGas',
  alkali_metal: 'alkaliMetal',
  alkaline_earth: 'alkalineEarth',
  transition_metal: 'transitionMetal',
  post_transition: 'postTransition',
  metalloid: 'metalloid',
  halogen: 'halogen',
  lanthanide: 'lanthanide',
  actinide: 'actinide'
}

const displayElements = computed(() => {
  let list = query.value ? search(query.value) : allElements
  if (selectedFamily.value) {
    list = list.filter(e => e.family === selectedFamily.value)
  }
  return list
})

const gridRows = computed(() => {
  const rows: (ElementData | null)[][] = []
  for (let y = 1; y <= 7; y++) {
    const row: (ElementData | null)[] = new Array(18).fill(null)
    for (const e of displayElements.value) {
      if (e.y === y && e.block !== 'f' && e.x >= 1 && e.x <= 18) {
        row[e.x - 1] = e
      }
    }
    rows.push(row)
  }
  return rows
})

const fBlock = computed(() => {
  const lanthanides: ElementData[] = []
  const actinides: ElementData[] = []
  for (const e of displayElements.value) {
    if (e.block === 'f') {
      if (e.period === 6) lanthanides.push(e)
      else if (e.period === 7) actinides.push(e)
    }
  }
  return { lanthanides, actinides }
})

function openElement(n: number) {
  router.push(`/element/${n}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 py-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      <div class="relative flex-1 w-full">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="query" :placeholder="t('app.search')" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/50 dark:text-white" />
      </div>
      <button @click="projectorMode = !projectorMode" :class="['px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap', projectorMode ? 'bg-mint-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']">
        {{ t('table.projector') }}
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
      <button @click="selectedFamily = null" :class="['px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors', !selectedFamily ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']">
        {{ t('table.families') }}
      </button>
      <button v-for="f in families" :key="f" @click="selectedFamily = f" :class="['px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors', selectedFamily === f ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']" :style="selectedFamily === f ? { backgroundColor: getFamily(f)?.color } : {}">
        {{ t('table.' + FAMILY_LABEL[f]) }}
      </button>
    </div>

    <div :class="['overflow-auto pb-8', projectorMode ? 'text-lg sm:text-2xl' : 'text-xs sm:text-sm']">
      <div class="min-w-[680px]" :style="{ maxWidth: projectorMode ? '100%' : '920px' }">
        <div v-for="(row, ri) in gridRows" :key="'r'+ri" class="flex">
          <div v-for="(cell, ci) in row" :key="'c'+ri+'-'+ci" class="flex-shrink-0 p-[1px]" :style="{ width: projectorMode ? '5.5vw' : '48px', height: projectorMode ? '5.5vw' : '48px' }">
            <ElementTile v-if="cell" :element="cell" @click="openElement" :size="projectorMode ? 'lg' : 'sm'" />
          </div>
        </div>

        <div class="mt-2 flex gap-1">
          <span class="w-10 flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 leading-[48px] text-xs">57-71</span>
          <ElementTile v-for="el in fBlock.lanthanides" :key="'lan'+el.atomicNumber" :element="el" @click="openElement" size="sm" />
        </div>

        <div class="mt-1 flex gap-1">
          <span class="w-10 flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 leading-[48px] text-xs">89-103</span>
          <ElementTile v-for="el in fBlock.actinides" :key="'act'+el.atomicNumber" :element="el" @click="openElement" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
