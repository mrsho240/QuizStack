'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionForm from '@/components/quiz/QuestionForm'
import { QuestionFormData } from '@/types'
import { createQuiz, parseCSV } from '@/lib/utils/quiz'
import { useAuth } from '@/lib/hooks/useAuth'
import { ChevronRight, BookOpen, Hash, Timer, Shuffle, Upload, FileText } from 'lucide-react'

const defaultQuestion = (): QuestionFormData => ({
  type: 'multiple_choice',
  question_text: '',
  hint: '',
  explanation: '',
  correct_answer: '',
  options: ['', '', '', ''],
  correct_option_index: 0,
})

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [randomize, setRandomize] = useState(false)

  const [questions, setQuestions] = useState<QuestionFormData[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [csvError, setCsvError] = useState('')

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setQuestions(Array.from({ length: questionCount }, () => defaultQuestion()))
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateQuestion = (index: number, data: QuestionFormData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? data : q)))
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length === 0) { setCsvError('No questions found in CSV'); return }
        setQuestions(parsed)
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        setCsvError('Invalid CSV format. Please use the template.')
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csv = [
      'type,question_text,hint,explanation,correct_answer,option_a,option_b,option_c,option_d,correct_option_index',
      'multiple_choice,"What is 2+2?","Think basic math","Addition of two numbers","4","3","4","5","6",1',
      'essay,"Explain photosynthesis","Think about plants","Process plants use to make food","The process by which plants convert sunlight into glucose",,,,,'
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'quizforge-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) return `Question ${i + 1}: question text is required`
      if (q.type === 'multiple_choice' && q.options.some(o => !o.trim()))
        return `Question ${i + 1}: all options are required`
      if (q.type === 'essay' && !q.correct_answer.trim())
        return `Question ${i + 1}: correct answer is required`
    }
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const validationError = validateQuestions()
    if (validationError) { setError(validationError); return }

    setSaving(true)
    setError('')
    try {
      const processed = questions.map((q) => ({
        ...q,
        correct_answer: q.type === 'multiple_choice' ? q.options[q.correct_option_index] : q.correct_answer,
      }))
      const timerSeconds = timerMinutes > 0 ? timerMinutes * 60 : null
      const quizId = await createQuiz(title, topic, user.id, processed, timerSeconds, randomize)
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

        {/* Step indicator */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-4">
            <span className={step >= 1 ? 'text-indigo-400' : ''}>Setup</span>
            <ChevronRight size={12} />
            <span className={step >= 2 ? 'text-indigo-400' : ''}>Questions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
            {step === 1 ? 'Create a New Quiz' : 'Add Questions'}
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            {step === 1 ? 'Set up your quiz topic and structure' : `Adding ${questions.length} questions to "${title}"`}
          </p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-5 animate-fade-up">
            <div className="card p-8 space-y-6">
              <div>
                <label className="label">Quiz Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry Midterm Review" className="input-field" required />
              </div>

              <div>
                <label className="label">Topic / Subject</label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Chemistry, Data Structures, History" className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="label">Number of Questions</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="number" value={questionCount}
                    onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, +e.target.value)))}
                    min={1} max={50} className="input-field pl-10" required />
                </div>
              </div>

              {/* Timer */}
              <div>
                <label className="label">
                  <Timer size={12} className="inline mr-1.5" />
                  Timer (minutes) — 0 = no timer
                </label>
                <input type="number" value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Math.max(0, +e.target.value))}
                  min={0} max={180} className="input-field" />
              </div>

              {/* Randomize */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Shuffle size={16} className="text-purple-400" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Randomize Questions</p>
                    <p className="text-xs text-[var(--text-muted)]">Shuffle question order each attempt</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRandomize(!randomize)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative ${randomize ? 'bg-indigo-600' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 ${randomize ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Continue to Questions <ChevronRight size={16} />
            </button>

            {/* CSV import section */}
            <div className="card p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Upload size={15} className="text-indigo-400" />
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Or Import from CSV</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Upload a CSV file to auto-generate questions. Download the template to see the correct format.
              </p>
              {csvError && <p className="text-xs text-red-400 font-mono">{csvError}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="btn-ghost flex items-center gap-2 text-sm flex-1"
                >
                  <FileText size={14} /> Download Template
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center gap-2 text-sm flex-1"
                >
                  <Upload size={14} /> Import CSV
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                />
              </div>
            </div>
          </form>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <form onSubmit={handleSave}>
            <div className="space-y-5 mb-8">
              {questions.map((q, i) => (
                <QuestionForm key={i} index={i} data={q} onChange={updateQuestion} />
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-scale-in">
                <p className="text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}

            <div className="flex gap-3 sticky bottom-6">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Quiz & Start Practicing'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
