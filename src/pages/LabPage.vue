<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const router = useRouter()

interface Molecule {
  id: string
  formula: string
  nameEs: string
  nameEn: string
  atoms: { symbol: string; color: string; x: number; y: number; z: number; label: string }[]
  bonds: [number, number][]
  elementIds: number[]
}

const molecules: Molecule[] = [
  {
    id: 'h2o', formula: 'H₂O', nameEs: 'Agua', nameEn: 'Water',
    atoms: [
      { symbol: 'O', color: '#EF4444', x: 0, y: 0, z: 0, label: 'O' },
      { symbol: 'H', color: '#60A5FA', x: -0.8, y: 0.6, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: 0.8, y: 0.6, z: 0, label: 'H' },
    ],
    bonds: [[0, 1], [0, 2]],
    elementIds: [8, 1]
  },
  {
    id: 'co2', formula: 'CO₂', nameEs: 'Dióxido de carbono', nameEn: 'Carbon dioxide',
    atoms: [
      { symbol: 'C', color: '#6B7280', x: 0, y: 0, z: 0, label: 'C' },
      { symbol: 'O', color: '#EF4444', x: 1.2, y: 0, z: 0, label: 'O' },
      { symbol: 'O', color: '#EF4444', x: -1.2, y: 0, z: 0, label: 'O' },
    ],
    bonds: [[0, 1], [0, 2]],
    elementIds: [6, 8]
  },
  {
    id: 'ch4', formula: 'CH₄', nameEs: 'Metano', nameEn: 'Methane',
    atoms: [
      { symbol: 'C', color: '#6B7280', x: 0, y: 0, z: 0, label: 'C' },
      { symbol: 'H', color: '#60A5FA', x: 0.8, y: 0.8, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: -0.8, y: -0.8, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: 0.8, y: -0.8, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: -0.8, y: 0.8, z: 0, label: 'H' },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
    elementIds: [6, 1]
  },
  {
    id: 'nh3', formula: 'NH₃', nameEs: 'Amoniaco', nameEn: 'Ammonia',
    atoms: [
      { symbol: 'N', color: '#8B5CF6', x: 0, y: 0, z: 0, label: 'N' },
      { symbol: 'H', color: '#60A5FA', x: 0.8, y: 0.6, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: -0.8, y: 0.6, z: 0, label: 'H' },
      { symbol: 'H', color: '#60A5FA', x: 0, y: -0.8, z: 0, label: 'H' },
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
    elementIds: [7, 1]
  },
  {
    id: 'o2', formula: 'O₂', nameEs: 'Oxígeno', nameEn: 'Oxygen',
    atoms: [
      { symbol: 'O', color: '#EF4444', x: -0.6, y: 0, z: 0, label: 'O' },
      { symbol: 'O', color: '#EF4444', x: 0.6, y: 0, z: 0, label: 'O' },
    ],
    bonds: [[0, 1]],
    elementIds: [8]
  },
  {
    id: 'nacl', formula: 'NaCl', nameEs: 'Cloruro de sodio', nameEn: 'Sodium chloride',
    atoms: [
      { symbol: 'Na', color: '#FCD34D', x: -0.7, y: 0, z: 0, label: 'Na' },
      { symbol: 'Cl', color: '#34D399', x: 0.7, y: 0, z: 0, label: 'Cl' },
    ],
    bonds: [[0, 1]],
    elementIds: [11, 17]
  },
]

const selectedMolecule = ref<Molecule>(molecules[0])
const rotating = ref(true)

function selectMol(id: string) {
  const found = molecules.find(m => m.id === id)
  if (found) selectedMolecule.value = found
}

function viewElement(z: number) {
  router.push(`/element/${z}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-6" v-motion :initial="{ y: -10, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="300">
      <router-link to="/" class="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">&larr; {{ t('app.back') }}</router-link>
      <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('app.lab') }}</h1>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Molecule selector -->
      <div v-motion :initial="{ x: -20, opacity: 0 }" :visible="{ x: 0, opacity: 1 }" :duration="400">
        <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Moléculas</h2>
        <div class="space-y-2">
          <button v-for="mol in molecules" :key="mol.id" @click="selectMol(mol.id)" :class="['w-full text-left px-4 py-3 rounded-xl border transition-all', selectedMolecule.id === mol.id ? 'border-mint-400 bg-mint-50 dark:bg-mint-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600']">
            <p class="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{{ mol.formula }}</p>
            <p class="text-xs text-slate-500">{{ locale === 'es' ? mol.nameEs : mol.nameEn }}</p>
          </button>
        </div>
      </div>

      <!-- 3D viewer -->
      <div class="md:col-span-2" v-motion :initial="{ y: 20, opacity: 0 }" :visible="{ y: 0, opacity: 1 }" :duration="400" :delay="100">
        <div class="aspect-square max-w-md mx-auto relative rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center" :class="{ 'animate-spin-slow': rotating }">
            <svg viewBox="-2 -2 4 4" class="w-48 h-48 sm:w-56 sm:h-56">
              <line v-for="(bond, i) in selectedMolecule.bonds" :key="'bond-' + i"
                :x1="selectedMolecule.atoms[bond[0]].x" :y1="selectedMolecule.atoms[bond[0]].y"
                :x2="selectedMolecule.atoms[bond[1]].x" :y2="selectedMolecule.atoms[bond[1]].y"
                stroke="#94A3B8" stroke-width="0.08" stroke-linecap="round" />
              <g v-for="(atom, i) in selectedMolecule.atoms" :key="'atom-' + i" class="cursor-pointer" @click="selectedMolecule.elementIds[i] && viewElement(selectedMolecule.elementIds[i])">
                <circle :cx="atom.x" :cy="atom.y" r="0.35" :fill="atom.color" opacity="0.85" />
                <circle :cx="atom.x" :cy="atom.y" r="0.35" fill="white" opacity="0.15" />
                <text :x="atom.x" :y="atom.y + 0.02" text-anchor="middle" dominant-baseline="central" fill="white" font-size="0.2" font-weight="bold" font-family="monospace">{{ atom.label }}</text>
              </g>
            </svg>
          </div>
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <button @click="rotating = !rotating" class="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              {{ rotating ? '⏸ Pause' : '▶ Play' }}
            </button>
            <span class="text-xs text-slate-400 bg-white/60 dark:bg-slate-800/60 px-2 py-1 rounded backdrop-blur-sm font-mono">{{ selectedMolecule.formula }}</span>
          </div>
        </div>

        <!-- Molecule info -->
        <div class="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{{ selectedMolecule.formula }} — {{ locale === 'es' ? selectedMolecule.nameEs : selectedMolecule.nameEn }}</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="z in selectedMolecule.elementIds" :key="z" @click="viewElement(z)" class="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-mint-400 transition-colors">
              {{ t('learn.viewElement') || 'View element' }} #{{ z }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}
</style>
