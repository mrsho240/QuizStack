'use client'

import { useState } from 'react'
import { Question } from '@/types'
import { Lightbulb, CheckCircle2, XCircle, ChevronRight, BookOpen } from 'lucide-react'
import clsx from 'clsx'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onNext: (wasCorrect: boolean) => void
  isLast: boolean
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  isLast,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [essayAnswer, setEssayAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const progress = ((questionNumber - 1) / totalQuestions) * 100

  const handleSubmit = () => {
    if (submitted) return
    let correct = false
    if (question.type === 'multiple_choice') {
      correct = selectedOption === question.correct_option_index
    } else {
      correct = essayAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
    }
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const canSubmit = !submitted && (
    question.type === 'multiple_choice'
      ? selectedOption !== null
      : essayAnswer.trim().length > 0
  )

  const handleNext = () => {
    const correct = isCorrect
    setSelectedOption(null)
    setEssayAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
    setShowHint(false)
    setShowExplanation(false)
    onNext(correct)
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-in">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className={clsx(
        'card p-8 transition-all duration-300',
        submitted && isCorrect && 'correct-state',
        submitted && !isCorrect && 'incorrect-state'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="tag">
            {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
          </span>
          {submitted && (
            <div className={clsx(
              'flex items-center gap-1.5 text-sm font-semibold animate-scale-in',
              isCorrect ? 'text-green-400' : 'text-red-400'
            )}>
              {isCorrect
                ? <><CheckCircle2 size={16} /> Correct!</>
                : <><XCircle size={16} /> Incorrect</>
              }
            </div>
          )}
        </div>

        {/* Question */}
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 leading-relaxed">
          {question.question_text}
        </h2>

        {/* MCQ Options */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrectOption = submitted && idx === question.correct_option_index
              const isWrong = submitted && isSelected && !isCorrect

              return (
                <button
                  key={idx}
                  onClick={() => !submitted && setSelectedOption(idx)}
                  disabled={submitted}
                  className={clsx(
                    'w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3',
                    !submitted && !isSelected && 'border-[var(--border)] bg-[var(--bg-input)] hover:border-indigo-500/40 hover:bg-indigo-500/5',
                    !submitted && isSelected && 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                    submitted && isCorrectOption && 'border-green-500/50 bg-green-500/10',
                    submitted && isWrong && 'border-red-500/50 bg-red-500/10',
                    submitted && !isCorrectOption && !isWrong && 'border-[var(--border)] bg-[var(--bg-input)] opacity-50'
                  )}
                >
                  <span className={clsx(
                    'w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 transition-all',
                    !submitted && !isSelected && 'border-[var(--border)] text-[var(--text-muted)]',
                    !submitted && isSelected && 'border-indigo-500 bg-indigo-500 text-white',
                    submitted && isCorrectOption && 'border-green-500 bg-green-500 text-white',
                    submitted && isWrong && 'border-red-500 bg-red-500 text-white',
                    submitted && !isCorrectOption && !isWrong && 'border-[var(--border)] text-[var(--text-muted)]',
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={clsx(
                    'text-sm font-medium',
                    !submitted && isSelected && 'text-indigo-300',
                    submitted && isCorrectOption && 'text-green-300',
                    submitted && isWrong && 'text-red-300',
                    submitted && !isCorrectOption && !isWrong && 'text-[var(--text-muted)]',
                    !submitted && !isSelected && 'text-[var(--text-secondary)]',
                  )}>
                    {option}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Essay */}
        {question.type === 'essay' && (
          <div className="mb-6">
            <textarea
              value={essayAnswer}
              onChange={(e) => setEssayAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here..."
              rows={4}
              className={clsx(
                'input-field resize-none',
                submitted && isCorrect && 'border-green-500/40',
                submitted && !isCorrect && 'border-red-500/40'
              )}
            />
            {submitted && !isCorrect && (
              <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 animate-fade-up">
                <p className="text-xs text-[var(--text-muted)] mb-1 font-mono uppercase tracking-wider">Correct Answer</p>
                <p className="text-sm text-green-400 font-medium">{question.correct_answer}</p>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {question.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-amber-400/80 hover:text-amber-400 transition-colors font-medium"
            >
              <Lightbulb size={15} />
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            <div className={clsx('hint-expand mt-2', showHint && 'open')}>
              <div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm text-amber-300/80 font-mono">{question.hint}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explanation — shown after submission */}
        {submitted && question.explanation && (
          <div className="mb-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 text-sm text-indigo-400/80 hover:text-indigo-400 transition-colors font-medium"
            >
              <BookOpen size={15} />
              {showExplanation ? 'Hide explanation' : 'See explanation'}
            </button>
            <div className={clsx('hint-expand mt-2', showExplanation && 'open')}>
              <div>
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 animate-fade-up">
                  <p className="text-xs text-[var(--text-muted)] mb-1 font-mono uppercase tracking-wider">Explanation</p>
                  <p className="text-sm text-indigo-300/90 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!canSubmit} className="btn-primary flex-1">
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLast ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
