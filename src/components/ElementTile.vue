<script setup lang="ts">
import type { ElementData } from '@/types'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  element: ElementData
  size?: 'sm' | 'md' | 'lg'
  trendValue?: number | null
  trendMax?: number
  familyColor?: string
  noAnim?: boolean
}>()

const emit = defineEmits<{
  click: [id: number]
  hover: [el: ElementData, event: MouseEvent]
  leave: []
}>()

const { locale } = useI18n()
const s = props.size ?? 'md'
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
      'bg-white/40 dark:bg-white/5 backdrop-blur-[1px]',
      props.noAnim ? 'opacity-100 scale-100' : '',
    ]"
    :style="{
      border: '1px solid ' + (familyColor || element.color) + '60',
      boxShadow: '0 0 6px ' + (familyColor || element.color) + '20, inset 0 0 12px ' + (familyColor || element.color) + '10',
    }"
  >
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" :style="{ background: 'radial-gradient(circle at center, ' + (familyColor || element.color) + '30 0%, transparent 70%)' }" />
    <span :class="['font-bold leading-none relative z-10', s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm']" :style="{ color: familyColor || element.color, textShadow: '0 0 8px ' + (familyColor || element.color) + '40' }">{{ element.symbol }}</span>
    <span v-if="$slots.default || props.element.atomicNumber" class="leading-none relative z-10 opacity-60 dark:opacity-50" :class="[s === 'sm' ? 'text-[0.45rem]' : s === 'lg' ? 'text-[0.6rem]' : 'text-[0.5rem]']">{{ element.atomicNumber }}</span>
    <slot />
  </button>
</template>
