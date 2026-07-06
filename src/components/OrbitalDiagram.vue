<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  configuration: string
}>()

interface Orbital {
  label: string
  electrons: number
  type: 's' | 'p' | 'd' | 'f'
  boxes: boolean[][]
}

const orbitals = computed(() => {
  const parts = props.configuration.split(' ')
  return parts.map(part => {
    const match = part.match(/^(\d+)([spdf])([¹²³⁴⁵⁶⁷⁸⁹¹⁰¹¹¹²¹³¹⁴]+)$/)
    if (!match) return null
    const [, n, type, sup] = match
    const electrons = supToNum(sup)
    const boxesCount = type === 's' ? 1 : type === 'p' ? 3 : type === 'd' ? 5 : 7
    const boxes: boolean[][] = []
    let remaining = electrons
    for (let i = 0; i < boxesCount; i++) {
      if (remaining >= 2) {
        boxes.push([true, true])
        remaining -= 2
      } else if (remaining === 1) {
        boxes.push([true, false])
        remaining--
      } else {
        boxes.push([false, false])
      }
    }
    return { label: n + type, electrons, type: type as 's' | 'p' | 'd' | 'f', boxes }
  }).filter(Boolean) as Orbital[]
})

function supToNum(s: string): number {
  const map: Record<string, number> = {
    '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5,
    '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '¹⁰': 10,
    '¹¹': 11, '¹²': 12, '¹³': 13, '¹⁴': 14
  }
  return map[s] || parseInt(s) || 0
}

const typeColor = (t: string) => {
  const colors: Record<string, string> = {
    s: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300',
    p: 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300',
    d: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    f: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
  }
  return colors[t] || 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="orb in orbitals" :key="orb.label" class="flex items-center gap-2">
      <span class="text-xs font-mono font-bold w-10 text-slate-600 dark:text-slate-400 shrink-0">{{ orb.label }}</span>
      <div class="flex gap-1">
        <div v-for="(box, bi) in orb.boxes" :key="bi"
          class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[0.6rem] font-mono leading-none"
          :class="typeColor(orb.type)">
          <span v-if="box[0]">↑</span>
          <span v-if="box[1]" class="-ml-0.5">↓</span>
          <span v-if="!box[0] && !box[1]" class="text-[0.4rem] opacity-30">□</span>
        </div>
      </div>
    </div>
  </div>
</template>
