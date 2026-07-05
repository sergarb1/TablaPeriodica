<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'
import { useTableConfig } from '@/composables/useTableConfig'
import { useI18n } from 'vue-i18n'
import ElementTile from '@/components/ElementTile.vue'
import ElementPopover from '@/components/ElementPopover.vue'
import TableConfig from '@/components/TableConfig.vue'
import type { ElementData } from '@/types'

const route = useRoute()
const router = useRouter()
const { getAll, search, getFamily } = useElement()
const { config, getColor, tilePx } = useTableConfig()
const { t, locale } = useI18n()

const allElements = getAll()
const query = ref('')
const selectedFamily = ref<string | null>((route.query.family as string) || null)
const showConfig = ref(false)
const isFullscreen = ref(false)

const hoverEl = ref<ElementData | null>(null)
const hoverPos = ref({ x: 0, y: 0 })
const showPopover = ref(false)
let popoverTimer: ReturnType<typeof setTimeout> | null = null

const families = ['nonmetal','noble_gas','alkali_metal','alkaline_earth','transition_metal','post_transition','metalloid','halogen','lanthanide','actinide']

const FAMILY_LABEL: Record<string, string> = {
  nonmetal: 'nonmetal', noble_gas: 'nobleGas', alkali_metal: 'alkaliMetal',
  alkaline_earth: 'alkalineEarth', transition_metal: 'transitionMetal',
  post_transition: 'postTransition', metalloid: 'metalloid', halogen: 'halogen',
  lanthanide: 'lanthanide', actinide: 'actinide'
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

function onTileHover(el: ElementData, e: MouseEvent) {
  if (!config.value.hoverInfo) return
  hoverEl.value = el
  hoverPos.value = { x: e.clientX, y: e.clientY }
  if (popoverTimer) clearTimeout(popoverTimer)
  popoverTimer = setTimeout(() => { showPopover.value = true }, 200)
}

function onTileLeave() {
  if (popoverTimer) clearTimeout(popoverTimer)
  showPopover.value = false
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  document.documentElement.classList.toggle('table-fullscreen', isFullscreen.value)
}

const tileSizePx = computed(() => {
  if (config.value.tileSize === 'compact') return 36
  if (config.value.tileSize === 'normal') return 48
  if (config.value.tileSize === 'comfortable') return 60
  return 80
})

function tileSize(el: ElementData) {
  if (config.value.tileSize === 'compact') return 'sm'
  if (config.value.tileSize === 'normal') return 'sm'
  if (config.value.tileSize === 'comfortable') return 'md'
  return 'lg'
}
</script>

<template>
  <div :class="['max-w-7xl mx-auto py-6', isFullscreen ? 'px-1' : 'px-2 sm:px-4']">
    <!-- Toolbar -->
    <div v-if="!isFullscreen" class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      <div class="relative flex-1 w-full">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="query" :placeholder="t('app.search')" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/50 dark:text-white" />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button @click="toggleFullscreen" class="px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
          {{ t('table.fullscreen') }}
        </button>
        <button @click="showConfig = true" class="px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>

    <!-- Fullscreen exit bar -->
    <div v-if="isFullscreen" class="absolute top-2 right-2 z-50">
      <button @click="toggleFullscreen" class="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
        ✕ {{ t('table.exitFullscreen') }}
      </button>
    </div>

    <!-- Family filters -->
    <div v-if="!isFullscreen" class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-fade">
      <button @click="selectedFamily = null" :class="['px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0', !selectedFamily ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']">
        {{ t('table.families') }}
      </button>
      <button v-for="f in families" :key="f" @click="selectedFamily = f" :class="['px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0', selectedFamily === f ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']" :style="selectedFamily === f ? { backgroundColor: getColor(f, getFamily(f)?.color || '#666') } : {}">
        {{ t('table.' + FAMILY_LABEL[f]) }}
      </button>
    </div>

    <!-- Table grid -->
    <div :class="['overflow-auto pb-8', isFullscreen ? 'max-h-screen' : '']" :style="{ fontSize: tileSizePx < 44 ? '0.65rem' : tileSizePx < 64 ? '0.75rem' : '0.85rem' }">
      <div class="inline-block" :style="{ minWidth: 18 * tileSizePx + 40 + 'px' }">
        <!-- Main 7 rows -->
        <div v-for="(row, ri) in gridRows" :key="'r'+ri" class="flex">
          <div v-for="(cell, ci) in row" :key="'c'+ri+'-'+ci" class="flex-shrink-0" :style="{ width: tileSizePx + 'px', height: tileSizePx + 'px', padding: tileSizePx <= 44 ? '1px' : '2px' }">
            <ElementTile v-if="cell" :element="cell" @click="openElement" @hover="onTileHover" @leave="onTileLeave" :size="tileSize(cell)" :noAnim="!config.animations" :familyColor="config.colorTheme !== 'normal' ? getColor(cell.family, cell.color) : undefined" />
          </div>
        </div>

        <!-- f-block rows -->
        <template v-if="config.fblockPosition === 'bottom'">
          <div v-if="fBlock.lanthanides.length" class="mt-2 flex" :style="{ gap: tileSizePx <= 44 ? '2px' : '4px' }">
            <span class="flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 text-xs flex items-center justify-end" :style="{ width: '36px', height: tileSizePx + 'px' }">57-71</span>
            <ElementTile v-for="el in fBlock.lanthanides" :key="'lan'+el.atomicNumber" :element="el" @click="openElement" @hover="onTileHover" @leave="onTileLeave" :size="tileSize(el)" :noAnim="!config.animations" :familyColor="config.colorTheme !== 'normal' ? getColor(el.family, el.color) : undefined" />
          </div>
          <div v-if="fBlock.actinides.length" class="mt-1 flex" :style="{ gap: tileSizePx <= 44 ? '2px' : '4px' }">
            <span class="flex-shrink-0 text-slate-400 dark:text-slate-500 text-right pr-1 text-xs flex items-center justify-end" :style="{ width: '36px', height: tileSizePx + 'px' }">89-103</span>
            <ElementTile v-for="el in fBlock.actinides" :key="'act'+el.atomicNumber" :element="el" @click="openElement" @hover="onTileHover" @leave="onTileLeave" :size="tileSize(el)" :noAnim="!config.animations" :familyColor="config.colorTheme !== 'normal' ? getColor(el.family, el.color) : undefined" />
          </div>
        </template>
      </div>
    </div>

    <!-- Legend (compact) -->
    <div v-if="!isFullscreen" class="mt-4 flex flex-wrap gap-2 justify-center">
      <span v-for="f in families" :key="f" class="inline-flex items-center gap-1 text-[0.55rem] text-slate-400">
        <span class="w-2 h-2 rounded-sm inline-block" :style="{ backgroundColor: getColor(f, getFamily(f)?.color || '#666') }" />
        {{ t('table.' + FAMILY_LABEL[f]) }}
      </span>
    </div>

    <!-- Popover -->
    <ElementPopover :element="hoverEl" :x="hoverPos.x" :y="hoverPos.y" :visible="showPopover" @close="showPopover = false" />

    <!-- Config panel -->
    <TableConfig v-if="showConfig" @close="showConfig = false" />
  </div>
</template>
