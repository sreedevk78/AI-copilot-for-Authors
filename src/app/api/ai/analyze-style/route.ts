import { NextRequest, NextResponse } from 'next/server'
import { AIGenerationService } from '@/lib/openai'
import { WritingAnalyzer } from '@/lib/writingUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, userId } = body

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400 }
      )
    }

    // Analyze writing style using AI
    const aiAnalysis = await AIGenerationService.analyzeWritingStyle(text)
    
    // Analyze metrics using local analyzer
    const metrics = WritingAnalyzer.analyzeText(text)
    const style = WritingAnalyzer.analyzeStyle(text)

    return NextResponse.json({
      success: true,
      data: {
        aiAnalysis: aiAnalysis.style,
        characteristics: aiAnalysis.characteristics,
        suggestions: aiAnalysis.suggestions,
        metrics,
        style,
        summary: {
          wordCount: metrics.wordCount,
          complexity: metrics.complexity,
          primaryTone: style.tone[0] || 'neutral',
          voice: style.voice,
          tense: style.tense
        }
      }
    })

  } catch (error) {
    console.error('Style analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze writing style' },
      { status: 500 }
    )
  }
}
