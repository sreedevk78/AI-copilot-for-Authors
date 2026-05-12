import { NextRequest, NextResponse } from 'next/server'
import { geminiAI } from '@/lib/geminiService'
import { WritingAnalyzer } from '@/lib/writingUtils'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400 },
      )
    }

    const aiAnalysis = await geminiAI.analyzeWritingStyle(text)
    const metrics = WritingAnalyzer.analyzeText(text)
    const style = WritingAnalyzer.analyzeStyle(text)

    return NextResponse.json({
      success: true,
      data: {
        aiAnalysis,
        characteristics: style.characteristics,
        suggestions: Array.isArray(aiAnalysis?.suggestions) ? aiAnalysis.suggestions : [],
        metrics,
        style,
        summary: {
          wordCount: metrics.wordCount,
          complexity: metrics.complexity,
          primaryTone: style.tone[0] || 'neutral',
          voice: style.voice,
          tense: style.tense,
        },
      },
    })
  } catch (error) {
    console.error('Style analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze writing style' },
      { status: 500 },
    )
  }
}
