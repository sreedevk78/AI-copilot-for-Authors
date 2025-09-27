import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre, authorId, isPublic, targetWordCount, tags } = body

    if (!title || !authorId) {
      return NextResponse.json(
        { error: 'Title and author ID are required' },
        { status: 400 }
      )
    }

    const story = await prisma.story.create({
      data: {
        title,
        description: description || '',
        genre: genre || 'General',
        authorId,
        isPublic: isPublic || false,
        targetWordCount: targetWordCount || null,
        tags: tags || []
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        _count: {
          select: {
            chapters: true,
            characters: true,
            plots: true,
            dialogues: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: story
    })

  } catch (error) {
    console.error('Create story error:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('authorId')
    const isPublic = searchParams.get('isPublic')
    const genre = searchParams.get('genre')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: any = {}
    if (authorId) whereClause.authorId = authorId
    if (isPublic !== null) whereClause.isPublic = isPublic === 'true'
    if (genre) whereClause.genre = genre

    const stories = await prisma.story.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, email: true }
        },
        _count: {
          select: {
            chapters: true,
            characters: true,
            plots: true,
            dialogues: true,
            likes: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: stories
    })

  } catch (error) {
    console.error('Get stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}
