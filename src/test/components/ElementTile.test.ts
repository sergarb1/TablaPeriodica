import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementTile from '@/components/ElementTile.vue'

const mockElement = {
  atomicNumber: 6,
  symbol: 'C',
  nameEs: 'Carbono',
  nameEn: 'Carbon',
  color: '#6B7280',
  block: 'p' as const,
  family: 'nonmetal',
  familyEs: 'No metal',
  familyEn: 'Nonmetal',
  state: 'solid',
  stateEs: 'Sólido',
  stateEn: 'Solid',
  group: 14,
  period: 2,
  x: 14,
  y: 2,
  atomicMass: '12.011',
  electronConfiguration: '[He] 2s2 2p2',
  electronShells: [2, 4],
  electronegativity: 2.55,
  atomicRadius: 70,
  ionizationEnergy: 11.26,
  valence: [4],
  oxidationStates: '-4, +2, +4',
  density: 2.267,
  meltingPoint: 3823,
  boilingPoint: 4300,
  yearDiscovered: 'prehistoric',
  discovererEs: 'Desconocido',
  discovererEn: 'Unknown',
  nameOriginEs: 'Del latín carbo, carbón',
  nameOriginEn: 'From Latin carbo, coal',
  curiosityEs: 'El carbono es la base de la vida en la Tierra.',
  curiosityEn: 'Carbon is the basis of life on Earth.',
  usesEs: 'Combustible, lubricantes, fibras de carbono',
  usesEn: 'Fuel, lubricants, carbon fibers',
  risksEs: 'El hollín y el polvo de carbón pueden ser cancerígenos.',
  risksEn: 'Soot and coal dust can be carcinogenic.',
}

describe('ElementTile.vue', () => {
  it('renders the symbol', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement }
    })
    expect(wrapper.text()).toContain('C')
  })

  it('renders the atomic number', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement }
    })
    expect(wrapper.text()).toContain('6')
  })

  it('applies default md size classes', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement }
    })
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('w-12')
    expect(btn.classes()).toContain('h-12')
  })

  it('applies sm size classes when size="sm"', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement, size: 'sm' }
    })
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('w-11')
    expect(btn.classes()).toContain('h-11')
  })

  it('applies lg size classes when size="lg"', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement, size: 'lg' }
    })
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('w-14')
    expect(btn.classes()).toContain('h-14')
  })

  it('emits click with atomic number on click', async () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual([6])
  })

  it('renders with trend styles when trendValue is provided', () => {
    const wrapper = mount(ElementTile, {
      props: { element: mockElement, trendValue: 50, trendMax: 100 }
    })
    const btn = wrapper.find('button')
    expect(btn.attributes('style')).toBeTruthy()
  })
})
