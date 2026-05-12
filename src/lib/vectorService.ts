import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from './prisma'

// Initialize Gemini AI for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export interface WorldEmbedding {
  id: string
  worldId: string
  content: string
  embedding: number[]
  type: 'overview' | 'character' | 'location' | 'culture' | 'history' | 'magic' | 'politics' | 'technology'
  metadata: {
    section: string
    subsection?: string
    importance: number
    createdAt: Date
  }
}

export interface WorldContext {
  worldId: string
  relevantSections: WorldEmbedding[]
  contextSummary: string
  suggestions: string[]
}

class VectorService {
  private static instance: VectorService

  static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService()
    }
    return VectorService.instance
  }

  // Generate embeddings using Gemini
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const prompt = `Generate a semantic embedding vector for the following text. Return only a JSON array of 768 numbers representing the semantic meaning:

Text: "${text}"

Return format: [0.1, 0.2, 0.3, ...] (768 numbers)`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const textResponse = response.text()
      
      // Try to parse the JSON array
      const cleaned = textResponse.replace(/```json|```/g, '').trim()
      const embedding = JSON.parse(cleaned)
      
      if (Array.isArray(embedding) && embedding.length === 768) {
        return embedding
      } else {
        throw new Error('Invalid embedding format')
      }
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Return a fallback embedding
      return this.generateFallbackEmbedding(text)
    }
  }

  // Generate fallback embedding based on text characteristics
  private generateFallbackEmbedding(text: string): number[] {
    const embedding = new Array(768).fill(0)
    const words = text.toLowerCase().split(/\s+/)
    
    // Simple hash-based embedding
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const hash = this.simpleHash(word)
      const index = hash % 768
      embedding[index] += 1 / words.length
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Calculate cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Store world content as embeddings
  async storeWorldContent(worldId: string, worldData: any): Promise<void> {
    const embeddings: WorldEmbedding[] = []
    
    // Overview embedding
    if (worldData.description) {
      const overviewEmbedding = await this.generateEmbedding(
        `World Overview: ${worldData.name}. ${worldData.description}`
      )
      embeddings.push({
        id: `${worldId}_overview`,
        worldId,
        content: worldData.description,
        embedding: overviewEmbedding,
        type: 'overview',
        metadata: {
          section: 'overview',
          importance: 1.0,
          createdAt: new Date()
        }
      })
    }

    // Characters embeddings
    if (worldData.characters && Array.isArray(worldData.characters)) {
      for (const character of worldData.characters) {
        const characterText = `${character.name} - ${character.role}. ${character.description}. Motivation: ${character.motivation}. Appearance: ${character.appearance}. Backstory: ${character.backstory}`
        const characterEmbedding = await this.generateEmbedding(characterText)
        embeddings.push({
          id: `${worldId}_character_${character.id}`,
          worldId,
          content: characterText,
          embedding: characterEmbedding,
          type: 'character',
          metadata: {
            section: 'characters',
            subsection: character.name,
            importance: 0.9,
            createdAt: new Date()
          }
        })
      }
    }

    // Magic system embedding
    if (worldData.magicSystem) {
      const magicEmbedding = await this.generateEmbedding(
        `Magic System: ${worldData.magicSystem}`
      )
      embeddings.push({
        id: `${worldId}_magic`,
        worldId,
        content: worldData.magicSystem,
        embedding: magicEmbedding,
        type: 'magic',
        metadata: {
          section: 'magic',
          importance: 0.8,
          createdAt: new Date()
        }
      })
    }

    // Political system embedding
    if (worldData.politicalSystem) {
      const politicsEmbedding = await this.generateEmbedding(
        `Political System: ${worldData.politicalSystem}`
      )
      embeddings.push({
        id: `${worldId}_politics`,
        worldId,
        content: worldData.politicalSystem,
        embedding: politicsEmbedding,
        type: 'politics',
        metadata: {
          section: 'politics',
          importance: 0.8,
          createdAt: new Date()
        }
      })
    }

    // Culture embedding
    if (worldData.culture) {
      const cultureEmbedding = await this.generateEmbedding(
        `Culture: ${worldData.culture}`
      )
      embeddings.push({
        id: `${worldId}_culture`,
        worldId,
        content: worldData.culture,
        embedding: cultureEmbedding,
        type: 'culture',
        metadata: {
          section: 'culture',
          importance: 0.7,
          createdAt: new Date()
        }
      })
    }

    // Geography embedding
    if (worldData.geography) {
      const geographyEmbedding = await this.generateEmbedding(
        `Geography: ${worldData.geography}`
      )
      embeddings.push({
        id: `${worldId}_geography`,
        worldId,
        content: worldData.geography,
        embedding: geographyEmbedding,
        type: 'location',
        metadata: {
          section: 'geography',
          importance: 0.7,
          createdAt: new Date()
        }
      })
    }

    // History embedding
    if (worldData.history) {
      const historyEmbedding = await this.generateEmbedding(
        `History: ${worldData.history}`
      )
      embeddings.push({
        id: `${worldId}_history`,
        worldId,
        content: worldData.history,
        embedding: historyEmbedding,
        type: 'history',
        metadata: {
          section: 'history',
          importance: 0.6,
          createdAt: new Date()
        }
      })
    }

    // Clear existing embeddings for this world before generating new ones
    await prisma.worldEmbedding.deleteMany({
      where: { worldId }
    })

    // Store embeddings in database
    for (const emb of embeddings) {
      await prisma.worldEmbedding.create({
        data: {
          worldId: emb.worldId,
          content: emb.content,
          embedding: JSON.stringify(emb.embedding),
          type: emb.type,
          section: emb.metadata.section,
          subsection: emb.metadata.subsection || null,
          importance: emb.metadata.importance
        }
      })
    }
  }

  // Retrieve relevant context for a query
  async retrieveContext(worldId: string, query: string, limit: number = 5): Promise<WorldContext> {
    const dbEmbeddings = await prisma.worldEmbedding.findMany({
      where: { worldId }
    })
    
    if (dbEmbeddings.length === 0) {
      return {
        worldId,
        relevantSections: [],
        contextSummary: 'No world context available',
        suggestions: []
      }
    }

    const worldEmbeddings: WorldEmbedding[] = dbEmbeddings.map(emb => ({
      id: emb.id,
      worldId: emb.worldId,
      content: emb.content,
      embedding: JSON.parse(emb.embedding),
      type: emb.type as any,
      metadata: {
        section: emb.section,
        subsection: emb.subsection || undefined,
        importance: emb.importance,
        createdAt: emb.createdAt
      }
    }))

    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query)
    
    // Calculate similarities
    const similarities = worldEmbeddings.map(embedding => ({
      ...embedding,
      similarity: this.cosineSimilarity(queryEmbedding, embedding.embedding)
    }))

    // Sort by similarity and take top results
    const relevantSections = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(item => item.similarity > 0.1) // Only include relevant results

    // Generate context summary
    const contextSummary = relevantSections
      .map(section => `${section.metadata.section}: ${section.content}`)
      .join('\n\n')

    // Generate suggestions based on context
    const suggestions = await this.generateSuggestions(query, relevantSections)

    return {
      worldId,
      relevantSections,
      contextSummary,
      suggestions
    }
  }

  // Generate AI suggestions based on retrieved context
  private async generateSuggestions(query: string, context: any[]): Promise<string[]> {
    try {
      const contextText = context.map(c => c.content).join('\n')
      const prompt = `Based on this world-building context and user query, provide 3 specific suggestions for further development:

Context: ${contextText}

User Query: "${query}"

Provide 3 actionable suggestions that build upon the existing world elements. Each suggestion should be 1-2 sentences and focus on expanding the world in meaningful ways.

Return as a JSON array of strings.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const textResponse = response.text()
      
      const cleaned = textResponse.replace(/```json|```/g, '').trim()
      const suggestions = JSON.parse(cleaned)
      
      return Array.isArray(suggestions) ? suggestions : [
        'Consider expanding the character relationships and dynamics',
        'Develop more detailed locations and settings',
        'Create additional world rules and cultural practices'
      ]
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return [
        'Consider expanding the character relationships and dynamics',
        'Develop more detailed locations and settings',
        'Create additional world rules and cultural practices'
      ]
    }
  }

  // Get all embeddings for a world
  async getWorldEmbeddings(worldId: string): Promise<WorldEmbedding[]> {
    const dbEmbeddings = await prisma.worldEmbedding.findMany({
      where: { worldId }
    })
    return dbEmbeddings.map(emb => ({
      id: emb.id,
      worldId: emb.worldId,
      content: emb.content,
      embedding: JSON.parse(emb.embedding),
      type: emb.type as any,
      metadata: {
        section: emb.section,
        subsection: emb.subsection || undefined,
        importance: emb.importance,
        createdAt: emb.createdAt
      }
    }))
  }

  // Clear world embeddings
  async clearWorldEmbeddings(worldId: string): Promise<void> {
    await prisma.worldEmbedding.deleteMany({
      where: { worldId }
    })
  }
}

export const vectorService = VectorService.getInstance()
