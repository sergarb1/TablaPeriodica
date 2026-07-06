import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrbitalDiagram from '@/components/OrbitalDiagram.vue'

function mountOrbital(config: string) {
  return mount(OrbitalDiagram, {
    props: { configuration: config },
  })
}

describe('OrbitalDiagram.vue', () => {
  it('renders nothing for empty config', () => {
    const wrapper = mountOrbital('')
    expect(wrapper.findAll('.space-y-2 > div').length).toBe(0)
  })

  it('renders 1s label for Hydrogen config', () => {
    const wrapper = mountOrbital('1s¹')
    expect(wrapper.text()).toContain('1s')
  })

  it('parses core notation [Ar] as label 4s and 3d', () => {
    const wrapper = mountOrbital('[Ar] 4s² 3d⁶')
    expect(wrapper.text()).toContain('4s')
    expect(wrapper.text()).toContain('3d')
  })

  it('shows ↑↓ arrows in filled 1s² box', () => {
    const wrapper = mountOrbital('1s²')
    expect(wrapper.text()).toContain('↑')
    expect(wrapper.text()).toContain('↓')
  })

  it('shows □ for empty boxes', () => {
    const wrapper = mountOrbital('2p¹')
    expect(wrapper.text()).toContain('□')
  })

  it('parses superscript numbers correctly for 4f¹⁴ 5d¹⁰ 6s²', () => {
    const wrapper = mountOrbital('4f¹⁴ 5d¹⁰ 6s²')
    expect(wrapper.text()).toContain('4f')
    expect(wrapper.text()).toContain('5d')
    expect(wrapper.text()).toContain('6s')
  })

  it('handles supToNum for various superscripts', () => {
    const wrapper = mountOrbital('1s¹') as any
    expect(wrapper.vm.supToNum('¹')).toBe(1)
    expect(wrapper.vm.supToNum('¹⁰')).toBe(10)
    expect(wrapper.vm.supToNum('abc')).toBe(0)
  })
})
