export type QuestionType = 'multiple_choice' | 'essay'

export interface Quiz {
  id: string
  title: string
  topic: string
  question_count: number
  created_by: string
  created_at: string
  updated_at: string
  timer_seconds?: number | null
  randomize_questions?: boolean
  profiles?: Profile
}

export interface Question {
  id: string
  quiz_id: string
  order_index: number
  type: QuestionType
  question_text: string
  hint?: string
  explanation?: string
  correct_answer: string
  options?: string[]
  correct_option_index?: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  score: number
  total: number
  percentage: number
  time_taken_seconds?: number
  completed_at: string
  profiles?: Profile
}

export interface QuizFormData {
  title: string
  topic: string
  question_count: number
  timer_seconds?: number | null
  randomize_questions?: boolean
}

export interface QuestionFormData {
  type: QuestionType
  question_text: string
  hint: string
  explanation: string
  correct_answer: string
  options: [string, string, string, string]
  correct_option_index: number
}

export interface AnswerState {
  submitted: boolean
  selected?: number | string
  isCorrect?: boolean
  showHint: boolean
  showExplanation: boolean
}

export type Theme = 'dark' | 'light'
