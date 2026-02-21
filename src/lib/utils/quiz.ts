import { createClient } from '@/lib/supabase/client'
import { Quiz, Question, QuestionFormData } from '@/types'

const supabase = createClient()

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, profiles(email, full_name)')
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
  questions: QuestionFormData[]
): Promise<string> {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ title, topic, question_count: questions.length, created_by: userId })
    .select()
    .single()
  if (quizError) throw quizError

  const inserts = questions.map((q, index) => ({
    quiz_id: quiz.id,
    order_index: index,
    type: q.type,
    question_text: q.question_text,
    hint: q.hint || null,
    correct_answer: q.correct_answer,
    options: q.type === 'multiple_choice' ? q.options : null,
    correct_option_index: q.type === 'multiple_choice' ? q.correct_option_index : null,
  }))

  const { error: qError } = await supabase.from('questions').insert(inserts)
  if (qError) throw qError
  return quiz.id
}

export async function updateQuiz(
  quizId: string,
  title: string,
  topic: string,
  questions: QuestionFormData[]
): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update({ title, topic, question_count: questions.length })
    .eq('id', quizId)
  if (error) throw error

  await supabase.from('questions').delete().eq('quiz_id', quizId)

  const inserts = questions.map((q, index) => ({
    quiz_id: quizId,
    order_index: index,
    type: q.type,
    question_text: q.question_text,
    hint: q.hint || null,
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