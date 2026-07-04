import { useLocalStorage } from '@vueuse/core'
import type { ProgressData } from '@/types'

const defaultProgress: ProgressData = {
  totalXp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: '',
  studiedElements: [],
  completedQuizzes: [],
  unlockedAchievements: [],
  totalCorrect: 0,
  totalIncorrect: 0,
  gamesPlayed: 0,
  studyTimeMinutes: 0,
  dailyGoal: 10
}

const progress = useLocalStorage<ProgressData>('quimica-progress', defaultProgress)

export function useProgress() {
  const today = () => new Date().toISOString().split('T')[0]

  const checkStreak = () => {
    const last = progress.value.lastStudyDate
    const todayStr = today()
    if (last === todayStr) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (last === yesterday) {
      progress.value.streak++
    } else {
      progress.value.streak = 1
    }
    progress.value.lastStudyDate = todayStr
  }

  const addXp = (amount: number) => {
    progress.value.totalXp += amount
    checkStreak()
  }

  const markElementStudied = (atomicNumber: number) => {
    if (!progress.value.studiedElements.includes(atomicNumber)) {
      progress.value.studiedElements.push(atomicNumber)
    }
    checkStreak()
  }

  const addCorrect = () => { progress.value.totalCorrect++ }
  const addIncorrect = () => { progress.value.totalIncorrect++ }
  const addGamePlayed = () => { progress.value.gamesPlayed++ }

  const addStudyTime = (minutes: number) => {
    progress.value.studyTimeMinutes += minutes
  }

  const unlockAchievement = (id: string) => {
    if (!progress.value.unlockedAchievements.includes(id)) {
      progress.value.unlockedAchievements.push(id)
      return true
    }
    return false
  }

  const xpForLevel = (level: number) => level * 100

  return {
    progress,
    addXp,
    markElementStudied,
    addCorrect,
    addIncorrect,
    addGamePlayed,
    addStudyTime,
    unlockAchievement,
    checkStreak,
    xpForLevel
  }
}
