export interface FamilyData {
  id: string
  nameEs: string
  nameEn: string
  color: string
  elements: number[]
}

export interface AchievementData {
  id: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  icon: string
  condition: 'elements' | 'quiz_streak' | 'games_won' | 'total_xp' | 'days_streak' | 'complete_table' | 'family_complete'
  conditionValue: number
  familyId?: string
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'symbol_to_name' | 'name_to_symbol' | 'group_guess'
  questionEs: string
  questionEn: string
  options?: string[]
  correctAnswer: string | boolean
  elementId?: number
  explanationEs?: string
  explanationEn?: string
  difficulty: 1 | 2 | 3
}

export interface Lesson {
  id: string
  titleEs: string
  titleEn: string
  descriptionEs: string
  descriptionEn: string
  level: number
  questions: string[]
  elements: number[]
}

export interface ProgressData {
  totalXp: number
  level: number
  streak: number
  lastStudyDate: string
  studiedElements: number[]
  completedQuizzes: string[]
  unlockedAchievements: string[]
  totalCorrect: number
  totalIncorrect: number
  gamesPlayed: number
  studyTimeMinutes: number
  dailyGoal: number
}
