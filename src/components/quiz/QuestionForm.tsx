'use client'

import { QuestionFormData } from '@/types'
import clsx from 'clsx'

interface QuestionFormProps {
  index: number
  data: QuestionFormData
  onChange: (index: number, data: QuestionFormData) => void
}

export default function QuestionForm({ index, data, onChange }: QuestionFormProps) {
  const update = (partial: Partial<QuestionFormData>) => onChange(index, { ...data, ...partial })

  const updateOption = (optIdx: number, value: string) => {
    const newOptions = [...data.options] as [string, string, string, string]
    newOptions[optIdx] = value
    onChange(index, { ...data, options: newOptions })
  }

  return (
    <div className="card p-6 space-y-5 animate-fade-up">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20
                        flex items-center justify-center text-sm font-bold text-indigo-400 font-mono">
          {index + 1}
        </div>
        <h3 className="font-semibold text-[var(--text-secondary)] text-sm">Question {index + 1}</h3>
      </div>

      {/* Type */}
      <div>
        <label className="label">Question Type</label>
        <div className="flex gap-3">
          {(['multiple_choice', 'essay'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ type })}
              className={clsx(
                'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200',
                data.type === type
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-500/30 hover:text-[var(--text-secondary)]'
              )}
            >
              {type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
            </button>
          ))}
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="label">Question Text</label>
        <textarea
          value={data.question_text}
          onChange={(e) => update({ question_text: e.target.value })}
          placeholder="Enter your question..."
          rows={2}
          className="input-field resize-none"
          required
        />
      </div>

      {/* MCQ Options */}
      {data.type === 'multiple_choice' && (
        <div>
          <label className="label">Answer Options — click letter to mark correct</label>
          <div className="space-y-2.5">
            {data.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update({ correct_option_index: optIdx })}
                  className={clsx(
                    'w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 transition-all duration-200',
                    data.correct_option_index === optIdx
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-500/40'
                  )}
                >
                  {String.fromCharCode(65 + optIdx)}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(optIdx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  className="input-field"
                  required
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essay answer */}
      {data.type === 'essay' && (
        <div>
          <label className="label">Correct Answer</label>
          <input
            type="text"
            value={data.correct_answer}
            onChange={(e) => update({ correct_answer: e.target.value })}
            placeholder="Expected answer (case-insensitive match)"
            className="input-field"
            required
          />
        </div>
      )}

      {/* Hint */}
      <div>
        <label className="label">Hint (Optional)</label>
        <input
          type="text"
          value={data.hint}
          onChange={(e) => update({ hint: e.target.value })}
          placeholder="Hint shown when student clicks 'Show hint'"
          className="input-field"
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="label">Explanation (Optional)</label>
        <textarea
          value={data.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          placeholder="Shown after the student submits — explain why the answer is correct"
          rows={2}
          className="input-field resize-none"
        />
      </div>
    </div>
  )
}
