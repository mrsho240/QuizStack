import { createClient } from '@/lib/supabase/client'
import { Quiz, Question, QuestionFormData, QuizAttempt } from '@/types'

const supabase = createClient()

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getQuestions(quizId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createQuiz(
  title: string,
  topic: string,
  userId: string,
  questions: QuestionFormData[],
  timerSeconds?: number | null,
  randomize?: boolean
): Promise<string> {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title,
      topic,
      question_count: questions.length,
      created_by: userId,
      timer_seconds: timerSeconds || null,
      randomize_questions: randomize || false,
    })
    .select()
    .single()
  if (quizError) throw quizError

  const inserts = questions.map((q, index) => ({
    quiz_id: quiz.id,
    order_index: index,
    type: q.type,
    question_text: q.question_text,
    hint: q.hint || null,
    explanation: q.explanation || null,
    correct_answer: q.correct_answer,
    options: q.type === 'multiple_choice' ? q.options : null,
    correct_option_index: q.type === 'multiple_choice' ? q.correct_option_index : null,
  }))

  const { error } = await supabase.from('questions').insert(inserts)
  if (error) throw error
  return quiz.id
}

export async function updateQuiz(
  quizId: string,
  title: string,
  topic: string,
  questions: QuestionFormData[],
  timerSeconds?: number | null,
  randomize?: boolean
): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update({
      title,
      topic,
      question_count: questions.length,
      timer_seconds: timerSeconds || null,
      randomize_questions: randomize || false,
    })
    .eq('id', quizId)
  if (error) throw error

  await supabase.from('questions').delete().eq('quiz_id', quizId)

  const inserts = questions.map((q, index) => ({
    quiz_id: quizId,
    order_index: index,
    type: q.type,
    question_text: q.question_text,
    hint: q.hint || null,
    explanation: q.explanation || null,
    correct_answer: q.correct_answer,
    options: q.type === 'multiple_choice' ? q.options : null,
    correct_option_index: q.type === 'multiple_choice' ? q.correct_option_index : null,
  }))

  const { error: qError } = await supabase.from('questions').insert(inserts)
  if (qError) throw qError
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
  if (error) throw error
}

// ── Attempts ──────────────────────────────────────────────
export async function saveAttempt(
  quizId: string,
  userId: string,
  score: number,
  total: number,
  timeTakenSeconds?: number
): Promise<void> {
  const percentage = Math.round((score / total) * 100)
  const { error } = await supabase.from('quiz_attempts').insert({
    quiz_id: quizId,
    user_id: userId,
    score,
    total,
    percentage,
    time_taken_seconds: timeTakenSeconds ?? null,
  })
  // Silently ignore if quiz_attempts table doesn't exist yet
  if (error) console.warn('saveAttempt failed (run migration.sql?):', error.message)
}

export async function getUserAttempts(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(title, topic)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  if (error) {
    console.warn('getUserAttempts failed (run migration.sql?):', error.message)
    return []
  }
  return data || []
}

export async function getLeaderboard(quizId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('percentage', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
    .limit(20)
  if (error) {
    console.warn('getLeaderboard failed (run migration.sql?):', error.message)
    return []
  }
  return data || []
}

// ── CSV Import ─────────────────────────────────────────────
export function parseCSV(csvText: string): QuestionFormData[] {
  const lines = csvText.trim().split('\n').filter(Boolean)
  const rows = lines.slice(1) // skip header

  return rows.map((line) => {
    const cols: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue }
      current += char
    }
    cols.push(current.trim())

    const type = cols[0]?.toLowerCase() === 'essay' ? 'essay' : 'multiple_choice'
    return {
      type: type as 'multiple_choice' | 'essay',
      question_text: cols[1] || '',
      hint: cols[2] || '',
      explanation: cols[3] || '',
      correct_answer: cols[4] || '',
      options: [cols[5] || '', cols[6] || '', cols[7] || '', cols[8] || ''] as [string,string,string,string],
      correct_option_index: parseInt(cols[9] || '0') || 0,
    }
  })
}
