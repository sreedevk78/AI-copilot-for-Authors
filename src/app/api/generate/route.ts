import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Initialize Gemini AI with secure server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

interface GenerationRequest {
  prompt: string
  settings: {
    tone: string
    temperature: number
    length: string
  }
  template: string
}

const TEMPLATE_PROMPTS = {
  idea: 'I\'m brainstorming story ideas and need some creative inspiration. Help me develop a compelling concept with interesting characters and an engaging conflict. Think about what would make readers want to keep turning pages.',
  plot: 'I\'m working on structuring my story and need help organizing the plot. Create a detailed outline that flows naturally from beginning to end, with strong character development and satisfying story beats.',
  dialogue: 'I\'m writing dialogue and want to make sure it sounds natural and engaging. Help me create conversations that reveal character personality and move the story forward in an authentic way.'
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, settings, template }: GenerationRequest = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Build the enhanced prompt based on template and settings
    let enhancedPrompt = prompt

    // Add template-specific instructions
    if (template && TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS]) {
      enhancedPrompt = `${TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS]}\n\nSpecific request: ${prompt}`
    }

    // Add tone and style instructions
    enhancedPrompt += `\n\nWrite this in a ${settings.tone.toLowerCase()} tone, as if you're a creative writing mentor sharing insights with a fellow writer.`
    
    // Add length instructions
    const lengthMap = {
      'Short': 'Keep it concise but impactful (50-100 words)',
      'Medium': 'Provide good detail without overwhelming (100-300 words)',
      'Long': 'Be comprehensive and thorough (300-500 words)',
      'Very Long': 'Be very detailed and in-depth (500+ words)'
    }
    enhancedPrompt += ` ${lengthMap[settings.length as keyof typeof lengthMap] || 'Provide good detail without overwhelming (100-300 words)'}.`
    
    // Add humanization instructions
    enhancedPrompt += `\n\nWrite in a natural, conversational style that feels like genuine creative advice. Use varied sentence structures, personal insights, and engaging language. Avoid repetitive patterns or overly formal language. Make it feel authentic and helpful.\n\nResponse:`

    // Configure generation parameters
    const generationConfig = {
      temperature: settings.temperature,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    }

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    // Get user session for database saving
    const session = await getServerSession(authOptions)
    let userId = null
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      userId = user?.id
    }

    // Create a readable stream for server-sent events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate content with Gemini
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
            generationConfig,
            safetySettings,
          })

          const response = result.response
          const text = response.text()

          // Save generation to database if user is authenticated
          if (userId) {
            try {
              await prisma.aIGeneration.create({
                data: {
                  type: template || 'general',
                  prompt: prompt,
                  generatedContent: text,
                  model: 'gemini-2.5-flash',
                  parameters: JSON.stringify(settings),
                  userId: userId
                }
              })
            } catch (dbError) {
              console.error('Failed to save generation to database:', dbError)
              // Continue with streaming even if DB save fails
            }
          }

          // Simulate streaming by sending chunks
          const words = text.split(' ')
          let currentChunk = ''
          
          for (let i = 0; i < words.length; i++) {
            currentChunk += words[i] + ' '
            
            // Send chunk every few words to simulate streaming
            if ((i + 1) % 3 === 0 || i === words.length - 1) {
              const data = JSON.stringify({ content: currentChunk })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              currentChunk = ''
              
              // Add small delay to simulate real streaming
              await new Promise(resolve => setTimeout(resolve, 50))
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()

        } catch (error) {
          console.error('Gemini API Error:', error)
          
          // Send error in stream format
          const errorData = JSON.stringify({ 
            error: 'Failed to generate content. Please try again.' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Generation API Error:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API authentication failed. Please check configuration.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
