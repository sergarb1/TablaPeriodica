<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'
import type { ElementData } from '@/types'

const { getAll, getByNumber } = useElement()
const { progress, addXp, addCorrect, addIncorrect, addGamePlayed } = useProgress()
const { t, locale } = useI18n()

const allElements = getAll()
type GameMode = 'quiz' | 'memory' | 'speed'
const activeMode = ref<GameMode>('quiz')

// ----- GUESS THE ELEMENT (Quiz) -----
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
    if (!shuffled.find(s => s.atomicNumber === others[r].atomicNumber)) shuffled.push(others[r])
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
  if (totalQuestions.value >= 10) { gameOver.value = true; addGamePlayed(); return }
  pickQuestion()
}

function startGame() {
  score.value = 0; streak.value = 0; bestStreak.value = 0; totalQuestions.value = 0; correctCount.value = 0
  gameStarted.value = true; gameOver.value = false
  pickQuestion()
}

const clue = computed(() => {
  const e = currentElement.value
  if (!e) return []
  return [
    `Z: ${e.atomicNumber}`,
    `Masa: ${e.atomicMass} u`,
    `${t('element.group')}: ${e.group ?? '-'} | ${t('element.period')}: ${e.period}`,
    e.electronConfiguration,
    e.electronegativity ? `${t('element.electronegativity')}: ${e.electronegativity}` : '',
    e.density ? `${t('element.density')}: ${e.density} g/cm³` : '',
  ].filter(Boolean)
})

// ----- MEMORY GAME -----
const memoryCards = ref<{ id: number; symbol: string; atomicNumber: number; flipped: boolean; matched: boolean }[]>([])
const memoryFlipped = ref<number[]>([])
const memoryMatched = ref(0)
const memoryMoves = ref(0)
const memoryStarted = ref(false)
const memoryWon = ref(false)

function startMemory() {
  const pool = allElements.filter(e => e.atomicNumber <= 20).slice(0, 8)
  const pairs = pool.flatMap(e => [
    { id: e.atomicNumber * 2, symbol: e.symbol, atomicNumber: e.atomicNumber, flipped: false, matched: false },
    { id: e.atomicNumber * 2 + 1, symbol: getDisplay(e), atomicNumber: e.atomicNumber, flipped: false, matched: false },
  ])
  for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]] }
  memoryCards.value = pairs
  memoryFlipped.value = []
  memoryMatched.value = 0
  memoryMoves.value = 0
  memoryStarted.value = true
  memoryWon.value = false
}

function flipCard(idx: number) {
  if (memoryFlipped.value.length >= 2) return
  if (memoryCards.value[idx].flipped || memoryCards.value[idx].matched) return
  memoryCards.value[idx].flipped = true
  memoryFlipped.value.push(idx)
  if (memoryFlipped.value.length === 2) {
    memoryMoves.value++
    const [a, b] = memoryFlipped.value
    if (memoryCards.value[a].atomicNumber === memoryCards.value[b].atomicNumber && a !== b) {
      memoryCards.value[a].matched = true
      memoryCards.value[b].matched = true
      memoryMatched.value++
      memoryFlipped.value = []
      addXp(5)
      if (memoryMatched.value === 8) { memoryWon.value = true; addGamePlayed() }
    } else {
      setTimeout(() => {
        memoryCards.value[a].flipped = false
        memoryCards.value[b].flipped = false
        memoryFlipped.value = []
      }, 800)
    }
  }
}

// ----- SPEED QUIZ -----
const speedTime = ref(60)
const speedRunning = ref(false)
const speedScore = ref(0)
const speedCorrect = ref(0)
const speedTotal = ref(0)
const speedCurrent = ref<ElementData | null>(null)
const speedOptions = ref<ElementData[]>([])
const speedAns = ref<number | null>(null)
const speedDone = ref(false)
let speedTimer: ReturnType<typeof setInterval> | null = null

function startSpeed() {
  speedTime.value = 60
  speedScore.value = 0
  speedCorrect.value = 0
  speedTotal.value = 0
  speedRunning.value = true
  speedDone.value = false
  speedAns.value = null
  nextSpeedQuestion()
  speedTimer = setInterval(() => {
    speedTime.value--
    if (speedTime.value <= 0) { endSpeed() }
  }, 1000)
}

function nextSpeedQuestion() {
  const pool = allElements.filter(e => e.atomicNumber <= 86)
  const idx = Math.floor(Math.random() * pool.length)
  const correct = pool[idx]
  const others = pool.filter(e => e.atomicNumber !== correct.atomicNumber)
  const shuf = [correct]
  while (shuf.length < 4) { const r = Math.floor(Math.random() * others.length); if (!shuf.find(s => s.atomicNumber === others[r].atomicNumber)) shuf.push(others[r]) }
  shuf.sort(() => Math.random() - 0.5)
  speedCurrent.value = correct
  speedOptions.value = shuf
  speedAns.value = null
  speedTotal.value++
}

function answerSpeed(n: number) {
  if (speedAns.value !== null || !speedRunning.value) return
  speedAns.value = n
  if (n === speedCurrent.value!.atomicNumber) {
    speedCorrect.value++
    speedScore.value += 5
    addCorrect()
  } else {
    addIncorrect()
  }
  setTimeout(() => { if (speedRunning.value) nextSpeedQuestion() }, 400)
}

function endSpeed() {
  if (speedTimer) { clearInterval(speedTimer); speedTimer = null }
  speedRunning.value = false
  speedDone.value = true
  addXp(speedScore.value)
  addGamePlayed()
}

watch(activeMode, () => {
  if (speedTimer) { clearInterval(speedTimer); speedTimer = null }
})

function name(el: ElementData) { return locale.value === 'es' ? el.nameEs : el.nameEn }
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="text-center mb-6" v-motion :initial="{ y: -10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('games.title') }}</h1>
      <p class="text-sm text-slate-500">{{ t('games.subtitle') }}</p>
    </div>

    <!-- Mode tabs -->
    <div class="flex justify-center gap-1 mb-8 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 max-w-sm mx-auto">
      <button @click="activeMode = 'quiz'" :class="['flex-1 py-2 text-xs font-medium rounded-lg transition-all', activeMode === 'quiz' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']">Adivinar</button>
      <button @click="activeMode = 'memory'" :class="['flex-1 py-2 text-xs font-medium rounded-lg transition-all', activeMode === 'memory' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']">Memoria</button>
      <button @click="activeMode = 'speed'" :class="['flex-1 py-2 text-xs font-medium rounded-lg transition-all', activeMode === 'speed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']">{{ t('games.speedQuiz') || 'Rápido' }}</button>
    </div>

    <!-- ===== QUIZ MODE ===== -->
    <div v-if="activeMode === 'quiz'">
      <div v-if="!gameStarted" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.guessElement') }}</h2>
        <p class="text-sm text-slate-400 mb-6">10 preguntas · XP por racha</p>
        <button @click="startGame" class="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Comenzar</button>
      </div>

      <div v-else-if="gameOver" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-mint-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('learn.seeResult') }}</h2>
        <div class="flex justify-center gap-6 mb-6">
          <div><p class="text-2xl font-bold text-mint-500">{{ correctCount }}/10</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
          <div><p class="text-2xl font-bold text-amber-500">{{ score }} XP</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
          <div><p class="text-2xl font-bold text-purple-500">{{ bestStreak }}</p><p class="text-xs text-slate-500">{{ t('games.streak') }}</p></div>
        </div>
        <button @click="startGame" class="px-8 py-3 rounded-xl bg-gradient-to-r from-mint-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else v-motion :initial="{ opacity: 0 }" :visible="{ opacity: 1 }" :duration="300">
        <div class="flex items-center justify-between mb-4">
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

        <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
          <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ t('games.hint') }}</p>
          <div class="space-y-1">
            <template v-for="(h, i) in clue" :key="i"><p class="text-sm text-slate-700 dark:text-slate-300 font-mono">{{ h }}</p></template>
          </div>
          <div v-if="answered && currentElement" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" :style="{ backgroundColor: currentElement.color + '30', color: currentElement.color }">{{ currentElement.symbol }}</div>
            <div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ getDisplay(currentElement) }}</p>
              <p class="text-xs text-slate-400">{{ currentElement.atomicNumber }} · {{ currentElement.familyEs }} / {{ currentElement.familyEn }}</p>
            </div>
          </div>
        </div>

        <div class="grid gap-2">
          <button v-for="opt in options" :key="opt.atomicNumber" @click="selectAnswer(opt.atomicNumber)" :disabled="answered"
            :class="['w-full text-left px-4 py-3 rounded-xl border font-medium transition-all',
              answered && opt.atomicNumber === currentElement!.atomicNumber ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
              answered && opt.atomicNumber === selectedAnswer ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
              answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
            <span class="font-mono">{{ getOptionLabel(opt) }}</span>
            <span v-if="answered && opt.atomicNumber === currentElement!.atomicNumber" class="float-right text-mint-500">✓</span>
            <span v-else-if="answered && opt.atomicNumber === selectedAnswer" class="float-right text-red-500">✗</span>
          </button>
        </div>

        <button v-if="answered" @click="nextQuestion" class="mt-4 w-full py-3 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
          {{ totalQuestions >= 10 ? t('learn.seeResult') : t('learn.nextQuestion') }}
        </button>
      </div>
    </div>

    <!-- ===== MEMORY MODE ===== -->
    <div v-if="activeMode === 'memory'">
      <div v-if="!memoryStarted" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.memoryGame') || 'Memory: symbol ↔ name' }}</h2>
        <p class="text-sm text-slate-400 mb-6">Empareja cada símbolo con su nombre · Primeros 8 elementos</p>
        <button @click="startMemory" class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold hover:shadow-lg transition-all">Comenzar</button>
      </div>

      <div v-else-if="memoryWon" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.youWon') || '¡Completado!' }}</h2>
        <p class="text-sm text-slate-400 mb-4">{{ memoryMoves }} movimientos</p>
        <button @click="startMemory" class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else class="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <div v-for="(card, i) in memoryCards" :key="card.id" @click="flipCard(i)"
          :class="['aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300',
            card.flipped || card.matched
              ? 'border-mint-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-transparent hover:border-slate-300 dark:hover:border-slate-600']">
          {{ (card.flipped || card.matched) ? card.symbol : '?' }}
        </div>
      </div>
      <div v-if="memoryStarted && !memoryWon" class="text-center mt-4">
        <p class="text-xs text-slate-400">{{ memoryMoves }} movimientos · {{ memoryMatched }}/8 pares</p>
      </div>
    </div>

    <!-- ===== SPEED MODE ===== -->
    <div v-if="activeMode === 'speed'">
      <div v-if="!speedRunning && !speedDone" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.speedQuiz') || 'Speed Quiz' }}</h2>
        <p class="text-sm text-slate-400 mb-6">60 segundos · ¡responde rápido!</p>
        <button @click="startSpeed" class="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all">Comenzar</button>
      </div>

      <div v-else-if="speedDone" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('games.timeUp') || '¡Tiempo!' }}</h2>
        <div class="flex justify-center gap-6 mb-6">
          <div><p class="text-2xl font-bold text-mint-500">{{ speedCorrect }}/{{ speedTotal }}</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
          <div><p class="text-2xl font-bold text-amber-500">{{ speedScore }}</p><p class="text-xs text-slate-500">Pts</p></div>
        </div>
        <button @click="startSpeed" class="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else v-motion :initial="{ opacity: 0 }" :visible="{ opacity: 1 }">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-lg font-bold font-mono" :class="{ 'text-red-500': speedTime <= 10 }">{{ speedTime }}s</span>
          </div>
          <span class="text-sm text-slate-500">{{ speedCorrect }}/{{ speedTotal }}</span>
        </div>

        <div v-if="speedCurrent" class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
          <p class="text-xs text-slate-400 mb-1">{{ t('games.hint') }}</p>
          <div class="space-y-1">
            <p class="text-sm font-mono text-slate-700 dark:text-slate-300">Z: {{ speedCurrent.atomicNumber }} · Masa: {{ speedCurrent.atomicMass }} u</p>
            <p class="text-sm font-mono text-slate-700 dark:text-slate-300">{{ speedCurrent.electronConfiguration }}</p>
          </div>
        </div>

        <div class="grid gap-2">
          <button v-for="opt in speedOptions" :key="opt.atomicNumber" @click="answerSpeed(opt.atomicNumber)" :disabled="speedAns !== null"
            :class="['w-full text-left px-4 py-3 rounded-xl border font-medium transition-all',
              speedAns !== null && opt.atomicNumber === speedCurrent!.atomicNumber ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
              speedAns !== null && opt.atomicNumber === speedAns ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600']">
            <span class="font-mono">{{ getOptionLabel(opt) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
