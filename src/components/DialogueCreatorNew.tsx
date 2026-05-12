'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Sparkles, 
  Save, 
  Copy, 
  Globe,
  RefreshCw,
  Users,
  Download,
  Share,
  Edit3,
  Trash2,
  ArrowRight,
  Filter,
  Shuffle,
  Volume2,
  Mic,
  Play,
  Pause,
  VolumeX
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { AIGeneratorLayout } from './ui/AIGeneratorLayout'

interface Dialogue {
  id: string
  title: string
  characters: string[]
  setting: string
  mood: string
  content: string
  genre: string
  createdAt: Date
}

const DIALOGUE_GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Horror',
  'Literary Fiction', 'Young Adult', 'Historical Fiction', 'Dystopian', 'Adventure'
]

const MOODS = [
  'Tense', 'Romantic', 'Comedic', 'Dramatic', 'Mysterious', 'Action-packed',
  'Emotional', 'Suspenseful', 'Intimate', 'Confrontational', 'Supportive', 'Playful'
]

const SETTINGS = [
  'Coffee shop', 'Medieval tavern', 'Space station', 'Victorian library', 'Modern office',
  'Ancient temple', 'Future city', 'Quiet garden', 'Stormy night', 'War zone',
  'Family dinner', 'Secret meeting', 'First date', 'Job interview', 'Funeral'
]

export function DialogueCreatorNew() {
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [selectedSetting, setSelectedSetting] = useState<string>('')
  const [character1, setCharacter1] = useState<string>('')
  const [character2, setCharacter2] = useState<string>('')
  const [selectedWorldId, setSelectedWorldId] = useState<string>('')
  const [worlds, setWorlds] = useState<any[]>([])
  const [generatedDialogue, setGeneratedDialogue] = useState<Dialogue | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedDialogues, setSavedDialogues] = useState<Dialogue[]>([])

  // Load saved dialogues and worlds from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dialoguesRes, worldsRes] = await Promise.all([
          fetch('/api/content/dialogues'),
          fetch('/api/content/worlds')
        ]);
        const dialoguesData = await dialoguesRes.json();
        const worldsData = await worldsRes.json();
        
        if (dialoguesData.success && dialoguesData.data) {
          setSavedDialogues(dialoguesData.data);
        }
        if (worldsData.success && worldsData.data) {
          setWorlds(worldsData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchData();
  }, []);

  const generateDialogue = async () => {
    if (!character1.trim() || !character2.trim()) {
      alert('Please enter both character names')
      return
    }

    setIsGenerating(true)
    setGeneratedDialogue(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dialogue',
          character1: character1,
          character2: character2,
          setting: selectedSetting || 'A quiet room',
          mood: selectedMood || 'conversational',
          genre: selectedGenre || 'general',
          worldId: selectedWorldId || undefined
        })
      })

      const data = await response.json()

      if (data.success && data.data.content) {
        const newDialogue: Dialogue = {
          id: Date.now().toString(),
          title: `Dialogue between ${character1} and ${character2}`,
          characters: [character1, character2],
          setting: selectedSetting || 'A quiet room',
          mood: selectedMood || 'conversational',
          content: data.data.content,
          genre: selectedGenre || 'General',
          createdAt: new Date()
        }
        setGeneratedDialogue(newDialogue)
      } else {
        throw new Error('Invalid response format or no content')
      }
    } catch (error) {
      console.error('Error generating dialogue:', error)
      // Fallback dialogue
      setGeneratedDialogue({
        id: Date.now().toString(),
        title: `Dialogue between ${character1} and ${character2}`,
        characters: [character1, character2],
        setting: selectedSetting || 'A quiet room',
        mood: selectedMood || 'conversational',
        content: `${character1}: "I've been thinking about what you said earlier."\n\n${character2}: "Oh? What part specifically?"\n\n${character1}: "The part about taking risks. I think you might be right."\n\n${character2}: "I usually am. But I'm curious - what changed your mind?"\n\n${character1}: "Maybe I've been too cautious. Life's too short to always play it safe."\n\n${character2}: "Now that's the spirit I was hoping to hear."`,
        genre: selectedGenre || 'General',
        createdAt: new Date()
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveDialogue = async () => {
    if (generatedDialogue) {
      try {
        const response = await fetch('/api/content/dialogues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: generatedDialogue.title,
            characters: generatedDialogue.characters,
            setting: generatedDialogue.setting,
            mood: generatedDialogue.mood,
            content: generatedDialogue.content,
            genre: generatedDialogue.genre
          })
        })

        const data = await response.json()
        
        if (data.success) {
          const savedDialogue = { ...generatedDialogue, id: data.dialogue.id }
          setSavedDialogues(prev => [savedDialogue, ...prev])
        } else {
          console.error('Failed to save dialogue:', data.error)
          const savedDialogue = { ...generatedDialogue, id: `saved-${Date.now()}` }
          setSavedDialogues(prev => [savedDialogue, ...prev])
        }
      } catch (error) {
        console.error('Error saving dialogue:', error)
        const savedDialogue = { ...generatedDialogue, id: `saved-${Date.now()}` }
        setSavedDialogues(prev => [savedDialogue, ...prev])
      }
    }
  }

  const copyDialogue = async () => {
    if (generatedDialogue) {
      const dialogueText = `${generatedDialogue.title}\n\nSetting: ${generatedDialogue.setting}\nMood: ${generatedDialogue.mood}\nGenre: ${generatedDialogue.genre}\n\n${generatedDialogue.content}`
      
      try {
        await navigator.clipboard.writeText(dialogueText)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const deleteDialogue = (id: string) => {
    setSavedDialogues(prev => prev.filter(dialogue => dialogue.id !== id))
  }

  const exportDialogues = () => {
    const dataStr = JSON.stringify(savedDialogues, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dialogues.json'
    link.click()
  }

  const generateRandomDialogue = () => {
    const randomGenre = DIALOGUE_GENRES[Math.floor(Math.random() * DIALOGUE_GENRES.length)]
    const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)]
    const randomSetting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)]
    
    setSelectedGenre(randomGenre)
    setSelectedMood(randomMood)
    setSelectedSetting(randomSetting)
    
    // Generate random character names
    const randomNames = [
      ['Alex', 'Jordan'], ['Sam', 'Taylor'], ['Casey', 'Morgan'], 
      ['Riley', 'Avery'], ['Quinn', 'Sage'], ['River', 'Phoenix']
    ]
    const randomPair = randomNames[Math.floor(Math.random() * randomNames.length)]
    
    setCharacter1(randomPair[0])
    setCharacter2(randomPair[1])
  }

  const useDialogueInStory = (dialogue: Dialogue) => {
    const storyPrompt = `Create a story scene that includes this dialogue: "${dialogue.title}" - ${dialogue.content}. Setting: ${dialogue.setting}. Mood: ${dialogue.mood}.`
    localStorage.setItem('ai_assistant_prompt', storyPrompt)
    localStorage.setItem('ai_assistant_template', 'dialogue')
    window.dispatchEvent(new CustomEvent('navigateToAssistant'))
  }

  return (
    <AIGeneratorLayout
      title="Dialogue Creator"
      subtitle="Craft authentic character conversations with AI"
      formControls={
        <div className="space-y-4">
          {worlds.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Context World (Optional)
              </label>
              <select
                value={selectedWorldId}
                onChange={(e) => setSelectedWorldId(e.target.value)}
                className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
              >
                <option value="">None - Standalone Dialogue</option>
                {worlds.map(world => (
                  <option key={world.id} value={world.id}>{world.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Character 1</label>
              <input
                type="text"
                value={character1}
                onChange={(e) => setCharacter1(e.target.value)}
                className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
                placeholder="e.g., Elara"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Character 2</label>
              <input
                type="text"
                value={character2}
                onChange={(e) => setCharacter2(e.target.value)}
                className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
                placeholder="e.g., Marcus"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Genre</label>
              <input
                list="dialogue-genres"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                placeholder="Select or type a genre"
                className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
              />
              <datalist id="dialogue-genres">
                {DIALOGUE_GENRES.map(genre => (
                  <option key={genre} value={genre} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Mood</label>
                <input
                  list="dialogue-moods"
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  placeholder="Select or type a mood"
                  className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
                />
                <datalist id="dialogue-moods">
                  {MOODS.map(mood => (
                    <option key={mood} value={mood} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Setting</label>
                <input
                  type="text"
                  value={selectedSetting}
                  onChange={(e) => setSelectedSetting(e.target.value)}
                  className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
                  placeholder="e.g., Coffee shop"
                />
              </div>
            </div>
          </div>
        </div>
      }
      generateButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateDialogue}
          disabled={isGenerating || !character1.trim() || !character2.trim()}
          className="bg-[var(--cx-ink-primary)] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isGenerating ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Dialogue</>
          )}
        </motion.button>
      }
      randomButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateRandomDialogue}
          disabled={isGenerating}
          className="bg-[#FDFBF7] border-2 border-[#D8C2A4] text-[#3B2418] px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-[#F2EFE8] disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          <Shuffle className="w-5 h-5" /> Random
        </motion.button>
      }
      generatedContent={
        generatedDialogue ? (
          <div className="p-6">
            <DialogueCard
              dialogue={generatedDialogue}
              onSave={saveDialogue}
              onCopy={copyDialogue}
              onUseInStory={() => useDialogueInStory(generatedDialogue)}
              isSaved={savedDialogues.some(saved => saved.title === generatedDialogue.title)}
            />
          </div>
        ) : null
      }
      savedCount={savedDialogues.length}
      onExport={exportDialogues}
      savedContent={
        savedDialogues.map((dialogue) => (
          <SavedDialogueCard
            key={dialogue.id}
            dialogue={dialogue}
            onDelete={() => deleteDialogue(dialogue.id)}
            onUseInStory={() => useDialogueInStory(dialogue)}
          />
        ))
      }
    />
  )
}

function DialogueCard({ 
  dialogue, 
  onSave, 
  onCopy, 
  onUseInStory, 
  isSaved 
}: { 
  dialogue: Dialogue
  onSave: () => void
  onCopy: () => void
  onUseInStory: () => void
  isSaved: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card animate-fade-in-up"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-2xl font-bold text-neutral-800 mb-2">{dialogue.title}</h4>
          <div className="flex items-center gap-3">
            <span className="badge badge-primary">{dialogue.genre}</span>
            <span className="badge badge-secondary">{dialogue.mood}</span>
            <span className="badge badge-success">{dialogue.setting}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopy}
            className="p-2 text-neutral-500 hover:text-[#8D6B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
            title="Copy dialogue"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          {!isSaved && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              className="p-2 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save dialogue"
            >
              <Save className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="bg-[#FDFBF7] p-8 rounded-xl border border-neutral-200 shadow-sm">
        <div className="prose prose-lg max-w-none prose-stone prose-p:leading-relaxed prose-strong:text-[var(--cx-ink-primary)] prose-em:text-neutral-500">
          <ReactMarkdown>{dialogue.content}</ReactMarkdown>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUseInStory}
        className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
      >
        <MessageSquare className="w-4 h-4" />
        Use in Story
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

function SavedDialogueCard({ 
  dialogue, 
  onDelete, 
  onUseInStory 
}: { 
  dialogue: Dialogue
  onDelete: () => void
  onUseInStory: () => void
}) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-neutral-800">{dialogue.title}</h5>
          <div className="flex gap-1 mt-1">
            <span className="badge badge-primary text-xs">{dialogue.genre}</span>
            <span className="badge badge-secondary text-xs">{dialogue.mood}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
          title="Delete dialogue"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
        {dialogue.content.substring(0, 100)}...
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUseInStory}
        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1"
      >
        <MessageSquare className="w-3 h-3" />
        Use in Story
      </motion.button>
    </div>
  )
}

