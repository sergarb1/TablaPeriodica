<script setup lang="ts">
import type { ElementData } from '@/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  element: ElementData
  size?: 'sm' | 'md' | 'lg'
  trendValue?: number | null
  trendMax?: number
  familyColor?: string
  noAnim?: boolean
  tileTheme?: 'crystal' | 'fill' | 'light'
}>()

const emit = defineEmits<{
  click: [id: number]
  hover: [el: ElementData, event: MouseEvent]
  leave: []
}>()

const { locale } = useI18n()
const s = props.size ?? 'md'

function luminance(hex: string): number {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const fillColor = computed(() => props.familyColor || props.element.color)
const isDarkBg = computed(() => luminance(fillColor.value) < 0.4)
</script>

<template>
  <button
    v-motion="noAnim ? undefined : { initial: { opacity: 0, scale: 0.6 }, visible: { opacity: 1, scale: 1 }, duration: 300 }"
    @click="emit('click', element.atomicNumber)"
    @mouseenter="emit('hover', element, $event)"
    @mouseleave="emit('leave')"
    :aria-label="`${element.symbol}: ${locale === 'es' ? element.nameEs : element.nameEn}, Z=${element.atomicNumber}`"
    class="relative flex flex-col items-center justify-center overflow-hidden rounded-lg cursor-pointer select-none transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-xl active:scale-95 group"
    :class="[
      s === 'sm' ? 'w-11 h-11' : s === 'lg' ? 'w-14 h-14' : 'w-12 h-12',
      tileTheme === 'fill' || tileTheme === 'light' ? '' : 'bg-white/40 dark:bg-white/5 backdrop-blur-[1px]',
      tileTheme === 'fill' ? 'shadow-md' : '',
      tileTheme === 'light' ? 'shadow-sm' : '',
      props.noAnim ? 'opacity-100 scale-100' : '',
    ]"
    :style="tileTheme === 'fill' ? {
      backgroundColor: fillColor,
      border: '1px solid ' + fillColor,
      color: isDarkBg ? '#fff' : '#111827',
    } : tileTheme === 'light' ? {
      backgroundColor: fillColor + '25',
      border: '1px solid ' + fillColor + '50',
      boxShadow: '0 0 6px ' + fillColor + '20',
      color: fillColor,
    } : {
      border: '1px solid ' + fillColor + '60',
      boxShadow: '0 0 6px ' + fillColor + '20, inset 0 0 12px ' + fillColor + '10',
    }"
  >
    <div v-if="tileTheme !== 'fill' && tileTheme !== 'light'" class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" :style="{ background: 'radial-gradient(circle at center, ' + fillColor + '30 0%, transparent 70%)' }" />
    <span :class="['font-bold leading-none relative z-10', s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm']" :style="tileTheme === 'fill' ? { color: 'inherit' } : { color: fillColor, textShadow: '0 0 8px ' + fillColor + '40' }">{{ element.symbol }}</span>
    <span v-if="$slots.default || props.element.atomicNumber" class="leading-none relative z-10 opacity-60 dark:opacity-50" :class="[s === 'sm' ? 'text-[0.45rem]' : s === 'lg' ? 'text-[0.6rem]' : 'text-[0.5rem]']">{{ element.atomicNumber }}</span>
    <slot />
  </button>
</template>
