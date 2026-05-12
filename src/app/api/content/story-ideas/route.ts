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

    const { title, concept, genre, themes, characters, conflict, setting, potential } = await request.json()

    if (!title || !concept) {
      return NextResponse.json(
        { error: 'Title and concept are required' },
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

    // Create story idea record
    const storyIdea = await prisma.storyIdea.create({
      data: {
        title,
        concept,
        genre: genre || 'General',
        themes: JSON.stringify(themes || []),
        characters: JSON.stringify(characters || []),
        conflict: conflict || '',
        setting: setting || '',
        potential: potential || 'medium',
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      storyIdea
    })

  } catch (error) {
    console.error('Story idea save error:', error)
    return NextResponse.json(
      { error: 'Failed to save story idea' },
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

    const storyIdeas = await prisma.storyIdea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: storyIdeas
    })

  } catch (error) {
    console.error('Get story ideas error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story ideas' },
      { status: 500 }
    )
  }
}
