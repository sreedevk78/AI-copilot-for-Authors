import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { vectorService } from '@/lib/vectorService'
import { geminiAI } from '@/lib/geminiService'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

    const { worldId, query, developmentType } = await request.json()

    if (!worldId || !query) {
      return NextResponse.json({ 
        success: false, 
        error: 'World ID and query are required' 
      }, { status: 400 })
    }

    // Get the world from the database
    const world = await prisma.world.findFirst({
      where: {
        id: worldId,
        userId: userId
      }
    })

    if (!world) {
      return NextResponse.json({ 
        success: false, 
        error: 'World not found or you do not have permission' 
      }, { status: 404 })
    }

    // Get the user to check for active voice profile
    let authorStyleContext: string | undefined = undefined;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { writingStyle: true }
    });
    if (user?.writingStyle) {
      authorStyleContext = user.writingStyle;
    }

    // Retrieve relevant context using RAG
    const context = await vectorService.retrieveContext(worldId, query, 5)

    // Generate development suggestions based on context
    const developmentContent = await geminiAI.generateWorldDevelopment(
      query,
      context.contextSummary,
      world.genre,
      developmentType || 'general',
      authorStyleContext
    )

    const suggestions: string[] = context.suggestions

    // Store the development in the database
    const development = await prisma.worldDevelopment.create({
      data: {
        worldId,
        query,
        developmentType: developmentType || 'general',
        content: developmentContent,
        context: context.contextSummary,
        suggestions: JSON.stringify(suggestions),
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        development: developmentContent,
        suggestions,
        context: context.contextSummary,
        relevantSections: context.relevantSections.map((section: any) => ({
          type: section.type,
          section: section.metadata.section,
          content: section.content.substring(0, 200) + '...',
          similarity: section.similarity || 0
        }))
      }
    })

  } catch (error) {
    console.error('Error in world development:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to develop world' 
    }, { status: 500 })
  }
}
