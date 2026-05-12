'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Command, Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cx-bg-canvas)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-[var(--cx-radius-lg)] border border-[var(--cx-border)] bg-white p-8 text-center shadow-[var(--cx-shadow-lg)]"
        >
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--cx-sage-soft)] text-[var(--cx-sage)]">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--cx-ink-primary)]">Account created</h1>
          <p className="mt-2 text-sm text-[var(--cx-ink-secondary)]">Redirecting to sign in…</p>
        </motion.div>
      </div>
    )
  }

  const inputClasses = "w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 text-sm text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"

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
            Start with one idea.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/40">
            Create your author account and get access to six creative instruments, a persistent story bible, and an AI writing partner.
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
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">Create your account</h1>
            <p className="mt-2 text-sm text-[var(--cx-ink-secondary)]">Set up your author workspace in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-rose)]/20 bg-[var(--cx-rose-soft)] px-4 py-3 text-sm text-[var(--cx-rose-strong)]">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
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
                  className={`${inputClasses} pr-12`}
                  placeholder="Create a password"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                placeholder="Repeat your password"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Get started'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--cx-ink-secondary)]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-[var(--cx-accent)] hover:text-[var(--cx-accent-hover)]">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
