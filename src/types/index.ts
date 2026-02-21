export type QuestionType = 'multiple_choice' | 'essay'

export interface Quiz {
  id: string
  title: string
  topic: string
  question_count: number
  created_by: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Question {
  id: string
  quiz_id: string
  order_index: number
  type: QuestionType
  question_text: string
  hint?: string
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

export interface QuizFormData {
  title: string
  topic: string
  question_count: number
}

export interface QuestionFormData {
  type: QuestionType
  question_text: string
  hint: string
  correct_answer: string
  options: [string, string, string, string]
  correct_option_index: number
}

export interface AnswerState {
  submitted: boolean
  selected?: number | string
  isCorrect?: boolean
  showHint: boolean
}

export type Database = {
  public: {
    Tables: {
      quizzes: {
        Row: Quiz
        Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Quiz, 'id' | 'created_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id' | 'created_at'>
        Update: Partial<Omit<Question, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
    }
  }
}
