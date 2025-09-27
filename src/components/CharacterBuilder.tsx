'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles,
  Save,
  RefreshCw,
  Star,
  Heart,
  Brain,
  Target,
  Zap,
  Shield,
  Eye,
  MessageSquare
} from 'lucide-react'
import { StoryGenerator } from '@/lib/writingUtils'

interface Character {
  id: string
  name: string
  description: string
  role: string
  personality: string
  backstory: string
  appearance: string
  voice: string
  motivation: string
  fear: string
  flaw: string
  strength: string
  relationships: string[]
  arc: string
  isProtagonist?: boolean
  isAntagonist?: boolean
}

const CHARACTER_ROLES = [
  'Protagonist',
  'Antagonist',
  'Supporting Character',
  'Mentor',
  'Sidekick',
  'Love Interest',
  'Villain',
  'Comic Relief'
]

const PERSONALITY_TRAITS = [
  'Brave', 'Cautious', 'Charismatic', 'Introverted', 'Extroverted',
  'Logical', 'Emotional', 'Creative', 'Analytical', 'Impulsive',
  'Patient', 'Ambitious', 'Loyal', 'Deceptive', 'Honest',
  'Optimistic', 'Pessimistic', 'Confident', 'Insecure', 'Wise'
]

export function CharacterBuilder() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'develop' | 'relationships'>('create')

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: 'New Character',
      description: '',
      role: 'Supporting Character',
      personality: '',
      backstory: '',
      appearance: '',
      voice: '',
      motivation: '',
      fear: '',
      flaw: '',
      strength: '',
      relationships: [],
      arc: ''
    }
    setCharacters(prev => [...prev, newCharacter])
    setActiveCharacter(newCharacter)
    setActiveTab('develop')
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    )
    
    if (activeCharacter?.id === id) {
      setActiveCharacter(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id))
    if (activeCharacter?.id === id) {
      setActiveCharacter(null)
    }
  }

  const generateCharacterDetails = async (field: string) => {
    if (!activeCharacter) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CHARACTER_DEVELOPMENT',
          prompt: `Develop the ${field} for a character named ${activeCharacter.name}, who is a ${activeCharacter.role}. Current details: ${JSON.stringify(activeCharacter)}. Focus specifically on ${field}.`,
          length: 'medium'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        updateCharacter(activeCharacter.id, { [field]: data.data.content })
      }
    } catch (error) {
      console.error('Error generating character details:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRandomCharacter = async () => {
    setIsGenerating(true)
    
    try {
      const traits = StoryGenerator.generateCharacterTraits()
      const randomPersonality = traits.personality[Math.floor(Math.random() * traits.personality.length)]
      const randomBackground = traits.background[Math.floor(Math.random() * traits.background.length)]
      const randomMotivation = traits.motivation[Math.floor(Math.random() * traits.motivation.length)]

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CHARACTER_DEVELOPMENT',
          prompt: `Create a complete character with the following traits: Personality: ${randomPersonality}, Background: ${randomBackground}, Motivation: ${randomMotivation}. Generate a name, detailed description, backstory, appearance, voice, fears, flaws, and strengths.`,
          length: 'long'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Parse the generated character data
        const characterData = parseCharacterData(data.data.content)
        const newCharacter: Character = {
          id: `char-${Date.now()}`,
          name: characterData.name || 'Generated Character',
          description: characterData.description || '',
          role: characterData.role || 'Supporting Character',
          personality: characterData.personality || randomPersonality,
          backstory: characterData.backstory || '',
          appearance: characterData.appearance || '',
          voice: characterData.voice || '',
          motivation: characterData.motivation || randomMotivation,
          fear: characterData.fear || '',
          flaw: characterData.flaw || '',
          strength: characterData.strength || '',
          relationships: characterData.relationships || [],
          arc: characterData.arc || ''
        }
        
        setCharacters(prev => [...prev, newCharacter])
        setActiveCharacter(newCharacter)
        setActiveTab('develop')
      }
    } catch (error) {
      console.error('Error generating character:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const parseCharacterData = (content: string): Partial<Character> => {
    // This is a simplified parser - in a real app, you'd want more sophisticated parsing
    const data: Partial<Character> = {}
    const lines = content.split('\n').filter(line => line.trim())
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('name:')) data.name = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('description:')) data.description = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('personality:')) data.personality = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('backstory:')) data.backstory = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('appearance:')) data.appearance = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('voice:')) data.voice = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('motivation:')) data.motivation = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('fear:')) data.fear = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('flaw:')) data.flaw = line.split(':')[1]?.trim() || ''
      if (lowerLine.includes('strength:')) data.strength = line.split(':')[1]?.trim() || ''
    })
    
    return data
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Character Builder</h1>
          </div>
          <p className="text-green-100">
            Create rich, three-dimensional characters that drive your story forward
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Character Library
            </button>
            <button
              onClick={() => setActiveTab('develop')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'develop'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Character Development
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'relationships'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Relationships
            </button>
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'create' && (
              <CharacterLibraryTab
                characters={characters}
                activeCharacter={activeCharacter}
                onSetActiveCharacter={setActiveCharacter}
                onAddCharacter={addCharacter}
                onGenerateRandomCharacter={generateRandomCharacter}
                onDeleteCharacter={deleteCharacter}
                isGenerating={isGenerating}
              />
            )}
            
            {activeTab === 'develop' && (
              <CharacterDevelopmentTab
                activeCharacter={activeCharacter}
                onUpdateCharacter={updateCharacter}
                onGenerateDetails={generateCharacterDetails}
                isGenerating={isGenerating}
              />
            )}
            
            {activeTab === 'relationships' && (
              <RelationshipsTab
                characters={characters}
                activeCharacter={activeCharacter}
                onUpdateCharacter={updateCharacter}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function CharacterLibraryTab({
  characters,
  activeCharacter,
  onSetActiveCharacter,
  onAddCharacter,
  onGenerateRandomCharacter,
  onDeleteCharacter,
  isGenerating
}: {
  characters: Character[]
  activeCharacter: Character | null
  onSetActiveCharacter: (character: Character) => void
  onAddCharacter: () => void
  onGenerateRandomCharacter: () => void
  onDeleteCharacter: (id: string) => void
  isGenerating: boolean
}) {
  return (
    <motion.div
      key="library"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Character Library</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onGenerateRandomCharacter}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Random
          </button>
          <button
            onClick={onAddCharacter}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Character
          </button>
        </div>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              isActive={activeCharacter?.id === character.id}
              onSelect={onSetActiveCharacter}
              onDelete={onDeleteCharacter}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No characters yet</h3>
          <p className="text-gray-600 mb-4">Create your first character to start building your story's cast</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onAddCharacter}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Create Character
            </button>
            <button
              onClick={onGenerateRandomCharacter}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              Generate Random
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function CharacterCard({
  character,
  index,
  isActive,
  onSelect,
  onDelete
}: {
  character: Character
  index: number
  isActive: boolean
  onSelect: (character: Character) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelect(character)}
      className={`bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
        isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
          {character.name.charAt(0)}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(character.id)
          }}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{character.name}</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {character.role}
        </span>
        {character.isProtagonist && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Protagonist
          </span>
        )}
        {character.isAntagonist && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            Antagonist
          </span>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-4">
        {character.description || 'No description yet'}
      </p>

      <div className="space-y-2">
        {character.motivation && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Target className="w-3 h-3" />
            <span className="truncate">{character.motivation}</span>
          </div>
        )}
        {character.fear && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Shield className="w-3 h-3" />
            <span className="truncate">{character.fear}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CharacterDevelopmentTab({
  activeCharacter,
  onUpdateCharacter,
  onGenerateDetails,
  isGenerating
}: {
  activeCharacter: Character | null
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void
  onGenerateDetails: (field: string) => void
  isGenerating: boolean
}) {
  if (!activeCharacter) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No character selected</h3>
        <p className="text-gray-600">Select a character from the library to develop their details</p>
      </div>
    )
  }

  return (
    <motion.div
      key="develop"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{activeCharacter.name}</h2>
          <p className="text-gray-600">{activeCharacter.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateCharacter(activeCharacter.id, { isProtagonist: !activeCharacter.isProtagonist })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCharacter.isProtagonist
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
            }`}
          >
            Protagonist
          </button>
          <button
            onClick={() => onUpdateCharacter(activeCharacter.id, { isAntagonist: !activeCharacter.isAntagonist })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCharacter.isAntagonist
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-800'
            }`}
          >
            Antagonist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <CharacterField
            label="Name"
            value={activeCharacter.name}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { name: value })}
            placeholder="Character name"
          />
          
          <CharacterField
            label="Role"
            value={activeCharacter.role}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { role: value })}
            type="select"
            options={CHARACTER_ROLES}
          />
          
          <CharacterField
            label="Description"
            value={activeCharacter.description}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { description: value })}
            type="textarea"
            placeholder="Brief character description"
            onGenerate={() => onGenerateDetails('description')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Personality"
            value={activeCharacter.personality}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { personality: value })}
            type="textarea"
            placeholder="Personality traits and characteristics"
            onGenerate={() => onGenerateDetails('personality')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Backstory"
            value={activeCharacter.backstory}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { backstory: value })}
            type="textarea"
            placeholder="Character's history and background"
            onGenerate={() => onGenerateDetails('backstory')}
            isGenerating={isGenerating}
          />
        </div>

        {/* Advanced Details */}
        <div className="space-y-4">
          <CharacterField
            label="Appearance"
            value={activeCharacter.appearance}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { appearance: value })}
            type="textarea"
            placeholder="Physical description"
            onGenerate={() => onGenerateDetails('appearance')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Voice & Speech"
            value={activeCharacter.voice}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { voice: value })}
            type="textarea"
            placeholder="How they speak and communicate"
            onGenerate={() => onGenerateDetails('voice')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Motivation"
            value={activeCharacter.motivation}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { motivation: value })}
            placeholder="What drives this character"
            onGenerate={() => onGenerateDetails('motivation')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Greatest Fear"
            value={activeCharacter.fear}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { fear: value })}
            placeholder="What they fear most"
            onGenerate={() => onGenerateDetails('fear')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Fatal Flaw"
            value={activeCharacter.flaw}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { flaw: value })}
            placeholder="Their biggest weakness"
            onGenerate={() => onGenerateDetails('flaw')}
            isGenerating={isGenerating}
          />
          
          <CharacterField
            label="Greatest Strength"
            value={activeCharacter.strength}
            onChange={(value) => onUpdateCharacter(activeCharacter.id, { strength: value })}
            placeholder="Their defining strength"
            onGenerate={() => onGenerateDetails('strength')}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </motion.div>
  )
}

function CharacterField({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder = '',
  onGenerate,
  isGenerating = false
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
  placeholder?: string
  onGenerate?: () => void
  isGenerating?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50"
            title="Generate with AI"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      )}
    </div>
  )
}

function RelationshipsTab({
  characters,
  activeCharacter,
  onUpdateCharacter
}: {
  characters: Character[]
  activeCharacter: Character | null
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void
}) {
  if (!activeCharacter) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No character selected</h3>
        <p className="text-gray-600">Select a character to explore their relationships</p>
      </div>
    )
  }

  return (
    <motion.div
      key="relationships"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relationships</h2>
        <p className="text-gray-600">Explore how {activeCharacter.name} relates to other characters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Character Connections</h3>
          {characters.filter(char => char.id !== activeCharacter.id).map(character => (
            <div key={character.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {character.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{character.name}</h4>
                <p className="text-sm text-gray-600">{character.role}</p>
              </div>
              <input
                type="text"
                placeholder="Relationship type"
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => {
                  const relationships = [...activeCharacter.relationships]
                  const existingIndex = relationships.findIndex(rel => rel.includes(character.name))
                  
                  if (existingIndex >= 0) {
                    relationships[existingIndex] = `${character.name}: ${e.target.value}`
                  } else {
                    relationships.push(`${character.name}: ${e.target.value}`)
                  }
                  
                  onUpdateCharacter(activeCharacter.id, { relationships })
                }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Character Arc</h3>
          <textarea
            value={activeCharacter.arc}
            onChange={(e) => onUpdateCharacter(activeCharacter.id, { arc: e.target.value })}
            placeholder="Describe how this character changes throughout the story"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Character Summary</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Role:</strong> {activeCharacter.role}</p>
              <p><strong>Motivation:</strong> {activeCharacter.motivation || 'Not defined'}</p>
              <p><strong>Fear:</strong> {activeCharacter.fear || 'Not defined'}</p>
              <p><strong>Strength:</strong> {activeCharacter.strength || 'Not defined'}</p>
              <p><strong>Flaw:</strong> {activeCharacter.flaw || 'Not defined'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
