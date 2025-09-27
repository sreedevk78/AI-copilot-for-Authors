export interface WritingMetrics {
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  averageWordsPerSentence: number
  readabilityScore: number
  complexity: 'simple' | 'moderate' | 'complex'
}

export interface WritingStyle {
  tone: string[]
  pacing: 'slow' | 'medium' | 'fast'
  voice: 'first' | 'second' | 'third'
  tense: 'past' | 'present' | 'future'
  characteristics: string[]
}

export class WritingAnalyzer {
  static analyzeText(text: string): WritingMetrics {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0)

    const wordCount = words.length
    const sentenceCount = sentences.length
    const paragraphCount = paragraphs.length
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const readabilityScore = this.calculateReadabilityScore(words, sentences)

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence,
      readabilityScore,
      complexity: this.determineComplexity(averageWordsPerSentence, readabilityScore)
    }
  }

  static analyzeStyle(text: string): WritingStyle {
    const tone = this.analyzeTone(text)
    const pacing = this.analyzePacing(text)
    const voice = this.analyzeVoice(text)
    const tense = this.analyzeTense(text)
    const characteristics = this.analyzeCharacteristics(text)

    return {
      tone,
      pacing,
      voice,
      tense,
      characteristics
    }
  }

  private static calculateReadabilityScore(words: string[], sentences: string[]): number {
    // Simplified Flesch Reading Ease Score
    const totalSyllables = words.reduce((count, word) => count + this.countSyllables(word), 0)
    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = totalSyllables / words.length

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    return Math.max(0, Math.min(100, score))
  }

  private static countSyllables(word: string): number {
    const vowels = 'aeiouy'
    let count = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase()
      const isVowel = vowels.includes(char)
      
      if (isVowel && !previousWasVowel) {
        count++
      }
      previousWasVowel = isVowel
    }

    // Handle silent 'e'
    if (word.endsWith('e') && count > 1) {
      count--
    }

    return Math.max(1, count)
  }

  private static determineComplexity(averageWordsPerSentence: number, readabilityScore: number): 'simple' | 'moderate' | 'complex' {
    if (averageWordsPerSentence < 12 && readabilityScore > 70) return 'simple'
    if (averageWordsPerSentence > 20 || readabilityScore < 30) return 'complex'
    return 'moderate'
  }

  private static analyzeTone(text: string): string[] {
    const tones = []
    const lowerText = text.toLowerCase()

    // Emotional tone indicators
    const toneMap = {
      'formal': ['however', 'therefore', 'furthermore', 'consequently', 'nevertheless'],
      'casual': ['okay', 'yeah', 'gonna', 'wanna', 'kinda', 'sorta'],
      'humorous': ['funny', 'hilarious', 'laugh', 'joke', 'wit', 'comedy'],
      'serious': ['important', 'critical', 'urgent', 'serious', 'grave', 'severe'],
      'dramatic': ['suddenly', 'dramatically', 'intensely', 'powerfully', 'striking'],
      'romantic': ['love', 'heart', 'passion', 'romantic', 'affection', 'devotion'],
      'mysterious': ['secret', 'hidden', 'unknown', 'mystery', 'enigma', 'puzzle']
    }

    for (const [tone, keywords] of Object.entries(toneMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        tones.push(tone)
      }
    }

    return tones.length > 0 ? tones : ['neutral']
  }

  private static analyzePacing(text: string): 'slow' | 'medium' | 'fast' {
    const sentences = text.split(/[.!?]+/)
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length
    
    if (avgWordsPerSentence > 20) return 'slow'
    if (avgWordsPerSentence < 10) return 'fast'
    return 'medium'
  }

  private static analyzeVoice(text: string): 'first' | 'second' | 'third' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('i ') || lowerText.includes(' we ') || lowerText.includes(' my ')) {
      return 'first'
    }
    if (lowerText.includes(' you ') || lowerText.includes(' your ')) {
      return 'second'
    }
    return 'third'
  }

  private static analyzeTense(text: string): 'past' | 'present' | 'future' {
    const lowerText = text.toLowerCase()
    
    // Check for future tense indicators
    if (lowerText.includes(' will ') || lowerText.includes(' going to ') || lowerText.includes(' shall ')) {
      return 'future'
    }
    
    // Check for past tense indicators
    if (lowerText.includes(' was ') || lowerText.includes(' were ') || lowerText.includes(' had ') || 
        lowerText.includes(' did ') || lowerText.includes(' -ed ') || lowerText.match(/\b\w+ed\b/)) {
      return 'past'
    }
    
    return 'present'
  }

  private static analyzeCharacteristics(text: string): string[] {
    const characteristics = []
    const lowerText = text.toLowerCase()

    // Dialogue analysis
    const dialogueCount = (text.match(/"/g) || []).length / 2
    if (dialogueCount > 3) characteristics.push('Dialogue-rich')

    // Description analysis
    const descriptiveWords = ['beautiful', 'vivid', 'stunning', 'magnificent', 'breathtaking', 'colorful', 'bright', 'dark']
    if (descriptiveWords.some(word => lowerText.includes(word))) {
      characteristics.push('Descriptive')
    }

    // Action analysis
    const actionWords = ['ran', 'jumped', 'fought', 'chased', 'exploded', 'screamed', 'dashed', 'leaped']
    if (actionWords.some(word => lowerText.includes(word))) {
      characteristics.push('Action-packed')
    }

    // Emotional analysis
    const emotionalWords = ['love', 'hate', 'fear', 'joy', 'anger', 'sadness', 'excitement', 'anxiety']
    if (emotionalWords.some(word => lowerText.includes(word))) {
      characteristics.push('Emotional')
    }

    // Technical analysis
    const technicalWords = ['system', 'process', 'method', 'technique', 'algorithm', 'data', 'analysis']
    if (technicalWords.some(word => lowerText.includes(word))) {
      characteristics.push('Technical')
    }

    return characteristics
  }
}

export class StoryGenerator {
  static generateStoryIdeas(genre?: string, themes?: string[]): string[] {
    const baseIdeas = [
      "A time traveler discovers they can only go back to moments of their greatest regrets",
      "In a world where memories can be bought and sold, someone discovers their past was stolen",
      "A small town where everyone knows the exact date they'll die, except for one person",
      "A library where the books write themselves based on the reader's thoughts",
      "A detective who can solve crimes by tasting the emotions left at crime scenes",
      "A person who can see the potential future of every decision they make",
      "A world where music has the power to physically shape reality",
      "A character who realizes they're a background character in someone else's story",
      "A society where people are judged by the color of their dreams",
      "A person who can communicate with the deceased, but only through unfinished business"
    ]

    if (genre) {
      return baseIdeas.filter(idea => this.matchesGenre(idea, genre))
    }

    return baseIdeas.slice(0, 5)
  }

  private static matchesGenre(idea: string, genre: string): boolean {
    const genreKeywords: Record<string, string[]> = {
      'science fiction': ['time', 'future', 'world', 'reality', 'system'],
      'fantasy': ['magic', 'world', 'power', 'society', 'dreams'],
      'mystery': ['detective', 'crime', 'discover', 'realize', 'business'],
      'romance': ['love', 'heart', 'relationship', 'emotional'],
      'horror': ['fear', 'dark', 'death', 'nightmare', 'ghost'],
      'thriller': ['chase', 'danger', 'secret', 'hidden', 'threat']
    }

    const keywords = genreKeywords[genre.toLowerCase()] || []
    return keywords.some((keyword: string) => idea.toLowerCase().includes(keyword))
  }

  static generateCharacterTraits(): { personality: string[], background: string[], motivation: string[] } {
    return {
      personality: [
        'Curious and adventurous',
        'Cautious and methodical',
        'Charismatic and charming',
        'Introverted and thoughtful',
        'Bold and impulsive',
        'Loyal and protective',
        'Creative and artistic',
        'Logical and analytical'
      ],
      background: [
        'Former military officer',
        'Small business owner',
        'Academic researcher',
        'Artist or musician',
        'Journalist or writer',
        'Medical professional',
        'Engineer or scientist',
        'Teacher or mentor'
      ],
      motivation: [
        'Seeking redemption for past mistakes',
        'Protecting loved ones',
        'Discovering the truth',
        'Achieving personal growth',
        'Righting a wrong',
        'Finding their purpose',
        'Overcoming fear',
        'Making a difference'
      ]
    }
  }

  static generatePlotPoints(storyType: 'hero\'s journey' | 'three act' | 'five act'): string[] {
    const plotStructures = {
      'hero\'s journey': [
        'Call to Adventure',
        'Refusal of the Call',
        'Meeting the Mentor',
        'Crossing the Threshold',
        'Tests and Trials',
        'Approach to the Inmost Cave',
        'The Ordeal',
        'Reward and Return',
        'The Road Back',
        'Resurrection',
        'Return with the Elixir'
      ],
      'three act': [
        'Act I: Setup and Inciting Incident',
        'Act I: Plot Point One',
        'Act II: Rising Action and Obstacles',
        'Act II: Midpoint Twist',
        'Act II: Dark Moment',
        'Act II: Plot Point Two',
        'Act III: Climax',
        'Act III: Resolution'
      ],
      'five act': [
        'Act I: Exposition',
        'Act II: Rising Action',
        'Act III: Climax',
        'Act IV: Falling Action',
        'Act V: Resolution'
      ]
    }

    return plotStructures[storyType] || plotStructures['three act']
  }
}

export class DialogueGenerator {
  static generateDialoguePrompts(): string[] {
    return [
      'A heated argument between two characters with opposing views',
      'A tender moment of reconciliation',
      'A mysterious conversation with hidden meanings',
      'A comedic misunderstanding',
      'A confession of love or betrayal',
      'A negotiation or deal-making scene',
      'A mentor teaching a student',
      'A farewell between close friends',
      'A first meeting between strangers',
      'A confrontation between hero and villain'
    ]
  }

  static analyzeDialogue(text: string): {
    authenticity: number
    characterDistinction: number
    subtext: boolean
    suggestions: string[]
  } {
    const suggestions = []
    let authenticity = 0.7
    let characterDistinction = 0.5
    let subtext = false

    // Check for authentic dialogue markers
    if (text.includes('"') || text.includes("'")) authenticity += 0.2
    if (text.includes('...') || text.includes('—')) authenticity += 0.1
    if (text.includes('said') || text.includes('asked')) authenticity += 0.1

    // Check for character distinction
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/))
    if (uniqueWords.size > 20) characterDistinction += 0.2
    if (text.includes('!') || text.includes('?')) characterDistinction += 0.1

    // Check for subtext
    if (text.includes('implied') || text.includes('suggested') || 
        text.includes('hinted') || text.includes('unspoken')) {
      subtext = true
    }

    // Generate suggestions
    if (authenticity < 0.7) suggestions.push('Add more natural speech patterns')
    if (characterDistinction < 0.6) suggestions.push('Develop distinct character voices')
    if (!subtext) suggestions.push('Consider adding subtext to dialogue')

    return {
      authenticity: Math.min(authenticity, 1.0),
      characterDistinction: Math.min(characterDistinction, 1.0),
      subtext,
      suggestions
    }
  }
}
