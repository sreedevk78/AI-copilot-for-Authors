import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const {
      writingExperience,
      favoriteGenres,
      writingGoals,
      previousWorks,
      writingStyle,
      interests
    } = await request.json()

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

    // Update user with onboarding data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        writingExperience,
        favoriteGenres: JSON.stringify(favoriteGenres),
        writingGoals: JSON.stringify(writingGoals),
        writingStyle: JSON.stringify(writingStyle),
        preferences: JSON.stringify({ interests })
      }
    })

    // Save onboarding responses
    const onboardingData = [
      {
        question: 'Writing Experience',
        answer: writingExperience,
        questionType: 'SURVEY'
      },
      {
        question: 'Favorite Genres',
        answer: favoriteGenres.join(', '),
        questionType: 'PREFERENCE'
      },
      {
        question: 'Writing Goals',
        answer: writingGoals.join(', '),
        questionType: 'SURVEY'
      },
      {
        question: 'Writing Style',
        answer: JSON.stringify(writingStyle),
        questionType: 'SURVEY'
      },
      {
        question: 'Interests',
        answer: interests.join(', '),
        questionType: 'PREFERENCE'
      }
    ]

    if (previousWorks) {
      onboardingData.push({
        question: 'Previous Works',
        answer: previousWorks,
        questionType: 'FILE_UPLOAD'
      })
    }

    // Save onboarding data
    for (const data of onboardingData) {
      await prisma.userOnboardingData.create({
        data: {
          question: data.question,
          answer: data.answer,
          questionType: data.questionType,
          userId: user.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    console.error('Complete onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
