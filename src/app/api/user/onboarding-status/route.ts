import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        completed: false
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { onboardingCompleted: true }
    })

    return NextResponse.json({
      completed: Boolean(user?.onboardingCompleted)
    })

  } catch (error) {
    console.error('Onboarding status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}
