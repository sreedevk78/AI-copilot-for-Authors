import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse user's writing style and preferences
    const writingStyle = user.writingStyle ? JSON.parse(user.writingStyle) : {}
    const preferences = user.preferences ? JSON.parse(user.preferences) : {}
    const favoriteGenres = user.favoriteGenres ? JSON.parse(user.favoriteGenres) : []
    const writingGoals = user.writingGoals ? JSON.parse(user.writingGoals) : []

    const style = {
      tone: writingStyle.tone || 'Creative',
      complexity: writingStyle.complexity || 'Moderate',
      pacing: writingStyle.pacing || 'Moderate',
      dialogueStyle: writingStyle.dialogueStyle || 'Natural',
      experience: user.writingExperience || 'INTERMEDIATE',
      favoriteGenres: favoriteGenres,
      writingGoals: writingGoals,
      interests: preferences.interests || []
    }

    return NextResponse.json({
      success: true,
      style
    })

  } catch (error) {
    console.error('Get writing style error:', error)
    return NextResponse.json(
      { error: 'Failed to get writing style' },
      { status: 500 }
    )
  }
}
