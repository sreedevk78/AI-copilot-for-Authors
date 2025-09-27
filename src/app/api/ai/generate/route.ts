import { NextRequest, NextResponse } from 'next/server'
import { AIGenerationService, GenerationRequest } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, prompt, context, userStyle, characterVoice, genre, tone, length, userId, storyId } = body

    // Validate required fields
    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Type and prompt are required' },
        { status: 400 }
      )
    }

    // Generate content using AI
    const generationRequest: GenerationRequest = {
      type,
      prompt,
      context,
      userStyle,
      characterVoice,
      genre,
      tone,
      length: length || 'medium'
    }

    const result = await AIGenerationService.generateContent(generationRequest)

    // Save generation to database if user is provided
    if (userId) {
      try {
        await prisma.aIGeneration.create({
          data: {
            prompt,
            response: result.content,
            type,
            quality: result.quality,
            metadata: JSON.stringify(result.metadata),
            userId,
            storyId: storyId || null
          }
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Continue without saving to database
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        quality: result.quality,
        suggestions: result.suggestions,
        metadata: result.metadata
      }
    })

  } catch (error) {
    console.error('AI Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const storyId = searchParams.get('storyId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = { userId }
    if (type) whereClause.type = type
    if (storyId) whereClause.storyId = storyId

    const generations = await prisma.aIGeneration.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        story: {
          select: { title: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: generations
    })

  } catch (error) {
    console.error('Get generations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
}
