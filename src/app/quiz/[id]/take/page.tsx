'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizResults from '@/components/quiz/QuizResults'
import { Quiz, Question } from '@/types'
import { getQuiz, getQuestions } from '@/lib/utils/quiz'
import { BookOpen } from 'lucide-react'

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
const [currentIndex, setCurrentIndex] = useState(0)
const [correctCount, setCorrectCount] = useState(0)
const [finished, setFinished] = useState(false)
const [started, setStarted] = useState(false)

const resetQuiz = () => {
  setCurrentIndex(0)
  setCorrectCount(0)
  setFinished(false)
  setStarted(false)
}
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [q, qs] = await Promise.all([getQuiz(id), getQuestions(id)])
        setQuiz(q)
        setQuestions(qs)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

const handleNext = (wasCorrect: boolean) => {
  if (wasCorrect) setCorrectCount((c) => c + 1)
  if (currentIndex >= questions.length - 1) {
    setFinished(true)
  } else {
    setCurrentIndex((i) => i + 1)
  }
}
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-500 font-mono text-sm animate-pulse">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-red-400 font-mono text-sm">{error || 'Quiz not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        {!started ? (
          <div className="max-w-lg mx-auto text-center animate-fade-up">
            <div className="card p-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20
                              flex items-center justify-center mx-auto mb-6">
                <BookOpen size={28} className="text-indigo-400" />
              </div>
              <span className="tag">{quiz.topic}</span>
              <h1 className="text-2xl font-bold mt-4 mb-2">{quiz.title}</h1>
              <p className="text-slate-400 text-sm font-mono mb-8">
                {questions.length} question{questions.length !== 1 ? 's' : ''} · Instant feedback after each answer
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                  <div className="text-xl font-bold text-indigo-400">{questions.length}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Questions</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                  <div className="text-xl font-bold text-indigo-400">
                    {questions.filter((q) => q.type === 'multiple_choice').length}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">MCQ</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                  <div className="text-xl font-bold text-indigo-400">
                    {questions.filter((q) => q.type === 'essay').length}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Essay</div>
                </div>
              </div>
              <button onClick={() => setStarted(true)} className="btn-primary w-full text-base">
                Start Quiz →
              </button>
            </div>
          </div>
        ) : finished ? (
          <QuizResults correct={correctCount} total={questions.length} quizId={quiz.id} onRetry={resetQuiz} />
        ) : (
          <QuestionCard
            key={currentIndex}
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onNext={handleNext}
            isLast={currentIndex === questions.length - 1}
          />
        )}
      </main>
    </div>
  )
}
