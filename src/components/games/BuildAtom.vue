<script setup lang="ts">
import { ref, computed } from 'vue'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'
import type { ElementData } from '@/types'

const emit = defineEmits<{ back: [] }>()

const { getAll } = useElement()
const { addXp, addCorrect, addIncorrect } = useProgress()
const { t, locale } = useI18n()

const allElements = getAll()

const current = ref<ElementData | null>(null)
const options = ref<ElementData[]>([])
const answered = ref(false)
const selected = ref<number | null>(null)
const score = ref(0)
const total = ref(0)
const correctCount = ref(0)
const started = ref(false)
const done = ref(false)
const showHint = ref(false)

const protons = computed(() => current.value?.atomicNumber ?? 0)
const neutrons = computed(() => {
  if (!current.value) return 0
  return Math.round(parseFloat(current.value.atomicMass)) - current.value.atomicNumber
})
const electrons = computed(() => protons.value)

function pick() {
  const pool = allElements.filter(e => e.atomicNumber <= 86 && e.atomicNumber !== 1)
  const el = pool[Math.floor(Math.random() * pool.length)]
  current.value = el
  showHint.value = false

  const others = pool.filter(e => e.atomicNumber !== el.atomicNumber)
  const shuffled = [el]
  while (shuffled.length < 4) {
    const r = Math.floor(Math.random() * others.length)
    if (!shuffled.find(s => s.atomicNumber === others[r].atomicNumber)) shuffled.push(others[r])
  }
  shuffled.sort(() => Math.random() - 0.5)
  options.value = shuffled

  answered.value = false
  selected.value = null
  total.value++
}

function select(z: number) {
  if (answered.value) return
  answered.value = true
  selected.value = z
  if (z === current.value!.atomicNumber) {
    addCorrect()
    correctCount.value++
    const xp = 15
    addXp(xp)
    score.value += xp
  } else {
    addIncorrect()
  }
}

function next() {
  if (total.value >= 8) { done.value = true; return }
  pick()
}

function start() {
  score.value = 0; total.value = 0; correctCount.value = 0; done.value = false; started.value = true
  pick()
}

function name(el: ElementData) { return locale.value === 'es' ? el.nameEs : el.nameEn }
</script>

<template>
  <div>
    <button @click="emit('back')" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('games.backToGames') }}
    </button>

    <div v-if="!started" class="text-center py-12">
      <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 4v1m6 11h2m-6 0h-2m0 0a6 6 0 01-6-6m6 6a6 6 0 006-6m-6 6v-6m6-6l-2 2m-8 8l-2 2"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.buildAtom') }}</h2>
      <p class="text-sm text-slate-400 mb-6">Endevina l'element a partir de protons, neutrons i electrons</p>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else-if="done" class="text-center py-12">
      <div class="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">¡Completado!</h2>
      <div class="flex justify-center gap-6 mb-6">
        <div><p class="text-2xl font-bold text-mint-500">{{ correctCount }}/8</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
        <div><p class="text-2xl font-bold text-amber-500">{{ score }} XP</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
      </div>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-slate-500">{{ total }}/8</span>
        <div class="flex items-center gap-3">
          <button @click="showHint = !showHint" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">{{ t('games.hint') }}</button>
          <span class="text-amber-500 font-medium">{{ score }} XP</span>
        </div>
      </div>

      <div v-if="current" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-4">
        <div class="grid grid-cols-3 gap-4 text-center mb-4">
          <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
            <p class="text-2xl font-bold text-red-500 font-mono">{{ protons }}</p>
            <p class="text-[0.6rem] text-slate-400">{{ t('element.protons') }}s</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            <p class="text-2xl font-bold text-slate-500 font-mono">{{ neutrons }}</p>
            <p class="text-[0.6rem] text-slate-400">{{ t('element.neutrons') }}s</p>
          </div>
          <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30">
            <p class="text-2xl font-bold text-sky-500 font-mono">{{ electrons }}</p>
            <p class="text-[0.6rem] text-slate-400">{{ t('element.electrons') }}s</p>
          </div>
        </div>

        <div v-if="showHint" class="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
          <p class="text-xs text-amber-700 dark:text-amber-300 font-mono">{{ current.electronConfiguration }}</p>
        </div>

        <div v-if="answered && current" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 font-bold text-lg" :style="{ backgroundColor: current.color + '30', color: current.color }">{{ current.symbol }}</div>
          <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ name(current) }}</p>
        </div>
      </div>

      <div class="grid gap-2">
        <button v-for="opt in options" :key="opt.atomicNumber" @click="select(opt.atomicNumber)" :disabled="answered"
          :class="['w-full text-left px-4 py-3 rounded-xl border font-medium transition-all text-sm',
            answered && opt.atomicNumber === current!.atomicNumber ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
            answered && opt.atomicNumber === selected ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
            'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
            answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
          <span class="font-mono">{{ opt.symbol }} — {{ name(opt) }}</span>
        </button>
      </div>

      <button v-if="answered" @click="next" class="mt-4 w-full py-3.5 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
        {{ total >= 8 ? t('learn.seeResult') : t('learn.nextQuestion') }}
      </button>
    </div>
  </div>
</template>
