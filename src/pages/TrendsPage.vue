<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { getAll } = useElement()
const { t, locale } = useI18n()
const allElements = getAll()

type TrendKey = 'electronegativity' | 'atomicRadius' | 'ionizationEnergy' | 'density' | 'meltingPoint' | 'boilingPoint'

interface TrendDef {
  key: TrendKey
  unit: string
  decimals: number
}

const trends: TrendDef[] = [
  { key: 'electronegativity', unit: '', decimals: 2 },
  { key: 'atomicRadius', unit: 'pm', decimals: 0 },
  { key: 'ionizationEnergy', unit: 'eV', decimals: 2 },
  { key: 'density', unit: 'g/cm³', decimals: 2 },
  { key: 'meltingPoint', unit: 'K', decimals: 0 },
  { key: 'boilingPoint', unit: 'K', decimals: 0 },
]

const activeTrend = ref<TrendKey>('electronegativity')

function trendLabel(key: TrendKey): string {
  const map: Record<TrendKey, string> = {
    electronegativity: 'table.trendElectronegativity',
    atomicRadius: 'table.trendAtomicRadius',
    ionizationEnergy: 'table.trendIonization',
    density: 'table.trendDensity',
    meltingPoint: 'table.trendMeltingPoint',
    boilingPoint: 'element.boilingPoint',
  }
  return map[key]
}

function getValue(el: typeof allElements[0], key: TrendKey): number | null {
  return el[key] as number | null
}

const ranges = computed(() => {
  const result: Record<string, { min: number; max: number }> = {}
  for (const t of trends) {
    let min = Infinity
    let max = -Infinity
    for (const el of allElements) {
      const v = getValue(el, t.key)
      if (v !== null) {
        if (v < min) min = v
        if (v > max) max = v
      }
    }
    result[t.key] = { min, max }
  }
  return result
})

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return (value - min) / (max - min)
}

function heatColor(norm: number): string {
  const r = Math.round(Math.min(norm * 2, 1) * 255)
  const b = Math.round(Math.min((1 - norm) * 2, 1) * 255)
  const g = Math.round(255 - Math.abs(norm - 0.5) * 2 * 200)
  return `rgb(${r}, ${g}, ${b})`
}

function tileColor(el: typeof allElements[0]): string {
  const v = getValue(el, activeTrend.value)
  if (v === null) return '#e5e7eb'
  const { min, max } = ranges.value[activeTrend.value]
  return heatColor(normalize(v, min, max))
}

function formatValue(v: number | null, trend: TrendDef): string {
  if (v === null) return '—'
  return v.toFixed(trend.decimals) + (trend.unit ? ' ' + trend.unit : '')
}

const gridRows = computed(() => {
  const rows: (typeof allElements[0] | null)[][] = []
  for (let y = 1; y <= 7; y++) {
    const row: (typeof allElements[0] | null)[] = new Array(18).fill(null)
    for (const e of allElements) {
      if (e.y === y && e.block !== 'f' && e.x >= 1 && e.x <= 18) {
        row[e.x - 1] = e
      }
    }
    rows.push(row)
  }
  return rows
})

const fBlock = computed(() => {
  const lanthanides: typeof allElements = []
  const actinides: typeof allElements = []
  for (const e of allElements) {
    if (e.block === 'f') {
      if (e.period === 6) lanthanides.push(e)
      else if (e.period === 7) actinides.push(e)
    }
  }
  return { lanthanides, actinides }
})

const hoverEl = ref<typeof allElements[0] | null>(null)
const hoverValue = computed(() => {
  if (!hoverEl.value) return ''
  const trend = trends.find(t => t.key === activeTrend.value)!
  const v = getValue(hoverEl.value, activeTrend.value)
  const name = locale.value === 'es' ? hoverEl.value.nameEs : hoverEl.value.nameEn
  return `${hoverEl.value.symbol} · ${name}: ${formatValue(v, trend)}`
})

const activeDef = computed(() => trends.find(t => t.key === activeTrend.value)!)

const TILE_SIZE = 48
const TILE_GAP = 2
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 py-6">
    <div class="text-center mb-6" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">{{ t('trends.title') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('trends.subtitle') }}</p>
    </div>

    <!-- Property selector -->
    <div class="flex flex-wrap justify-center gap-2 mb-6" v-motion :initial="{ y: 10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="100">
      <button
        v-for="tr in trends"
        :key="tr.key"
        @click="activeTrend = tr.key"
        :class="[
          'px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
          activeTrend === tr.key
            ? 'bg-mint-500 text-white shadow-md scale-105'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        ]"
      >
        {{ t(trendLabel(tr.key)) }}
      </button>
    </div>

    <!-- Color scale legend -->
    <div v-motion :initial="{ y: 10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300" :delay="150" class="flex items-center justify-center gap-3 mb-6">
      <span class="text-xs text-slate-500">{{ ranges[activeTrend].min.toFixed(activeDef.decimals) }}</span>
      <div class="w-48 h-3 rounded-full" :style="{
        background: 'linear-gradient(to right, ' + heatColor(0) + ', ' + heatColor(0.5) + ', ' + heatColor(1) + ')'
      }" />
      <span class="text-xs text-slate-500">{{ ranges[activeTrend].max.toFixed(activeDef.decimals) }} {{ activeDef.unit }}</span>
    </div>

    <!-- Table -->
    <div class="overflow-auto pb-8">
      <div class="inline-block" :style="{ minWidth: 18 * TILE_SIZE + 40 + 'px' }">
        <div v-for="(row, ri) in gridRows" :key="'r'+ri" class="flex">
          <div v-for="(cell, ci) in row" :key="'c'+ri+'-'+ci" class="flex-shrink-0 flex items-center justify-center"
            :style="{ width: TILE_SIZE + 'px', height: TILE_SIZE + 'px', padding: TILE_GAP / 2 + 'px' }">
            <div
              v-if="cell"
              @mouseenter="hoverEl = cell"
              @mouseleave="hoverEl = null"
              @click="router.push('/element/' + cell.atomicNumber)"
              class="relative flex flex-col items-center justify-center w-full h-full rounded cursor-pointer transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-xl active:scale-95"
              :style="{ backgroundColor: tileColor(cell), color: 'white', textShadow: '0 0 3px rgba(0,0,0,0.6)' }"
            >
              <span class="font-bold leading-none text-[0.6rem]">{{ cell.symbol }}</span>
              <span class="leading-none text-[0.4rem] opacity-80">{{ cell.atomicNumber }}</span>
            </div>
          </div>
        </div>

        <!-- f-block -->
        <template>
          <div v-if="fBlock.lanthanides.length" class="mt-2 flex items-center" :style="{ gap: '2px' }">
            <span class="flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 text-[0.5rem] flex items-center justify-end" :style="{ width: '36px', height: TILE_SIZE + 'px' }">57-71</span>
            <div v-for="el in fBlock.lanthanides" :key="'lan'+el.atomicNumber"
              @mouseenter="hoverEl = el" @mouseleave="hoverEl = null"
              @click="router.push('/element/' + el.atomicNumber)"
              class="flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-xl active:scale-95"
              :style="{ width: TILE_SIZE + 'px', height: TILE_SIZE + 'px', backgroundColor: tileColor(el), color: 'white', textShadow: '0 0 3px rgba(0,0,0,0.6)' }"
            >
              <span class="font-bold leading-none text-[0.6rem]">{{ el.symbol }}</span>
              <span class="leading-none text-[0.4rem] opacity-80">{{ el.atomicNumber }}</span>
            </div>
          </div>
          <div v-if="fBlock.actinides.length" class="mt-1 flex items-center" :style="{ gap: '2px' }">
            <span class="flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 text-[0.5rem] flex items-center justify-end" :style="{ width: '36px', height: TILE_SIZE + 'px' }">89-103</span>
            <div v-for="el in fBlock.actinides" :key="'act'+el.atomicNumber"
              @mouseenter="hoverEl = el" @mouseleave="hoverEl = null"
              @click="router.push('/element/' + el.atomicNumber)"
              class="flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-xl active:scale-95"
              :style="{ width: TILE_SIZE + 'px', height: TILE_SIZE + 'px', backgroundColor: tileColor(el), color: 'white', textShadow: '0 0 3px rgba(0,0,0,0.6)' }"
            >
              <span class="font-bold leading-none text-[0.6rem]">{{ el.symbol }}</span>
              <span class="leading-none text-[0.4rem] opacity-80">{{ el.atomicNumber }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Hover tooltip -->
    <div v-if="hoverEl" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium shadow-xl transition-all">
      {{ hoverValue }}
    </div>
  </div>
</template>
