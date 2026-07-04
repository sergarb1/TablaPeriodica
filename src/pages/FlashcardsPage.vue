<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import elementsData from '@/data/elements.json'
import type { ElementData } from '@/types'

const { t, locale } = useI18n()
const elements = elementsData as ElementData[]

const families = [...new Set(elements.map(e => e.family).filter(Boolean))] as string[]
const selectedFamily = ref<string>('')

const filteredElements = computed(() =>
  selectedFamily.value
    ? elements.filter(e => e.family === selectedFamily.value)
    : elements
)

const currentIndex = ref(0)
const flipped = ref(false)
const knownElements = ref<Set<number>>(new Set(JSON.parse(localStorage.getItem('flashcards_known') || '[]')))
const unknownElements = ref<Set<number>>(new Set(JSON.parse(localStorage.getItem('flashcards_unknown') || '[]')))

const currentCard = computed(() => filteredElements.value[currentIndex.value])

function flip() { flipped.value = !flipped.value }

function markKnown() {
  if (!currentCard.value) return
  knownElements.value.add(currentCard.value.atomicNumber)
  unknownElements.value.delete(currentCard.value.atomicNumber)
  save()
  next()
}

function markUnknown() {
  if (!currentCard.value) return
  unknownElements.value.add(currentCard.value.atomicNumber)
  knownElements.value.delete(currentCard.value.atomicNumber)
  save()
  next()
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
  save()
  currentIndex.value = 0
}

function save() {
  localStorage.setItem('flashcards_known', JSON.stringify([...knownElements.value]))
  localStorage.setItem('flashcards_unknown', JSON.stringify([...unknownElements.value]))
}

function name(el: ElementData) {
  return locale.value === 'es' ? el.nameEs : el.nameEn
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6" v-motion :initial="{ y: -10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <router-link to="/learn" class="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">&larr; {{ t('app.back') }}</router-link>
      <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('app.flashcards') }}</h1>
      <div class="w-12"></div>
    </div>

    <div v-if="!currentCard" class="text-center py-20 text-slate-400">
      <p class="text-lg">{{ t('app.loading') }}</p>
    </div>

    <template v-else>
      <div class="flex items-center gap-2 mb-4">
        <select v-model="selectedFamily" class="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1.5">
          <option value="">{{ t('learn.allFamilies') || 'All families' }}</option>
          <option v-for="f in families" :key="f" :value="f">{{ f === 'nonmetal' ? (locale === 'es' ? 'No metal' : 'Nonmetal') : f.replace(/_/g, ' ') }}</option>
        </select>
        <button @click="shuffle" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Shuffle">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      <div class="text-center text-xs text-slate-400 mb-3">{{ currentIndex + 1 }} / {{ filteredElements.length }}</div>

      <div class="aspect-[3/4] cursor-pointer perspective-1000 mb-4" @click="flip">
        <div class="relative w-full h-full transition-transform duration-[600ms] preserve-3d" :class="{ 'rotate-y-180': flipped }">
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden p-6">
            <div class="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-4">
              <span class="text-4xl font-bold font-mono text-slate-800 dark:text-slate-200">{{ currentCard.symbol }}</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">{{ currentCard.atomicNumber }}</p>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ name(currentCard) }}</h2>
            <p class="text-xs text-slate-400 mt-2">{{ t('learn.tapToFlip') || 'Tap to reveal' }}</p>
          </div>

          <div class="absolute inset-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden rotate-y-180 p-6">
            <div class="text-center space-y-2">
              <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2" :style="{ backgroundColor: currentCard.color + '30' }">
                <span class="text-xl font-bold font-mono" :style="{ color: currentCard.color }">{{ currentCard.symbol }}</span>
              </div>
              <p class="text-sm text-slate-500">{{ currentCard.atomicMass }} u</p>
              <p v-if="currentCard.electronegativity" class="text-xs text-slate-400">{{ t('element.electronegativity') }}: {{ currentCard.electronegativity }}</p>
              <p v-if="currentCard.atomicRadius" class="text-xs text-slate-400">{{ t('element.atomicRadius') }}: {{ currentCard.atomicRadius }} pm</p>
              <p class="text-xs text-slate-500 mt-2 italic">{{ currentCard.familyEs }} / {{ currentCard.familyEn }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ currentCard.group ? `G. ${currentCard.group}` : '' }} · P. {{ currentCard.period }} · {{ currentCard.block }}-block</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-4 mb-6">
        <button @click="prev" :disabled="currentIndex === 0" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button @click="markUnknown" class="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors" title="Don't know">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button @click="markKnown" class="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors" title="Know it">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </button>
        <button @click="next" :disabled="currentIndex >= filteredElements.length - 1" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div class="flex items-center justify-center gap-6 text-xs text-slate-400">
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
</style>
