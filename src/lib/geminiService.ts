import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

class GeminiService {
  private async generate(prompt: string): Promise<any> {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Attempt to parse JSON if the response is wrapped in a code block or is raw JSON
      try {
        const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        if (cleanedText.startsWith('{') || cleanedText.startsWith('[')) {
          return JSON.parse(cleanedText)
        }
      } catch (e) {
        // Not a valid JSON, return as text
      }
      return text
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate content with AI.')
    }
  }

  private appendStyleContext(prompt: string, authorStyleContext?: string): string {
    if (!authorStyleContext) return prompt;
    return `${prompt}\n\nCRITICAL SYSTEM INSTRUCTION: You must mimic the exact stylistic fingerprint provided below. Adopt the author's precise pacing, vocabulary level, and descriptive tendencies. DO NOT use generic AI filler words.\nAuthor Style Profile:\n${authorStyleContext}`;
  }

  private appendWorldContext(prompt: string, worldContext?: string): string {
    if (!worldContext) return prompt;
    return `${prompt}\n\nCRITICAL WORLD CONTEXT: The user is generating this content within a specific World they created. Ground all generation deeply within the constraints, tone, and lore of this World.\n\nWorld Bible Context:\n${worldContext}`;
  }

  async generateStoryIdea(genre: string, theme: string, authorStyleContext?: string, worldContext?: string): Promise<any> {
    let prompt = `You are an expert creative writing assistant. Generate a highly creative and compelling story idea.
Genre: ${genre}
Theme: ${theme}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "title": "A catchy, intriguing title",
  "concept": "A detailed 2-3 sentence logline/premise",
  "genre": "${genre}",
  "themes": ["${theme}", "Another related theme"],
  "characters": ["Name - Role", "Name - Role"],
  "conflict": "The core internal and external conflict",
  "setting": "A vivid description of the world/setting"
}`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    prompt = this.appendWorldContext(prompt, worldContext);
    return this.generate(prompt)
  }

  async generateCharacter(name: string, role: string, genre: string, authorStyleContext?: string, worldContext?: string): Promise<any> {
    let prompt = `You are an expert character developer. Create a deeply fleshed-out character profile.
Role: ${role}
Genre: ${genre}
Name: ${name || 'Choose a fitting name'}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "name": "Character Name",
  "role": "${role}",
  "age": 25,
  "description": "A 2-3 sentence engaging overview of who they are",
  "personality": ["Trait 1", "Trait 2", "Trait 3"],
  "backstory": "A compelling 1-2 paragraph history that explains how they became who they are",
  "motivation": "Their deepest driving desire or goal",
  "appearance": "Distinctive physical traits and clothing style",
  "skills": ["Skill 1", "Skill 2"],
  "flaws": ["Flaw 1", "Flaw 2"],
  "relationships": ["Name - Relationship dynamics"]
}`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    prompt = this.appendWorldContext(prompt, worldContext);
    return this.generate(prompt)
  }

  async generatePlotOutline(genre: string, theme: string, authorStyleContext?: string, worldContext?: string): Promise<any> {
    let prompt = `You are a master storyteller. Create a highly detailed plot outline.
Genre: ${genre}
Theme: ${theme}

Respond ONLY with a valid JSON array of strings, where each string is a detailed plot point (e.g. ["Inciting Incident: ...", "Rising Action: ...", ...]). Provide 5 to 7 major plot points.`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    prompt = this.appendWorldContext(prompt, worldContext);
    return this.generate(prompt)
  }

  async generateDialogue(character1: string, character2: string, context: string, authorStyleContext?: string, worldContext?: string): Promise<any> {
    let prompt = `You are an expert dialogue writer for film and literature. Write an authentic, engaging dialogue scene.
Characters: ${character1} and ${character2}
Context/Setting: ${context}

Ensure the dialogue reveals subtext, character personality, and advances the mood. Format the output simply as:
${character1}: "..."
${character2}: "..."`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    prompt = this.appendWorldContext(prompt, worldContext);
    return this.generate(prompt)
  }

  async generateWorldBuilding(genre: string, setting: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are an expert world-builder for immersive fiction.
Genre: ${genre}
Setting: ${setting}

Create a vivid, highly detailed world-building document. Describe the environment, the society, culture, conflicts, and unique elements (magic/technology) in evocative, sensory language. Structure it with clear paragraphs.`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  async finalizeWorldBuilding(briefOrChatHistory: string, genre: string, setting: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are an expert world-builder. Based on the following brief/conversation history, generate a comprehensive, structured World Bible.
Genre: ${genre}
Setting: ${setting}
Brief/History:
${briefOrChatHistory}

Respond ONLY with a valid JSON object matching this EXACT structure. Make it highly detailed and imaginative.
{
  "name": "World Name",
  "description": "A comprehensive 2-3 paragraph overview of the world",
  "genre": "${genre}",
  "setting": "${setting}",
  "timePeriod": "e.g., Medieval, Far Future",
  "magicSystem": "Detailed description of magic or advanced tech",
  "technologyLevel": "Current state of technology",
  "politicalSystem": "How the world is governed",
  "culture": "Overview of societal norms and culture",
  "geography": "Key geographical features",
  "history": "A brief history of the world",
  "rules": ["Rule 1", "Rule 2", "Rule 3"],
  "characters": [
    {
      "name": "Character Name",
      "role": "e.g., Protagonist, Villain",
      "description": "Brief description",
      "motivation": "Their goals",
      "relationships": ["Rel 1"],
      "appearance": "Visuals",
      "backstory": "Brief history"
    }
  ]
}`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  async generateWorldDevelopment(query: string, context: string, genre: string, type: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are an expert world-builder for immersive fiction.
Genre: ${genre}
Focus Area: ${type}
Existing Context from World Bible:
${context}

Task: ${query}

Create a highly detailed, evocative, and logically consistent development based on the query and the existing context. Maintain the established lore and expand upon it.`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  async analyzeWritingStyle(text: string): Promise<any> {
    const prompt = `You are an elite literary editor. Analyze the following text's writing style.
Provide specific, actionable, and constructive feedback on:
1. Sentence structure and pacing
2. Tone and voice
3. Descriptiveness and sensory details
4. Areas for improvement

Text to analyze:
"${text}"`
    return this.generate(prompt)
  }

  async generateChatResponse(message: string, context?: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are an expert creative writing assistant and storytelling mentor. 
Your goal is to provide deeply insightful, encouraging, and highly relevant advice to the user.
Always answer directly, provide concrete examples when helpful, and ask thought-provoking questions to help them brainstorm. Do not use generic filler words.

User Message: "${message}"`
    if (context) {
      prompt += `\n\nActive Context/Current Work: ${context}`
    }
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  async generateStoryChapter(storyContext: string, chapterNumber: number, previousChapter?: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are a bestselling author writing a novel. Write Chapter ${chapterNumber} based on the following story context:\n${storyContext}\n`
    if (previousChapter) {
      prompt += `\nThe previous chapter ended with: ${previousChapter}\n`
    }
    prompt += `\nWrite the next chapter, ensuring excellent pacing, show-don't-tell descriptions, and strong character development.`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  async improveText(text: string, focusArea?: string, authorStyleContext?: string): Promise<any> {
    let prompt = `You are a professional editor. Improve the following text.`
    if (focusArea) {
      prompt += ` Focus specifically on drastically improving its ${focusArea}.`
    }
    prompt += `\n\nText:\n"${text}"\n\nProvide the improved text only, without any introductory or concluding remarks.`
    prompt = this.appendStyleContext(prompt, authorStyleContext);
    return this.generate(prompt)
  }

  // Suggestion methods
  async generateWritingTip(context?: string): Promise<any> {
    const base = 'Give me a brief, one-sentence creative writing tip. Be specific and actionable.'
    return this.generate(context ? `${base}\nContext: ${context}` : base)
  }

  async generateCharacterSuggestion(context?: string): Promise<any> {
    const base = 'Give me a brief, one-sentence psychological tip on how to make a fictional character more compelling.'
    return this.generate(context ? `${base}\nContext: ${context}` : base)
  }

  async generatePlotSuggestion(context?: string): Promise<any> {
    const base = 'Give me a brief, one-sentence tip on how to structure a compelling plot twist.'
    return this.generate(context ? `${base}\nContext: ${context}` : base)
  }

  async generateWorldBuildingSuggestion(context?: string): Promise<any> {
    const base = 'Give me a brief, one-sentence tip for effective world-building that affects the characters.'
    return this.generate(context ? `${base}\nContext: ${context}` : base)
  }

  async generateStyleImprovement(context?: string): Promise<any> {
    const base = 'Give me a brief, one-sentence advanced tip on how to improve writing style (e.g. rhythm, syntax).'
    return this.generate(context ? `${base}\nContext: ${context}` : base)
  }

  async generateGeneralSuggestion(customPrompt?: string): Promise<any> {
    const prompt = customPrompt || "Give me a brief, encouraging, one-sentence suggestion for a writer struggling with writer's block."
    return this.generate(prompt)
  }
}

const geminiAI = new GeminiService()
export default geminiAI
export { geminiAI }
