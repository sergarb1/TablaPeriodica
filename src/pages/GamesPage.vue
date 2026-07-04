<script setup lang="ts">
import { ref, computed } from 'vue'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'
import type { ElementData } from '@/types'

const { getAll, getByNumber } = useElement()
const { progress, addXp, addCorrect, addIncorrect, addGamePlayed } = useProgress()
const { t, locale } = useI18n()

const allElements = getAll()
const currentElement = ref<ElementData | null>(null)
const options = ref<ElementData[]>([])
const selectedAnswer = ref<number | null>(null)
const answered = ref(false)
const score = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const gameStarted = ref(false)
const gameOver = ref(false)
const totalQuestions = ref(0)
const correctCount = ref(0)

function pickQuestion() {
  const pool = allElements.filter(e => e.nameEs && e.nameEn && e.atomicNumber <= 103)
  const idx = Math.floor(Math.random() * pool.length)
  const correct = pool[idx]

  const others = pool.filter(e => e.atomicNumber !== correct.atomicNumber)
  const shuffled = [correct]
  while (shuffled.length < 4) {
    const r = Math.floor(Math.random() * others.length)
    if (!shuffled.find(s => s.atomicNumber === others[r].atomicNumber)) {
      shuffled.push(others[r])
    }
  }

  shuffled.sort(() => Math.random() - 0.5)
  currentElement.value = correct
  options.value = shuffled
  selectedAnswer.value = null
  answered.value = false
  totalQuestions.value++
}

function getDisplay(e: ElementData): string {
  return locale.value === 'es' ? e.nameEs : e.nameEn
}

function getOptionLabel(e: ElementData) {
  return `${e.symbol} — ${getDisplay(e)}`
}

function selectAnswer(atomicNumber: number) {
  if (answered.value) return
  selectedAnswer.value = atomicNumber
  answered.value = true
  if (atomicNumber === currentElement.value!.atomicNumber) {
    addCorrect()
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    correctCount.value++
    const xpGain = 10 + streak.value * 2
    addXp(xpGain)
    score.value += xpGain
  } else {
    addIncorrect()
    streak.value = 0
  }
}

function nextQuestion() {
  if (totalQuestions.value >= 10) {
    gameOver.value = true
    addGamePlayed()
    return
  }
  pickQuestion()
}

function startGame() {
  score.value = 0
  streak.value = 0
  bestStreak.value = 0
  totalQuestions.value = 0
  correctCount.value = 0
  gameStarted.value = true
  gameOver.value = false
  pickQuestion()
}

const clue = computed(() => {
  const e = currentElement.value
  if (!e) return []
  const hints: string[] = [
    `${t('element.atomicNumber')}: ${e.atomicNumber}`,
    `${t('element.atomicMass')}: ${e.atomicMass} u`,
    `${t('element.group')}: ${e.group ?? '-'} | ${t('element.period')}: ${e.period}`,
    `${e.electronConfiguration}`,
  ]
  if (e.electronegativity) hints.push(`${t('element.electronegativity')}: ${e.electronegativity}`)
  if (e.density) hints.push(`${t('element.density')}: ${e.density} g/cm³`)
  return hints
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div v-if="!gameStarted" class="text-center py-16" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
      <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400 mb-6">{{ t('games.subtitle') }}</p>
      <button @click="startGame" class="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" v-motion :initial="{ scale: 0.9 }" :visible="{ scale: 1 }" :delay="200">
        {{ t('games.guessElement') }}
      </button>
      <div class="mt-8 text-sm text-slate-400">10 preguntas · XP por racha</div>
    </div>

    <div v-else-if="gameOver" class="text-center py-16" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
      <div class="w-20 h-20 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-mint-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{{ t('learn.seeResult') }}</h2>
      <div class="flex justify-center gap-8 my-6">
        <div><p class="text-3xl font-bold text-mint-500">{{ correctCount }}</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
        <div><p class="text-3xl font-bold text-amber-500">{{ score }}</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
        <div><p class="text-3xl font-bold text-purple-500">{{ bestStreak }}</p><p class="text-xs text-slate-500">{{ t('learn.score') }}</p></div>
      </div>
      <button @click="startGame" class="px-8 py-3 rounded-xl bg-gradient-to-r from-mint-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all">
        {{ t('games.start') }}
      </button>
    </div>

    <div v-else v-motion :initial="{ opacity: 0 }" :visible="{ opacity: 1 }" :duration="300">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-500">{{ totalQuestions }}/10</span>
          <div class="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-mint-500 rounded-full transition-all" :style="{ width: (totalQuestions / 10 * 100) + '%' }" />
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-amber-500 font-medium">{{ score }} XP</span>
          <span v-if="streak >= 2" class="text-orange-500 font-medium">🔥 {{ streak }}</span>
        </div>
      </div>

      <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
        <p class="text-xs text-slate-400 mb-3 uppercase tracking-wider">{{ t('games.hint') }}</p>
        <div class="space-y-1.5">
          <p v-for="(h, i) in clue" :key="i" class="text-sm text-slate-700 dark:text-slate-300 font-mono">{{ h }}</p>
        </div>
        <div v-if="answered && currentElement" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" :style="{ backgroundColor: currentElement.color + '30', color: currentElement.color }">{{ currentElement.symbol }}</div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ getDisplay(currentElement) }}</p>
            <p class="text-xs text-slate-400">{{ currentElement.atomicNumber }} · {{ currentElement.familyEs }} / {{ currentElement.familyEn }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <button v-for="opt in options" :key="opt.atomicNumber"
          @click="selectAnswer(opt.atomicNumber)"
          :disabled="answered"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl border font-medium transition-all',
            answered && opt.atomicNumber === currentElement!.atomicNumber
              ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300'
              : answered && opt.atomicNumber === selectedAnswer
                ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
            answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]'
          ]"
          v-motion :initial="{ x: -10, opacity: 0 }" :visible="{ x: 0, opacity: 1 }" :duration="200" :delay="80"
        >
          <span class="font-mono">{{ getOptionLabel(opt) }}</span>
          <span v-if="answered && opt.atomicNumber === currentElement!.atomicNumber" class="float-right text-mint-500">✓</span>
          <span v-else-if="answered && opt.atomicNumber === selectedAnswer" class="float-right text-red-500">✗</span>
        </button>
      </div>

      <button v-if="answered && totalQuestions < 10" @click="nextQuestion" class="mt-6 w-full py-3 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
        {{ t('learn.nextQuestion') }}
      </button>
      <button v-if="answered && totalQuestions >= 10" @click="nextQuestion" class="mt-6 w-full py-3 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
        {{ t('learn.seeResult') }}
      </button>
    </div>
  </div>
</template>
