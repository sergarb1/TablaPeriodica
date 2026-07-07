<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useElement } from '@/composables/useElement'
import { useProgress } from '@/composables/useProgress'
import { useI18n } from 'vue-i18n'
import type { ElementData } from '@/types'
import ClassifyFamilies from '@/components/games/ClassifyFamilies.vue'
import BuildAtom from '@/components/games/BuildAtom.vue'
import ElectronConfig from '@/components/games/ElectronConfig.vue'

const { getAll, getByNumber } = useElement()
const { progress, addXp, addCorrect, addIncorrect, addGamePlayed } = useProgress()
const { t, locale } = useI18n()

const allElements = getAll()
type GameMode = 'quiz' | 'memory' | 'speed' | 'completa' | 'classify' | 'build-atom' | 'electron-config' | null
const activeMode = ref<GameMode>(null)

// Question types for quiz variety
const questionTypes = ['hints', 'symbol-to-name', 'name-to-symbol', 'true-false', 'fill-blank', 'group-guess', 'sort-elements', 'block-guess', 'state-guess'] as const
type QuestionType = typeof questionTypes[number]
const currentQType = ref<QuestionType>('hints')

// True/False state
const tfStatement = ref('')
const tfIsTrue = ref(true)

// Fill-blank state
const fbAnswer = ref('')
const fbBlankPrompt = ref('')
const fbUserInput = ref('')
const fbSubmitted = ref(false)

// Group-guess state
const ggTarget = ref<{ element: ElementData; property: 'group' | 'period' } | null>(null)
const ggOptions = ref<number[]>([])
const ggCorrect = ref<number>(0)

// Sort-elements state
const sortElements = ref<ElementData[]>([])
const sortProperty = ref<'atomicNumber' | 'atomicMass' | 'electronegativity' | 'density' | 'meltingPoint'>('atomicNumber')
const sortOrder = ref<'asc' | 'desc'>('asc')
const sortAnswered = ref(false)
const sortSelected = ref<number[]>([])
const sortMessage = ref('')

// Block-guess state
const bgElement = ref<ElementData | null>(null)
const bgOptions = ref<string[]>([])
const bgCorrect = ref('')

// State-guess state
const sgElement = ref<ElementData | null>(null)
const sgOptions = ref<string[]>([])
const sgCorrect = ref('')

const gamesList = [
  { id: 'quiz' as const, icon: '🤔', title: 'Adivina el elemento', desc: '25 preguntas con pistas y XP por racha', gradient: 'from-amber-500 to-orange-500', color: 'amber' },
  { id: 'memory' as const, icon: '🧠', title: 'Memoria', desc: 'Empareja símbolo ↔ nombre · 8 elementos', gradient: 'from-purple-500 to-violet-500', color: 'purple' },
  { id: 'speed' as const, icon: '⚡', title: 'Contrarreloj', desc: '60 segundos · responde lo más rápido posible', gradient: 'from-red-500 to-rose-500', color: 'red' },
  { id: 'completa' as const, icon: '🧩', title: 'Completa la tabla', desc: 'Arrastra cada elemento a su posición', gradient: 'from-blue-500 to-cyan-500', color: 'blue' },
  { id: 'classify' as const, icon: '🏷️', title: 'Clasifica por familias', desc: 'Assigna cada element a la seua família', gradient: 'from-teal-500 to-emerald-500', color: 'teal' },
  { id: 'build-atom' as const, icon: '⚛️', title: 'Construye un átomo', desc: 'Endevina l\'element: protons, neutrons, electrons', gradient: 'from-orange-500 to-amber-500', color: 'orange' },
  { id: 'electron-config' as const, icon: '🔬', title: 'Configuració electrònica', desc: 'Endevina l\'element per la seua configuració', gradient: 'from-violet-500 to-purple-500', color: 'violet' },
]

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

function pickQuestionType(): QuestionType {
  return questionTypes[Math.floor(Math.random() * questionTypes.length)]
}

function generateTF(element: ElementData) {
  const props = [
    { text: `${t('element.group')} ${element.group}`, check: () => element.group !== null },
    { text: `${t('element.period')} ${element.period}`, check: () => true },
    { text: `${t('element.block')} ${element.block.toUpperCase()}`, check: () => true },
    { text: `${t('element.state')}: ${locale.value === 'es' ? element.stateEs : element.stateEn}`, check: () => true },
    { text: `${t('element.electronegativity')} = ${element.electronegativity}`, check: () => element.electronegativity !== null },
    { text: `${t('element.density')} = ${element.density} g/cm³`, check: () => element.density !== null },
  ]
  const valid = props.filter(p => p.check())
  const pick = valid[Math.floor(Math.random() * valid.length)]
  const isTrue = Math.random() > 0.4
  const display = locale.value === 'es' ? element.nameEs : element.nameEn
  if (isTrue) {
    tfStatement.value = `${display}: ${pick.text}`
    tfIsTrue.value = true
  } else {
    const wrong = allElements.filter(e => e.atomicNumber !== element.atomicNumber)
    const r = wrong[Math.floor(Math.random() * wrong.length)]
    const wrongProp = props.filter(p => p.check())
    const wp = wrongProp.length > 1 ? wrongProp.filter(p => p.text !== pick.text)[0] : pick
    if (wp) {
      tfStatement.value = `${display}: ${wp.text}`
    } else {
      tfStatement.value = `${display}: ${pick.text}`
    }
    tfIsTrue.value = false
    // If we accidentally made it true, flip
    if (tfStatement.value === `${display}: ${pick.text}`) tfIsTrue.value = false
  }
}

function generateFillBlank(element: ElementData) {
  const display = locale.value === 'es' ? element.nameEs : element.nameEn
  const blanks = [
    { prompt: `${t('element.electronConfiguration')}:`, answer: element.electronConfiguration },
    { prompt: `${t('element.group')}:`, answer: String(element.group ?? '-') },
    { prompt: `${t('element.period')}:`, answer: String(element.period) },
    { prompt: `${t('element.block')}:`, answer: element.block.toUpperCase() },
    { prompt: `${t('element.state')}:`, answer: locale.value === 'es' ? element.stateEs : element.stateEn },
  ]
  const pick = blanks[Math.floor(Math.random() * blanks.length)]
  fbBlankPrompt.value = `${display} — ${pick.prompt}`
  fbAnswer.value = pick.answer.toLowerCase()
}

function generateGroupGuess(element: ElementData) {
  const property = Math.random() > 0.5 ? 'group' as const : 'period' as const
  ggTarget.value = { element, property }
  const correctVal = property === 'group' ? element.group ?? 0 : element.period
  ggCorrect.value = correctVal

  const pool = [correctVal]
  while (pool.length < 4) {
    const r = property === 'group' ? Math.floor(Math.random() * 18) + 1 : Math.floor(Math.random() * 7) + 1
    if (!pool.includes(r)) pool.push(r)
  }
  pool.sort(() => Math.random() - 0.5)
  ggOptions.value = pool
}

function generateSortElements() {
  const props = ['atomicNumber', 'atomicMass', 'electronegativity', 'density', 'meltingPoint'] as const
  sortProperty.value = props[Math.floor(Math.random() * props.length)]
  sortOrder.value = Math.random() > 0.5 ? 'asc' : 'desc'

  const pool = getAll().filter(e => {
    const v = e[sortProperty.value]
    return v !== null && v !== undefined && v !== '' && e.atomicNumber <= 86
  })
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4)
  sortElements.value = shuffled
  sortSelected.value = []
  sortAnswered.value = false
  sortMessage.value = ''
}

function generateBlockGuess(correct: ElementData) {
  bgElement.value = correct
  bgCorrect.value = correct.block.toUpperCase()
  bgOptions.value = ['S', 'P', 'D', 'F'].sort(() => Math.random() - 0.5)
}

function generateStateGuess(correct: ElementData) {
  sgElement.value = correct
  const stateKey = (locale.value === 'es' ? 'stateEs' : 'stateEn') as 'stateEs' | 'stateEn'
  sgCorrect.value = correct[stateKey]
  const allStates = locale.value === 'es'
    ? ['Sólido', 'Líquido', 'Gas', 'Desconocido']
    : ['Solid', 'Liquid', 'Gas', 'Unknown']
  sgOptions.value = [...allStates].sort(() => Math.random() - 0.5)
}

function selectSortElement(idx: number) {
  if (sortAnswered.value) return
  if (sortSelected.value.includes(idx)) {
    sortSelected.value = sortSelected.value.filter(i => i !== idx)
  } else {
    sortSelected.value = [...sortSelected.value, idx]
  }
}

function submitSort() {
  if (sortAnswered.value || sortSelected.value.length !== 4) return
  sortAnswered.value = true
  answered.value = true
  const sorted = [...sortElements.value].sort((a, b) => {
    const va = a[sortProperty.value] as number
    const vb = b[sortProperty.value] as number
    return sortOrder.value === 'asc' ? va - vb : vb - va
  })
  const correct = sortSelected.value.every((idx, i) => sortElements.value[idx].atomicNumber === sorted[i].atomicNumber)
  if (correct) {
    addCorrect()
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    correctCount.value++
    const xp = 20
    addXp(xp)
    score.value += xp
    sortMessage.value = '✓ ' + t('learn.correct')
  } else {
    addIncorrect()
    streak.value = 0
    sortMessage.value = '✗ ' + t('learn.incorrect') + '. Ordre correcte: ' + sorted.map(e => e.symbol).join(' → ')
  }
}

function pickQuestion() {
  const pool = allElements.filter(e => e.nameEs && e.nameEn && e.atomicNumber <= 103)
  const idx = Math.floor(Math.random() * pool.length)
  const correct = pool[idx]

  if (gameStarted.value && totalQuestions.value > 0 && Math.random() < 0.5) {
    currentQType.value = pickQuestionType()
  } else {
    currentQType.value = 'hints'
  }

  if (currentQType.value === 'true-false') {
    generateTF(correct)
  } else if (currentQType.value === 'fill-blank') {
    generateFillBlank(correct)
    fbUserInput.value = ''
    fbSubmitted.value = false
  } else if (currentQType.value === 'group-guess') {
    generateGroupGuess(correct)
  } else if (currentQType.value === 'sort-elements') {
    generateSortElements()
  } else if (currentQType.value === 'block-guess') {
    generateBlockGuess(correct)
  } else if (currentQType.value === 'state-guess') {
    generateStateGuess(correct)
  } else {
    const others = pool.filter(e => e.atomicNumber !== correct.atomicNumber)
    const shuffled = [correct]
    while (shuffled.length < 4) {
      const r = Math.floor(Math.random() * others.length)
      if (!shuffled.find(s => s.atomicNumber === others[r].atomicNumber)) shuffled.push(others[r])
    }
    shuffled.sort(() => Math.random() - 0.5)
    currentElement.value = correct
    options.value = shuffled
  }

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

function selectTF(answer: boolean) {
  if (answered.value) return
  answered.value = true
  const correct = answer === tfIsTrue.value
  if (correct) {
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

function selectGroupGuess(val: number) {
  if (answered.value) return
  answered.value = true
  selectedAnswer.value = val
  const correct = val === ggCorrect.value
  if (correct) {
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

function selectBlockGuess(val: string) {
  if (answered.value) return
  answered.value = true
  selectedAnswer.value = bgElement.value!.atomicNumber
  const correct = val === bgCorrect.value
  if (correct) {
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

function selectStateGuess(val: string) {
  if (answered.value) return
  answered.value = true
  selectedAnswer.value = sgElement.value!.atomicNumber
  const correct = val === sgCorrect.value
  if (correct) {
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

function submitFillBlank() {
  if (answered.value) return
  answered.value = true
  fbSubmitted.value = true
  const correct = fbUserInput.value.toLowerCase().trim() === fbAnswer.value
  if (correct) {
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
  if (totalQuestions.value >= 25) { gameOver.value = true; addGamePlayed(); return }
  // Reset sort state for next question
  sortMessage.value = ''
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
const memoryDifficulty = ref<'easy' | 'medium' | 'hard'>('easy')
const memoryCards = ref<{ id: number; symbol: string; atomicNumber: number; flipped: boolean; matched: boolean }[]>([])
const memoryFlipped = ref<number[]>([])
const memoryMatched = ref(0)
const memoryMoves = ref(0)
const memoryStarted = ref(false)
const memoryWon = ref(false)

const memoryConfig = computed(() => ({
  easy: { maxZ: 20, pairs: 8 },
  medium: { maxZ: 60, pairs: 10 },
  hard: { maxZ: 118, pairs: 12 },
}[memoryDifficulty.value]))

function startMemory() {
  const { maxZ, pairs } = memoryConfig.value
  const pool = allElements.filter(e => e.atomicNumber <= maxZ).sort(() => Math.random() - 0.5).slice(0, pairs)
  const cards = pool.flatMap(e => [
    { id: e.atomicNumber * 2, symbol: e.symbol, atomicNumber: e.atomicNumber, flipped: false, matched: false },
    { id: e.atomicNumber * 2 + 1, symbol: getDisplay(e), atomicNumber: e.atomicNumber, flipped: false, matched: false },
  ])
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]] }
  memoryCards.value = cards
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
      if (memoryMatched.value === memoryConfig.value.pairs) { memoryWon.value = true; addGamePlayed() }
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
const speedTypes = ['hints', 'symbol-to-name', 'name-to-symbol'] as const
type SpeedType = typeof speedTypes[number]
const speedTime = ref(60)
const speedRunning = ref(false)
const speedScore = ref(0)
const speedCorrect = ref(0)
const speedTotal = ref(0)
const speedCurrent = ref<ElementData | null>(null)
const speedOptions = ref<ElementData[]>([])
const speedAns = ref<number | null>(null)
const speedDone = ref(false)
const speedQType = ref<SpeedType>('hints')
const speedBgOpts = ref<string[]>([])
const speedBgCorrect = ref('')
const speedSgOpts = ref<string[]>([])
const speedSgCorrect = ref('')
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
  const roll = Math.random()
  if (roll < 0.5) speedQType.value = 'hints'
  else if (roll < 0.75) speedQType.value = 'symbol-to-name'
  else speedQType.value = 'name-to-symbol'

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

// ----- COMPLETA LA TABLA GAME -----
const completaDifficulty = ref<'easy' | 'medium' | 'hard'>('easy')
const completaTargets = ref<ElementData[]>([])
const completaGrid = ref<(ElementData | null)[][]>([])
const completaPool = ref<ElementData[]>([])
const completaPlaced = ref<number[]>([])
const completaScore = ref(0)
const completaMistakes = ref(0)
const completaStarted = ref(false)
const completaDone = ref(false)
const completaTime = ref(0)
let completaTimer: ReturnType<typeof setInterval> | null = null
const completaDragEl = ref<number | null>(null)

function generateCompletaTargets(): ElementData[] {
  if (completaDifficulty.value === 'easy') {
    return allElements.filter(e => e.atomicNumber <= 20)
  }
  const maxZ = completaDifficulty.value === 'medium' ? 86 : 118
  const pool = allElements.filter(e => e.y <= 7 && e.atomicNumber <= maxZ)
  const count = completaDifficulty.value === 'medium' ? 20 : 30
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

function startCompleta() {
  const els = generateCompletaTargets()
  completaTargets.value = els
  completaPlaced.value = []
  completaScore.value = 0
  completaMistakes.value = 0
  completaTime.value = 0
  completaDone.value = false
  completaStarted.value = true

  const grid: (ElementData | null)[][] = []
  for (let y = 1; y <= 7; y++) {
    const row: (ElementData | null)[] = new Array(18).fill(null)
    for (const e of els) {
      if (e.y === y && e.x >= 1 && e.x <= 18) {
        row[e.x - 1] = e
      }
    }
    grid.push(row)
  }
  completaGrid.value = grid

  const shuffled = [...els].sort(() => Math.random() - 0.5)
  completaPool.value = shuffled

  completaTimer = setInterval(() => { completaTime.value++ }, 1000)
}

function completaDrop(z: number, gridX: number, gridY: number) {
  const el = allElements.find(e => e.atomicNumber === z)
  if (!el) return false
  if (el.x === gridX && el.y === gridY) {
    if (!completaPlaced.value.includes(z)) {
      completaPlaced.value.push(z)
      completaPool.value = completaPool.value.filter(e => e.atomicNumber !== z)
      completaScore.value += 10
      addCorrect()
      const newGrid = [...completaGrid.value]
      const row = [...newGrid[gridY - 1]]
      row[gridX - 1] = el
      newGrid[gridY - 1] = row
      completaGrid.value = newGrid
      if (completaPlaced.value.length === completaTargets.value.length) {
        endCompleta()
      }
    }
    return true
  }
  return false
}

function completaDropFail() {
  completaMistakes.value++
  addIncorrect()
}

function endCompleta() {
  if (completaTimer) { clearInterval(completaTimer); completaTimer = null }
  completaDone.value = true
  const bonus = Math.max(0, 100 - completaTime.value)
  addXp(completaScore.value + bonus)
  addGamePlayed()
}

function isCompletaCellPopulated(y: number, x: number) {
  return completaPlaced.value.some(z => {
    const el = allElements.find(e => e.atomicNumber === z)
    return el && el.x === x && el.y === y
  })
}

function onDragStart(e: DragEvent, z: number) {
  completaDragEl.value = z
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(z))
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent, x: number, y: number) {
  e.preventDefault()
  const z = parseInt(e.dataTransfer?.getData('text/plain') || '')
  if (!z) return
  if (!completaDrop(z, x, y)) {
    completaDropFail()
  }
  completaDragEl.value = null
}

watch(activeMode, () => {
  if (speedTimer) { clearInterval(speedTimer); speedTimer = null }
  if (completaTimer) { clearInterval(completaTimer); completaTimer = null }
  if (activeMode.value === null || ['classify','build-atom','electron-config'].includes(activeMode.value)) {
    // Reset any sub-component state
  }
})

function name(el: ElementData) { return locale.value === 'es' ? el.nameEs : el.nameEn }

function cleanupCompleta() {
  if (completaTimer) { clearInterval(completaTimer); completaTimer = null }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Card grid when no game selected -->
    <div v-if="!activeMode" v-motion :initial="{ y: 10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('games.title') }}</h1>
        <p class="text-sm text-slate-500">{{ t('games.subtitle') }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button v-for="(g, i) in gamesList" :key="g.id" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="100 + i * 80" @click="activeMode = g.id" class="group relative overflow-hidden p-6 rounded-2xl text-left text-white transition-all hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] bg-gradient-to-br" :class="g.gradient">
          <div class="relative z-10">
            <div class="text-4xl mb-3">{{ g.icon }}</div>
            <h2 class="text-lg font-bold mb-1">{{ g.id === 'quiz' ? t('games.guessElement') : g.id === 'speed' ? (t('games.speedQuiz') || g.title) : g.title }}</h2>
            <p class="text-xs text-white/80">{{ g.desc }}</p>
          </div>
          <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        </button>
      </div>
    </div>

    <!-- ===== QUIZ MODE ===== -->
    <template v-else-if="activeMode === 'quiz'">
      <button @click="activeMode = null" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        {{ t('games.backToGames') }}
      </button>
      <div v-if="!gameStarted" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.guessElement') }}</h2>
        <p class="text-sm text-slate-400 mb-6">25 preguntas · XP por racha</p>
        <button @click="startGame" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Comenzar</button>
      </div>

      <div v-else-if="gameOver" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-mint-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('learn.seeResult') }}</h2>
        <div class="flex justify-center gap-6 mb-6">
          <div><p class="text-2xl font-bold text-mint-500">{{ correctCount }}/25</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
          <div><p class="text-2xl font-bold text-amber-500">{{ score }} XP</p><p class="text-xs text-slate-500">{{ t('games.score') }}</p></div>
          <div><p class="text-2xl font-bold text-purple-500">{{ bestStreak }}</p><p class="text-xs text-slate-500">{{ t('games.streak') }}</p></div>
        </div>
        <button @click="startGame" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-mint-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else v-motion :initial="{ opacity: 0 }" :visible="{ opacity: 1 }" :duration="300">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-slate-500">{{ totalQuestions }}/25</span>
            <div class="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-mint-500 rounded-full transition-all" :style="{ width: (totalQuestions / 25 * 100) + '%' }" />
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span v-if="currentQType !== 'hints' && currentQType !== 'true-false'" class="text-xs text-slate-400 font-mono">{{ currentQType }}</span>
            <span class="text-amber-500 font-medium">{{ score }} XP</span>
            <span v-if="streak >= 2" class="text-orange-500 font-medium">🔥 {{ streak }}</span>
          </div>
        </div>

        <!-- HINTS question type -->
        <template v-if="currentQType === 'hints' || currentQType === 'symbol-to-name' || currentQType === 'name-to-symbol'">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">
              {{ currentQType === 'symbol-to-name' ? 'Símbolo → Nombre' : currentQType === 'name-to-symbol' ? 'Nombre → Símbolo' : t('games.hint') }}
            </p>
            <template v-if="currentQType === 'symbol-to-name' && currentElement">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" :style="{ backgroundColor: currentElement.color + '30', color: currentElement.color }">{{ currentElement.symbol }}</div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('flashcards.flip') }}: {{ t('games.correctAnswers') }} nombre</p>
              </div>
            </template>
            <template v-else-if="currentQType === 'name-to-symbol' && currentElement">
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ locale === 'es' ? currentElement.nameEs : currentElement.nameEn }}</p>
              <p class="text-xs text-slate-400">Z = {{ currentElement.atomicNumber }}</p>
            </template>
            <template v-else>
              <div class="space-y-1">
                <template v-for="(h, i) in clue" :key="i"><p class="text-sm text-slate-700 dark:text-slate-300 font-mono">{{ h }}</p></template>
              </div>
            </template>
            <div v-if="answered && currentElement" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" :style="{ backgroundColor: currentElement.color + '30', color: currentElement.color }">{{ currentElement.symbol }}</div>
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ getDisplay(currentElement) }}</p>
                <p class="text-xs text-slate-400">{{ currentElement.atomicNumber }} · {{ locale === 'es' ? currentElement.familyEs : currentElement.familyEn }}</p>
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
              <span class="font-mono text-sm sm:text-base">{{ getOptionLabel(opt) }}</span>
              <span v-if="answered && opt.atomicNumber === currentElement!.atomicNumber" class="float-right text-mint-500">✓</span>
              <span v-else-if="answered && opt.atomicNumber === selectedAnswer" class="float-right text-red-500">✗</span>
            </button>
          </div>
        </template>

        <!-- TRUE/FALSE question type -->
        <template v-else-if="currentQType === 'true-false'">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-4 text-center">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ t('games.trueFalse') }}</p>
            <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ tfStatement }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button @click="selectTF(true)" :disabled="answered"
              :class="['py-4 rounded-xl font-bold text-lg transition-all',
                answered && tfIsTrue ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-600 border-2' :
                answered && !tfIsTrue ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 border-2' :
                'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              {{ t('games.true') }}
            </button>
            <button @click="selectTF(false)" :disabled="answered"
              :class="['py-4 rounded-xl font-bold text-lg transition-all',
                answered && !tfIsTrue ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-600 border-2' :
                answered && tfIsTrue ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 border-2' :
                'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              {{ t('games.false') }}
            </button>
          </div>
        </template>

        <!-- FILL-BLANK question type -->
        <template v-else-if="currentQType === 'fill-blank'">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ t('games.fillBlank') }}</p>
            <p class="text-base font-semibold text-slate-900 dark:text-white mb-3">{{ fbBlankPrompt }}</p>
            <input v-model="fbUserInput" :disabled="answered"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mint-500/50 font-mono text-sm"
              :placeholder="t('games.fillBlankHint')" @keyup.enter="submitFillBlank" />
            <div v-if="fbSubmitted" class="mt-2 text-sm font-medium" :class="fbUserInput.toLowerCase().trim() === fbAnswer ? 'text-mint-600' : 'text-red-500'">
              <template v-if="fbUserInput.toLowerCase().trim() === fbAnswer">✓ {{ t('learn.correct') }}</template>
              <template v-else>✗ {{ t('learn.incorrect') }}: {{ fbAnswer }}</template>
            </div>
          </div>
          <button v-if="!answered" @click="submitFillBlank" class="w-full py-3.5 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
            {{ t('common.ok') }}
          </button>
        </template>

        <!-- GROUP-GUESS question type -->
        <template v-else-if="currentQType === 'group-guess' && ggTarget">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ ggTarget.property === 'group' ? t('element.group') : t('element.period') }}</p>
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-xl" :style="{ backgroundColor: ggTarget.element.color + '30', color: ggTarget.element.color }">{{ ggTarget.element.symbol }}</div>
            <p class="text-lg font-bold text-slate-900 dark:text-white">{{ getDisplay(ggTarget.element) }}</p>
            <p class="text-xs text-slate-400 mt-1">Z = {{ ggTarget.element.atomicNumber }}</p>
            <p class="text-sm text-slate-500 mt-2">{{ ggTarget.property === 'group' ? '¿En qué grupo está?' : '¿En qué período está?' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="val in ggOptions" :key="val" @click="selectGroupGuess(val)" :disabled="answered"
              :class="['px-4 py-3 rounded-xl border font-medium text-sm transition-all',
                answered && val === ggCorrect ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
                answered && val === selectedAnswer ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              {{ val }}
            </button>
          </div>
        </template>

        <!-- SORT-ELEMENTS question type -->
        <template v-else-if="currentQType === 'sort-elements' && sortElements.length">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">{{ t('games.sort') || 'Ordena' }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Ordena de {{ sortOrder === 'asc' ? 'menor a mayor' : 'mayor a menor' }} por
              <span class="font-semibold text-slate-900 dark:text-white">
                {{ sortProperty === 'atomicNumber' ? 'Z' : sortProperty === 'atomicMass' ? 'masa' : sortProperty === 'electronegativity' ? 'EN' : sortProperty === 'density' ? 'densidad' : 'P. fusión' }}
              </span>
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <button v-for="(el, i) in sortElements" :key="el.atomicNumber" @click="selectSortElement(i)" :disabled="sortAnswered"
              :class="['px-4 py-3 rounded-xl border font-medium text-sm transition-all text-left',
                sortSelected.includes(i) ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300 ring-2 ring-mint-400/50' :
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                sortAnswered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              <span class="font-mono">{{ el.symbol }} — {{ getDisplay(el) }}</span>
              <span class="text-xs text-slate-400 ml-2">{{ el.atomicNumber }}</span>
              <span v-if="sortAnswered" class="float-right text-xs" :class="sortMessage.startsWith('✓') ? 'text-mint-500' : 'text-red-500'">
                {{ sortSelected.indexOf(i) + 1 }}
              </span>
            </button>
          </div>
          <div v-if="sortMessage" class="mt-2 text-sm font-medium text-center" :class="sortMessage.startsWith('✓') ? 'text-mint-600' : 'text-red-500'">
            {{ sortMessage }}
          </div>
          <button v-if="!sortAnswered && sortSelected.length === 4" @click="submitSort" class="mt-3 w-full py-3.5 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all">
            {{ t('games.sortSubmit') || 'Confirmar orden' }}
          </button>
        </template>

        <!-- BLOCK-GUESS question type -->
        <template v-else-if="currentQType === 'block-guess' && bgElement">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">Bloque</p>
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-xl" :style="{ backgroundColor: bgElement.color + '30', color: bgElement.color }">{{ bgElement.symbol }}</div>
            <p class="text-lg font-bold text-slate-900 dark:text-white">{{ getDisplay(bgElement) }}</p>
            <p class="text-xs text-slate-400 mt-1">Z = {{ bgElement.atomicNumber }}</p>
            <p class="text-sm text-slate-500 mt-2">¿De qué bloque es?</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="val in bgOptions" :key="val" @click="selectBlockGuess(val)" :disabled="answered"
              :class="['px-4 py-3 rounded-xl border font-bold text-sm transition-all',
                answered && val === bgCorrect ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
                answered && val !== bgCorrect ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              {{ val }}
            </button>
          </div>
        </template>
        <!-- STATE-GUESS question type -->
        <template v-else-if="currentQType === 'state-guess' && sgElement">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4 text-center">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider">Estado</p>
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-xl" :style="{ backgroundColor: sgElement.color + '30', color: sgElement.color }">{{ sgElement.symbol }}</div>
            <p class="text-lg font-bold text-slate-900 dark:text-white">{{ getDisplay(sgElement) }}</p>
            <p class="text-xs text-slate-400 mt-1">Z = {{ sgElement.atomicNumber }}</p>
            <p class="text-sm text-slate-500 mt-2">¿En qué estado está a temperatura ambiente?</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="val in sgOptions" :key="val" @click="selectStateGuess(val)" :disabled="answered"
              :class="['px-4 py-3 rounded-xl border font-medium text-sm transition-all',
                answered && val === sgCorrect ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30 text-mint-700 dark:text-mint-300' :
                answered && val !== sgCorrect ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                answered ? 'cursor-default' : 'cursor-pointer hover:shadow-sm active:scale-[0.99]']">
              {{ val }}
            </button>
          </div>
        </template>

        <button v-if="answered" @click="nextQuestion" class="mt-4 w-full py-3.5 rounded-xl bg-mint-500 text-white font-semibold hover:bg-mint-600 active:scale-[0.98] transition-all" aria-live="polite" role="alert">
          {{ totalQuestions >= 25 ? t('learn.seeResult') : t('learn.nextQuestion') }}
        </button>
        <!-- Accessibility: announce new question type -->
        <div aria-live="polite" class="sr-only">
          <template v-if="answered && currentQType === 'hints' && currentElement">{{ t('games.correctAnswers') }}: {{ getDisplay(currentElement) }}</template>
        </div>
      </div>
    </template>

    <!-- ===== MEMORY MODE ===== -->
    <template v-else-if="activeMode === 'memory'">
      <button @click="activeMode = null" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        {{ t('games.backToGames') }}
      </button>
      <div v-if="!memoryStarted" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.memoryGame') }}</h2>
        <div class="flex justify-center gap-2 mb-4">
          <button v-for="d in ([{k:'easy',l:'Fácil'},{k:'medium',l:'Media'},{k:'hard',l:'Difícil'}] as const)" :key="d.k" @click="memoryDifficulty = d.k"
            :class="['px-4 py-2 rounded-lg text-xs font-semibold transition-all border',
              memoryDifficulty === d.k ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300']">
            {{ d.l }}
          </button>
        </div>
        <p class="text-sm text-slate-400 mb-6">Empareja símbolo ↔ nombre · {{ memoryConfig.pairs }} pares · Z ≤ {{ memoryConfig.maxZ }}</p>
        <button @click="startMemory" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold hover:shadow-lg transition-all">Comenzar</button>
      </div>

      <div v-else-if="memoryWon" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.youWon') }}</h2>
        <p class="text-sm text-slate-400 mb-4">{{ memoryMoves }} movimientos · {{ memoryConfig.pairs }} pares</p>
        <button @click="startMemory" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
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
        <p class="text-xs text-slate-400">{{ memoryMoves }} movimientos · {{ memoryMatched }}/{{ memoryConfig.pairs }} pares</p>
      </div>
    </template>

    <!-- ===== SPEED MODE ===== -->
    <template v-else-if="activeMode === 'speed'">
      <button @click="activeMode = null" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        {{ t('games.backToGames') }}
      </button>
      <div v-if="!speedRunning && !speedDone" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.speedQuiz') }}</h2>
        <p class="text-sm text-slate-400 mb-6">60 segundos · ¡responde rápido!</p>
        <button @click="startSpeed" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all">Comenzar</button>
      </div>

      <div v-else-if="speedDone" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('games.timeUp') }}</h2>
        <div class="flex justify-center gap-6 mb-6">
          <div><p class="text-2xl font-bold text-mint-500">{{ speedCorrect }}/{{ speedTotal }}</p><p class="text-xs text-slate-500">{{ t('learn.correct') }}</p></div>
          <div><p class="text-2xl font-bold text-amber-500">{{ speedScore }}</p><p class="text-xs text-slate-500">Pts</p></div>
        </div>
        <button @click="startSpeed" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
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
          <template v-if="speedQType === 'hints'">
            <p class="text-xs text-slate-400 mb-1">{{ t('games.hint') }}</p>
            <div class="space-y-1">
              <p class="text-sm font-mono text-slate-700 dark:text-slate-300">Z: {{ speedCurrent.atomicNumber }} · Masa: {{ speedCurrent.atomicMass }} u</p>
              <p class="text-sm font-mono text-slate-700 dark:text-slate-300">{{ speedCurrent.electronConfiguration }}</p>
            </div>
          </template>
          <template v-else-if="speedQType === 'symbol-to-name'">
            <p class="text-xs text-slate-400 mb-1 uppercase tracking-wider">Símbolo → Nombre</p>
            <div class="flex items-center justify-center gap-4">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl" :style="{ backgroundColor: speedCurrent.color + '30', color: speedCurrent.color }">{{ speedCurrent.symbol }}</div>
              <p class="text-sm text-slate-500">¿Qué elemento es?</p>
            </div>
          </template>
          <template v-else-if="speedQType === 'name-to-symbol'">
            <p class="text-xs text-slate-400 mb-1 uppercase tracking-wider">Nombre → Símbolo</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white text-center">{{ locale === 'es' ? speedCurrent.nameEs : speedCurrent.nameEn }}</p>
            <p class="text-xs text-slate-400 text-center">Z = {{ speedCurrent.atomicNumber }}</p>
          </template>
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
    </template>

    <!-- ===== COMPLETA LA TABLA ===== -->
    <template v-else-if="activeMode === 'completa'">
      <button @click="activeMode = null; cleanupCompleta()" class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        {{ t('games.backToGames') }}
      </button>

      <div v-if="!completaStarted" class="text-center py-12" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }">
        <div class="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.completeTable') }}</h2>
        <div class="flex justify-center gap-2 mb-4">
          <button v-for="d in ([{k:'easy',l:'Fácil'},{k:'medium',l:'Media'},{k:'hard',l:'Difícil'}] as const)" :key="d.k" @click="completaDifficulty = d.k"
            :class="['px-4 py-2 rounded-lg text-xs font-semibold transition-all border',
              completaDifficulty === d.k ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300']">
            {{ d.l }}
          </button>
        </div>
        <p class="text-sm text-slate-400 mb-2">{{ t('games.completeTableDesc') }}</p>
        <p class="text-xs text-slate-400 mb-6">
          <template v-if="completaDifficulty === 'easy'">{{ t('games.completeTableEasy') }}</template>
          <template v-else-if="completaDifficulty === 'medium'">20 elementos aleatorios · Z ≤ 86</template>
          <template v-else>30 elementos aleatorios · Z ≤ 118</template>
        </p>
        <button @click="startCompleta" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else-if="completaDone" class="text-center py-12" v-motion :initial="{ scale: 0.9, opacity: 0 }" :visible="{ scale: 1, opacity: 1 }">
        <div class="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('games.youWon') }}</h2>
        <p class="text-sm text-slate-400 mb-4">{{ completaScore }} pts · {{ completaTime }}s · {{ completaMistakes }} {{ t('games.mistakes') }}</p>
        <button @click="startCompleta" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">{{ t('games.start') }}</button>
      </div>

      <div v-else v-motion :initial="{ opacity: 0 }" :visible="{ opacity: 1 }">
        <!-- Timer + stats -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-sm font-bold font-mono">{{ completaTime }}s</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-mint-500 font-medium">{{ completaPlaced.length }}/{{ completaTargets.length }}</span>
            <span v-if="completaMistakes > 0" class="text-red-400">{{ completaMistakes }} {{ t('games.mistakes') }}</span>
          </div>
        </div>

        <!-- Drop grid -->
        <div class="flex justify-center mb-4 overflow-auto">
          <div class="inline-flex flex-col gap-[1px]">
            <div v-for="(row, ri) in completaGrid" :key="'r'+ri" class="flex gap-[1px]">
              <div v-for="(cell, ci) in row" :key="'c'+ri+'-'+ci"
                @dragover="onDragOver"
                @drop="onDrop($event, ci + 1, ri + 1)"
                :class="[
                  'w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded flex items-center justify-center text-xs font-bold transition-all',
                  cell && completaPlaced.includes(cell.atomicNumber)
                    ? 'bg-mint-100 dark:bg-mint-900/50 text-mint-700 dark:text-mint-300 shadow-inner'
                    : cell && !completaPlaced.includes(cell.atomicNumber)
                    ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                    : 'bg-slate-50/50 dark:bg-slate-900/30'
                ]"
              >
                <template v-if="cell && completaPlaced.includes(cell.atomicNumber)">
                  <span>{{ cell.symbol }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Draggable pool -->
        <div class="max-w-lg mx-auto">
          <p class="text-xs text-slate-400 mb-2 text-center">{{ t('games.completeTableDrag') }}</p>
          <div class="flex flex-wrap justify-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 min-h-[60px]">
            <div
              v-for="el in completaPool"
              :key="el.atomicNumber"
              draggable="true"
              @dragstart="onDragStart($event, el.atomicNumber)"
              @dragend="completaDragEl = null"
              class="w-[42px] h-[42px] rounded-lg flex items-center justify-center text-sm font-bold cursor-grab active:cursor-grabbing transition-all hover:scale-110 hover:shadow-md active:scale-95 select-none"
              :style="{ backgroundColor: el.color + '30', color: el.color, border: '1px solid ' + el.color }"
            >
              {{ el.symbol }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== CLASIFICA POR FAMILIAS ===== -->
    <template v-else-if="activeMode === 'classify'">
      <ClassifyFamilies @back="activeMode = null" />
    </template>

    <!-- ===== CONSTRUYE UN ÁTOMO ===== -->
    <template v-else-if="activeMode === 'build-atom'">
      <BuildAtom @back="activeMode = null" />
    </template>

    <!-- ===== CONFIGURACIÓN ELECTRÓNICA ===== -->
    <template v-else-if="activeMode === 'electron-config'">
      <ElectronConfig @back="activeMode = null" />
    </template>
  </div>
</template>
