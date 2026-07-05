import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type ThemeType = 'crystal' | 'fill' | 'light'

export interface TableConfig {
  tileSize: 'compact' | 'normal' | 'comfortable' | 'large'
  labelMode: 'symbol' | 'name' | 'both'
  colorTheme: 'crystal' | 'filled' | 'filledLight' | 'highContrast' | 'deuteranopia' | 'monochrome'
  fblockPosition: 'bottom' | 'hidden' | 'inline'
  animations: boolean
  showAtomicNumber: boolean
  hoverInfo: boolean
}

const defaults: TableConfig = {
  tileSize: 'normal',
  labelMode: 'symbol',
  colorTheme: 'crystal',
  fblockPosition: 'bottom',
  animations: true,
  showAtomicNumber: true,
  hoverInfo: true,
}

const config = useLocalStorage<TableConfig>('quimica-table-config', defaults)

// Migrate old localStorage keys
if (config.value.colorTheme === 'normal') config.value.colorTheme = 'crystal'

const TILE_SIZE_MAP: Record<TableConfig['tileSize'], number> = {
  compact: 36,
  normal: 48,
  comfortable: 60,
  large: 80,
}

const COLOR_THEMES: Record<TableConfig['colorTheme'], Record<string, string>> = {
  crystal: {},
  filled: {},
  filledLight: {},
  highContrast: {
    nonmetal: '#0000FF',
    noble_gas: '#800080',
    alkali_metal: '#FF0000',
    alkaline_earth: '#FFA500',
    transition_metal: '#00CED1',
    post_transition: '#C0C0C0',
    metalloid: '#008000',
    halogen: '#00FF00',
    lanthanide: '#A52A2A',
    actinide: '#8B0000',
  },
  deuteranopia: {
    nonmetal: '#0077BB',
    noble_gas: '#CC3311',
    alkali_metal: '#EE7733',
    alkaline_earth: '#009988',
    transition_metal: '#33BBEE',
    post_transition: '#EE3377',
    metalloid: '#BBBBBB',
    halogen: '#AA3377',
    lanthanide: '#882255',
    actinide: '#552211',
  },
  monochrome: {
    nonmetal: '#333333',
    noble_gas: '#555555',
    alkali_metal: '#777777',
    alkaline_earth: '#999999',
    transition_metal: '#BBBBBB',
    post_transition: '#DDDDDD',
    metalloid: '#AAAAAA',
    halogen: '#666666',
    lanthanide: '#888888',
    actinide: '#444444',
  },
}

export function useTableConfig() {
  const tilePx = () => TILE_SIZE_MAP[config.value.tileSize]

  const getColor = (family: string, baseColor: string): string => {
    const theme = COLOR_THEMES[config.value.colorTheme as keyof typeof COLOR_THEMES]
    if (!theme || config.value.colorTheme === 'crystal' || config.value.colorTheme === 'filled' || config.value.colorTheme === 'filledLight' || !theme[family]) return baseColor
    return theme[family]
  }

  const labelContent = (el: { symbol: string; nameEs: string; nameEn: string }, locale: string) => {
    const mode = config.value.labelMode
    if (mode === 'symbol') return el.symbol
    if (mode === 'name') return locale === 'es' ? el.nameEs : el.nameEn
    return el.symbol
  }

  const showNumber = () => config.value.showAtomicNumber

  const themeType = computed<ThemeType>(() => {
    if (config.value.colorTheme === 'filled') return 'fill'
    if (config.value.colorTheme === 'filledLight') return 'light'
    return 'crystal'
  })

  return {
    config,
    tilePx,
    getColor,
    labelContent,
    showNumber,
    themeType,
    defaults,
    TILE_SIZE_MAP,
  }
}
