'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionForm from '@/components/quiz/QuestionForm'
import { QuestionFormData } from '@/types'
import { createQuiz } from '@/lib/utils/quiz'
import { useAuth } from '@/lib/hooks/useAuth'
import { ChevronRight, BookOpen, Hash } from 'lucide-react'

const defaultQuestion = (): QuestionFormData => ({
  type: 'multiple_choice',
  question_text: '',
  hint: '',
  correct_answer: '',
  options: ['', '', '', ''],
  correct_option_index: 0,
})

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Step 1 state
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(5)

  // Step 2 state
  const [questions, setQuestions] = useState<QuestionFormData[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const qs = Array.from({ length: questionCount }, () => defaultQuestion())
    setQuestions(qs)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateQuestion = (index: number, data: QuestionFormData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? data : q)))
  }

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) return `Question ${i + 1}: question text is required`
      if (q.type === 'multiple_choice') {
        if (q.options.some((o) => !o.trim())) return `Question ${i + 1}: all options are required`
      } else {
        if (!q.correct_answer.trim()) return `Question ${i + 1}: correct answer is required`
      }
    }
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validationError = validateQuestions()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    try {
      // Set correct_answer for MCQ from selected option
      const processedQuestions = questions.map((q) => ({
        ...q,
        correct_answer:
          q.type === 'multiple_choice'
            ? q.options[q.correct_option_index]
            : q.correct_answer,
      }))

      const quizId = await createQuiz(title, topic, user.id, processedQuestions)
      router.push(`/quiz/${quizId}/take`)
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-4">
            <span className={step >= 1 ? 'text-indigo-400' : ''}>Setup</span>
            <ChevronRight size={12} />
            <span className={step >= 2 ? 'text-indigo-400' : ''}>Questions</span>
          </div>
          <h1 className="text-3xl font-extrabold">
            {step === 1 ? 'Create a New Quiz' : 'Add Questions'}
          </h1>
          <p className="text-slate-400 mt-1">
            {step === 1
              ? 'Set up your quiz topic and structure'
              : `Adding ${questionCount} questions to "${title}"`}
          </p>
        </div>

        {/* Step 1: Quiz setup */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="card p-8 space-y-6 animate-fade-up">
            <div>
              <label className="label">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Midterm Review"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Topic / Subject</label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Chemistry, Data Structures, History"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Number of Questions</label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, +e.target.value)))}
                  min={1}
                  max={50}
                  className="input-field pl-10"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-mono">Between 1 and 50 questions</p>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Continue to Questions
              <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <form onSubmit={handleSave}>
            <div className="space-y-5 mb-8">
              {questions.map((q, i) => (
                <QuestionForm
                  key={i}
                  index={i}
                  data={q}
                  onChange={updateQuestion}
                />
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-scale-in">
                <p className="text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}

            <div className="flex gap-3 sticky bottom-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-ghost"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving...' : 'Save Quiz & Start Practicing'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
