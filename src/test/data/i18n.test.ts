import { describe, it, expect } from 'vitest'
import es from '@/i18n/locales/es.json'
import en from '@/i18n/locales/en.json'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flattenKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('i18n key parity', () => {
  const esKeys = new Set(flattenKeys(es as Record<string, unknown>))
  const enKeys = new Set(flattenKeys(en as Record<string, unknown>))

  it('ES has all EN keys', () => {
    const missing = [...enKeys].filter(k => !esKeys.has(k))
    expect(missing, `Missing in ES: ${missing.join(', ')}`).toEqual([])
  })

  it('EN has all ES keys', () => {
    const missing = [...esKeys].filter(k => !enKeys.has(k))
    expect(missing, `Missing in EN: ${missing.join(', ')}`).toEqual([])
  })

  it('has the same number of keys in both locales', () => {
    expect(esKeys.size).toBe(enKeys.size)
  })
})

describe('i18n key count', () => {
  it('has at least 100 translated keys per locale', () => {
    expect(flattenKeys(es as Record<string, unknown>).length).toBeGreaterThanOrEqual(100)
    expect(flattenKeys(en as Record<string, unknown>).length).toBeGreaterThanOrEqual(100)
  })
})
