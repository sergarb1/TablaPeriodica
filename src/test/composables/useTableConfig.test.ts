import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})

async function importModule() {
  vi.resetModules()
  return import('@/composables/useTableConfig')
}

describe('useTableConfig', () => {
  it('returns default config', async () => {
    const { useTableConfig } = await importModule()
    const { config, defaults } = useTableConfig()
    expect(config.value.tileSize).toBe(defaults.tileSize)
    expect(config.value.colorTheme).toBe(defaults.colorTheme)
    expect(config.value.labelMode).toBe(defaults.labelMode)
    expect(config.value.animations).toBe(true)
  })

  it('migrates old "normal" theme to "crystal" from localStorage', async () => {
    localStorage.setItem('quimica-table-config', JSON.stringify({ colorTheme: 'normal' }))
    const { useTableConfig } = await importModule()
    const { config } = useTableConfig()
    expect(config.value.colorTheme).toBe('crystal')
  })

  it('preserves valid theme from localStorage', async () => {
    localStorage.setItem('quimica-table-config', JSON.stringify({ colorTheme: 'highContrast' }))
    const { useTableConfig } = await importModule()
    const { config } = useTableConfig()
    expect(config.value.colorTheme).toBe('highContrast')
  })

  describe('tilePx', () => {
    it('returns correct sizes', async () => {
      const { useTableConfig } = await importModule()
      const { config, tilePx } = useTableConfig()
      config.value.tileSize = 'compact'
      expect(tilePx()).toBe(36)
      config.value.tileSize = 'normal'
      expect(tilePx()).toBe(48)
      config.value.tileSize = 'comfortable'
      expect(tilePx()).toBe(60)
      config.value.tileSize = 'large'
      expect(tilePx()).toBe(80)
    })
  })

  describe('getColor', () => {
    async function setup(theme: string) {
      const { useTableConfig } = await importModule()
      const { config, getColor } = useTableConfig()
      config.value.colorTheme = theme as any
      return { config, getColor }
    }

    it('returns baseColor for crystal theme', async () => {
      const { getColor } = await setup('crystal')
      expect(getColor('nonmetal', '#FF0000')).toBe('#FF0000')
    })

    it('returns baseColor for filled theme', async () => {
      const { getColor } = await setup('filled')
      expect(getColor('alkali_metal', '#00FF00')).toBe('#00FF00')
    })

    it('returns baseColor for filledLight theme', async () => {
      const { getColor } = await setup('filledLight')
      expect(getColor('transition_metal', '#0000FF')).toBe('#0000FF')
    })

    it('returns mapped color for highContrast theme', async () => {
      const { getColor } = await setup('highContrast')
      expect(getColor('nonmetal', '#FF0000')).toBe('#0000FF')
    })

    it('returns mapped color for deuteranopia theme', async () => {
      const { getColor } = await setup('deuteranopia')
      expect(getColor('alkali_metal', '#FF0000')).toBe('#EE7733')
    })

    it('returns mapped color for monochrome theme', async () => {
      const { getColor } = await setup('monochrome')
      expect(getColor('lanthanide', '#FF0000')).toBe('#888888')
    })

    it('falls back to baseColor for unknown family in theme', async () => {
      const { getColor } = await setup('highContrast')
      expect(getColor('unknown_family', '#ABCDEF')).toBe('#ABCDEF')
    })

    it('returns baseColor for old "normal" value (no crash)', async () => {
      const { getColor } = await setup('normal')
      expect(getColor('nonmetal', '#123456')).toBe('#123456')
    })

    it('returns baseColor for nonexistent theme (no crash)', async () => {
      const { getColor } = await setup('nonexistent')
      expect(getColor('nonmetal', '#654321')).toBe('#654321')
    })
  })

  describe('labelContent', () => {
    async function setup(labelMode: string) {
      const { useTableConfig } = await importModule()
      const { config, labelContent } = useTableConfig()
      config.value.labelMode = labelMode as any
      return { labelContent }
    }

    const el = { symbol: 'H', nameEs: 'Hidrógeno', nameEn: 'Hydrogen' }

    it('returns symbol in symbol mode', async () => {
      const { labelContent } = await setup('symbol')
      expect(labelContent(el, 'es')).toBe('H')
      expect(labelContent(el, 'en')).toBe('H')
    })

    it('returns localized name in name mode', async () => {
      const { labelContent } = await setup('name')
      expect(labelContent(el, 'es')).toBe('Hidrógeno')
      expect(labelContent(el, 'en')).toBe('Hydrogen')
    })

    it('returns symbol in both mode', async () => {
      const { labelContent } = await setup('both')
      expect(labelContent(el, 'es')).toBe('H')
    })
  })

  describe('themeType', () => {
    async function setup(theme: string) {
      const { useTableConfig } = await importModule()
      const { config, themeType } = useTableConfig()
      config.value.colorTheme = theme as any
      return { config, themeType }
    }

    it('returns "crystal" for crystal theme', async () => {
      const { themeType } = await setup('crystal')
      expect(themeType.value).toBe('crystal')
    })

    it('returns "fill" for filled theme', async () => {
      const { themeType } = await setup('filled')
      expect(themeType.value).toBe('fill')
    })

    it('returns "light" for filledLight theme', async () => {
      const { themeType } = await setup('filledLight')
      expect(themeType.value).toBe('light')
    })

    it('returns "crystal" for non-fill themes', async () => {
      const { themeType } = await setup('highContrast')
      expect(themeType.value).toBe('crystal')
    })
  })
})
