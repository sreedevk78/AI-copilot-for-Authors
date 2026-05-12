'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  Sparkles, 
  Save, 
  Copy, 
  RefreshCw,
  Users,
  Map,
  Crown,
  Zap,
  BookOpen,
  ArrowRight,
  Trash2,
  Edit3,
  Plus,
  Eye,
  Star,
  Heart,
  Download,
  Share,
  Building,
  Mountain,
  Sun,
  Moon,
  TreePine,
  Waves,
  Flame,
  X,
  Brain
} from 'lucide-react'
import { RAGWorldDevelopment } from './RAGWorldDevelopment'
import { WorldBuildingDisplay } from './RichTextDisplay'
import { AIGeneratorLayout } from './ui/AIGeneratorLayout'

interface WorldCharacter {
  id: string
  name: string
  role: string
  description: string
  motivation: string
  appearance: string
  backstory: string
  relationships: string[]
}

interface World {
  id: string
  name: string
  description: string
  genre: string
  setting: string
  timePeriod?: string
  magicSystem?: string
  technologyLevel?: string
  politicalSystem?: string
  culture?: string
  geography?: string
  history?: string
  rules?: string[]
  characters?: WorldCharacter[]
  timeline?: TimelineEvent[]
  maps?: MapLocation[]
  languages?: Language[]
  religions?: Religion[]
  cultures?: Culture[]
  conflicts?: Conflict[]
  locations?: Location[]
  createdAt?: Date
}

interface TimelineEvent {
  id: string
  year: string
  title: string
  description: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  category: 'political' | 'cultural' | 'technological' | 'magical' | 'natural' | 'military'
}

interface MapLocation {
  id: string
  name: string
  type: 'city' | 'town' | 'village' | 'landmark' | 'region' | 'dungeon' | 'temple'
  coordinates: { x: number; y: number }
  description: string
  population?: number
  ruler?: string
  resources?: string[]
}

interface Language {
  id: string
  name: string
  speakers: string[]
  script: string
  complexity: 'simple' | 'moderate' | 'complex'
  samplePhrases: string[]
  grammar: string
}

interface Religion {
  id: string
  name: string
  followers: string[]
  beliefs: string[]
  practices: string[]
  deities: string[]
  holyTexts: string[]
}

interface Culture {
  id: string
  name: string
  description: string
  values: string[]
  traditions: string[]
  art: string[]
  music: string[]
  food: string[]
  clothing: string[]
}

interface Conflict {
  id: string
  name: string
  type: 'war' | 'political' | 'religious' | 'economic' | 'cultural'
  parties: string[]
  description: string
  status: 'ongoing' | 'resolved' | 'escalating' | 'dormant'
  impact: 'local' | 'regional' | 'global'
}

interface Location {
  id: string
  name: string
  type: 'city' | 'forest' | 'mountain' | 'desert' | 'ocean' | 'plains' | 'tundra' | 'jungle'
  climate: string
  resources: string[]
  dangers: string[]
  inhabitants: string[]
  description: string
}

interface Character {
  id: string
  name: string
  role: string
  description: string
  motivation: string
  relationships: string[]
  appearance: string
  backstory: string
}

const GENRES = [
  'Fantasy', 'Science Fiction', 'Steampunk', 'Cyberpunk', 'Post-Apocalyptic',
  'Medieval', 'Modern', 'Historical', 'Alternate History', 'Space Opera',
  'Urban Fantasy', 'High Fantasy', 'Dark Fantasy', 'Romance', 'Horror'
]

const SETTINGS = [
  'Medieval Kingdom', 'Space Station', 'Modern City', 'Ancient Ruins', 'Underwater City',
  'Floating Islands', 'Desert Oasis', 'Arctic Base', 'Jungle Temple', 'Crystal Caves',
  'Steampunk Metropolis', 'Post-Apocalyptic Wasteland', 'Magical Academy', 'Pirate Haven', 'Alien Planet'
]

const TIME_PERIODS = [
  'Prehistoric', 'Ancient', 'Medieval', 'Renaissance', 'Industrial Age',
  'Modern Day', 'Near Future', 'Far Future', 'Alternate Timeline', 'Timeless'
]

const TECHNOLOGY_LEVELS = [
  'Stone Age', 'Bronze Age', 'Iron Age', 'Medieval', 'Renaissance',
  'Industrial', 'Modern', 'Near Future', 'Advanced', 'Post-Singularity'
]

const POLITICAL_SYSTEMS = [
  'Monarchy', 'Democracy', 'Dictatorship', 'Anarchy', 'Theocracy',
  'Oligarchy', 'Republic', 'Empire', 'Federation', 'Tribal'
]

export function WorldBuilder() {
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedSetting, setSelectedSetting] = useState<string>('')
  const [userContext, setUserContext] = useState<string>('')
  const [generatedWorld, setGeneratedWorld] = useState<World | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedWorlds, setSavedWorlds] = useState<World[]>([])
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create')
  const [showWorldDetails, setShowWorldDetails] = useState(false)
  const [showRAGDevelopment, setShowRAGDevelopment] = useState(false)
  const [currentWorldId, setCurrentWorldId] = useState<string | null>(null)
  const [currentWorldName, setCurrentWorldName] = useState<string>('World')
  const [selectedWorldForDetails, setSelectedWorldForDetails] = useState<World | null>(null)

  useEffect(() => {
    loadSavedWorlds()
  }, [])

  const loadSavedWorlds = async () => {
    try {
      const response = await fetch('/api/content/worlds')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const worlds = data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            genre: item.genre,
            setting: item.setting,
            timePeriod: item.timePeriod,
            magicSystem: item.magicSystem,
            technologyLevel: item.technologyLevel,
            politicalSystem: item.politicalSystem,
            culture: item.culture,
            geography: item.geography,
            history: item.history,
            rules: item.rules ? JSON.parse(item.rules) : [],
            characters: item.characters ? JSON.parse(item.characters) : [],
            createdAt: new Date(item.createdAt)
          }))
          setSavedWorlds(worlds)
        }
      }
    } catch (error) {
      console.error('Error loading saved worlds:', error)
    }
  }

  const generateWorld = async () => {
    if (!userContext.trim()) {
      alert('Please provide some context about the world you want to create')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'world_building',
          context: userContext,
          genre: selectedGenre || 'Fantasy',
          setting: selectedSetting || 'Medieval Kingdom'
        })
      })

      const data = await response.json()
      
      if (data.success && data.data.content) {
        const worldData = data.data.content
        const newWorld: World = {
          id: Date.now().toString(),
          name: worldData.name || 'Untitled World',
          description: worldData.description || 'A rich and detailed world',
          genre: worldData.genre || selectedGenre || 'Fantasy',
          setting: worldData.setting || selectedSetting || 'Medieval Kingdom',
          timePeriod: worldData.timePeriod,
          magicSystem: worldData.magicSystem,
          technologyLevel: worldData.technologyLevel,
          politicalSystem: worldData.politicalSystem,
          culture: worldData.culture,
          geography: worldData.geography,
          history: worldData.history,
          rules: Array.isArray(worldData.rules) ? worldData.rules : ['Magic follows natural laws', 'Technology is limited by era'],
          characters: Array.isArray(worldData.characters) ? worldData.characters : [
            {
              id: '1',
              name: 'The Protagonist',
              role: 'Hero',
              description: 'A brave soul seeking adventure',
              motivation: 'To protect what they love',
              relationships: ['Mentor', 'Companion'],
              appearance: 'Determined eyes, weathered hands',
              backstory: 'Raised in humble beginnings'
            },
            {
              id: '2',
              name: 'The Mentor',
              role: 'Guide',
              description: 'Wise and experienced',
              motivation: 'To pass on knowledge',
              relationships: ['Protagonist'],
              appearance: 'Silver hair, knowing smile',
              backstory: 'Has seen many battles'
            }
          ],
          createdAt: new Date()
        }
        setGeneratedWorld(newWorld)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating world:', error)
      // Fallback world
      const fallbackWorld: World = {
        id: Date.now().toString(),
        name: 'The Enchanted Realm',
        description: 'A mystical world where magic flows through every living thing, creating a delicate balance between light and shadow.',
        genre: selectedGenre || 'Fantasy',
        setting: selectedSetting || 'Medieval Kingdom',
        timePeriod: 'Medieval',
        magicSystem: 'Elemental magic system based on natural forces',
        technologyLevel: 'Medieval with magical enhancements',
        politicalSystem: 'Constitutional monarchy',
        culture: 'Harmony-focused society with deep respect for nature',
        geography: 'Diverse landscapes from floating mountains to crystal forests',
        history: 'Ancient civilizations built on magical foundations',
        rules: [
          'Magic must be in harmony with nature',
          'Technology cannot replace magical solutions',
          'All beings have inherent magical potential'
        ],
        characters: [
          {
            id: '1',
            name: 'Aria Windwhisper',
            role: 'Elemental Guardian',
            description: 'A young mage with the rare ability to communicate with elemental spirits',
            motivation: 'To restore balance to the magical realms',
            relationships: ['Mentor: Elder Thorne', 'Companion: Shadow the wolf'],
            appearance: 'Silver hair that shifts like wind, eyes that reflect the sky',
            backstory: 'Found abandoned in the Crystal Forest as a child, raised by elemental spirits'
          },
          {
            id: '2',
            name: 'Elder Thorne',
            role: 'Wise Mentor',
            description: 'Ancient druid who has guarded the realm for centuries',
            motivation: 'To ensure the survival of magical knowledge',
            relationships: ['Student: Aria', 'Ally: Council of Elders'],
            appearance: 'Bark-like skin, eyes deep as ancient roots, staff of living wood',
            backstory: 'Once a mortal who chose to merge with an ancient oak tree for eternal wisdom'
          },
          {
            id: '3',
            name: 'Captain Ironwill',
            role: 'Military Leader',
            description: 'Stoic commander of the realm\'s magical guard',
            motivation: 'To protect the realm from external threats',
            relationships: ['Rival: Dark Mage Zephyr', 'Loyalty: The Crown'],
            appearance: 'Imposing figure in enchanted armor, battle-scarred but noble',
            backstory: 'Rose through the ranks after saving the capital from a dragon attack'
          }
        ],
        createdAt: new Date()
      }
      setGeneratedWorld(fallbackWorld)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveWorld = async (world: World): Promise<World | null> => {
    try {
      const response = await fetch('/api/content/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: world.name,
          description: world.description,
          genre: world.genre,
          setting: world.setting,
          timePeriod: world.timePeriod,
          magicSystem: world.magicSystem,
          technologyLevel: world.technologyLevel,
          politicalSystem: world.politicalSystem,
          culture: world.culture,
          geography: world.geography,
          history: world.history,
          rules: world.rules,
          characters: world.characters
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const savedWorld = { ...world, id: data.world.id }
        setSavedWorlds(prev => [savedWorld, ...prev])
        try {
          await fetch('/api/worlds/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId: savedWorld.id,
              worldData: savedWorld
            })
          })
        } catch (embeddingError) {
          console.error('Failed to create world embeddings:', embeddingError)
        }
        return savedWorld
      } else {
        console.error('Failed to save world:', data.error)
      }
    } catch (error) {
      console.error('Error saving world:', error)
    }
    return null
  }

  const deleteWorld = async (id: string) => {
    try {
      const response = await fetch(`/api/content/worlds?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setSavedWorlds(prev => prev.filter(world => world.id !== id))
      } else {
        console.error('Failed to delete world:', data.error)
      }
    } catch (error) {
      console.error('Error deleting world:', error)
    }
  }

  return (
    <>
      <AIGeneratorLayout
        title="World Builder"
        subtitle="Create immersive worlds with rich lore, characters, and detailed settings"
        formControls={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Describe Your World Concept</label>
              <textarea
                className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all resize-y min-h-[120px] text-sm"
                placeholder="Describe the world you want to create... (e.g., 'A steampunk city where magic and technology coexist, ruled by a council of inventors and mages')"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Genre (Optional)</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
                <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Setting (Optional)</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {SETTINGS.map((setting) => (
                    <button
                      key={setting}
                      onClick={() => setSelectedSetting(setting === selectedSetting ? '' : setting)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedSetting === setting
                          ? 'bg-[var(--cx-ink-primary)] text-white shadow-md'
                          : 'bg-[var(--cx-bg-wash)] text-[var(--cx-ink-secondary)] hover:bg-[var(--cx-bg-panel)] border border-[var(--cx-border)]'
                      }`}
                    >
                      {setting}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
        generateButton={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateWorld}
            disabled={isGenerating || !userContext.trim()}
            className="bg-[var(--cx-ink-primary)] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            {isGenerating ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Creating World...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Create World</>
            )}
          </motion.button>
        }
        generatedContent={
          generatedWorld ? (
            <div className="p-6">
              <WorldCard 
                world={generatedWorld} 
                onSave={() => saveWorld(generatedWorld)}
                onView={() => {
                  setSelectedWorldForDetails(generatedWorld)
                  setShowWorldDetails(true)
                }}
                onDevelop={async () => {
                  const savedWorld = savedWorlds.find(world => world.name === generatedWorld.name) || await saveWorld(generatedWorld)
                  if (!savedWorld) return
                  setCurrentWorldId(savedWorld.id)
                  setCurrentWorldName(savedWorld.name)
                  setShowRAGDevelopment(true)
                }}
                isGenerated={true}
              />
            </div>
          ) : null
        }
        savedCount={savedWorlds.length}
        savedContent={
          savedWorlds.map((world) => (
            <WorldCard 
              key={world.id} 
              world={world} 
              onView={() => {
                setSelectedWorldForDetails(world)
                setShowWorldDetails(true)
              }}
              onDelete={() => deleteWorld(world.id)}
              onDevelop={() => {
                setCurrentWorldId(world.id)
                setCurrentWorldName(world.name)
                setShowRAGDevelopment(true)
              }}
              isSaved={true}
            />
          ))
        }
      />

      {/* World Details Modal */}
      {showWorldDetails && selectedWorldForDetails && (
        <WorldDetailsModal 
          world={selectedWorldForDetails} 
          onClose={() => {
            setShowWorldDetails(false)
            setSelectedWorldForDetails(null)
          }}
        />
      )}

      {/* RAG Development Modal */}
      {showRAGDevelopment && currentWorldId && (
        <RAGWorldDevelopment
          worldId={currentWorldId}
          worldName={currentWorldName}
          onClose={() => {
            setShowRAGDevelopment(false)
            setCurrentWorldId(null)
            setCurrentWorldName('World')
          }}
        />
      )}
    </>
  )
}

function WorldCard({ 
  world, 
  onSave, 
  onView, 
  onDelete,
  onDevelop,
  isSaved = false,
  isGenerated = false
}: { 
  world: World
  onSave?: () => void
  onView: () => void
  onDelete?: () => void
  onDevelop?: () => void
  isSaved?: boolean
  isGenerated?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism-content p-6 rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2A1711]">{world.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-[var(--cx-accent-soft)] text-purple-800 px-2.5 py-0.5 rounded-full font-medium">
                {world.genre}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">
                {world.setting}
              </span>
              {world.createdAt && (
                <span className="text-xs text-[#8D6B4A] ml-2">
                  Created: {new Date(world.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onView}
            className="p-2 text-[var(--cx-ink-secondary)] hover:text-[#8D6B4A] hover:bg-[#F5EDE3] rounded-full transition-colors"
            title="View details"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          {isGenerated && onSave && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              className="p-2 text-[var(--cx-ink-secondary)] hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Save world"
            >
              <Save className="w-5 h-5" />
            </motion.button>
          )}
          {isSaved && onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 text-[var(--cx-ink-secondary)] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete world"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <WorldBuildingDisplay content={world.description} className="!p-4 !shadow-none !border-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3B2418] mb-4">
        {world.timePeriod && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
              <Sun className="w-4 h-4 text-yellow-500" /> Time Period:
            </h4>
            <p className="text-sm">{world.timePeriod}</p>
          </div>
        )}
        {world.magicSystem && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
              <Zap className="w-4 h-4 text-purple-500" /> Magic System:
            </h4>
            <p className="text-sm">{world.magicSystem}</p>
          </div>
        )}
        {world.politicalSystem && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
              <Crown className="w-4 h-4 text-gold-500" /> Government:
            </h4>
            <p className="text-sm">{world.politicalSystem}</p>
          </div>
        )}
        {world.technologyLevel && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
              <Building className="w-4 h-4 text-blue-500" /> Technology:
            </h4>
            <p className="text-sm">{world.technologyLevel}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-[var(--cx-ink-secondary)]">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[#8D6B4A]" />
            {world.characters?.length || 0} characters
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-[#8D6B4A]" />
            {world.rules?.length || 0} rules
          </span>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onDevelop) {
              onDevelop()
            } else {
              const developPrompt = `Develop this world further: "${world.name}" - ${world.description}. Create more detailed lore, expand the magic system, and add more characters.`;
              localStorage.setItem('ai_assistant_prompt', developPrompt);
              localStorage.setItem('ai_assistant_template', 'plot');
              window.dispatchEvent(new CustomEvent('navigateToAssistant'));
            }
          }}
          className="bg-gradient-to-r from-[#8D6B4A] to-[#563024] text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          RAG Development <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

function WorldDetailsModal({ world, onClose }: { world: World, onClose: () => void }) {
  const [editingCharacters, setEditingCharacters] = useState(false)
  const [characters, setCharacters] = useState(world.characters || [])
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: '',
    description: '',
    motivation: '',
    appearance: '',
    backstory: '',
    relationships: [] as string[]
  })
  const [showAddCharacter, setShowAddCharacter] = useState(false)

  const addCharacter = () => {
    if (newCharacter.name && newCharacter.role) {
      const character: WorldCharacter = {
        id: Date.now().toString(),
        name: newCharacter.name,
        role: newCharacter.role,
        description: newCharacter.description,
        motivation: newCharacter.motivation,
        appearance: newCharacter.appearance,
        backstory: newCharacter.backstory,
        relationships: newCharacter.relationships
      }
      setCharacters([...characters, character])
      setNewCharacter({
        name: '',
        role: '',
        description: '',
        motivation: '',
        appearance: '',
        backstory: '',
        relationships: []
      })
      setShowAddCharacter(false)
    }
  }

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id))
  }

  const addRelationship = (characterId: string, relationship: string) => {
    if (relationship.trim()) {
      setCharacters(characters.map(char => 
        char.id === characterId 
          ? { ...char, relationships: [...char.relationships, relationship.trim()] }
          : char
      ))
    }
  }

  const removeRelationship = (characterId: string, relationshipIndex: number) => {
    setCharacters(characters.map(char => 
      char.id === characterId 
        ? { ...char, relationships: char.relationships.filter((_, index) => index !== relationshipIndex) }
        : char
    ))
  }

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal-content w-full max-w-6xl mx-4"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-2">{world.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="badge badge-primary">{world.genre}</span>
                  <span className="badge badge-secondary">{world.setting}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Overview Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary-600" />
              World Overview
            </h3>
            <div className="card">
              <div className="mb-6">
                <WorldBuildingDisplay content={world.description} className="!p-0 !shadow-none !border-none" />
              </div>
            </div>
          </div>

          {/* World Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {world.timePeriod && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Sun className="w-6 h-6 text-warning-500" />
                    Time Period
                  </h4>
                  <p className="text-neutral-700 font-medium">{world.timePeriod}</p>
                </div>
              )}
              
              {world.magicSystem && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-secondary-500" />
                    Magic System
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.magicSystem}</p>
                </div>
              )}
              
              {world.politicalSystem && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Crown className="w-6 h-6 text-warning-600" />
                    Political System
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.politicalSystem}</p>
                </div>
              )}
              
              {world.technologyLevel && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Building className="w-6 h-6 text-primary-500" />
                    Technology Level
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.technologyLevel}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {world.culture && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent-500" />
                    Culture
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.culture}</p>
                </div>
              )}

              {world.geography && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <Mountain className="w-6 h-6 text-accent-600" />
                    Geography
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.geography}</p>
                </div>
              )}

              {world.history && (
                <div className="card">
                  <h4 className="text-xl font-bold text-neutral-800 mb-3 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-warning-500" />
                    History
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{world.history}</p>
                </div>
              )}
            </div>
          </div>

          {/* World Rules */}
          {world.rules && world.rules.length > 0 && (
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-3">
                <Star className="w-6 h-6 text-primary-500" />
                World Rules & Laws
              </h4>
              <div className="card">
                <ul className="space-y-3">
                  {world.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-neutral-700 font-medium">{rule}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Characters Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary-500" />
                World Characters
              </h4>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingCharacters(!editingCharacters)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {editingCharacters ? 'Done Editing' : 'Edit Characters'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCharacter(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Character
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover-lift group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h5 className="text-xl font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                      {character.name}
                    </h5>
                    {editingCharacters && (
                      <button
                        onClick={() => deleteCharacter(character.id)}
                        className="p-2 hover:bg-error-50 text-error-500 hover:text-error-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="badge badge-primary text-xs">{character.role}</span>
                    </div>
                    
                    <p className="text-neutral-700 text-sm leading-relaxed">{character.description}</p>
                    
                    {character.motivation && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 mb-1">Motivation:</p>
                        <p className="text-sm text-neutral-700">{character.motivation}</p>
                      </div>
                    )}
                    
                    {character.appearance && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 mb-1">Appearance:</p>
                        <p className="text-sm text-neutral-700">{character.appearance}</p>
                      </div>
                    )}
                    
                    {character.backstory && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 mb-1">Backstory:</p>
                        <p className="text-sm text-neutral-700">{character.backstory}</p>
                      </div>
                    )}
                    
                    {character.relationships && character.relationships.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 mb-2">Relationships:</p>
                        <div className="flex flex-wrap gap-1">
                          {character.relationships.map((rel, index) => (
                            <span key={index} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                              {rel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Add Character Modal */}
          {showAddCharacter && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#FDFBF7] rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">Add New Character</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Character Name *</label>
                      <input
                        type="text"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Enter character name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role *</label>
                      <input
                        type="text"
                        value={newCharacter.role}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, role: e.target.value }))}
                        className="form-input"
                        placeholder="e.g., Protagonist, Antagonist, Mentor"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={newCharacter.description}
                      onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input form-textarea"
                      placeholder="Brief description of the character"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Motivation</label>
                    <input
                      type="text"
                      value={newCharacter.motivation}
                      onChange={(e) => setNewCharacter(prev => ({ ...prev, motivation: e.target.value }))}
                      className="form-input"
                      placeholder="What drives this character?"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Appearance</label>
                    <input
                      type="text"
                      value={newCharacter.appearance}
                      onChange={(e) => setNewCharacter(prev => ({ ...prev, appearance: e.target.value }))}
                      className="form-input"
                      placeholder="Physical description"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Backstory</label>
                    <textarea
                      value={newCharacter.backstory}
                      onChange={(e) => setNewCharacter(prev => ({ ...prev, backstory: e.target.value }))}
                      className="form-input form-textarea"
                      placeholder="Character's background and history"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addCharacter}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Character
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddCharacter(false)}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="btn-secondary px-8"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Save updated world with new characters
                console.log('Saving world with updated characters:', characters)
                onClose()
              }}
              className="btn-primary px-8 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
