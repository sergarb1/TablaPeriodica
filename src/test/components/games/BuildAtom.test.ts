import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import BuildAtom from '@/components/games/BuildAtom.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      games: { backToGames: 'Volver', start: 'Comenzar', hint: 'Pista', score: 'Puntuación', buildAtom: 'Construye un átomo' },
      learn: { correct: 'Correcto', incorrect: 'Incorrecto', seeResult: 'Ver resultado', nextQuestion: 'Siguiente' },
      element: { protons: 'Protón', neutrons: 'Neutrón', electrons: 'Electrón' },
    },
    en: {}
  }
})

function mountGame() {
  return mount(BuildAtom, {
    global: { plugins: [i18n, createPinia()] }
  })
}

describe('BuildAtom.vue', () => {
  it('starts in intro state', () => {
    const wrapper = mountGame()
    expect(wrapper.text()).toContain('Comenzar')
  })

  async function startGame(wrapper: ReturnType<typeof mountGame>) {
    const btn = wrapper.findAll('button').find(b => b.text().includes('Comenzar'))
    await btn?.trigger('click')
    await wrapper.vm.$nextTick()
  }

  it('shows game UI after starting', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    expect(wrapper.text()).toContain('/10')
  })

  it('shows proton, neutron, electron counts', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    expect(wrapper.text()).toContain('Protón')
    expect(wrapper.text()).toContain('Neutrón')
    expect(wrapper.text()).toContain('Electrón')
  })

  it('shows 4 answer options after picking', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    const answerButtons = wrapper.findAll('button').filter(b => b.text().includes('—'))
    expect(answerButtons.length).toBe(4)
  })

  it('disables options after selecting one', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    const answerButtons = wrapper.findAll('button').filter(b => b.text().includes('—'))
    if (answerButtons.length) {
      await answerButtons[0].trigger('click')
      await wrapper.vm.$nextTick()
      const disabled = wrapper.findAll('button[disabled]')
      expect(disabled.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('shows hint button', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    expect(wrapper.text()).toContain('Pista')
  })

  it('emits back when back button clicked', async () => {
    const wrapper = mountGame()
    const backBtn = wrapper.findAll('button').filter(b => b.text().includes('Volver'))
    if (backBtn.length) {
      await backBtn[0].trigger('click')
      expect(wrapper.emitted('back')).toBeTruthy()
    }
  })

  it('computes neutrons correctly for known element', () => {
    const wrapper = mountGame() as any
    const el = { atomicNumber: 6, atomicMass: '12.011' }
    wrapper.vm.current = el
    expect(wrapper.vm.protons).toBe(6)
    expect(wrapper.vm.neutrons).toBe(6)
    expect(wrapper.vm.electrons).toBe(6)
  })
})
