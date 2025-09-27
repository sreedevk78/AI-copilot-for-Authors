import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GenerationRequest {
  type: 'STORY_IDEA' | 'PLOT_DEVELOPMENT' | 'DIALOGUE' | 'CHARACTER_DEVELOPMENT' | 'SCENE_DESCRIPTION' | 'WORLD_BUILDING' | 'STYLE_ADAPTATION'
  prompt: string
  context?: string
  userStyle?: string
  characterVoice?: string
  genre?: string
  tone?: string
  length?: 'short' | 'medium' | 'long'
}

export interface GenerationResponse {
  content: string
  quality: number
  suggestions?: string[]
  metadata?: Record<string, any>
}

export class AIGenerationService {
  static async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request)
      const userPrompt = this.buildUserPrompt(request)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: this.getMaxTokens(request.length || 'medium'),
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })

      const content = completion.choices[0]?.message?.content || ''
      const quality = this.assessQuality(content, request.type)
      const suggestions = this.generateSuggestions(content, request.type)

      return {
        content,
        quality,
        suggestions,
        metadata: {
          model: 'gpt-4-turbo-preview',
          tokens_used: completion.usage?.total_tokens,
          finish_reason: completion.choices[0]?.finish_reason
        }
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to generate content. Please try again.')
    }
  }

  private static buildSystemPrompt(request: GenerationRequest): string {
    const basePrompt = `You are an expert creative writing assistant specialized in helping writers develop compelling stories while preserving their unique voice. Your role is to provide high-quality, creative content that enhances the writer's vision.`

    const typeSpecificPrompts = {
      STORY_IDEA: `Generate innovative story ideas that are fresh, engaging, and have strong potential for development. Focus on unique concepts, compelling characters, and interesting conflicts.`,
      PLOT_DEVELOPMENT: `Develop detailed plot structures, story arcs, and narrative progression. Consider pacing, tension, and character development within the plot.`,
      DIALOGUE: `Create authentic, character-driven dialogue that advances the plot and reveals character personality. Ensure each character has a distinct voice.`,
      CHARACTER_DEVELOPMENT: `Develop rich, three-dimensional characters with clear motivations, flaws, and growth arcs. Focus on psychological depth and relatability.`,
      SCENE_DESCRIPTION: `Create vivid, immersive scene descriptions that engage the senses and set the perfect mood for the story.`,
      WORLD_BUILDING: `Develop rich, consistent fictional worlds with detailed cultures, histories, and rules that support the story.`,
      STYLE_ADAPTATION: `Adapt content to match the writer's unique style while maintaining quality and creativity.`
    }

    return `${basePrompt}\n\n${typeSpecificPrompts[request.type]}`
  }

  private static buildUserPrompt(request: GenerationRequest): string {
    let prompt = request.prompt

    if (request.context) {
      prompt += `\n\nContext: ${request.context}`
    }

    if (request.userStyle) {
      prompt += `\n\nWriter's Style: ${request.userStyle}`
    }

    if (request.characterVoice) {
      prompt += `\n\nCharacter Voice: ${request.characterVoice}`
    }

    if (request.genre) {
      prompt += `\n\nGenre: ${request.genre}`
    }

    if (request.tone) {
      prompt += `\n\nDesired Tone: ${request.tone}`
    }

    if (request.length) {
      const lengthInstructions = {
        short: 'Keep the response concise and focused.',
        medium: 'Provide a balanced response with good detail.',
        long: 'Be comprehensive and thorough in your response.'
      }
      prompt += `\n\nLength: ${lengthInstructions[request.length]}`
    }

    return prompt
  }

  private static getMaxTokens(length: 'short' | 'medium' | 'long'): number {
    const tokenMap = {
      short: 500,
      medium: 1000,
      long: 2000
    }
    return tokenMap[length]
  }

  private static assessQuality(content: string, type: GenerationRequest['type']): number {
    // Simple quality assessment based on content characteristics
    let score = 0.7 // Base score

    // Length check
    if (content.length > 100) score += 0.1
    if (content.length > 300) score += 0.1

    // Creativity indicators
    if (content.includes('"') || content.includes("'")) score += 0.05 // Dialogue
    if (content.split('.').length > 3) score += 0.05 // Multiple sentences
    if (content.includes('!') || content.includes('?')) score += 0.05 // Emotional punctuation

    // Type-specific checks
    if (type === 'DIALOGUE' && content.includes('"')) score += 0.1
    if (type === 'CHARACTER_DEVELOPMENT' && content.toLowerCase().includes('character')) score += 0.1
    if (type === 'STORY_IDEA' && content.toLowerCase().includes('story')) score += 0.1

    return Math.min(score, 1.0)
  }

  private static generateSuggestions(content: string, type: GenerationRequest['type']): string[] {
    const suggestions = []

    // General suggestions
    if (content.length < 100) {
      suggestions.push('Consider expanding with more details')
    }

    if (!content.includes('"') && type === 'DIALOGUE') {
      suggestions.push('Try adding more dialogue to bring characters to life')
    }

    // Type-specific suggestions
    switch (type) {
      case 'STORY_IDEA':
        suggestions.push('Think about the main conflict and character motivations')
        suggestions.push('Consider the setting and how it influences the story')
        break
      case 'PLOT_DEVELOPMENT':
        suggestions.push('Map out the three-act structure')
        suggestions.push('Identify key plot points and turning moments')
        break
      case 'CHARACTER_DEVELOPMENT':
        suggestions.push('Define the character\'s core motivation')
        suggestions.push('Consider their greatest fear and flaw')
        break
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  static async analyzeWritingStyle(text: string): Promise<{
    style: string
    characteristics: string[]
    suggestions: string[]
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert writing style analyst. Analyze the given text and provide insights about the writer\'s unique voice, style characteristics, and suggestions for improvement.'
          },
          {
            role: 'user',
            content: `Analyze this writing sample and provide a comprehensive style analysis:\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })

      const analysis = completion.choices[0]?.message?.content || ''
      
      return {
        style: analysis,
        characteristics: this.extractCharacteristics(analysis),
        suggestions: this.extractSuggestions(analysis)
      }
    } catch (error) {
      console.error('Style analysis error:', error)
      return {
        style: 'Unable to analyze style at this time.',
        characteristics: [],
        suggestions: []
      }
    }
  }

  private static extractCharacteristics(analysis: string): string[] {
    const characteristics = []
    const text = analysis.toLowerCase()

    if (text.includes('descriptive') || text.includes('vivid')) characteristics.push('Descriptive')
    if (text.includes('concise') || text.includes('brief')) characteristics.push('Concise')
    if (text.includes('emotional') || text.includes('passionate')) characteristics.push('Emotional')
    if (text.includes('humorous') || text.includes('witty')) characteristics.push('Humorous')
    if (text.includes('formal') || text.includes('professional')) characteristics.push('Formal')
    if (text.includes('conversational') || text.includes('casual')) characteristics.push('Conversational')

    return characteristics
  }

  private static extractSuggestions(analysis: string): string[] {
    const suggestions = []
    const text = analysis.toLowerCase()

    if (text.includes('vary') && text.includes('sentence')) suggestions.push('Vary sentence structure')
    if (text.includes('show') && text.includes('tell')) suggestions.push('Show more, tell less')
    if (text.includes('dialogue')) suggestions.push('Add more dialogue')
    if (text.includes('sensory')) suggestions.push('Include sensory details')
    if (text.includes('pacing')) suggestions.push('Consider pacing')

    return suggestions.slice(0, 3)
  }
}
