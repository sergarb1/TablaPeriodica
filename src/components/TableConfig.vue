<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTableConfig } from '@/composables/useTableConfig'

const { t } = useI18n()
const { config } = useTableConfig()

const emit = defineEmits<{
  close: []
}>()

const toggleOptions: { label: string; key: keyof typeof config.value }[] = [
  { label: 'animations', key: 'animations' },
  { label: 'showAtomicNumber', key: 'showAtomicNumber' },
  { label: 'hoverInfo', key: 'hoverInfo' },
]
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('table.config') }}</h2>
        <button @click="emit('close')" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="p-5 space-y-5">
        <!-- Tile size -->
        <div>
          <label class="block text-[0.65rem] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{{ t('table.tileSize') }}</label>
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="s in (['compact','normal','comfortable','large'] as const)" :key="s"
              @click="config.tileSize = s"
              :class="['px-2 py-2 rounded-lg text-[0.6rem] font-medium transition-colors border',
                config.tileSize === s
                  ? 'bg-mint-500 text-white border-mint-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600']">
              {{ t('table.tile' + s.charAt(0).toUpperCase() + s.slice(1)) }}
            </button>
          </div>
        </div>

        <!-- Label mode -->
        <div>
          <label class="block text-[0.65rem] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{{ t('table.labelMode') }}</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button v-for="l in (['symbol','name','both'] as const)" :key="l"
              @click="config.labelMode = l"
              :class="['px-2 py-2 rounded-lg text-[0.6rem] font-medium transition-colors border',
                config.labelMode === l
                  ? 'bg-mint-500 text-white border-mint-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600']">
              {{ t('table.label' + l.charAt(0).toUpperCase() + l.slice(1)) }}
            </button>
          </div>
        </div>

        <!-- Color theme -->
        <div>
          <label class="block text-[0.65rem] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{{ t('table.colorTheme') }}</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button v-for="c in (['crystal','filled','filledLight','highContrast','deuteranopia','monochrome'] as const)" :key="c"
              @click="config.colorTheme = c"
              :class="['px-1.5 py-2 rounded-lg text-[0.55rem] font-medium transition-colors border',
                config.colorTheme === c
                  ? 'bg-mint-500 text-white border-mint-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600']">
              <span class="flex flex-col items-center gap-1">
                <span class="flex items-center gap-0.5">
                  <span v-if="c === 'crystal'" class="w-3 h-3 rounded-sm bg-white/60 border border-slate-300" />
                  <span v-if="c === 'filled'" class="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span v-if="c === 'filledLight'" class="w-3 h-3 rounded-sm bg-emerald-200" />
                  <span v-if="c === 'highContrast'" class="w-3 h-3 rounded-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600" />
                  <span v-if="c === 'deuteranopia'" class="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 via-teal-400 to-pink-400" />
                  <span v-if="c === 'monochrome'" class="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700" />
                </span>
                {{ t('table.theme' + c.charAt(0).toUpperCase() + c.slice(1)) }}
              </span>
            </button>
          </div>
        </div>

        <!-- f-block position -->
        <div>
          <label class="block text-[0.65rem] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{{ t('table.fblockMode') }}</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button v-for="f in (['bottom','hidden','inline'] as const)" :key="f"
              @click="config.fblockPosition = f"
              :class="['px-2 py-2 rounded-lg text-[0.6rem] font-medium transition-colors border',
                config.fblockPosition === f
                  ? 'bg-mint-500 text-white border-mint-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600']">
              {{ t('table.fblock' + f.charAt(0).toUpperCase() + f.slice(1)) }}
            </button>
          </div>
        </div>

        <!-- Toggles -->
        <div class="space-y-3">
          <div v-for="opt in toggleOptions" :key="opt.label"
            class="flex items-center justify-between">
            <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('table.' + opt.label) }}</span>
            <button @click="(config[opt.key] as boolean) = !config[opt.key]"
              :class="['w-10 h-5 rounded-full transition-colors relative',
                config[opt.key] ? 'bg-mint-500' : 'bg-slate-200 dark:bg-slate-700']">
              <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                config[opt.key] ? 'translate-x-5' : 'translate-x-0.5']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
