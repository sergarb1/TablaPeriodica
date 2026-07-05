<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ElementData } from '@/types'

const props = withDefaults(defineProps<{
  element: ElementData | null
  x: number
  y: number
  visible: boolean
}>(), {
  x: 0,
  y: 0,
  visible: false,
})

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const { locale } = useI18n()
const popoverRef = ref<HTMLElement | null>(null)

const name = computed(() => locale.value === 'es' ? props.element?.nameEs : props.element?.nameEn)
const familyName = computed(() => locale.value === 'es' ? props.element?.familyEs : props.element?.familyEn)

const popoverStyle = computed(() => {
  if (!props.element) return {}
  const maxX = typeof document !== 'undefined' ? document.documentElement.clientWidth : 768
  return {
    left: Math.min(props.x, maxX - 240) + 'px',
    top: Math.max(props.y - 10, 8) + 'px',
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <transition name="popover">
      <div
        v-if="visible && element"
        ref="popoverRef"
        class="fixed z-[100] w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 pointer-events-auto"
        :style="popoverStyle"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            :style="{ backgroundColor: element.color + '30', color: element.color }"
          >
            {{ element.symbol }}
          </div>
          <div class="min-w-0">
            <p class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ name }}</p>
            <p class="text-[0.6rem] text-slate-400 font-mono">{{ element.atomicNumber }} · {{ familyName }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[0.65rem]">
          <span class="text-slate-400">{{ $t('element.atomicMass') }}</span>
          <span class="text-slate-700 dark:text-slate-300 text-right font-mono">{{ element.atomicMass }} u</span>
          <span v-if="element.electronegativity" class="text-slate-400">EN</span>
          <span v-if="element.electronegativity" class="text-slate-700 dark:text-slate-300 text-right font-mono">{{ element.electronegativity }}</span>
          <span class="text-slate-400">{{ $t('element.state') }}</span>
          <span class="text-slate-700 dark:text-slate-300 text-right">{{ locale === 'es' ? element.stateEs : element.stateEn }}</span>
        </div>

        <button
          @click="router.push('/element/' + element.atomicNumber); emit('close')"
          class="mt-3 w-full py-1.5 rounded-lg bg-mint-500 text-white text-[0.65rem] font-semibold hover:bg-mint-600 transition-colors"
        >
          {{ $t('common.details') || 'Ver detalle' }}
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.popover-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.popover-leave-active {
  transition: opacity 0.1s ease;
}
.popover-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}
.popover-leave-to {
  opacity: 0;
}
</style>
