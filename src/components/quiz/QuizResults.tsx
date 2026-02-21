'use client'

import Link from 'next/link'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import clsx from 'clsx'

interface QuizResultsProps {
  correct: number
  total: number
  quizId: string
  onRetry: () => void
}

export default function QuizResults({ correct, total, quizId, onRetry }: QuizResultsProps) {
  const percentage = Math.round((correct / total) * 100)
  const isPassing = percentage >= 60

  const getMessage = () => {
    if (percentage === 100) return 'Perfect Score! 🎉'
    if (percentage >= 80) return 'Excellent Work!'
    if (percentage >= 60) return 'Good Job!'
    if (percentage >= 40) return 'Keep Practicing'
    return 'Keep Studying!'
  }

  return (
    <div className="max-w-md mx-auto animate-scale-in">
      <div className="card p-10 text-center">
        <div className={clsx(
          'w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center',
          isPassing
            ? 'bg-green-500/10 border-2 border-green-500/30'
            : 'bg-red-500/10 border-2 border-red-500/30'
        )}>
          <Trophy size={40} className={isPassing ? 'text-green-400' : 'text-red-400'} />
        </div>

        <h2 className="text-3xl font-bold mb-1">{getMessage()}</h2>
        <p className="text-slate-400 text-sm font-mono mb-8">Quiz completed</p>

        <div className={clsx(
          'text-6xl font-bold mb-2',
          isPassing ? 'text-gradient' : 'text-red-400'
        )}>
          {percentage}%
        </div>

        <p className="text-slate-400 font-mono text-sm mb-8">
          {correct} / {total} correct
        </p>

        {/* Score bar */}
        <div className="progress-bar mb-8 h-2">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-1000',
              isPassing
                ? 'bg-gradient-to-r from-indigo-500 to-green-500'
                : 'bg-gradient-to-r from-red-600 to-red-400'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={15} />
            Retry
          </button>
          <Link
            href="/"
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <Home size={15} />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
