'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { BookOpen, Plus, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()

  return (
    <header className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-200">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Quiz<span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/quiz/create" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm">
                    <Plus size={16} /> Create Quiz
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1e1e2e]">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-400 font-mono max-w-[140px] truncate">{user.email}</span>
                  </div>
                  <button onClick={signOut} className="border border-[#1e1e2e] hover:border-indigo-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="border border-[#1e1e2e] text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-all duration-200 text-sm">Sign In</Link>
                  <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm">Get Started</Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}