// AI Service with multiple free APIs and fallbacks
import { v4 as uuidv4 } from 'uuid'

interface AIResponse {
  content: string
  model: string
  success: boolean
  error?: string
}

interface StoryIdea {
  id: string
  title: string
  logline: string
  genre: string
  theme: string
  characters: string[]
  conflict: string
  setting: string
  tone: string
}

class AIService {
  private static instance: AIService
  private fallbackIdeas!: StoryIdea[]
  private fallbackPlots!: string[]
  private fallbackDialogues!: string[]
  private fallbackCharacters!: any[]

  constructor() {
    this.initializeFallbacks()
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private initializeFallbacks() {
    // Fallback story ideas
    this.fallbackIdeas = [
      {
        id: uuidv4(),
        title: "The Memory Thief",
        logline: "In a world where memories can be extracted and sold, a young woman discovers she can steal memories from others but loses her own in the process.",
        genre: "Science Fiction",
        theme: "Identity",
        characters: ["Luna Chen", "Dr. Marcus Reed", "The Memory Broker"],
        conflict: "Luna must choose between saving her own memories or using her power to help others.",
        setting: "Neo-Tokyo 2087",
        tone: "Dark and introspective"
      },
      {
        id: uuidv4(),
        title: "The Last Bookstore",
        logline: "When physical books are banned worldwide, the owner of the last remaining bookstore becomes a revolutionary.",
        genre: "Dystopian Fiction",
        theme: "Freedom",
        characters: ["Elena Rodriguez", "Agent Thompson", "The Underground Readers"],
        conflict: "Elena must protect her hidden library while evading the Book Police.",
        setting: "Future America",
        tone: "Hopeful and defiant"
      },
      {
        id: uuidv4(),
        title: "Whispers in the Wind",
        logline: "A deaf girl discovers she can hear the voices of the dead carried by the wind.",
        genre: "Supernatural Fiction",
        theme: "Communication",
        characters: ["Sofia Martinez", "The Wind Spirits", "Dr. Katherine Wells"],
        conflict: "Sofia must help the spirits find peace while protecting herself from those who want to exploit her gift.",
        setting: "Small coastal town",
        tone: "Mystical and emotional"
      },
      {
        id: uuidv4(),
        title: "The Time Garden",
        logline: "A botanist discovers a garden where each plant represents a different moment in time.",
        genre: "Fantasy",
        theme: "Time",
        characters: ["Dr. Isabella Green", "The Time Keeper", "Marcus the Gardener"],
        conflict: "Isabella must prevent time from unraveling while saving her lost love.",
        setting: "Hidden garden in England",
        tone: "Whimsical and romantic"
      },
      {
        id: uuidv4(),
        title: "The Dream Architects",
        logline: "In a world where dreams are designed and sold, a rogue architect creates nightmares that reveal hidden truths.",
        genre: "Psychological Thriller",
        theme: "Reality",
        characters: ["Alex Rivera", "The Dream Corporation", "Luna the Nightmare"],
        conflict: "Alex must escape the dream world while exposing the corporation's lies.",
        setting: "Corporate-controlled future",
        tone: "Surreal and intense"
      }
    ]

    // Fallback plot structures
    this.fallbackPlots = [
      "Act 1: Setup - Introduce protagonist and world. Establish the ordinary world and the inciting incident that changes everything.",
      "Act 2: Confrontation - Rising action with obstacles and complications. The protagonist faces challenges and learns about their true power.",
      "Act 3: Resolution - Climax and falling action. The final confrontation and the new world order.",
      "Hero's Journey: Call to Adventure → Refusal of the Call → Meeting the Mentor → Crossing the Threshold → Tests and Trials → The Ordeal → The Reward → The Road Back → Resurrection → Return with the Elixir",
      "Three-Act Structure: Setup (25%) → Confrontation (50%) → Resolution (25%)",
      "Save the Cat Beat Sheet: Opening Image → Theme Stated → Setup → Catalyst → Debate → Break into Two → B Story → Fun and Games → Midpoint → Bad Guys Close In → All Is Lost → Dark Night of the Soul → Break into Three → Finale → Final Image"
    ]

    // Fallback dialogues
    this.fallbackDialogues = [
      `"I never asked for this power," Luna whispered, staring at her trembling hands.
"But you have it," Dr. Reed replied, his voice steady. "The question is: what will you do with it?"`,

      `"Books are dangerous," Agent Thompson said, his hand on his weapon.
"Dangerous to whom?" Elena challenged, standing protectively in front of her shelves.`,

      `"Can you hear them?" Sofia signed to Dr. Wells.
"Only the wind," the doctor replied. "But you hear something else, don't you?"`,

      `"Time is not linear in this garden," the Time Keeper explained, touching a flower that glowed with ancient light.
"Then how do we find him?" Isabella asked desperately.`,

      `"You can't escape your own dreams," the corporate voice echoed through the nightmare.
"Watch me," Alex said, pulling the threads of reality apart with bare hands.`
    ]

    // Fallback characters
    this.fallbackCharacters = [
      {
        name: "Luna Chen",
        role: "Protagonist",
        age: 24,
        description: "A memory therapist with the rare ability to extract and manipulate memories.",
        personality: ["Empathetic", "Conflicted", "Determined"],
        backstory: "Lost her own memories in a childhood accident, now helps others recover theirs.",
        motivation: "To understand what she lost and help others find peace."
      },
      {
        name: "Dr. Marcus Reed",
        role: "Mentor",
        age: 45,
        description: "A neuroscientist who studies the connection between memory and identity.",
        personality: ["Wise", "Patient", "Secretive"],
        backstory: "Former memory researcher who went rogue to protect his patients.",
        motivation: "To prevent memory manipulation from being weaponized."
      }
    ]
  }

  // Try Hugging Face Inference API (free tier)
  private async tryHuggingFace(prompt: string, maxLength: number = 200): Promise<AIResponse> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'd want to use an API key for higher rate limits
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: maxLength,
            temperature: 0.8,
            do_sample: true
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.generated_text) {
          return {
            content: data.generated_text,
            model: 'HuggingFace-DialoGPT',
            success: true
          }
        }
      }
      
      throw new Error('Hugging Face API failed')
    } catch (error) {
      return {
        content: '',
        model: 'HuggingFace-DialoGPT',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Try OpenAI API (requires API key but more reliable)
  private async tryOpenAI(prompt: string, maxTokens: number = 200): Promise<AIResponse> {
    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key not configured')
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.8
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.choices && data.choices[0]?.message?.content) {
          return {
            content: data.choices[0].message.content,
            model: 'OpenAI-GPT-3.5',
            success: true
          }
        }
      }
      
      throw new Error('OpenAI API failed')
    } catch (error) {
      return {
        content: '',
        model: 'OpenAI-GPT-3.5',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Fallback to curated content
  private getFallbackContent(type: string, genre?: string): string {
    switch (type) {
      case 'story_idea':
        const idea = this.fallbackIdeas[Math.floor(Math.random() * this.fallbackIdeas.length)]
        return JSON.stringify(idea)
      
      case 'plot':
        return this.fallbackPlots[Math.floor(Math.random() * this.fallbackPlots.length)]
      
      case 'dialogue':
        return this.fallbackDialogues[Math.floor(Math.random() * this.fallbackDialogues.length)]
      
      case 'character':
        const character = this.fallbackCharacters[Math.floor(Math.random() * this.fallbackCharacters.length)]
        return JSON.stringify(character)
      
      default:
        return "I'm sorry, I'm having trouble generating content right now. Please try again in a moment."
    }
  }

  // Main generation method with fallbacks
  async generateContent(type: string, prompt: string, genre?: string): Promise<AIResponse> {
    console.log(`Generating ${type} content with prompt: ${prompt}`)
    
    // Try different AI services in order of preference
    const services = [
      () => this.tryOpenAI(prompt, 300),
      () => this.tryHuggingFace(prompt, 200)
    ]

    for (const service of services) {
      try {
        const result = await service()
        if (result.success && result.content.trim()) {
          return result
        }
      } catch (error) {
        console.log('Service failed, trying next...', error)
        continue
      }
    }

    // If all AI services fail, use fallback content
    console.log('All AI services failed, using fallback content')
    const fallbackContent = this.getFallbackContent(type, genre)
    
    return {
      content: fallbackContent,
      model: 'Fallback-Curated',
      success: true
    }
  }

  // Specific generation methods
  async generateStoryIdea(genre: string = 'fantasy', theme: string = 'adventure'): Promise<StoryIdea> {
    const prompt = `Generate a creative story idea for a ${genre} story with the theme of ${theme}. Include title, logline, characters, conflict, setting, and tone.`
    
    const response = await this.generateContent('story_idea', prompt, genre)
    
    try {
      return JSON.parse(response.content)
    } catch {
      // Return a random fallback idea if parsing fails
      return this.fallbackIdeas[Math.floor(Math.random() * this.fallbackIdeas.length)]
    }
  }

  async generatePlotOutline(genre: string, theme: string): Promise<string[]> {
    const prompt = `Create a detailed plot outline for a ${genre} story with the theme of ${theme}. Provide 5-7 key plot points.`
    
    const response = await this.generateContent('plot', prompt, genre)
    
    if (response.success) {
      // Try to split into plot points
      const points = response.content.split('\n').filter(point => point.trim())
      return points.length > 0 ? points : this.fallbackPlots
    }
    
    return this.fallbackPlots
  }

  async generateDialogue(character1: string, character2: string, context: string): Promise<string> {
    const prompt = `Write a dialogue between ${character1} and ${character2} in the context of: ${context}. Make it natural and revealing of character.`
    
    const response = await this.generateContent('dialogue', prompt)
    
    if (response.success && response.content.trim()) {
      return response.content
    }
    
    return this.fallbackDialogues[Math.floor(Math.random() * this.fallbackDialogues.length)]
  }

  async generateCharacter(role: string, genre: string): Promise<any> {
    const prompt = `Create a detailed character for a ${role} in a ${genre} story. Include name, age, description, personality traits, backstory, and motivation.`
    
    const response = await this.generateContent('character', prompt, genre)
    
    try {
      return JSON.parse(response.content)
    } catch {
      return this.fallbackCharacters[Math.floor(Math.random() * this.fallbackCharacters.length)]
    }
  }

  async analyzeWritingStyle(text: string): Promise<any> {
    // For now, return a mock analysis
    // In a real implementation, you'd use AI to analyze the text
    return {
      tone: 'conversational',
      pace: 'moderate',
      vocabulary: 'accessible',
      sentenceStructure: 'varied',
      themes: ['identity', 'growth'],
      strengths: ['character development', 'dialogue'],
      suggestions: ['Consider adding more sensory details', 'Try varying sentence length for rhythm']
    }
  }
}

export const aiService = AIService.getInstance()
export type { StoryIdea, AIResponse }
