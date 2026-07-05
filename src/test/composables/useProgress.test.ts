import { describe, it, expect, beforeEach } from 'vitest'
import { useProgress } from '@/composables/useProgress'

function resetProgress() {
  localStorage.removeItem('quimica-progress')
}
const defaults = { totalXp: 0, level: 1, streak: 0, lastStudyDate: '', studiedElements: [], completedQuizzes: [], unlockedAchievements: [], totalCorrect: 0, totalIncorrect: 0, gamesPlayed: 0, studyTimeMinutes: 0, dailyGoal: 10 }

describe('useProgress()', () => {
  beforeEach(() => {
    resetProgress()
    const { progress } = useProgress()
    Object.assign(progress.value, defaults)
  })

  it('starts with default values', () => {
    const { progress } = useProgress()
    expect(progress.value.totalXp).toBe(0)
    expect(progress.value.level).toBe(1)
    expect(progress.value.streak).toBe(0)
    expect(progress.value.studiedElements).toEqual([])
    expect(progress.value.totalCorrect).toBe(0)
    expect(progress.value.totalIncorrect).toBe(0)
    expect(progress.value.gamesPlayed).toBe(0)
  })

  it('addXp increases totalXp', () => {
    const { progress, addXp } = useProgress()
    addXp(50)
    expect(progress.value.totalXp).toBe(50)
    addXp(30)
    expect(progress.value.totalXp).toBe(80)
  })

  it('addCorrect and addIncrement increment counters', () => {
    const { progress, addCorrect, addIncorrect } = useProgress()
    addCorrect()
    addCorrect()
    addCorrect()
    addIncorrect()
    expect(progress.value.totalCorrect).toBe(3)
    expect(progress.value.totalIncorrect).toBe(1)
  })

  it('addGamePlayed increments games counter', () => {
    const { progress, addGamePlayed } = useProgress()
    addGamePlayed()
    addGamePlayed()
    expect(progress.value.gamesPlayed).toBe(2)
  })

  it('markElementStudied adds element to list', () => {
    const { progress, markElementStudied } = useProgress()
    markElementStudied(1)
    expect(progress.value.studiedElements).toContain(1)
  })

  it('markElementStudied does not duplicate', () => {
    const { progress, markElementStudied } = useProgress()
    markElementStudied(1)
    markElementStudied(1)
    expect(progress.value.studiedElements).toEqual([1])
  })

  it('addStudyTime accumulates minutes', () => {
    const { progress, addStudyTime } = useProgress()
    addStudyTime(5)
    addStudyTime(10)
    expect(progress.value.studyTimeMinutes).toBe(15)
  })

  it('unlockAchievement adds id and returns true', () => {
    const { progress, unlockAchievement } = useProgress()
    const result = unlockAchievement('first_element')
    expect(result).toBe(true)
    expect(progress.value.unlockedAchievements).toContain('first_element')
  })

  it('unlockAchievement returns false for duplicate', () => {
    const { progress, unlockAchievement } = useProgress()
    unlockAchievement('first_element')
    const result = unlockAchievement('first_element')
    expect(result).toBe(false)
    expect(progress.value.unlockedAchievements).toEqual(['first_element'])
  })

  it('xpForLevel returns level * 100', () => {
    const { xpForLevel } = useProgress()
    expect(xpForLevel(1)).toBe(100)
    expect(xpForLevel(5)).toBe(500)
    expect(xpForLevel(10)).toBe(1000)
  })

  it('persists to localStorage', () => {
    const { addXp, addCorrect, addGamePlayed, progress } = useProgress()
    addXp(100)
    addCorrect()
    addGamePlayed()

    const { progress: restored } = useProgress()
    expect(restored.value.totalXp).toBe(100)
    expect(restored.value.totalCorrect).toBe(1)
    expect(restored.value.gamesPlayed).toBe(1)
  })
})
