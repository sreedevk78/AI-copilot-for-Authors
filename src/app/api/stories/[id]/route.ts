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
    chapters: {
      orderBy: { order: 'asc' as const },
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

async function getSessionUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  return user?.id || null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const story = await prisma.story.findUnique({
      where: { id: params.id },
      include: storyInclude(),
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Get story error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getSessionUserId()
    const body = await request.json()
    const { title, description, genre, status, isPublic, targetWordCount, tags } = body

    const existingStory = await prisma.story.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 },
      )
    }

    if (userId && existingStory.authorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      )
    }

    const story = await prisma.story.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(genre && { genre }),
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
        ...(targetWordCount !== undefined && { targetWordCount }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
      },
      include: storyInclude(),
    })

    return NextResponse.json({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Update story error:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getSessionUserId()
    const existingStory = await prisma.story.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!existingStory) {
      return NextResponse.json({
        success: true,
        message: 'Story deleted successfully',
      })
    }

    if (userId && existingStory.authorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      )
    }

    await prisma.story.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    })
  } catch (error) {
    console.error('Delete story error:', error)
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 },
    )
  }
}

