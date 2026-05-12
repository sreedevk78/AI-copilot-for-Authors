import { NextRequest, NextResponse } from 'next/server'
import { geminiAI } from '@/lib/geminiService'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let authorStyleContext: string | undefined = undefined;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { writingStyle: true }
      })
      if (user?.writingStyle) {
        authorStyleContext = user.writingStyle
      }
    }

    const { 
      type = 'general', 
      prompt, 
      genre, 
      theme, 
      character1,
      character2,
      context: dialogueContext,
      role,
      name,
      userId,
      storyId,
      userMessage,
      storyContext,
      chapterNumber,
      previousChapter,
      focusArea,
      text,
      setting,
      worldId
    } = await request.json()

    let worldContextStr: string | undefined = undefined;
    if (worldId) {
      const world = await prisma.world.findUnique({ where: { id: worldId } });
      if (world) {
        worldContextStr = `World Name: ${world.name}\nGenre: ${world.genre}\nSetting: ${world.setting}\nCore Rules/Description: ${world.description}`;
      }
    }

    if (!prompt && !type && !userMessage) {
      return NextResponse.json(
        { error: 'Prompt, type, or userMessage is required' },
        { status: 400 }
      )
    }

    let result
    
    switch (type) {
      case 'story_idea':
        result = await geminiAI.generateStoryIdea(genre, theme, authorStyleContext, worldContextStr)
        break
      case 'plot':
        result = await geminiAI.generatePlotOutline(genre || 'fantasy', theme || 'adventure', authorStyleContext, worldContextStr)
        break
      case 'dialogue':
        result = await geminiAI.generateDialogue(character1, character2, dialogueContext, authorStyleContext, worldContextStr)
        break
      case 'character':
        result = await geminiAI.generateCharacter(name || '', role || '', genre || '', authorStyleContext, worldContextStr)
        break
      case 'analyze_style':
      case 'style_analysis':
        result = await geminiAI.analyzeWritingStyle(prompt || text)
        break
      case 'chat':
        result = await geminiAI.generateChatResponse(userMessage || prompt, dialogueContext, authorStyleContext)
        break
      case 'story_chapter':
        result = await geminiAI.generateStoryChapter(storyContext, chapterNumber, previousChapter, authorStyleContext)
        break
      case 'improve_text':
        result = await geminiAI.improveText(text, focusArea, authorStyleContext)
        break
      case 'world_building':
        result = await geminiAI.generateWorldBuilding(genre, setting, authorStyleContext)
        break
      case 'finalize_world':
        result = await geminiAI.finalizeWorldBuilding(prompt || text, genre || 'Fantasy', setting || 'Custom', authorStyleContext)
        break
      default:
        // For general prompts, use chat response
        result = await geminiAI.generateChatResponse(prompt || userMessage, dialogueContext, authorStyleContext)
    }

    return NextResponse.json({
      success: true,
      data: {
        content: result,
        type,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content with AI' },
      { status: 500 }
    )
  }
}
