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

    const { title, description, genre, tags, targetWordCount } = await request.json()

    if (!title || !genre) {
      return NextResponse.json(
        { error: 'Title and genre are required' },
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

    // Create new story
    const story = await prisma.story.create({
      data: {
        title,
        description: description || '',
        genre,
        tags: tags ? JSON.stringify(tags) : null,
        targetWordCount: targetWordCount || null,
        authorId: user.id,
        status: 'DRAFT',
        wordCount: 0,
        isPublic: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      story
    })

  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
