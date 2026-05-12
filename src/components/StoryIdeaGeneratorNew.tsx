'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  Sparkles, 
  Save, 
  Copy, 
  RefreshCw,
  Star,
  BookOpen,
  Heart,
  Zap,
  Users,
  ArrowRight,
  Filter,
  Shuffle,
  Download,
  Share,
  Trash2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { AIGeneratorLayout } from './ui/AIGeneratorLayout'

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
  createdAt: Date
}

const GENRES = [
  'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Horror',
  'Literary Fiction', 'Young Adult', 'Historical Fiction', 'Dystopian', 'Adventure'
]

const THEMES = [
  'Identity', 'Love', 'Power', 'Sacrifice', 'Redemption', 'Coming of Age',
  'Family', 'Friendship', 'Justice', 'Freedom', 'Technology', 'Nature',
  'Time', 'Memory', 'Dreams', 'Survival', 'Betrayal', 'Discovery'
]

export function StoryIdeaGeneratorNew() {
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [generatedIdeas, setGeneratedIdeas] = useState<StoryIdea[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<StoryIdea[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate')

  // Load saved ideas from backend and localStorage
  useEffect(() => {
    const loadSavedIdeas = async () => {
      try {
        // Try to load from backend first
        const response = await fetch('/api/content/story-ideas')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            // Convert backend data to component format
            const ideas = data.data.map((item: any) => ({
              id: item.id,
              title: item.title,
              concept: item.concept,
              genre: item.genre,
              themes: item.themes ? JSON.parse(item.themes) : [],
              characters: item.characters ? JSON.parse(item.characters) : [],
              conflict: item.conflict,
              setting: item.setting,
              potential: item.potential,
              createdAt: new Date(item.createdAt)
            }))
            setSavedIdeas(ideas)
            return
          }
        }
      } catch (error) {
        console.error('Error loading saved ideas from backend:', error)
      }

      // Fallback to localStorage
      const saved = localStorage.getItem('saved-story-ideas')
      if (saved) {
        try {
          setSavedIdeas(JSON.parse(saved))
        } catch (error) {
          console.error('Error loading saved ideas from localStorage:', error)
        }
      }
    }

    loadSavedIdeas()
  }, [])

  // Save ideas to localStorage
  useEffect(() => {
    localStorage.setItem('saved-story-ideas', JSON.stringify(savedIdeas))
  }, [savedIdeas])

  const generateIdeas = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'story_idea',
          genre: selectedGenre || 'fantasy',
          theme: selectedThemes.length > 0 ? selectedThemes[0] : 'adventure'
        })
      })

      const data = await response.json()
      
      if (data.success && data.data.content) {
        const aiIdea = data.data.content
        const newIdea: StoryIdea = {
          id: Date.now().toString(),
          title: aiIdea.title || 'Untitled Story',
          concept: aiIdea.logline || aiIdea.concept || 'A compelling story concept',
          genre: aiIdea.genre || selectedGenre || 'Fantasy',
          themes: Array.isArray(aiIdea.themes) ? aiIdea.themes : [aiIdea.theme || selectedThemes[0] || 'Adventure'],
          characters: Array.isArray(aiIdea.characters) ? aiIdea.characters : ['Character 1', 'Character 2'],
          conflict: aiIdea.conflict || 'An intriguing conflict',
          setting: aiIdea.setting || 'An interesting setting',
          potential: 'high',
          createdAt: new Date()
        }
        setGeneratedIdeas(prev => [newIdea, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating ideas:', error)
      // Fallback idea
      const fallbackIdea: StoryIdea = {
        id: Date.now().toString(),
        title: 'The Mysterious Journey',
        concept: 'A hero embarks on an unexpected adventure that changes their life forever.',
        genre: selectedGenre || 'Fantasy',
        themes: selectedThemes.length > 0 ? selectedThemes : ['Adventure'],
        characters: ['The Hero', 'The Mentor', 'The Antagonist'],
        conflict: 'The hero must overcome their greatest fear to save what they love.',
        setting: 'A world where magic and mystery intertwine',
        potential: 'high',
        createdAt: new Date()
      }
      setGeneratedIdeas(prev => [fallbackIdea, ...prev])
    } finally {
      setIsGenerating(false)
    }
  }

  const saveIdea = async (idea: StoryIdea) => {
    try {
      const response = await fetch('/api/content/story-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          concept: idea.concept,
          genre: idea.genre,
          themes: idea.themes,
          characters: idea.characters,
          conflict: idea.conflict,
          setting: idea.setting,
          potential: idea.potential
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Add to local state with the server ID
        const savedIdea = { ...idea, id: data.storyIdea.id }
        setSavedIdeas(prev => [savedIdea, ...prev])
        // Also save to localStorage as backup
        localStorage.setItem('saved-story-ideas', JSON.stringify([savedIdea, ...savedIdeas]))
      } else {
        console.error('Failed to save idea:', data.error)
        // Fallback to localStorage only
        const savedIdea = { ...idea, id: `saved-${Date.now()}` }
        setSavedIdeas(prev => [savedIdea, ...prev])
      }
    } catch (error) {
      console.error('Error saving idea:', error)
      // Fallback to localStorage only
      const savedIdea = { ...idea, id: `saved-${Date.now()}` }
      setSavedIdeas(prev => [savedIdea, ...prev])
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const deleteSavedIdea = (id: string) => {
    setSavedIdeas(prev => prev.filter(idea => idea.id !== id))
  }

  const exportIdeas = () => {
    const dataStr = JSON.stringify(savedIdeas, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'story-ideas.json'
    link.click()
  }

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const developIdea = (idea: StoryIdea) => {
    const developPrompt = `Develop this story idea further: "${idea.title}" - ${idea.concept}. Create a detailed plot outline, character development, and scene structure.`
    localStorage.setItem('ai_assistant_prompt', developPrompt)
    localStorage.setItem('ai_assistant_template', 'plot')
    window.dispatchEvent(new CustomEvent('navigateToAssistant'))
  }

  const generateRandomIdea = () => {
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)]
    const randomThemes = THEMES.sort(() => 0.5 - Math.random()).slice(0, 2)
    setSelectedGenre(randomGenre)
    setSelectedThemes(randomThemes)
    generateIdeas()
  }

  return (
    <AIGeneratorLayout
      title="Story Idea Generator"
      subtitle="AI-powered creative inspiration for your next masterpiece"
      formControls={
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-2.5">Choose Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedGenre === genre
                      ? 'bg-[var(--cx-ink-primary)] text-white shadow-md'
                      : 'bg-[var(--cx-bg-wash)] text-[var(--cx-ink-secondary)] hover:bg-[var(--cx-bg-panel)] border border-[var(--cx-border)]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-2.5">Select Themes</label>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedThemes.includes(theme)
                      ? 'bg-[var(--cx-ink-primary)] text-white shadow-md'
                      : 'bg-[var(--cx-bg-wash)] text-[var(--cx-ink-secondary)] hover:bg-[var(--cx-bg-panel)] border border-[var(--cx-border)]'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      generateButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateIdeas}
          disabled={isGenerating}
          className="bg-[var(--cx-ink-primary)] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isGenerating ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Ideas</>
          )}
        </motion.button>
      }
      randomButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateRandomIdea}
          disabled={isGenerating}
          className="bg-[#FDFBF7] border-2 border-[#D8C2A4] text-[#3B2418] px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-[#F2EFE8] disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          <Shuffle className="w-5 h-5" /> Random Idea
        </motion.button>
      }
      generatedContent={
        generatedIdeas.length > 0 ? (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold text-[#2A1711] border-b border-[#E8E3D8] pb-4">
              Generated Ideas ({generatedIdeas.length})
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {generatedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onSave={() => saveIdea(idea)}
                  onCopy={() => copyToClipboard(`${idea.title}\n\n${idea.concept}`)}
                  onDevelop={() => developIdea(idea)}
                  isSaved={savedIdeas.some(saved => saved.title === idea.title)}
                />
              ))}
            </div>
          </div>
        ) : null
      }
      savedCount={savedIdeas.length}
      onExport={exportIdeas}
      savedContent={
        savedIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onSave={() => {}}
            onCopy={() => copyToClipboard(`${idea.title}\n\n${idea.concept}`)}
            onDevelop={() => developIdea(idea)}
            isSaved={true}
            onDelete={() => deleteSavedIdea(idea.id)}
          />
        ))
      }
    />
  )
}

function IdeaCard({ 
  idea, 
  onSave, 
  onCopy, 
  onDevelop, 
  isSaved, 
  onDelete 
}: { 
  idea: StoryIdea
  onSave: () => void
  onCopy: () => void
  onDevelop: () => void
  isSaved: boolean
  onDelete?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover-lift"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-neutral-800 mb-2">{idea.title}</h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-primary">{idea.genre}</span>
            <span className={`badge ${
              idea.potential === 'high' ? 'badge-success' : 
              idea.potential === 'medium' ? 'badge-secondary' : 'badge-primary'
            }`}>
              {idea.potential} potential
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopy}
            className="p-2 text-neutral-500 hover:text-[#8D6B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          {!isSaved && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              className="p-2 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none prose-neutral prose-p:leading-relaxed mb-4">
        <ReactMarkdown>{idea.concept}</ReactMarkdown>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Users className="w-4 h-4" />
          <span className="font-medium">Characters:</span>
          <span>{idea.characters.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium flex-shrink-0">Conflict:</span>
          <div className="prose prose-sm max-w-none prose-neutral">
            <ReactMarkdown>{idea.conflict}</ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Heart className="w-4 h-4" />
          <span className="font-medium">Themes:</span>
          <span>{idea.themes.join(', ')}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDevelop}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Develop this idea
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

