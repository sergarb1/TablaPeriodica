<script setup lang="ts">
import type { ElementData } from '@/types'

const props = defineProps<{
  element: ElementData
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

const sizeMap = { sm: 'w-10 h-10 text-[0.4rem]', md: 'w-12 h-12 text-[0.5rem]', lg: 'w-14 h-14 text-xs' }
const symbolSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
</script>

<template>
  <button
    v-motion :initial="{ opacity: 0, scale: 0.6 }" :visible="{ opacity: 1, scale: 1 }" :duration="300"
    @click="emit('click', element.atomicNumber)"
    class="relative flex flex-col items-center justify-center overflow-hidden rounded-lg cursor-pointer select-none transition-all duration-150 hover:z-10 hover:scale-125 hover:shadow-lg active:scale-95"
    :class="[sizeMap[size ?? 'md']]"
    :style="{ backgroundColor: element.color + '20', border: '1px solid ' + element.color + '40' }"
  >
    <span :class="['font-bold leading-none', symbolSize[size ?? 'md']]" :style="{ color: element.color }">{{ element.symbol }}</span>
    <span class="leading-none opacity-60 dark:opacity-50">{{ element.atomicNumber }}</span>
  </button>
</template>
