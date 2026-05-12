'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Sparkles, 
  Save, 
  Copy, 
  RefreshCw,
  User,
  Heart,
  Globe,
  Brain,
  Sword,
  Crown,
  Shield,
  Eye,
  Zap,
  Download,
  Share,
  Edit3,
  Trash2,
  ArrowRight,
  Filter,
  Shuffle,
  BookOpen,
  Skull,
  HeartHandshake
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { AIGeneratorLayout } from './ui/AIGeneratorLayout'

interface Character {
  id: string
  name: string
  role: string
  age?: number
  description: string
  personality: string[]
  backstory: string
  motivation: string
  appearance: string
  skills: string[]
  flaws: string[]
  relationships: string[]
  createdAt: Date
}

const CHARACTER_ROLES = [
  'Hero', 'Villain', 'Mentor', 'Sidekick', 'Love Interest', 'Antagonist', 'Protagonist',
  'Supporting Character', 'Comic Relief', 'Wise Elder', 'Rebel', 'Guardian', 'Rival'
]

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Horror',
  'Literary Fiction', 'Young Adult', 'Historical Fiction', 'Dystopian', 'Adventure'
]

const PERSONALITY_TRAITS = [
  'Brave', 'Cunning', 'Loyal', 'Mysterious', 'Charismatic', 'Shy', 'Outgoing',
  'Analytical', 'Emotional', 'Stoic', 'Optimistic', 'Pessimistic', 'Creative',
  'Logical', 'Impulsive', 'Patient', 'Ambitious', 'Humble', 'Proud', 'Kind',
  'Sarcastic', 'Witty', 'Serious', 'Playful', 'Determined', 'Flexible'
]

export function CharacterBuilderNew() {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedWorldId, setSelectedWorldId] = useState<string>('')
  const [worlds, setWorlds] = useState<any[]>([])
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([])

  // Load saved characters and worlds from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charsRes, worldsRes] = await Promise.all([
          fetch('/api/content/characters'),
          fetch('/api/content/worlds')
        ]);
        const charsData = await charsRes.json();
        const worldsData = await worldsRes.json();
        
        if (charsData.success && charsData.data) {
          setSavedCharacters(charsData.data);
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

  const generateCharacter = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'character',
          role: selectedRole || 'Hero',
          genre: selectedGenre || 'Fantasy',
          worldId: selectedWorldId || undefined
        })
      })

      const data = await response.json()
      
      if (data.success && data.data.content) {
        const characterData = data.data.content
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: characterData.name || 'Unnamed Character',
          role: characterData.role || selectedRole || 'Hero',
          age: characterData.age || undefined,
          description: characterData.description || 'A compelling character',
          personality: Array.isArray(characterData.personality) ? characterData.personality : ['Mysterious'],
          backstory: characterData.backstory || 'A rich and complex background',
          motivation: characterData.motivation || 'Driven by personal goals',
          appearance: characterData.appearance || 'Distinctive and memorable',
          skills: Array.isArray(characterData.skills) ? characterData.skills : ['Adaptable'],
          flaws: Array.isArray(characterData.flaws) ? characterData.flaws : ['Perfectionist'],
          relationships: Array.isArray(characterData.relationships) ? characterData.relationships : ['Complex'],
          createdAt: new Date()
        }
        setGeneratedCharacter(newCharacter)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating character:', error)
      // Fallback character
      const fallbackCharacter: Character = {
        id: Date.now().toString(),
        name: 'Aria Shadowbane',
        role: selectedRole || 'Hero',
        age: 28,
        description: 'A skilled warrior with a mysterious past',
        personality: ['Brave', 'Mysterious', 'Determined'],
        backstory: 'Raised by a secret order of guardians, Aria has spent years training to protect the innocent.',
        motivation: 'To uncover the truth about her parents\' disappearance',
        appearance: 'Tall with silver hair and piercing blue eyes, bearing the mark of her order',
        skills: ['Combat', 'Stealth', 'Strategy'],
        flaws: ['Trust Issues', 'Impatient'],
        relationships: ['Mentor: Elder Marcus', 'Rival: Dark Knight Kael'],
        createdAt: new Date()
      }
      setGeneratedCharacter(fallbackCharacter)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveCharacter = async () => {
    if (generatedCharacter) {
      try {
        const response = await fetch('/api/content/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: generatedCharacter.name,
            role: generatedCharacter.role,
            age: generatedCharacter.age,
            description: generatedCharacter.description,
            personality: generatedCharacter.personality,
            backstory: generatedCharacter.backstory,
            motivation: generatedCharacter.motivation,
            appearance: generatedCharacter.appearance,
            skills: generatedCharacter.skills,
            flaws: generatedCharacter.flaws,
            relationships: generatedCharacter.relationships
          })
        })

        const data = await response.json()
        
        if (data.success) {
          const savedCharacter = { ...generatedCharacter, id: data.character.id }
          setSavedCharacters(prev => [savedCharacter, ...prev])
        } else {
          console.error('Failed to save character:', data.error)
          const savedCharacter = { ...generatedCharacter, id: `saved-${Date.now()}` }
          setSavedCharacters(prev => [savedCharacter, ...prev])
        }
      } catch (error) {
        console.error('Error saving character:', error)
        const savedCharacter = { ...generatedCharacter, id: `saved-${Date.now()}` }
        setSavedCharacters(prev => [savedCharacter, ...prev])
      }
    }
  }

  const copyCharacter = async () => {
    if (generatedCharacter) {
      const characterText = `Character: ${generatedCharacter.name}
Role: ${generatedCharacter.role}
Description: ${generatedCharacter.description}
Personality: ${generatedCharacter.personality.join(', ')}
Backstory: ${generatedCharacter.backstory}
Motivation: ${generatedCharacter.motivation}
Appearance: ${generatedCharacter.appearance}
Skills: ${generatedCharacter.skills.join(', ')}
Flaws: ${generatedCharacter.flaws.join(', ')}
Relationships: ${generatedCharacter.relationships.join(', ')}`
      
      try {
        await navigator.clipboard.writeText(characterText)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const deleteCharacter = (id: string) => {
    setSavedCharacters(prev => prev.filter(char => char.id !== id))
  }

  const exportCharacters = () => {
    const dataStr = JSON.stringify(savedCharacters, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'characters.json'
    link.click()
  }

  const generateRandomCharacter = () => {
    const randomRole = CHARACTER_ROLES[Math.floor(Math.random() * CHARACTER_ROLES.length)]
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)]
    setSelectedRole(randomRole)
    setSelectedGenre(randomGenre)
    generateCharacter()
  }

  const useCharacterInStory = (character: Character) => {
    const storyPrompt = `Create a story featuring this character: ${character.name} - ${character.description}. Role: ${character.role}. Backstory: ${character.backstory}. Motivation: ${character.motivation}.`
    localStorage.setItem('ai_assistant_prompt', storyPrompt)
    localStorage.setItem('ai_assistant_template', 'idea')
    window.dispatchEvent(new CustomEvent('navigateToAssistant'))
  }

  return (
    <AIGeneratorLayout
      title="Character Builder"
      subtitle="Create compelling characters with AI assistance"
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
                <option value="">None - Standalone Character</option>
                {worlds.map(world => (
                  <option key={world.id} value={world.id}>{world.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Character Role</label>
            <input
              list="character-roles"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="Select or type a role"
              className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
            />
            <datalist id="character-roles">
              {CHARACTER_ROLES.map(role => (
                <option key={role} value={role} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Genre</label>
            <input
              list="character-genres"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              placeholder="Select or type a genre"
              className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
            />
            <datalist id="character-genres">
              {GENRES.map(genre => (
                <option key={genre} value={genre} />
              ))}
            </datalist>
          </div>
        </div>
      }
      generateButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateCharacter}
          disabled={isGenerating}
          className="bg-[var(--cx-ink-primary)] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isGenerating ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Character</>
          )}
        </motion.button>
      }
      randomButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateRandomCharacter}
          disabled={isGenerating}
          className="bg-[#FDFBF7] border-2 border-[#D8C2A4] text-[#3B2418] px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-[#F2EFE8] disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          <Shuffle className="w-5 h-5" /> Random
        </motion.button>
      }
      generatedContent={
        generatedCharacter ? (
          <div className="p-6">
            <CharacterCard
              character={generatedCharacter}
              onSave={saveCharacter}
              onCopy={copyCharacter}
              onUseInStory={() => useCharacterInStory(generatedCharacter)}
              isSaved={savedCharacters.some(saved => saved.name === generatedCharacter.name)}
            />
          </div>
        ) : null
      }
      savedCount={savedCharacters.length}
      onExport={exportCharacters}
      savedContent={
        savedCharacters.map((character) => (
          <SavedCharacterCard
            key={character.id}
            character={character}
            onDelete={() => deleteCharacter(character.id)}
            onUseInStory={() => useCharacterInStory(character)}
          />
        ))
      }
    />
  )
}

function CharacterCard({ 
  character, 
  onSave, 
  onCopy, 
  onUseInStory, 
  isSaved 
}: { 
  character: Character
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
          <h4 className="text-2xl font-bold text-neutral-800 mb-2">{character.name}</h4>
          <div className="flex items-center gap-3">
            <span className="badge badge-primary">{character.role}</span>
            {character.age && <span className="badge badge-secondary">Age: {character.age}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopy}
            className="p-2 text-neutral-500 hover:text-[#8D6B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
            title="Copy character"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          {!isSaved && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              className="p-2 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save character"
            >
              <Save className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Description
          </h5>
          <div className="prose prose-sm max-w-none prose-neutral prose-p:leading-relaxed">
            <ReactMarkdown>{character.description}</ReactMarkdown>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Personality
          </h5>
          <div className="flex flex-wrap gap-2">
            {character.personality.map((trait, index) => (
              <span key={index} className="badge badge-secondary">{trait}</span>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Backstory
          </h5>
          <div className="prose prose-sm max-w-none prose-neutral prose-p:leading-relaxed">
            <ReactMarkdown>{character.backstory}</ReactMarkdown>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Motivation
          </h5>
          <div className="prose prose-sm max-w-none prose-neutral prose-p:leading-relaxed">
            <ReactMarkdown>{character.motivation}</ReactMarkdown>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Skills
            </h5>
            <div className="flex flex-wrap gap-1">
              {character.skills.map((skill, index) => (
                <span key={index} className="badge badge-success text-xs">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Flaws
            </h5>
            <div className="flex flex-wrap gap-1">
              {character.flaws.map((flaw, index) => (
                <span key={index} className="badge badge-primary text-xs">{flaw}</span>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUseInStory}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Use in Story
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

function SavedCharacterCard({ 
  character, 
  onDelete, 
  onUseInStory 
}: { 
  character: Character
  onDelete: () => void
  onUseInStory: () => void
}) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-neutral-800">{character.name}</h5>
          <p className="text-sm text-neutral-600">{character.role}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
          title="Delete character"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{character.description}</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUseInStory}
        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1"
      >
        <BookOpen className="w-3 h-3" />
        Use in Story
      </motion.button>
    </div>
  )
}
