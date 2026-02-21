import Link from 'next/link'
import { Quiz } from '@/types'
import { BookOpen, Hash, ChevronRight, User2 } from 'lucide-react'

interface QuizCardProps {
  quiz: Quiz
  isOwner: boolean
  onDelete?: (id: string) => void
}

export default function QuizCard({ quiz, isOwner, onDelete }: QuizCardProps) {
  const creatorName = (quiz as any).profiles?.full_name || (quiz as any).profiles?.email?.split('@')[0] || 'Unknown'
  const formattedDate = new Date(quiz.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="card-hover p-6 flex flex-col gap-4 group relative animate-fade-up">
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={`/quiz/${quiz.id}/edit`}
            className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400
                       border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400
                         border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20
                        flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="tag mb-2">{quiz.topic}</span>
          <h3 className="font-bold text-base text-slate-100 leading-snug line-clamp-2 mt-1">
            {quiz.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Hash size={11} />
          {quiz.question_count} questions
        </span>
        <span className="flex items-center gap-1.5">
          <User2 size={11} />
          {creatorName}
        </span>
        <span className="ml-auto">{formattedDate}</span>
      </div>

      <div className="pt-2 border-t border-[#1e1e2e]">
        <Link
          href={`/quiz/${quiz.id}/take`}
          className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
        >
          Start Quiz
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
