'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  quizId: string
  title: string
}

export default function ShareButton({ quizId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/quiz/${quizId}/take`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleShare} className="btn-ghost flex items-center gap-2 text-sm" title={`Share "${title}"`}>
      {copied
        ? <><Check size={15} className="text-green-400" /> Copied!</>
        : <><Share2 size={15} /> Share</>
      }
    </button>
  )
}