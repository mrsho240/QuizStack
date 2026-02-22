'use client'

import { useEffect, useState } from 'react'
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

interface TimerProps {
  totalSeconds: number
  onTimeUp: () => void
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) { onTimeUp(); return }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { onTimeUp(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const percentage = (secondsLeft / totalSeconds) * 100
  const isWarning = percentage <= 25
  const isDanger = percentage <= 10

  return (
    <div className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-xl border font-mono text-sm font-bold transition-all duration-300',
      isDanger && 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse',
      isWarning && !isDanger && 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      !isWarning && 'border-[var(--border)] text-[var(--text-secondary)]'
    )}>
      {isWarning ? <AlertTriangle size={14} /> : <TimerIcon size={14} />}
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}