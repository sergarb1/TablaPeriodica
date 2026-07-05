<script setup lang="ts">
import type { ElementData } from '@/types'

const props = defineProps<{
  element: ElementData
  size?: 'sm' | 'md' | 'lg'
  trendValue?: number | null
  trendMax?: number
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

const s = props.size ?? 'md'

function trendBg(v: number | null | undefined, max: number): string {
  if (v == null) return ''
  const ratio = Math.min(v / max, 1)
  const r = Math.round(255 * (1 - ratio))
  const g = Math.round(255 * ratio * 0.6)
  const b = Math.round(255 * (1 - ratio * 0.5))
  return `${props.element.color}${Math.round(ratio * 40 + 10).toString(16).padStart(2, '0')}`
}
</script>

<template>
  <button
    v-motion :initial="{ opacity: 0, scale: 0.6 }" :visible="{ opacity: 1, scale: 1 }" :duration="300"
    @click="emit('click', element.atomicNumber)"
    class="relative flex flex-col items-center justify-center overflow-hidden rounded-lg cursor-pointer select-none transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-xl active:scale-95 group bg-white/40 dark:bg-white/5 backdrop-blur-[1px]"
    :class="[s === 'sm' ? 'w-11 h-11' : s === 'lg' ? 'w-14 h-14' : 'w-12 h-12']"
    :style="{
      border: '1px solid ' + element.color + '60',
      boxShadow: '0 0 6px ' + element.color + '20, inset 0 0 12px ' + element.color + '10',
    }"
  >
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" :style="{ background: 'radial-gradient(circle at center, ' + element.color + '30 0%, transparent 70%)' }" />
    <span :class="['font-bold leading-none relative z-10', s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm']" :style="{ color: element.color, textShadow: '0 0 8px ' + element.color + '40' }">{{ element.symbol }}</span>
    <span class="leading-none relative z-10 opacity-60 dark:opacity-50" :class="[s === 'sm' ? 'text-[0.4rem]' : s === 'lg' ? 'text-[0.6rem]' : 'text-[0.5rem]']">{{ element.atomicNumber }}</span>
  </button>
</template>
