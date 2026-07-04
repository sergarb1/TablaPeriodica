<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12 text-center">
    <div class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
      <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
    </div>
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Laboratorio</h2>
    <p class="text-slate-500 dark:text-slate-400 mb-8">Simulaciones educativas interactivas</p>
    <p class="text-sm text-slate-400 dark:text-slate-500">Próximamente: enlaces químicos, estados de la materia y reacciones</p>
  </div>
</template>
