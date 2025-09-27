'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  Sparkles, 
  Shuffle, 
  Save, 
  Copy, 
  RefreshCw,
  Filter,
  Star,
  BookOpen,
  Heart,
  Zap,
  Users
} from 'lucide-react'
import { StoryGenerator } from '@/lib/writingUtils'

interface StoryIdea {
  id: string
  title: string
  concept: string
  genre: string
  themes: string[]
  characters: string[]
  conflict: string
  setting: string
  potential: 'high' | 'medium' | 'low'
}

const GENRES = [
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Literary Fiction',
  'Young Adult',
  'Historical Fiction',
  'Dystopian'
]

const THEMES = [
  'Identity',
  'Love',
  'Power',
  'Sacrifice',
  'Redemption',
  'Coming of Age',
  'Family',
  'Friendship',
  'Justice',
  'Freedom',
  'Technology',
  'Nature',
  'Time',
  'Memory',
  'Dreams'
]

export function StoryIdeaGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [generatedIdeas, setGeneratedIdeas] = useState<StoryIdea[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<StoryIdea[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate')

  const generateIdeas = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STORY_IDEA',
          prompt: `Generate 5 innovative story ideas${selectedGenre ? ` in the ${selectedGenre} genre` : ''}${selectedThemes.length > 0 ? ` exploring themes of ${selectedThemes.join(', ')}` : ''}. Each idea should include a compelling concept, potential characters, conflict, and setting.`,
          genre: selectedGenre,
          length: 'long'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Parse the AI response and create structured ideas
        const ideas = parseGeneratedIdeas(data.data.content)
        setGeneratedIdeas(ideas)
      }
    } catch (error) {
      console.error('Error generating ideas:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const parseGeneratedIdeas = (content: string): StoryIdea[] => {
    // This is a simplified parser - in a real app, you'd want more sophisticated parsing
    const ideas: StoryIdea[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    lines.forEach((line, index) => {
      if (line.match(/^\d+\./)) {
        const ideaText = line.replace(/^\d+\.\s*/, '')
        ideas.push({
          id: `idea-${index}`,
          title: ideaText.substring(0, 50) + '...',
          concept: ideaText,
          genre: selectedGenre || 'General',
          themes: selectedThemes,
          characters: ['Protagonist', 'Antagonist'],
          conflict: 'To be developed',
          setting: 'To be developed',
          potential: Math.random() > 0.5 ? 'high' : 'medium'
        })
      }
    })

    return ideas.slice(0, 5)
  }

  const saveIdea = (idea: StoryIdea) => {
    setSavedIdeas(prev => [...prev, { ...idea, id: `saved-${Date.now()}` }])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Story Idea Generator</h1>
          </div>
          <p className="text-purple-100">
            Get inspired with AI-powered story concepts tailored to your preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Generate Ideas
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Ideas ({savedIdeas.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'generate' ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Genre Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Genre (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedGenre === genre
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Themes (Select multiple)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => toggleTheme(theme)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedThemes.includes(theme)
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateIdeas}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-3 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Story Ideas
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Generated Ideas */}
                <AnimatePresence>
                  {generatedIdeas.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        Generated Ideas
                      </h2>
                      <div className="grid gap-4">
                        {generatedIdeas.map((idea, index) => (
                          <IdeaCard
                            key={idea.id}
                            idea={idea}
                            index={index}
                            onSave={saveIdea}
                            onCopy={copyToClipboard}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Saved Ideas
                </h2>
                {savedIdeas.length > 0 ? (
                  <div className="grid gap-4">
                    {savedIdeas.map((idea, index) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        index={index}
                        isSaved={true}
                        onCopy={copyToClipboard}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No saved ideas yet. Generate some ideas and save your favorites!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function IdeaCard({ 
  idea, 
  index, 
  onSave, 
  onCopy, 
  isSaved = false 
}: { 
  idea: StoryIdea
  index: number
  onSave?: (idea: StoryIdea) => void
  onCopy: (text: string) => void
  isSaved?: boolean
}) {
  const potentialColors = {
    high: 'from-green-500 to-emerald-600',
    medium: 'from-yellow-500 to-orange-600',
    low: 'from-gray-500 to-slate-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${potentialColors[idea.potential]} flex items-center justify-center text-white font-bold text-sm`}>
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {idea.genre}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {idea.potential} potential
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(idea.concept)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!isSaved && onSave && (
            <button
              onClick={() => onSave(idea)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Save idea"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{idea.concept}</p>

      {idea.themes.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-600">Themes:</span>
          <div className="flex flex-wrap gap-1">
            {idea.themes.map((theme) => (
              <span
                key={theme}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {idea.characters.length} characters
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {idea.conflict}
          </span>
        </div>
        
        <button className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors">
          Develop this idea →
        </button>
      </div>
    </motion.div>
  )
}
