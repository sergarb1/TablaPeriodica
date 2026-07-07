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
const families = [...new Set(allElements.map(e => e.family).filter(Boolean))] as string[]

const current = ref<ElementData | null>(null)
const familyOptions = ref<string[]>([])
const correctFamily = ref('')
const answered = ref(false)
const selectedFamily = ref('')
const score = ref(0)
const total = ref(0)
const correctCount = ref(0)
const started = ref(false)
const done = ref(false)

const familyLabel = (f: string) => {
  const e = allElements.find(el => el.family === f)
  if (!e) return f.replace(/_/g, ' ')
  return locale.value === 'es' ? e.familyEs : e.familyEn
}

function pick() {
  const pool = allElements.filter(e => e.family && e.family !== 'unknown' && e.atomicNumber <= 118)
  const el = pool[Math.floor(Math.random() * pool.length)]
  current.value = el
  correctFamily.value = el.family

  const others = families.filter(f => f !== el.family)
  const shuffled = [el.family]
  while (shuffled.length < 4) {
    const r = others[Math.floor(Math.random() * others.length)]
    if (!shuffled.includes(r)) shuffled.push(r)
  }
  shuffled.sort(() => Math.random() - 0.5)
  familyOptions.value = shuffled
  answered.value = false
  selectedFamily.value = ''
  total.value++
}

function selectFamily(f: string) {
  if (answered.value) return
  answered.value = true
  selectedFamily.value = f
  if (f === correctFamily.value) {
    addCorrect()
    correctCount.value++
    const xp = 10 + Math.floor(Math.random() * 5)
    addXp(xp)
    score.value += xp
  } else {
    addIncorrect()
  }
}

function next() {
  if (total.value >= 12) { done.value = true; return }
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
      <div class="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.families') }}</h2>
      <p class="text-sm text-slate-400 mb-6">Classifica 12 elements en la seua família correcta</p>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else-if="done" class="text-center py-12">
      <div class="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">¡Completado!</h2>
      <div class="flex justify-center gap-6 mb-6">
        <div><p class="text-2xl font-bold text-mint-500">{{ correctCount }}/12</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
        <div><p class="text-2xl font-bold text-amber-500">{{ score }} XP</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
      </div>
      <button @click="start" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-slate-500">{{ total }}/12</span>
        <span class="text-amber-500 font-medium">{{ score }} XP</span>
      </div>

      <div v-if="current" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl" :style="{ backgroundColor: current.color + '30', color: current.color }">{{ current.symbol }}</div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ name(current) }}</h3>
        <p class="text-xs text-slate-400 mt-1">Z: {{ current.atomicNumber }} · {{ current.atomicMass }} u</p>
        <p class="text-xs text-slate-400">{{ t('element.group') }}: {{ current.group ?? '-' }} · {{ t('element.period') }}: {{ current.period }} · {{ current.electronConfiguration }}</p>
        <div v-if="answered" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p class="text-sm font-medium" :class="selectedFamily === correctFamily ? 'text-mint-600' : 'text-red-500'">
            {{ selectedFamily === correctFamily ? '✓ ' + t('learn.correct') : '✗ ' + t('games.correctAnswers') + ': ' + familyLabel(correctFamily) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button v-for="f in familyOptions" :key="f" @click="selectFamily(f)" :disabled="answered"
          :class="['px-4 py-3 rounded-xl border font-medium text-sm transition-all',
            answered && f === correctFamily ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
            answered && f === selectedFamily ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
            'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
            answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
          {{ familyLabel(f) }}
        </button>
      </div>

      <button v-if="answered" @click="next" class="mt-4 w-full py-3.5 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
        {{ total >= 12 ? t('learn.seeResult') : t('learn.nextQuestion') }}
      </button>
    </div>
  </div>
</template>
