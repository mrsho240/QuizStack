'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Quiz } from '@/types'
import { getQuiz, getLeaderboard } from '@/lib/utils/quiz'
import { Trophy, Medal, ArrowLeft, Clock, Target } from 'lucide-react'
import clsx from 'clsx'

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [q, a] = await Promise.all([getQuiz(id), getLeaderboard(id)])
        setQuiz(q)
        setAttempts(a)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatTime = (s?: number) => {
    if (!s) return '—'
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  const getMedalColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400'
    if (rank === 1) return 'text-slate-300'
    if (rank === 2) return 'text-amber-600'
    return ''
  }

  const getMedalBg = (rank: number) => {
    if (rank === 0) return 'bg-yellow-400/10 border-yellow-400/30'
    if (rank === 1) return 'bg-slate-400/10 border-slate-400/30'
    if (rank === 2) return 'bg-amber-600/10 border-amber-600/30'
    return ''
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to quizzes
        </Link>

        <div className="text-center mb-10 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30
                          flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
          {quiz && <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{quiz.title}</p>}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-5 h-16 animate-pulse" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="card p-12 text-center animate-fade-up">
            <Target size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No attempts yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Be the first to complete this quiz!</p>
            <Link href={`/quiz/${id}/take`} className="btn-primary">Take Quiz</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt, rank) => (
              <div key={attempt.id}
                className={clsx('card p-5 flex items-center gap-4 animate-fade-up', rank < 3 && getMedalBg(rank))}
                style={{ animationDelay: `${rank * 50}ms` }}>
                <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center font-bold flex-shrink-0', rank < 3 && getMedalBg(rank))}>
                  {rank < 3
                    ? <Medal size={18} className={getMedalColor(rank)} />
                    : <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{rank + 1}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('font-semibold truncate', rank < 3 ? getMedalColor(rank) : '')}
                    style={rank >= 3 ? { color: 'var(--text-primary)' } : {}}>
                    {attempt.user_id?.slice(0, 8)}...
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {new Date(attempt.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={clsx('text-lg font-bold',
                    attempt.percentage >= 80 ? 'text-green-400' :
                    attempt.percentage >= 60 ? 'text-indigo-400' : 'text-red-400')}>
                    {attempt.percentage}%
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {attempt.score}/{attempt.total}
                  </div>
                </div>
                {attempt.time_taken_seconds && (
                  <div className="flex items-center gap-1 text-xs font-mono flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}>
                    <Clock size={11} />{formatTime(attempt.time_taken_seconds)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href={`/quiz/${id}/take`} className="btn-primary w-full flex items-center justify-center">
            Take Quiz
          </Link>
        </div>
      </main>
    </div>
  )
}