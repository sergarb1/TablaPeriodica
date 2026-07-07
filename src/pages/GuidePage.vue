<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useElement } from '@/composables/useElement'

const { t, locale } = useI18n()
const router = useRouter()
const { getByNumber } = useElement()

const g = (k: string) => t('guide.' + k)
const bold = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

const faqs = [
  { q: 's6Q1', a: 's6A1', open: ref(false) },
  { q: 's6Q2', a: 's6A2', open: ref(false) },
  { q: 's6Q3', a: 's6A3', open: ref(false) },
  { q: 's6Q4', a: 's6A4', open: ref(false) },
  { q: 's6Q5', a: 's6A5', open: ref(false) },
]

function toggleFaq(idx: number) {
  faqs[idx].open.value = !faqs[idx].open.value
}

const everydayItems = [
  { key: 'Fe', icon: '⚔️', gkey: 's3Fe' },
  { key: 'Ca', icon: '🦴', gkey: 's3Ca' },
  { key: 'Na', icon: '🧂', gkey: 's3Na' },
  { key: 'C', icon: '✏️', gkey: 's3C' },
  { key: 'Au', icon: '👑', gkey: 's3Au' },
  { key: 'He', icon: '🎈', gkey: 's3He' },
  { key: 'Si', icon: '💻', gkey: 's3Si' },
  { key: 'O', icon: '🫁', gkey: 's3O' },
]

const trends = [
  { icon: '⚡', dir: '↗', gkey: 's4EN' },
  { icon: '📐', dir: '↘', gkey: 's4Radius' },
  { icon: '💥', dir: '↗', gkey: 's4IE' },
  { icon: '🔨', dir: '↙', gkey: 's4Metal' },
]

const mnemonics = [
  { icon: '🥊', gkey: 's5MnAlkali' },
  { icon: '🦴', gkey: 's5MnAlkaline' },
  { icon: '🧪', gkey: 's5MnHalogen' },
  { icon: '🎈', gkey: 's5MnNoble' },
]

const funfacts = [
  { gkey: 's7F1' }, { gkey: 's7F2' }, { gkey: 's7F3' },
  { gkey: 's7F4' }, { gkey: 's7F5' }, { gkey: 's7F6' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-10" v-motion :initial="{ y: -20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-4 text-3xl">
        🤪
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{{ g('title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{{ g('subtitle') }}</p>
    </div>

    <!-- Section 1: Atom -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s1Title') }}</h2>
      <div class="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-900/20 border border-cyan-200/50 dark:border-cyan-800/30 mb-3">
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line" v-html="bold(g('s1What'))"></p>
      </div>
      <p class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">{{ g('s1Parts') }}</p>
      <div class="grid gap-2 sm:grid-cols-3 mb-3">
        <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-800/30"><p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-bold">👍 {{ t('element.protons') || 'Protón' }}</span> — {{ g('s1Proton') }}</p></div>
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"><p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-bold">😐 {{ t('element.neutrons') }}</span> — {{ g('s1Neutron') }}</p></div>
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30"><p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-bold">⚡ {{ t('element.electrons') }}</span> — {{ g('s1Electron') }}</p></div>
      </div>
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"><p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" v-html="bold(g('s1Order'))"></p></div>
    </section>

    <!-- Section 2: How to read -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="100" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s2Title') }}</h2>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 border border-rose-200/50 dark:border-rose-800/30"><h3 class="font-semibold text-slate-900 dark:text-white mb-1 text-sm">📏 {{ t('element.periods') }}</h3><p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" v-html="bold(g('s2Periods'))"></p></div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30"><h3 class="font-semibold text-slate-900 dark:text-white mb-1 text-sm">📋 {{ t('element.groups') }}</h3><p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" v-html="bold(g('s2Groups'))"></p></div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"><h3 class="font-semibold text-slate-900 dark:text-white mb-1 text-sm">🧊 {{ t('element.blocks') }}</h3><p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" v-html="bold(g('s2Blocks'))"></p></div>
      </div>
    </section>

    <!-- Section 3: Everyday elements -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="200" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s3Title') }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ g('s3Lead') }}</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <div v-for="item in everydayItems" :key="item.key" class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"><p class="text-slate-700 dark:text-slate-300 leading-relaxed" v-html="bold(g(item.gkey))"></p></div>
      </div>
    </section>

    <!-- Section 4: Trends -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="300" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s4Title') }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ g('s4Lead') }}</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <div v-for="t in trends" :key="t.gkey" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <span class="text-xl shrink-0 mt-0.5">{{ t.icon }}</span>
          <span class="text-2xl font-bold text-slate-300 shrink-0">{{ t.dir }}</span>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" v-html="bold(g(t.gkey))"></p>
        </div>
      </div>
    </section>

    <!-- Section 5: Memory tricks -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="400" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s5Title') }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ g('s5Lead') }}</p>
      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/30 mb-3">
        <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line" v-html="bold(g('s5First20'))"></p>
      </div>
      <div class="grid gap-2 sm:grid-cols-2 mb-3">
        <div v-for="m in mnemonics" :key="m.gkey" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-bold">{{ m.icon }}</span> <span v-html="bold(g(m.gkey))"></span></p>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30">
        <h3 class="font-semibold text-slate-900 dark:text-white text-sm mb-1">{{ g('s5ConfigTitle') }}</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" v-html="bold(g('s5Config'))"></p>
      </div>
    </section>

    <!-- Section 6: FAQ -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="500" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s6Title') }}</h2>
      <div class="space-y-2">
        <div v-for="(faq, i) in faqs" :key="i" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button @click="toggleFaq(i)" class="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span class="text-sm font-medium text-slate-900 dark:text-white pr-4">{{ g(faq.q) }}</span>
            <svg class="w-4 h-4 text-slate-400 shrink-0 transition-transform" :class="{ 'rotate-180': faq.open.value }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="faq.open.value" class="px-4 pb-4 bg-white dark:bg-slate-900">
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" v-html="bold(g(faq.a))"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: Fun facts -->
    <section v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="600" class="mb-10">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{{ g('s7Title') }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ g('s7Intro') }}</p>
      <div class="grid gap-3">
        <div v-for="(f, i) in funfacts" :key="i" class="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200/40 dark:border-yellow-800/30">
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" v-html="bold(g(f.gkey))"></p>
        </div>
      </div>
    </section>

    <div class="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
      ✅ 100% gratuita · 🔒 Tus datos no salen de este dispositivo · 📖 AGPL v3 + CC BY-SA 4.0
    </div>
  </div>
</template>
