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

    const { activeVoiceProfile } = await request.json()

    if (!activeVoiceProfile) {
      return NextResponse.json(
        { error: 'Voice profile data is required' },
        { status: 400 }
      )
    }

    // Update user's writingStyle field with the active voice profile
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        writingStyle: typeof activeVoiceProfile === 'string' ? activeVoiceProfile : JSON.stringify(activeVoiceProfile)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Active voice profile updated successfully'
    })

  } catch (error) {
    console.error('Save active voice error:', error)
    return NextResponse.json(
      { error: 'Failed to save active voice profile' },
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
      where: { email: session.user.email },
      select: { writingStyle: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let activeVoiceProfile = null
    if (user.writingStyle) {
      try {
        activeVoiceProfile = JSON.parse(user.writingStyle)
      } catch (e) {
        activeVoiceProfile = user.writingStyle
      }
    }

    return NextResponse.json({
      success: true,
      data: activeVoiceProfile
    })

  } catch (error) {
    console.error('Get active voice error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active voice profile' },
      { status: 500 }
    )
  }
}
