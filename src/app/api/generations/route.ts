import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Temporary in-memory storage
const generations: any[] = []

export async function POST(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

    const { content, type, prompt, settings, storyId } = await request.json()

    if (!content || !type || !prompt) {
      return NextResponse.json(
        { error: 'Content, type, and prompt are required' },
        { status: 400 }
      )
    }

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        const generation = await prisma.aIGeneration.create({
          data: {
            type,
            prompt,
            generatedContent: content,
            model: 'gemini-2.5-flash',
            parameters: settings ? JSON.stringify(settings) : null,
            userId: user.id,
            storyId: storyId || null
          }
        })

        return NextResponse.json({
          success: true,
          generation
        })
      }
    }

    // Compatibility fallback for unauthenticated local test scripts.
    const generation = {
      id: Date.now().toString(),
      type,
      prompt,
      generatedContent: content,
      model: 'gemini-2.5-flash',
      parameters: settings ? JSON.stringify(settings) : null,
      userId: userId,
      storyId: storyId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    generations.push(generation)

    return NextResponse.json({
      success: true,
      generation
    })

  } catch (error) {
    console.error('Generation save error:', error)
    return NextResponse.json(
      { error: 'Failed to save generation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const storyId = searchParams.get('storyId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const whereClause: any = { userId: user.id }
      if (type) whereClause.type = type
      if (storyId) whereClause.storyId = storyId

      const persistedGenerations = await prisma.aIGeneration.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return NextResponse.json({
        success: true,
        data: persistedGenerations
      })
    }

    const whereClause: any = { userId: userId }
    if (type) whereClause.type = type
    if (storyId) whereClause.storyId = storyId

    let filteredGenerations = generations.filter(gen => {
      if (gen.userId !== userId) return false
      if (type && gen.type !== type) return false
      if (storyId && gen.storyId !== storyId) return false
      return true
    })
    
    // Sort by createdAt desc and limit
    filteredGenerations = filteredGenerations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredGenerations
    })

  } catch (error) {
    console.error('Get generations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
}
