'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizResults from '@/components/quiz/QuizResults'
import Timer from '@/components/quiz/Timer'
import { Quiz, Question } from '@/types'
import { getQuiz, getQuestions, saveAttempt } from '@/lib/utils/quiz'
import { useAuth } from '@/lib/hooks/useAuth'
import { BookOpen, Shuffle, Timer as TimerIcon } from 'lucide-react'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')
  const [timeTaken, setTimeTaken] = useState<number | undefined>()
  const startTimeRef = useRef<number>(0)

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

  const handleStart = () => {
    // Randomize if enabled
    if (quiz?.randomize_questions) {
      setQuestions((prev) => shuffleArray(prev))
    }
    startTimeRef.current = Date.now()
    setStarted(true)
  }

  const handleNext = (wasCorrect: boolean) => {
    const newCorrect = wasCorrect ? correctCount + 1 : correctCount
    if (wasCorrect) setCorrectCount(newCorrect)

    if (currentIndex >= questions.length - 1) {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
      setTimeTaken(elapsed)
      setFinished(true)
      // Save attempt if logged in
      if (user) {
        saveAttempt(id, user.id, newCorrect, questions.length, elapsed).catch(console.error)
      }
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleTimeUp = () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    setTimeTaken(elapsed)
    setFinished(true)
    if (user) {
      saveAttempt(id, user.id, correctCount, questions.length, elapsed).catch(console.error)
    }
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setFinished(false)
    setStarted(false)
    setTimeTaken(undefined)
    // Re-fetch to reset question order
    getQuestions(id).then(setQuestions)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-[var(--text-muted)] font-mono text-sm animate-pulse">Loading quiz...</div>
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
          /* Intro screen */
          <div className="max-w-lg mx-auto text-center animate-fade-up">
            <div className="card p-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20
                              flex items-center justify-center mx-auto mb-6">
                <BookOpen size={28} className="text-indigo-400" />
              </div>
              <span className="tag">{quiz.topic}</span>
              <h1 className="text-2xl font-bold mt-4 mb-2 text-[var(--text-primary)]">{quiz.title}</h1>
              <p className="text-[var(--text-muted)] text-sm font-mono mb-6">
                Instant feedback after each answer
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                  <div className="text-xl font-bold text-indigo-400">{questions.length}</div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">Questions</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                  <div className="text-xl font-bold text-indigo-400">
                    {questions.filter(q => q.type === 'multiple_choice').length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">MCQ</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                  <div className="text-xl font-bold text-indigo-400">
                    {questions.filter(q => q.type === 'essay').length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">Essay</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {quiz.timer_seconds && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                    <TimerIcon size={12} />
                    {Math.floor(quiz.timer_seconds / 60)}:{String(quiz.timer_seconds % 60).padStart(2,'0')} timer
                  </div>
                )}
                {quiz.randomize_questions && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
                    <Shuffle size={12} />
                    Randomized order
                  </div>
                )}
              </div>

              <button onClick={handleStart} className="btn-primary w-full text-base">
                Start Quiz →
              </button>
            </div>
          </div>
        ) : finished ? (
          <QuizResults
            correct={correctCount}
            total={questions.length}
            quizId={quiz.id}
            timeTaken={timeTaken}
            onRetry={resetQuiz}
          />
        ) : (
          <div>
            {/* Timer bar */}
            {quiz.timer_seconds && started && (
              <div className="flex justify-end mb-4">
                <Timer totalSeconds={quiz.timer_seconds} onTimeUp={handleTimeUp} />
              </div>
            )}
            <QuestionCard
              key={currentIndex}
              question={questions[currentIndex]}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onNext={handleNext}
              isLast={currentIndex === questions.length - 1}
            />
          </div>
        )}
      </main>
    </div>
  )
}
