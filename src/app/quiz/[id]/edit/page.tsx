'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionForm from '@/components/quiz/QuestionForm'
import { Quiz, Question, QuestionFormData } from '@/types'
import { getQuiz, getQuestions, updateQuiz } from '@/lib/utils/quiz'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShieldAlert } from 'lucide-react'

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<QuestionFormData[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [q, qs] = await Promise.all([getQuiz(id), getQuestions(id)])
        setQuiz(q)
        setTitle(q?.title || '')
        setTopic(q?.topic || '')
        setQuestions(
          qs.map((q) => ({
            type: q.type,
            question_text: q.question_text,
            hint: q.hint || '',
            correct_answer: q.correct_answer,
            options: (q.options as [string, string, string, string]) || ['', '', '', ''],
            correct_option_index: q.correct_option_index ?? 0,
          }))
        )
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const isOwner = !authLoading && user && quiz && user.id === quiz.created_by

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setSaving(true)
    setError('')

    try {
      const processedQuestions = questions.map((q) => ({
        ...q,
        correct_answer:
          q.type === 'multiple_choice' ? q.options[q.correct_option_index] : q.correct_answer,
      }))
      await updateQuiz(id, title, topic, processedQuestions)
      router.push(`/quiz/${id}/take`)
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-500 font-mono text-sm animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <ShieldAlert size={40} className="text-red-400" />
          <p className="text-slate-300 font-semibold">You don&apos;t have permission to edit this quiz.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-extrabold">Edit Quiz</h1>
          <p className="text-slate-400 mt-1">Update your quiz content and questions</p>
        </div>

        <form onSubmit={handleSave}>
          {/* Quiz meta */}
          <div className="card p-6 mb-6 space-y-5 animate-fade-up">
            <div>
              <label className="label">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-5 mb-8">
            {questions.map((q, i) => (
              <QuestionForm
                key={i}
                index={i}
                data={q}
                onChange={(idx, data) =>
                  setQuestions((prev) => prev.map((q, i) => (i === idx ? data : q)))
                }
              />
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          )}

          <div className="flex gap-3 sticky bottom-6">
            <button type="button" onClick={() => router.back()} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
