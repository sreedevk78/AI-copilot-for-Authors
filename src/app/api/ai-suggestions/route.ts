import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { geminiAI } from '@/lib/geminiService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { type, context, userId, storyId } = await request.json()

    if (!type || !context) {
      return NextResponse.json(
        { error: 'Type and context are required' },
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

    // Generate AI suggestion based on type and context
    let suggestionContent = ''
    let suggestionTitle = ''

    try {
      switch (type) {
        case 'WRITING_TIP':
          suggestionContent = await geminiAI.generateWritingTip(context)
          suggestionTitle = 'Writing Tip'
          break
        case 'CHARACTER_SUGGESTION':
          suggestionContent = await geminiAI.generateCharacterSuggestion(context)
          suggestionTitle = 'Character Development'
          break
        case 'PLOT_DEVELOPMENT':
          suggestionContent = await geminiAI.generatePlotSuggestion(context)
          suggestionTitle = 'Plot Enhancement'
          break
        case 'WORLD_BUILDING':
          suggestionContent = await geminiAI.generateWorldBuildingSuggestion(context)
          suggestionTitle = 'World Building'
          break
        case 'STYLE_IMPROVEMENT':
          suggestionContent = await geminiAI.generateStyleImprovement(context)
          suggestionTitle = 'Style Enhancement'
          break
        default:
          suggestionContent = await geminiAI.generateGeneralSuggestion(context)
          suggestionTitle = 'AI Suggestion'
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      // Fallback suggestions
      suggestionContent = getFallbackSuggestion(type, context)
      suggestionTitle = 'Writing Tip'
    }

    // Create AI suggestion record
    const suggestion = await prisma.aISuggestion.create({
      data: {
        type,
        title: suggestionTitle,
        content: suggestionContent,
        context,
        userId: user.id,
        storyId: storyId || null
      }
    })

    return NextResponse.json({
      success: true,
      suggestion
    })

  } catch (error) {
    console.error('AI suggestion creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create AI suggestion' },
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const storyId = searchParams.get('storyId')
    const limit = parseInt(searchParams.get('limit') || '10')

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

    const whereClause: any = { userId: user.id }
    if (type) whereClause.type = type
    if (storyId) whereClause.storyId = storyId

    const suggestions = await prisma.aISuggestion.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: suggestions
    })

  } catch (error) {
    console.error('Get AI suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI suggestions' },
      { status: 500 }
    )
  }
}

function getFallbackSuggestion(type: string, context: string): string {
  const fallbacks = {
    WRITING_TIP: `Consider adding more sensory details to your writing. Use the five senses (sight, sound, smell, taste, touch) to make your scenes more immersive. For example, instead of just describing what characters see, include the sounds around them, the texture of objects they touch, or the scents in the air.`,
    CHARACTER_SUGGESTION: `Your characters could benefit from more internal conflict. Consider giving them opposing desires or fears that create tension within their personality. This makes characters more relatable and adds depth to their decision-making process.`,
    PLOT_DEVELOPMENT: `Try adding a plot twist or unexpected complication to your story. This could be a character revealing a secret, an unforeseen obstacle, or a change in circumstances that forces your protagonist to adapt their approach.`,
    WORLD_BUILDING: `Consider the ripple effects of your world's rules. How do the magic systems, technology, or social structures affect everyday life? Think about how people get food, travel, communicate, and solve problems in your world.`,
    STYLE_IMPROVEMENT: `Vary your sentence structure to create rhythm and flow. Mix short, punchy sentences with longer, more complex ones. This creates a natural reading pace and keeps your prose engaging.`
  }

  return fallbacks[type as keyof typeof fallbacks] || fallbacks.WRITING_TIP
}
