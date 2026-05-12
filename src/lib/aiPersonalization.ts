'use client'

/**
 * AI Personalization Service
 *
 * Provides both server-backed (via /api/ai/writing-coach) and client-side
 * content analysis capabilities. The server handles Gemini-powered coaching;
 * the client handles lightweight heuristic analysis for immediate feedback.
 */

/* ── Types ──────────────────────────────────────────────────── */

export interface UserWritingStyle {
  tone: string
  complexity: string
  pacing: string
  dialogueStyle: string
  experience: string
  favoriteGenres: string[]
  writingGoals: string[]
  interests: string[]
}

export interface PersonalizedSuggestion {
  id: string
  type: string
  title: string
  content: string
  context: string
  priority: string
  personalization: {
    basedOnStyle: boolean
    styleElements: string[]
    genreRelevance: string[]
    goalAlignment: string[]
  }
}

export interface ContentAnalysis {
  wordCount: number
  sentenceCount: number
  avgSentenceLength: number
  hasDialogue: boolean
  hasCharacterNames: boolean
  hasWorldDetails: boolean
  hasSensoryLanguage: boolean
  readabilityScore: number    // 0-100 approximation
  dialogueRatio: number       // 0-1 ratio of dialogue to narration
  needsCharacterDevelopment: boolean
  needsPlotDevelopment: boolean
  needsStyleImprovement: boolean
  needsWorldBuilding: boolean
  needsDialogueWork: boolean
  needsPacing: boolean
}

/* ── Suggestion type definitions ────────────────────────────── */

type SuggestionType =
  | 'WRITING_TIP'
  | 'CHARACTER_SUGGESTION'
  | 'PLOT_DEVELOPMENT'
  | 'WORLD_BUILDING'
  | 'STYLE_IMPROVEMENT'
  | 'CREATIVE_INSPIRATION'

/* ── Service ────────────────────────────────────────────────── */

export class AIPersonalizationService {
  private static instance: AIPersonalizationService

  static getInstance(): AIPersonalizationService {
    if (!AIPersonalizationService.instance) {
      AIPersonalizationService.instance = new AIPersonalizationService()
    }
    return AIPersonalizationService.instance
  }

  /* ── Server-backed suggestion generation ──────────────────── */

  /**
   * Fetches AI-generated coaching tips from the server.
   * The server queries the user's full portfolio and calls Gemini.
   */
  async generatePersonalizedSuggestion(
    context: string,
    userStyle: UserWritingStyle,
    suggestionType: string
  ): Promise<PersonalizedSuggestion> {
    try {
      const response = await fetch('/api/ai/writing-coach')
      const data = await response.json()

      if (data.suggestions?.length > 0) {
        const s = data.suggestions[0]
        return {
          id: s.id || Date.now().toString(),
          type: s.type || suggestionType,
          title: s.title,
          content: s.content,
          context: s.context || context,
          priority: s.priority || 'MEDIUM',
          personalization: {
            basedOnStyle: true,
            styleElements: this.extractStyleElements(userStyle),
            genreRelevance: userStyle.favoriteGenres,
            goalAlignment: userStyle.writingGoals,
          },
        }
      }
    } catch (error) {
      console.error('AIPersonalizationService: endpoint unreachable, using fallback', error)
    }

    return this.buildFallbackSuggestion(context, suggestionType, userStyle)
  }

  /**
   * Fetches multiple contextual suggestions from the server.
   */
  async generateContextualSuggestions(
    currentContent: string,
    userStyle: UserWritingStyle,
    contentType: string
  ): Promise<PersonalizedSuggestion[]> {
    // First, run local analysis to determine what kind of tips to request
    const analysis = this.analyzeContent(currentContent, userStyle)
    const suggestions: PersonalizedSuggestion[] = []

    try {
      const response = await fetch('/api/ai/writing-coach')
      const data = await response.json()

      if (data.suggestions?.length > 0) {
        return data.suggestions.map((s: any) => ({
          id: s.id || Date.now().toString(),
          type: s.type || 'WRITING_TIP',
          title: s.title,
          content: s.content,
          context: s.context || contentType,
          priority: s.priority || 'MEDIUM',
          personalization: {
            basedOnStyle: true,
            styleElements: this.extractStyleElements(userStyle),
            genreRelevance: userStyle.favoriteGenres,
            goalAlignment: userStyle.writingGoals,
          },
        }))
      }
    } catch (error) {
      console.error('AIPersonalizationService: contextual suggestions failed', error)
    }

    // Fallback: generate local suggestions based on content analysis
    if (analysis.needsCharacterDevelopment) {
      suggestions.push(this.buildFallbackSuggestion(
        `Character development needed in ${contentType}`,
        'CHARACTER_SUGGESTION',
        userStyle,
      ))
    }
    if (analysis.needsPlotDevelopment) {
      suggestions.push(this.buildFallbackSuggestion(
        `Plot needs more structure in ${contentType}`,
        'PLOT_DEVELOPMENT',
        userStyle,
      ))
    }
    if (analysis.needsStyleImprovement) {
      suggestions.push(this.buildFallbackSuggestion(
        `Style can be sharpened in ${contentType}`,
        'STYLE_IMPROVEMENT',
        userStyle,
      ))
    }
    if (analysis.needsWorldBuilding) {
      suggestions.push(this.buildFallbackSuggestion(
        `World details are thin in ${contentType}`,
        'WORLD_BUILDING',
        userStyle,
      ))
    }
    if (analysis.needsDialogueWork) {
      suggestions.push(this.buildFallbackSuggestion(
        `Dialogue needs more variety in ${contentType}`,
        'CHARACTER_SUGGESTION',
        userStyle,
      ))
    }

    return suggestions
  }

  /* ── Client-side content analysis (heuristic, no AI) ──────── */

  /**
   * Analyzes writing content locally using heuristics.
   * This runs instantly without an API call — useful for real-time
   * feedback while the user is actively writing.
   */
  analyzeContent(content: string, userStyle: UserWritingStyle): ContentAnalysis {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentenceCount = sentences.length
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0

    // Dialogue detection: count lines with quotes
    const dialogueLines = (content.match(/[""][^""]*[""]/g) || []).length
    const hasDialogue = dialogueLines > 0
    const dialogueRatio = sentenceCount > 0 ? dialogueLines / sentenceCount : 0

    // Character name detection (capitalized proper nouns)
    const hasCharacterNames = /[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?/.test(content)

    // World-building detail detection
    const worldKeywords = /\b(forest|mountain|city|kingdom|village|castle|tower|river|ocean|desert|cave|temple|palace|market|harbor|magic|spell|enchant|technology|device|weapon|artifact)\b/i
    const hasWorldDetails = worldKeywords.test(content)

    // Sensory language detection
    const sensoryKeywords = /\b(smell|taste|touch|hear|sound|bright|dark|warm|cold|rough|smooth|loud|quiet|fragrant|bitter|sweet|sharp|soft|glow|shimmer|echo|whisper)\b/i
    const hasSensoryLanguage = sensoryKeywords.test(content)

    // Simple readability approximation (Flesch-like)
    const syllableCount = words.reduce((sum, word) => sum + this.estimateSyllables(word), 0)
    const readabilityScore = sentenceCount > 0 && wordCount > 0
      ? Math.max(0, Math.min(100, 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)))
      : 50

    return {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      hasDialogue,
      hasCharacterNames,
      hasWorldDetails,
      hasSensoryLanguage,
      readabilityScore: Math.round(readabilityScore),
      dialogueRatio: Math.round(dialogueRatio * 100) / 100,
      needsCharacterDevelopment: wordCount > 200 && !hasCharacterNames,
      needsPlotDevelopment: wordCount > 500 && !hasDialogue && avgSentenceLength > 20,
      needsStyleImprovement: wordCount > 100 && (avgSentenceLength > 25 || !hasSensoryLanguage),
      needsWorldBuilding: wordCount > 300 && !hasWorldDetails && userStyle.favoriteGenres.some(g =>
        ['Fantasy', 'Science Fiction', 'Historical Fiction'].includes(g)
      ),
      needsDialogueWork: wordCount > 400 && dialogueRatio < 0.1,
      needsPacing: avgSentenceLength > 20 && userStyle.pacing === 'FAST',
    }
  }

  /* ── Priority determination ───────────────────────────────── */

  determinePriority(context: string, userStyle: UserWritingStyle): string {
    // Urgent for deadline-related goals
    if (userStyle.writingGoals.some(goal =>
      /deadline|urgent|publish|finish/i.test(goal)
    )) {
      return 'HIGH'
    }

    // High for active style/voice work
    if (/style|tone|voice|rewrite/i.test(context)) {
      return 'HIGH'
    }

    // Medium for structural work
    if (/plot|structure|outline|character/i.test(context)) {
      return 'MEDIUM'
    }

    return 'LOW'
  }

  /* ── Title generation ─────────────────────────────────────── */

  generateSuggestionTitle(type: string, userStyle: UserWritingStyle): string {
    const templates: Record<string, string> = {
      WRITING_TIP: `${userStyle.tone} writing tip`,
      CHARACTER_SUGGESTION: `Character depth for ${userStyle.favoriteGenres[0] || 'your genre'}`,
      PLOT_DEVELOPMENT: `Plot structure for ${userStyle.pacing.toLowerCase()} pacing`,
      WORLD_BUILDING: `World-building for ${userStyle.favoriteGenres[0] || 'your story'}`,
      STYLE_IMPROVEMENT: `Voice refinement: ${userStyle.tone.toLowerCase()} tone`,
      CREATIVE_INSPIRATION: 'Fresh creative direction',
    }
    return templates[type] || 'Writing suggestion'
  }

  /* ── Internal helpers ─────────────────────────────────────── */

  private extractStyleElements(userStyle: UserWritingStyle): string[] {
    return [
      userStyle.tone,
      userStyle.complexity,
      userStyle.pacing,
      userStyle.dialogueStyle,
    ].filter(Boolean)
  }

  private estimateSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, '')
    if (w.length <= 3) return 1
    let count = w.match(/[aeiouy]+/g)?.length || 1
    if (w.endsWith('e') && !w.endsWith('le')) count--
    return Math.max(1, count)
  }

  private buildFallbackSuggestion(
    context: string,
    suggestionType: string,
    userStyle: UserWritingStyle,
  ): PersonalizedSuggestion {
    const fallbackContent = this.getFallbackContent(suggestionType, userStyle)

    return {
      id: `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: suggestionType,
      title: this.generateSuggestionTitle(suggestionType, userStyle),
      content: fallbackContent,
      context,
      priority: this.determinePriority(context, userStyle),
      personalization: {
        basedOnStyle: true,
        styleElements: this.extractStyleElements(userStyle),
        genreRelevance: userStyle.favoriteGenres,
        goalAlignment: userStyle.writingGoals,
      },
    }
  }

  private getFallbackContent(type: string, userStyle: UserWritingStyle): string {
    const genre = userStyle.favoriteGenres[0] || 'your chosen genre'
    const tone = userStyle.tone?.toLowerCase() || 'creative'
    const pacing = userStyle.pacing?.toLowerCase() || 'moderate'
    const dialogue = userStyle.dialogueStyle?.toLowerCase() || 'natural'
    const complexity = userStyle.complexity?.toLowerCase() || 'moderate'

    const fallbacks: Record<string, string> = {
      WRITING_TIP: `Your ${tone} tone works well with ${genre}. Try anchoring the next scene with a concrete sensory detail in the first sentence — it pulls the reader in faster than exposition.`,
      CHARACTER_SUGGESTION: `Give your main character a ${dialogue} speaking pattern that breaks under pressure. When they're stressed, their dialogue should shift — shorter sentences, different vocabulary. That contrast reveals depth.`,
      PLOT_DEVELOPMENT: `With ${pacing} pacing, your story needs a turning point every 2,000-3,000 words. Check your current draft — if the reader hasn't been surprised in the last 3 pages, something needs to happen.`,
      WORLD_BUILDING: `Your ${genre} world needs one rule that complicates everything. Magic should have a cost, technology should have a failure mode, society should have a contradiction. That tension makes the world feel real.`,
      STYLE_IMPROVEMENT: `At ${complexity} complexity, every sentence should earn its length. Read your last paragraph aloud — if you stumble, the reader will too. Cut any word that doesn't move the story forward or deepen the feeling.`,
      CREATIVE_INSPIRATION: `What if you wrote the opposite of what your character expects? The ${tone} tone doesn't have to mean predictable outcomes. Subvert one assumption in your next scene.`,
    }

    return fallbacks[type] || `Consider how your ${tone} tone and ${genre} genre interact in your current draft. What tension exists between them?`
  }
}

export const aiPersonalization = AIPersonalizationService.getInstance()
