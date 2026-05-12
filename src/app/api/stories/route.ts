import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function storyInclude() {
  return {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    _count: {
      select: {
        chapters: true,
        characters: true,
        plots: true,
        dialogues: true,
        likes: true,
      },
    },
  }
}

async function resolveCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  return prisma.user.findUnique({
    where: { email: session.user.email },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre, authorId, isPublic, targetWordCount, tags } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 },
      )
    }

    const currentUser = await resolveCurrentUser()
    const author = currentUser || (authorId
      ? await prisma.user.findUnique({ where: { id: authorId } })
      : null)

    if (!author) {
      return NextResponse.json(
        { error: 'Authentication or a valid author ID is required' },
        { status: 401 },
      )
    }

    const story = await prisma.story.create({
      data: {
        title,
        description: description || '',
        genre: genre || 'General',
        authorId: author.id,
        isPublic: Boolean(isPublic),
        targetWordCount: targetWordCount || null,
        tags: tags ? JSON.stringify(tags) : null,
        status: 'DRAFT',
        wordCount: 0,
      },
      include: storyInclude(),
    })

    return NextResponse.json({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Create story error:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const authorId = searchParams.get('authorId')
    const isPublic = searchParams.get('isPublic')
    const genre = searchParams.get('genre')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const currentUser = await resolveCurrentUser()

    const whereClause: any = {}
    const requestedAuthorId = userId || authorId

    if (requestedAuthorId) {
      whereClause.authorId = requestedAuthorId
    } else if (currentUser && isPublic === null) {
      whereClause.authorId = currentUser.id
    }

    if (isPublic !== null) whereClause.isPublic = isPublic === 'true'
    if (genre) whereClause.genre = genre

    const stories = await prisma.story.findMany({
      where: whereClause,
      include: storyInclude(),
      orderBy: { updatedAt: 'desc' },
      take: Number.isFinite(limit) ? limit : 20,
    })

    return NextResponse.json({
      success: true,
      data: stories,
    })
  } catch (error) {
    console.error('Get stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 },
    )
  }
}

