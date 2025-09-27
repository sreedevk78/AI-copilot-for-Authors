import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: { name: true, email: true, avatar: true }
        },
        chapters: {
          orderBy: { order: 'asc' }
        },
        characters: true,
        plots: {
          orderBy: { order: 'asc' }
        },
        dialogues: {
          include: {
            character: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            collaborations: true
          }
        }
      }
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: story
    })

  } catch (error) {
    console.error('Get story error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id
    const body = await request.json()
    const { title, description, genre, status, isPublic, targetWordCount, tags } = body

    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(genre && { genre }),
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
        ...(targetWordCount !== undefined && { targetWordCount }),
        ...(tags && { tags })
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: story
    })

  } catch (error) {
    console.error('Update story error:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id

    await prisma.story.delete({
      where: { id: storyId }
    })

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully'
    })

  } catch (error) {
    console.error('Delete story error:', error)
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    )
  }
}
