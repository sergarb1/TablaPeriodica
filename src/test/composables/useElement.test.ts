import { describe, it, expect } from 'vitest'
import { useElement } from '@/composables/useElement'

const { getAll, getByNumber, getBySymbol, getFamily, getFamilyByElement, getNeighbors, search } = useElement()

describe('useElement()', () => {
  it('getAll returns 118 elements', () => {
    expect(getAll().length).toBe(118)
  })

  describe('getByNumber', () => {
    it('returns Hydrogen for number 1', () => {
      const h = getByNumber(1)
      expect(h).not.toBeNull()
      expect(h!.symbol).toBe('H')
      expect(h!.nameEn).toBe('Hydrogen')
      expect(h!.nameEs).toBe('Hidrógeno')
    })

    it('returns Oganesson for number 118', () => {
      const og = getByNumber(118)
      expect(og).not.toBeNull()
      expect(og!.symbol).toBe('Og')
    })

    it('returns null for out-of-range number', () => {
      expect(getByNumber(0)).toBeNull()
      expect(getByNumber(200)).toBeNull()
      expect(getByNumber(-1)).toBeNull()
    })
  })

  describe('getBySymbol', () => {
    it('returns Helium for He', () => {
      const he = getBySymbol('He')
      expect(he).not.toBeNull()
      expect(he!.atomicNumber).toBe(2)
    })

    it('is case-sensitive', () => {
      expect(getBySymbol('he')).toBeNull()
    })

    it('returns null for unknown symbol', () => {
      expect(getBySymbol('Xx')).toBeNull()
    })
  })

  describe('search', () => {
    it('finds by symbol (partial)', () => {
      const results = search('C')
      expect(results.some(e => e.symbol === 'C')).toBe(true)
      expect(results.some(e => e.symbol === 'Ca')).toBe(true)
      expect(results.some(e => e.symbol === 'Cl')).toBe(true)
    })

    it('finds by English name (case-insensitive)', () => {
      const results = search('oxygen')
      expect(results.some(e => e.symbol === 'O')).toBe(true)
    })

    it('finds by Spanish name (case-insensitive)', () => {
      const results = search('oro')
      expect(results.some(e => e.symbol === 'Au')).toBe(true)
    })

    it('finds by exact atomic number', () => {
      expect(search('79')).toHaveLength(1)
      expect(search('79')[0].symbol).toBe('Au')
    })

    it('returns empty for gibberish', () => {
      expect(search('zzzzzz')).toHaveLength(0)
    })
  })

  describe('getFamily', () => {
    it('returns metal family', () => {
      const f = getFamily('transition_metal')
      expect(f).not.toBeNull()
      expect(f!.elements.length).toBeGreaterThan(20)
    })

    it('returns null for unknown family', () => {
      expect(getFamily('nonexistent')).toBeNull()
    })
  })

  describe('getFamilyByElement', () => {
    it('returns correct family for Oxygen', () => {
      const o = getByNumber(8)
      const f = getFamilyByElement(o!)
      expect(f).not.toBeNull()
      expect(f!.id).toBe('nonmetal')
    })
  })

  describe('getNeighbors', () => {
    it('returns 4 neighbors for a middle element', () => {
      const si = getByNumber(14)
      const neighbors = getNeighbors(si!)
      expect(neighbors.length).toBe(4)
      const present = neighbors.filter(n => n !== null)
      expect(present.length).toBeGreaterThanOrEqual(3)
    })

    it('neighbors contain adjacent atomic numbers for Oxygen', () => {
      const o = getByNumber(8)!
      const neighbors = getNeighbors(o)
      const symbols = neighbors.filter(Boolean).map(n => n!.symbol)
      expect(symbols).toContain('N')
      expect(symbols).toContain('F')
    })
  })
})
