'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Command, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden flex-1 flex-col justify-between bg-[var(--cx-bg-deep)] p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-sm)] bg-white/10">
            <Command className="h-4 w-4 text-white/70" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white/80">CodeXcape</span>
        </div>

        <div className="max-w-md">
          <h2 className="font-serif text-4xl font-semibold leading-tight text-white/90">
            Where stories<br />take shape.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/40">
            Six creative instruments and an AI writing partner — all orbiting one desk.
          </p>
        </div>

        <p className="text-xs text-white/20">© 2024 CodeXcape. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-[var(--cx-bg-canvas)] p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)]">
              <Command className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-[var(--cx-ink-primary)]">CodeXcape</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">Sign in to CodeXcape</h1>
            <p className="mt-2 text-sm text-[var(--cx-ink-secondary)]">Welcome back. Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-rose)]/20 bg-[var(--cx-rose-soft)] px-4 py-3 text-sm text-[var(--cx-rose-strong)]">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 text-sm text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 pr-12 text-sm text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cx-ink-muted)] hover:text-[var(--cx-ink-primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--cx-ink-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-[var(--cx-accent)] hover:text-[var(--cx-accent-hover)]">
              Get started
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-[var(--cx-bg-panel)] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cx-ink-muted)]">Demo account</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--cx-ink-secondary)]">Email</span>
                <code className="rounded border border-[var(--cx-border)] bg-white px-2.5 py-1 font-mono text-xs text-[var(--cx-ink-primary)]">demo@example.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--cx-ink-secondary)]">Password</span>
                <code className="rounded border border-[var(--cx-border)] bg-white px-2.5 py-1 font-mono text-xs text-[var(--cx-ink-primary)]">demo123</code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
