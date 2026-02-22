'use client'

import Link from 'next/link'
import { Quiz } from '@/types'
import { BookOpen, Hash, ChevronRight, Timer, Trophy } from 'lucide-react'
import ShareButton from './ShareButton'

interface QuizCardProps {
  quiz: Quiz
  isOwner: boolean
  onDelete?: (id: string) => void
}

export default function QuizCard({ quiz, isOwner, onDelete }: QuizCardProps) {
  const formattedDate = new Date(quiz.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="card-hover p-6 flex flex-col gap-4 group relative animate-fade-up">

      {/* Edit/Delete — only owner, hover reveal top-right */}
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Link href={`/quiz/${quiz.id}/edit`}
            className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400
                       border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
            Edit
          </Link>
          {onDelete && (
            <button onClick={() => onDelete(quiz.id)}
              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400
                         border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Delete
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20
                        flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0 pr-20">
          <span className="tag">{quiz.topic}</span>
          <h3 className="font-bold text-base leading-snug line-clamp-2 mt-2"
            style={{ color: 'var(--text-primary)' }}>
            {quiz.title}
          </h3>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono"
        style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <Hash size={11} />{quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''}
        </span>
        {quiz.timer_seconds && (
          <span className="flex items-center gap-1.5 text-amber-400/80">
            <Timer size={11} />{Math.floor(quiz.timer_seconds / 60)}m
          </span>
        )}
        <span className="ml-auto">{formattedDate}</span>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Start Quiz — always visible */}
        <Link href={`/quiz/${quiz.id}/take`}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
          Start Quiz <ChevronRight size={16} />
        </Link>

        {/* Share + Leaderboard — appear on hover */}
        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 overflow-hidden max-h-0 group-hover:max-h-12">
          <ShareButton quizId={quiz.id} title={quiz.title} />
          <Link href={`/quiz/${quiz.id}/leaderboard`}
            className="btn-ghost flex-1 flex items-center justify-center gap-1.5 text-xs !py-2">
            <Trophy size={12} /> Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}