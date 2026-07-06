<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import elementsData from '@/data/elements.json'
import type { ElementData } from '@/types'

const { t, locale } = useI18n()
const elements = elementsData as ElementData[]

const families = [...new Set(elements.map(e => e.family).filter(Boolean))] as string[]
const selectedFamily = ref<string>('')

interface SM2Card {
  n: number
  interval: number
  ef: number
  nextReview: string
}

function loadSM2(): Record<number, SM2Card> {
  try { return JSON.parse(localStorage.getItem('flashcards_sm2') || '{}') } catch { return {} }
}
function saveSM2(data: Record<number, SM2Card>) {
  localStorage.setItem('flashcards_sm2', JSON.stringify(data))
}

const sm2Data = ref<Record<number, SM2Card>>(loadSM2())

const today = new Date().toISOString().split('T')[0]

const filteredElements = computed(() => {
  let pool = selectedFamily.value
    ? elements.filter(e => e.family === selectedFamily.value)
    : [...elements]

  // Sort by SM-2 priority: due first, then by interval ascending
  pool.sort((a, b) => {
    const aData = sm2Data.value[a.atomicNumber]
    const bData = sm2Data.value[b.atomicNumber]
    const aDue = aData && aData.nextReview <= today ? 0 : 1
    const bDue = bData && bData.nextReview <= today ? 0 : 1
    if (aDue !== bDue) return aDue - bDue
    const aInt = aData?.interval ?? 0
    const bInt = bData?.interval ?? 0
    if (aInt !== bInt) return aInt - bInt
    return a.atomicNumber - b.atomicNumber
  })

  return pool
})

const currentIndex = ref(0)
const flipped = ref(false)

const knownElements = ref<Set<number>>(new Set(JSON.parse(localStorage.getItem('flashcards_known') || '[]')))
const unknownElements = ref<Set<number>>(new Set(JSON.parse(localStorage.getItem('flashcards_unknown') || '[]')))

const currentCard = computed(() => filteredElements.value[currentIndex.value])
const dueCount = computed(() => filteredElements.value.filter(e => {
  const d = sm2Data.value[e.atomicNumber]
  return !d || d.nextReview <= today
}).length)

function getSM2(z: number): SM2Card {
  return sm2Data.value[z] || { n: 0, interval: 0, ef: 2.5, nextReview: today }
}

function updateSM2(z: number, quality: number) {
  const card = getSM2(z)
  if (quality >= 3) {
    // Good recall
    if (card.n === 0) card.interval = 1
    else if (card.n === 1) card.interval = 6
    else card.interval = Math.round(card.interval * card.ef)
    card.n++
  } else {
    // Poor recall - reset
    card.n = 0
    card.interval = 1
  }
  card.ef = Math.max(1.3, card.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  const next = new Date()
  next.setDate(next.getDate() + card.interval)
  card.nextReview = next.toISOString().split('T')[0]
  sm2Data.value[z] = card
  saveSM2(sm2Data.value)
}

function flip() { flipped.value = !flipped.value }

function markKnown() {
  if (!currentCard.value) return
  const z = currentCard.value.atomicNumber
  knownElements.value.add(z)
  unknownElements.value.delete(z)
  updateSM2(z, 4)
  saveStats()
  next()
}

function markUnknown() {
  if (!currentCard.value) return
  const z = currentCard.value.atomicNumber
  unknownElements.value.add(z)
  knownElements.value.delete(z)
  updateSM2(z, 1)
  saveStats()
  next()
}

function saveStats() {
  localStorage.setItem('flashcards_known', JSON.stringify([...knownElements.value]))
  localStorage.setItem('flashcards_unknown', JSON.stringify([...unknownElements.value]))
}

function next() {
  if (currentIndex.value < filteredElements.value.length - 1) {
    currentIndex.value++
    flipped.value = false
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    flipped.value = false
  }
}

function shuffle() {
  const arr = filteredElements.value
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  currentIndex.value = 0
  flipped.value = false
}

function resetProgress() {
  knownElements.value.clear()
  unknownElements.value.clear()
  sm2Data.value = {}
  saveSM2({})
  saveStats()
  currentIndex.value = 0
}

function name(el: ElementData) {
  return locale.value === 'es' ? el.nameEs : el.nameEn
}

const nextReviewLabel = computed(() => {
  if (!currentCard.value) return ''
  const d = getSM2(currentCard.value.atomicNumber)
  if (d.interval === 0) return 'Nou'
  return d.nextReview === today ? 'Hui' : new Date(d.nextReview) < new Date(today) ? `Fa ${Math.round((Date.now() - new Date(d.nextReview).getTime()) / 86400000)} dies` : d.nextReview
})
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4" v-motion :initial="{ y: -10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <router-link to="/learn" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">&larr; {{ t('app.back') }}</router-link>
      <h1 class="text-base font-bold text-slate-900 dark:text-white">{{ t('app.flashcards') }}</h1>
      <div class="w-10"></div>
    </div>

    <div v-if="!currentCard" class="text-center py-16 text-slate-400">
      <p class="text-sm">{{ t('app.loading') }}</p>
    </div>

    <template v-else>
      <div class="flex items-center gap-1.5 mb-3">
        <select v-model="selectedFamily" class="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-2">
          <option value="">{{ t('learn.allFamilies') || 'All families' }}</option>
          <option v-for="f in families" :key="f" :value="f">{{ f === 'nonmetal' ? (locale === 'es' ? 'No metal' : 'Nonmetal') : f.replace(/_/g, ' ') }}</option>
        </select>
        <button @click="shuffle" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center" title="Shuffle">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      <div class="text-center text-[0.55rem] text-slate-400 mb-2">
        <span>{{ currentIndex + 1 }} / {{ filteredElements.length }}</span>
        <span v-if="dueCount < filteredElements.length" class="ml-2">· {{ dueCount }} {{ t('flashcards.due') || 'pendents' }}</span>
      </div>

      <div class="aspect-[3/4] max-h-[280px] cursor-pointer perspective-1000 mb-3" @click="flip">
        <div class="relative w-full h-full transition-transform duration-[600ms] preserve-3d" :class="{ 'rotate-y-180': flipped }">
          <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden p-3">
            <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center mb-2">
              <span class="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{{ currentCard.symbol }}</span>
            </div>
            <p class="text-[0.6rem] text-slate-500 dark:text-slate-400 mb-0.5">{{ currentCard.atomicNumber }}</p>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ name(currentCard) }}</h2>
            <p class="text-[0.5rem] text-slate-400 mt-1.5">{{ t('learn.tapToFlip') || 'Tap to reveal' }}</p>
          </div>

          <div class="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden rotate-y-180 p-3">
            <div class="text-center space-y-1">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1" :style="{ backgroundColor: currentCard.color + '30' }">
                <span class="text-sm font-bold font-mono" :style="{ color: currentCard.color }">{{ currentCard.symbol }}</span>
              </div>
              <p class="text-[0.6rem] text-slate-500">{{ currentCard.atomicMass }} u</p>
              <p v-if="currentCard.electronegativity" class="text-[0.55rem] text-slate-400">{{ t('element.electronegativity') }}: {{ currentCard.electronegativity }}</p>
              <p v-if="currentCard.atomicRadius" class="text-[0.55rem] text-slate-400">{{ t('element.atomicRadius') }}: {{ currentCard.atomicRadius }} pm</p>
              <p class="text-[0.5rem] text-slate-500 italic">{{ currentCard.familyEs }} / {{ currentCard.familyEn }}</p>
              <p class="text-[0.5rem] text-slate-400">{{ currentCard.group ? `G. ${currentCard.group}` : '' }} · P. {{ currentCard.period }} · {{ currentCard.block }}-block</p>
              <p class="text-[0.45rem] text-slate-400 mt-1 border-t border-slate-200 dark:border-slate-700 pt-1">{{ t('flashcards.nextReview') || 'Pròxima revisió' }}: {{ nextReviewLabel }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mb-4">
        <button @click="prev" :disabled="currentIndex === 0" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button @click="markUnknown" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors flex items-center justify-center" title="Don't know">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button @click="markKnown" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors flex items-center justify-center" title="Know it">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </button>
        <button @click="next" :disabled="currentIndex >= filteredElements.length - 1" class="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div class="flex items-center justify-center gap-4 text-[0.6rem] text-slate-400">
        <span>✅ {{ knownElements.size }}</span>
        <span>❌ {{ unknownElements.size }}</span>
        <button @click="resetProgress" class="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Reset</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) {
  .preserve-3d { transform-style: flat; }
  .rotate-y-180 { transform: none; }
}
</style>
