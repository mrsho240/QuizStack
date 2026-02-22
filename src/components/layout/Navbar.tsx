'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTheme } from '@/lib/hooks/useTheme'
import { BookOpen, Plus, LogOut, User, LayoutDashboard, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center
                          group-hover:bg-indigo-500 transition-colors duration-200">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
            Quiz<span className="text-gradient">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost p-2.5 !px-2.5"
            title="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={16} className="text-amber-400" />
              : <Moon size={16} className="text-indigo-400" />
            }
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard"
                    className="btn-ghost flex items-center gap-2 text-sm">
                    <LayoutDashboard size={15} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link href="/quiz/create"
                    className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Create Quiz</span>
                  </Link>
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]">
                    <User size={14} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-muted)] font-mono max-w-[140px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button onClick={signOut} className="btn-ghost flex items-center gap-2 text-sm">
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
                  <Link href="/auth/signup" className="btn-primary text-sm">Get Started</Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
