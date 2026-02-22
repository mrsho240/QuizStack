'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserAttempts } from '@/lib/utils/quiz'
import { LayoutDashboard, TrendingUp, Target, BookOpen, ChevronRight, Trophy, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [migrationNeeded, setMigrationNeeded] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserAttempts(user.id)
      .then((data) => {
        setAttempts(data)
        setLoading(false)
      })
      .catch((e) => {
        if (e?.message?.includes('does not exist')) setMigrationNeeded(true)
        setLoading(false)
      })
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="font-mono text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your dashboard.</p>
          <Link href="/auth/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  const totalAttempts = attempts.length
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
    : 0
  const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0
  const passCount = attempts.filter(a => a.percentage >= 60).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard size={24} className="text-indigo-400" />
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>

        {/* Migration warning */}
        {migrationNeeded && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-8 animate-fade-up">
            <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">Database migration required</p>
              <p className="text-xs text-amber-300/80">
                Run <code className="bg-amber-500/20 px-1 rounded">migration.sql</code> in your Supabase SQL Editor to enable quiz history and leaderboards.
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Attempts', value: totalAttempts, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Best Score', value: `${bestScore}%`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
            { label: 'Passed', value: `${passCount}/${totalAttempts}`, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={label} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Score chart */}
        {attempts.length > 1 && (
          <div className="card p-6 mb-8 animate-fade-up">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={16} className="text-indigo-400" />
              Recent Scores
            </h2>
            <div className="flex items-end gap-1.5 h-24">
              {attempts.slice(0, 20).reverse().map((a, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group" title={`${a.percentage}%`}>
                  <div
                    className={clsx(
                      'w-full rounded-t transition-all group-hover:opacity-70',
                      a.percentage >= 80 ? 'bg-green-500' :
                      a.percentage >= 60 ? 'bg-indigo-500' : 'bg-red-500'
                    )}
                    style={{ height: `${Math.max(a.percentage, 4)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-mono mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>Oldest</span><span>Latest</span>
            </div>
          </div>
        )}

        {/* History */}
        <div className="animate-fade-up">
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quiz History</h2>

          {attempts.length === 0 ? (
            <div className="card p-12 text-center">
              <BookOpen size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No attempts yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Start taking quizzes to track your progress here.
              </p>
              <Link href="/" className="btn-primary">Browse Quizzes</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt, i) => {
                const quiz = attempt.quizzes
                const isPassing = attempt.percentage >= 60
                return (
                  <div
                    key={attempt.id}
                    className="card p-4 flex items-center gap-4 animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className={clsx(
                      'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                      isPassing ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    )}>
                      {attempt.percentage}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {quiz?.title || 'Unknown Quiz'}
                      </p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {quiz?.topic} · {attempt.score}/{attempt.total} correct ·{' '}
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/quiz/${attempt.quiz_id}/take`}
                      className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0"
                    >
                      Retry <ChevronRight size={13} />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}