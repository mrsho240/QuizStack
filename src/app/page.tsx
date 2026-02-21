'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import QuizCard from '@/components/quiz/QuizCard'
import { Quiz } from '@/types'
import { getQuizzes, deleteQuiz } from '@/lib/utils/quiz'
import { useAuth } from '@/lib/hooks/useAuth'
import { Plus, Search, BookOpen } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuizzes()
  }, [])

  async function loadQuizzes() {
    try {
      const data = await getQuizzes()
      setQuizzes(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this quiz? This cannot be undone.')) return
    try {
      await deleteQuiz(id)
      setQuizzes((prev) => prev.filter((q) => q.id !== id))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20
                          bg-indigo-500/5 text-indigo-400 text-xs font-mono mb-6">
            <BookOpen size={12} />
            University Exam Practice
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Master your exams with{' '}
            <span className="text-gradient">QuizStack</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Create topic-specific quizzes, practice with instant feedback, and ace your next exam.
          </p>
          {!user && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/auth/signup" className="btn-primary">
                Get Started Free
              </Link>
              <Link href="/auth/login" className="btn-ghost">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Search + header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">All Quizzes</h2>
            <p className="text-sm text-slate-500 font-mono mt-0.5">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quizzes..."
                className="input-field pl-9"
              />
            </div>
            {user && (
              <Link href="/quiz/create" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
                <Plus size={16} />
                Create
              </Link>
            )}
          </div>
        </div>

        {/* Quiz grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 h-48 animate-pulse">
                <div className="h-4 bg-[#1e1e2e] rounded mb-3 w-3/4" />
                <div className="h-3 bg-[#1e1e2e] rounded mb-2 w-1/2" />
                <div className="h-3 bg-[#1e1e2e] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20
                            flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              {search ? 'No quizzes found' : 'No quizzes yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search ? 'Try a different search term' : 'Be the first to create a quiz!'}
            </p>
            {!search && user && (
              <Link href="/quiz/create" className="btn-primary inline-flex">
                Create First Quiz
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((quiz, i) => (
              <div key={quiz.id} style={{ animationDelay: `${i * 60}ms` }}>
                <QuizCard
                  quiz={quiz}
                  isOwner={user?.id === quiz.created_by}
                  onDelete={user?.id === quiz.created_by ? handleDelete : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
