'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { LandingPage } from '@/components/LandingPage'
import { OnboardingCheck } from '@/components/OnboardingCheck'

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cx-bg-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--cx-border)] border-t-[var(--cx-accent)] mx-auto mb-4"></div>
          <p className="text-sm text-[var(--cx-ink-secondary)]">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LandingPage />
  }

  return <OnboardingCheck />
}