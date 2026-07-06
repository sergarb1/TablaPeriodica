import { describe, it, expect } from 'vitest'
import elementsData from '@/data/elements.json'
import familiesData from '@/data/families.json'
import type { ElementData, FamilyData } from '@/types'

const elements = elementsData as ElementData[]
const families = familiesData as FamilyData[]

describe('elements.json data integrity', () => {
  it('has 118 elements', () => {
    expect(elements.length).toBe(118)
  })

  it('covers atomic numbers 1-118 without gaps', () => {
    const numbers = elements.map(e => e.atomicNumber).sort((a, b) => a - b)
    expect(numbers[0]).toBe(1)
    expect(numbers[numbers.length - 1]).toBe(118)
    for (let i = 1; i <= 118; i++) {
      expect(numbers.includes(i)).toBe(true)
    }
  })

  it('all elements have required fields', () => {
    for (const el of elements) {
      expect(el.symbol).toBeTruthy()
      expect(el.nameEs).toBeTruthy()
      expect(el.nameEn).toBeTruthy()
      expect(el.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(['s', 'p', 'd', 'f']).toContain(el.block)
      expect(el.atomicNumber).toBeGreaterThanOrEqual(1)
      expect(el.atomicNumber).toBeLessThanOrEqual(118)
    }
  })

  it('most elements have different ES/EN names', () => {
    const same = elements.filter(e => e.nameEs === e.nameEn)
    expect(same.length).toBeLessThan(5)
  })

  it('all elements have valid family references', () => {
    const familyIds = new Set(families.map(f => f.id))
    for (const el of elements) {
      expect(familyIds.has(el.family)).toBe(true)
    }
  })

  it('each family contains its declared elements', () => {
    for (const family of families) {
      for (const n of family.elements) {
        const el = elements.find(e => e.atomicNumber === n)
        expect(el).toBeTruthy()
      }
    }
  })

  it('all elements have x,y positions (1-18, 1-10)', () => {
    for (const el of elements) {
      expect(el.x).toBeGreaterThanOrEqual(1)
      expect(el.x).toBeLessThanOrEqual(18)
      expect(el.y).toBeGreaterThanOrEqual(1)
      expect(el.y).toBeLessThanOrEqual(10)
    }
  })

  it('no two s/p/d-block elements share the same x,y position', () => {
    const main = elements.filter(e => e.block !== 'f')
    const positions = main.map(e => `${e.x},${e.y}`)
    const unique = new Set(positions)
    expect(unique.size).toBe(main.length)
  })

  it('has at least the most common properties', () => {
    for (const el of elements) {
      expect(typeof el.atomicMass).toBe('string')
      expect(typeof el.electronConfiguration).toBe('string')
      expect(Array.isArray(el.electronShells)).toBe(true)
      expect(Array.isArray(el.valence)).toBe(true)
      expect(typeof el.yearDiscovered).toBe('string')
    }
  })

  it('ElementData type supports electronAffinity and imageUrl', () => {
    const data: Partial<ElementData> = {
      electronAffinity: null,
      imageUrl: null,
    }
    expect('electronAffinity' in data).toBe(true)
    expect('imageUrl' in data).toBe(true)
  })

  it('electronAffinity is number or null when populated', () => {
    const withAffinity = elements.filter((el): el is typeof el & { electronAffinity: number | null } => 'electronAffinity' in el)
    for (const el of withAffinity) {
      expect(el.electronAffinity === null || typeof el.electronAffinity === 'number').toBe(true)
    }
  })
})

describe('families.json data integrity', () => {
  it('has all required families', () => {
    const ids = families.map(f => f.id)
    const required = ['nonmetal', 'noble_gas', 'alkali_metal', 'alkaline_earth', 'transition_metal', 'post_transition', 'metalloid', 'halogen', 'lanthanide', 'actinide']
    for (const id of required) {
      expect(ids.includes(id)).toBe(true)
    }
  })

  it('all families have names in both languages', () => {
    for (const f of families) {
      expect(f.nameEs).toBeTruthy()
      expect(f.nameEn).toBeTruthy()
      expect(f.nameEs !== f.nameEn).toBe(true)
    }
  })

  it('all families have a valid color', () => {
    for (const f of families) {
      expect(f.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('at most 2 elements belong to more than one family', () => {
    const allElems = families.flatMap(f => f.elements)
    const unique = new Set(allElems)
    expect(allElems.length - unique.size).toBeLessThanOrEqual(2)
  })

  it('the 2 multi-family elements are 85 (At) and 117 (Ts)', () => {
    const counts: Record<number, number> = {}
    families.flatMap(f => f.elements).forEach(n => { counts[n] = (counts[n] || 0) + 1 })
    const dupes = Object.entries(counts).filter(([, v]) => v > 1).map(([k]) => Number(k))
    expect(dupes.sort((a, b) => a - b)).toEqual([85, 117])
  })

  it('covers all 118 elements across families', () => {
    const allElems = new Set(families.flatMap(f => f.elements))
    expect(allElems.size).toBe(118)
  })
})
