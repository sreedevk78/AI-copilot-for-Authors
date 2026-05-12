'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserOnboarding } from './UserOnboarding'
import { WritingDashboard } from './WritingDashboard'

interface OnboardingData {
  writingExperience: string
  favoriteGenres: string[]
  writingGoals: string[]
  previousWorks: string
  writingStyle: {
    tone: string
    complexity: string
    pacing: string
    dialogueStyle: string
  }
  interests: string[]
}

export function OnboardingCheck() {
  const { data: session, status } = useSession()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      checkOnboardingStatus()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session])

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/user/onboarding-status')
      if (response.ok) {
        const data = await response.json()
        setHasCompletedOnboarding(data.completed)
      } else {
        setHasCompletedOnboarding(false)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setHasCompletedOnboarding(true)
      } else {
        console.error('Failed to save onboarding data')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cx-bg-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--cx-border)] border-t-[var(--cx-accent)] mx-auto mb-4"></div>
          <p className="text-sm text-[var(--cx-ink-secondary)]">Preparing your workspace…</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (hasCompletedOnboarding === false) {
    return <UserOnboarding onComplete={handleOnboardingComplete} />
  }

  return <WritingDashboard />
}
