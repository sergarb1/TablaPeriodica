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

function pick() {
  const pool = allElements.filter(e => e.atomicNumber <= 86 && e.atomicNumber > 2)
  const el = pool[Math.floor(Math.random() * pool.length)]
  current.value = el

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
  if (total.value >= 10) { done.value = true; return }
  pick()
}

function start() {
  score.value = 0; total.value = 0; correctCount.value = 0; done.value = false; started.value = true
  pick()
}

function name(el: ElementData) { return locale.value === 'es' ? el.nameEs : el.nameEn }

const totalElectrons = computed(() => {
  if (!current.value) return 0
  return current.value.atomicNumber
})
</script>

<template>
  <div>
    <button @click="emit('back')" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('games.backToGames') }}
    </button>

    <div v-if="!started" class="text-center py-12">
      <div class="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.electronBuilder') }}</h2>
      <p class="text-sm text-slate-400 mb-6">Endevina l'element a partir de la seua configuració electrònica</p>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else-if="done" class="text-center py-12">
      <div class="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">¡Completat!</h2>
      <div class="flex justify-center gap-6 mb-6">
        <div><p class="text-2xl font-bold text-mint-500">{{ correctCount }}/10</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
        <div><p class="text-2xl font-bold text-amber-500">{{ score }} XP</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
      </div>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-slate-500">{{ total }}/10</span>
        <span class="text-amber-500 font-medium">{{ score }} XP</span>
      </div>

      <div v-if="current" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
        <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ t('element.electronConfiguration') }}</p>
        <p class="text-lg font-mono font-bold text-mint-600 dark:text-mint-400">{{ current.electronConfiguration }}</p>
        <p class="text-xs text-slate-400 mt-2">{{ totalElectrons }} electrons</p>
        <div v-if="answered && current" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
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
        {{ total >= 10 ? t('learn.seeResult') : t('learn.nextQuestion') }}
      </button>
    </div>
  </div>
</template>
