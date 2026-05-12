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

    const { title, characters, setting, mood, content, genre } = await request.json()

    if (!title || !content || !characters) {
      return NextResponse.json(
        { error: 'Title, content, and characters are required' },
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

    // Create dialogue record
    const dialogue = await prisma.savedDialogue.create({
      data: {
        title,
        content,
        setting: setting || 'Unknown',
        mood: mood || 'Neutral',
        genre: genre || 'General',
        characters: JSON.stringify(characters),
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      dialogue
    })

  } catch (error) {
    console.error('Dialogue save error:', error)
    return NextResponse.json(
      { error: 'Failed to save dialogue' },
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

    const dialogues = await prisma.savedDialogue.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: dialogues
    })

  } catch (error) {
    console.error('Get dialogues error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dialogues' },
      { status: 500 }
    )
  }
}
