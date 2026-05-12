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

    const { name, tone, pace, vocabulary, sentenceStructure, strengths, improvements, sample } = await request.json()

    if (!name || !sample) {
      return NextResponse.json(
        { error: 'Name and sample text are required' },
        { status: 400 }
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

    // Create voice profile record
    const voiceProfile = await prisma.voiceProfile.create({
      data: {
        name,
        tone: tone || 'Conversational',
        pace: pace || 'Moderate',
        vocabulary: vocabulary || 'Intermediate',
        sentenceStructure: sentenceStructure || 'Varied',
        strengths: JSON.stringify(strengths || []),
        improvements: JSON.stringify(improvements || []),
        sample,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      voiceProfile
    })

  } catch (error) {
    console.error('Voice profile save error:', error)
    return NextResponse.json(
      { error: 'Failed to save voice profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const voiceProfiles = await prisma.voiceProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: voiceProfiles
    })

  } catch (error) {
    console.error('Get voice profiles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voice profiles' },
      { status: 500 }
    )
  }
}
