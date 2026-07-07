import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import ClassifyFamilies from '@/components/games/ClassifyFamilies.vue'
import elementsData from '@/data/elements.json'
import familiesData from '@/data/families.json'
import type { ElementData, FamilyData } from '@/types'

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      games: { backToGames: 'Volver', start: 'Comenzar', correctAnswers: 'Correcto', score: 'Puntuación', families: 'Familias' },
      learn: { correct: 'Correcto', incorrect: 'Incorrecto', seeResult: 'Ver resultado', nextQuestion: 'Siguiente' },
      element: { group: 'Grupo', period: 'Período' },
    },
    en: {}
  }
})

function mountGame() {
  return mount(ClassifyFamilies, {
    global: { plugins: [i18n, createPinia()] }
  })
}

describe('ClassifyFamilies.vue', () => {
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
    expect(wrapper.text()).toContain('/12')
  })

  it('shows family options (4 buttons) after picking', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    const familyButtons = wrapper.findAll('.grid-cols-2 button')
    expect(familyButtons.length).toBe(4)
  })

  it('disables options after selecting one', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    const buttons = wrapper.findAll('.grid-cols-2 button')
    await buttons[0].trigger('click')
    await wrapper.vm.$nextTick()
    const disabled = wrapper.findAll('button[disabled]')
    expect(disabled.length).toBeGreaterThanOrEqual(4)
  })

  it('shows next question button after answering', async () => {
    const wrapper = mountGame()
    await startGame(wrapper)
    const buttons = wrapper.findAll('.grid-cols-2 button')
    await buttons[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Siguiente')
  })

  it('emits back when back button clicked', async () => {
    const wrapper = mountGame()
    const backBtn = wrapper.findAll('button').filter(b => b.text().includes('Volver'))
    if (backBtn.length) {
      await backBtn[0].trigger('click')
      expect(wrapper.emitted('back')).toBeTruthy()
    }
  })

  it('all families used in game are valid', () => {
    const elements = elementsData as ElementData[]
    const families = familiesData as FamilyData[]
    const familyIds = new Set(families.map(f => f.id))
    for (const el of elements) {
      if (el.family) expect(familyIds.has(el.family)).toBe(true)
    }
  })
})
