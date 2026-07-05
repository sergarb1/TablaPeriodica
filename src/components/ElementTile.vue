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
  labelMode?: 'symbol' | 'name' | 'both'
  tilePx?: number
  showNumber?: boolean
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

const displayLabel = computed(() => {
  const el = props.element
  if (props.labelMode === 'name') return locale.value === 'es' ? el.nameEs : el.nameEn
  if (props.labelMode === 'both') return el.symbol
  return el.symbol
})

const displaySubLabel = computed(() => {
  if (props.labelMode !== 'both') return ''
  const el = props.element
  return locale.value === 'es' ? el.nameEs : el.nameEn
})

const fontSize = computed(() => {
  if (props.tilePx) {
    if (props.tilePx <= 36) return 'text-xs'
    if (props.tilePx <= 48) return 'text-sm'
    return 'text-base'
  }
  return s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm'
})

const nameSize = computed(() => {
  if (props.tilePx) {
    if (props.tilePx <= 36) return 'text-[0.45rem]'
    if (props.tilePx <= 48) return 'text-[0.5rem]'
    return 'text-[0.55rem]'
  }
  return 'text-[0.45rem]'
})

const nameLabelSize = computed(() => {
  if (props.labelMode !== 'name') return ''
  const el = props.element
  const nameLength = (locale.value === 'es' ? el.nameEs : el.nameEn).length
  const base = props.tilePx
  if (base) {
    if (base <= 36) {
      if (nameLength > 9) return 'text-[0.35rem]'
      if (nameLength > 6) return 'text-[0.4rem]'
      return 'text-[0.45rem]'
    }
    if (base <= 48) {
      if (nameLength > 9) return 'text-[0.4rem]'
      if (nameLength > 6) return 'text-[0.45rem]'
      return 'text-[0.5rem]'
    }
    if (nameLength > 9) return 'text-[0.45rem]'
    if (nameLength > 6) return 'text-[0.55rem]'
    return 'text-[0.6rem]'
  }
  if (nameLength > 9) return 'text-[0.4rem]'
  if (nameLength > 6) return 'text-[0.45rem]'
  return 'text-[0.5rem]'
})

const numSize = computed(() => {
  if (props.tilePx) {
    if (props.tilePx <= 36) return 'text-[0.45rem]'
    if (props.tilePx <= 48) return 'text-[0.5rem]'
    return 'text-[0.6rem]'
  }
  return s === 'sm' ? 'text-[0.45rem]' : s === 'lg' ? 'text-[0.6rem]' : 'text-[0.5rem]'
})

const tileStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.tilePx) {
    style.width = props.tilePx + 'px'
    style.height = props.tilePx + 'px'
  }
  if (props.tileTheme === 'fill') {
    style.backgroundColor = fillColor.value
    style.border = '1px solid ' + fillColor.value
    style.color = isDarkBg.value ? '#fff' : '#111827'
  } else if (props.tileTheme === 'light') {
    style.backgroundColor = fillColor.value + '25'
    style.border = '1px solid ' + fillColor.value + '50'
    style.boxShadow = '0 0 6px ' + fillColor.value + '20'
    style.color = fillColor.value
  } else {
    style.border = '1px solid ' + fillColor.value + '60'
    style.boxShadow = '0 0 6px ' + fillColor.value + '20, inset 0 0 12px ' + fillColor.value + '10'
  }
  return style
})
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
      tilePx ? '' : (s === 'sm' ? 'w-11 h-11' : s === 'lg' ? 'w-14 h-14' : 'w-12 h-12'),
      tileTheme === 'fill' || tileTheme === 'light' ? '' : 'bg-white/40 dark:bg-white/5 backdrop-blur-[1px]',
      tileTheme === 'fill' ? 'shadow-md' : '',
      tileTheme === 'light' ? 'shadow-sm' : '',
      props.noAnim ? 'opacity-100 scale-100' : '',
    ]"
    :style="tileStyle"
  >
    <div v-if="tileTheme !== 'fill' && tileTheme !== 'light'" class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" :style="{ background: 'radial-gradient(circle at center, ' + fillColor + '30 0%, transparent 70%)' }" />
    <template v-if="props.labelMode === 'both'">
      <span class="font-bold leading-none relative z-10" :class="[fontSize]" :style="tileTheme === 'fill' ? { color: 'inherit' } : { color: fillColor, textShadow: '0 0 8px ' + fillColor + '40' }">{{ displayLabel }}</span>
      <span class="leading-none relative z-10 truncate max-w-full px-0.5" :class="[nameSize]" :title="displaySubLabel" :style="tileTheme === 'fill' ? { color: 'inherit', opacity: 0.8 } : { color: fillColor, opacity: 0.7 }">{{ displaySubLabel }}</span>
    </template>
    <span v-else-if="props.labelMode === 'symbol'" :class="['font-bold leading-none relative z-10', fontSize]" :style="tileTheme === 'fill' ? { color: 'inherit' } : { color: fillColor, textShadow: '0 0 8px ' + fillColor + '40' }" class="truncate max-w-full px-0.5">{{ displayLabel }}</span>
    <span v-else :class="['font-bold leading-none relative z-10', nameLabelSize]" :title="displayLabel" :style="tileTheme === 'fill' ? { color: 'inherit' } : { color: fillColor, textShadow: '0 0 8px ' + fillColor + '40' }" class="truncate max-w-full px-0.5">{{ displayLabel }}</span>
    <span v-if="showNumber" class="leading-none relative z-10 opacity-60 dark:opacity-50" :class="[numSize]">{{ element.atomicNumber }}</span>
    <slot />
  </button>
</template>
