'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause,
  Sparkles,
  Users,
  Zap,
  Heart,
  Save,
  Copy,
  RefreshCw,
  Volume2,
  Mic,
  MicOff
} from 'lucide-react'
import { DialogueGenerator } from '@/lib/writingUtils'

interface Character {
  id: string
  name: string
  voice: string
  personality: string
  age?: number
  accent?: string
}

interface DialogueLine {
  id: string
  characterId: string
  content: string
  emotion?: string
  action?: string
  order: number
}

interface Scene {
  id: string
  title: string
  setting: string
  context: string
  lines: DialogueLine[]
}

export function DialogueCreator() {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'char-1',
      name: 'Alex',
      voice: 'Direct and confident',
      personality: 'Leader type, decisive',
      age: 28
    },
    {
      id: 'char-2',
      name: 'Sam',
      voice: 'Thoughtful and measured',
      personality: 'Analytical, careful',
      age: 32
    }
  ])
  
  const [scenes, setScenes] = useState<Scene[]>([])
  const [activeScene, setActiveScene] = useState<Scene | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState<'characters' | 'scenes' | 'practice'>('characters')

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: 'New Character',
      voice: 'Unique voice description',
      personality: 'Personality traits',
      age: 25
    }
    setCharacters(prev => [...prev, newCharacter])
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    )
  }

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id))
  }

  const createScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: 'New Dialogue Scene',
      setting: 'Describe the setting',
      context: 'What is happening in this scene?',
      lines: []
    }
    setScenes(prev => [...prev, newScene])
    setActiveScene(newScene)
    setActiveTab('scenes')
  }

  const addDialogueLine = (sceneId: string, characterId: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      characterId,
      content: 'Enter dialogue...',
      emotion: 'neutral',
      order: scene.lines.length
    }

    const updatedScene = {
      ...scene,
      lines: [...scene.lines, newLine]
    }

    setScenes(prev => 
      prev.map(s => s.id === sceneId ? updatedScene : s)
    )
    
    if (activeScene?.id === sceneId) {
      setActiveScene(updatedScene)
    }
  }

  const updateDialogueLine = (sceneId: string, lineId: string, updates: Partial<DialogueLine>) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    const updatedLines = scene.lines.map(line =>
      line.id === lineId ? { ...line, ...updates } : line
    )

    const updatedScene = { ...scene, lines: updatedLines }

    setScenes(prev => 
      prev.map(s => s.id === sceneId ? updatedScene : s)
    )
    
    if (activeScene?.id === sceneId) {
      setActiveScene(updatedScene)
    }
  }

  const generateDialogue = async () => {
    if (!activeScene || characters.length < 2) return

    setIsGenerating(true)
    
    try {
      const characterContext = characters.map(char => 
        `${char.name}: ${char.voice}, ${char.personality}`
      ).join('; ')

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DIALOGUE',
          prompt: `Create a dialogue scene between these characters: ${characterContext}. Setting: ${activeScene.setting}. Context: ${activeScene.context}. Make it natural and engaging with 5-8 lines of dialogue.`,
          length: 'medium'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Parse the generated dialogue and create lines
        const dialogueContent = data.data.content
        const lines = parseDialogue(dialogueContent)
        
        if (lines.length > 0) {
          const updatedScene = {
            ...activeScene,
            lines: lines
          }
          
          setScenes(prev => 
            prev.map(s => s.id === activeScene.id ? updatedScene : s)
          )
          setActiveScene(updatedScene)
        }
      }
    } catch (error) {
      console.error('Error generating dialogue:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const parseDialogue = (content: string): DialogueLine[] => {
    const lines: DialogueLine[] = []
    const dialogueLines = content.split('\n').filter(line => line.trim())
    
    dialogueLines.forEach((line, index) => {
      const match = line.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        const characterName = match[1].trim()
        const dialogue = match[2].trim()
        
        // Find character by name
        const character = characters.find(char => 
          char.name.toLowerCase() === characterName.toLowerCase()
        )
        
        if (character) {
          lines.push({
            id: `line-${Date.now()}-${index}`,
            characterId: character.id,
            content: dialogue,
            emotion: 'neutral',
            order: index
          })
        }
      }
    })
    
    return lines
  }

  const playScene = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would trigger text-to-speech or audio playback
  }

  const analyzeDialogue = () => {
    if (!activeScene) return
    
    const dialogueText = activeScene.lines.map(line => {
      const character = characters.find(char => char.id === line.characterId)
      return `${character?.name}: ${line.content}`
    }).join('\n')

    const analysis = DialogueGenerator.analyzeDialogue(dialogueText)
    return analysis
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Dialogue Creator</h1>
          </div>
          <p className="text-blue-100">
            Craft authentic conversations that bring your characters to life
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('characters')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'characters'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Characters
            </button>
            <button
              onClick={() => setActiveTab('scenes')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'scenes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dialogue Scenes
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'practice'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Practice & Analysis
            </button>
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'characters' && (
              <CharactersTab
                characters={characters}
                onAddCharacter={addCharacter}
                onUpdateCharacter={updateCharacter}
                onDeleteCharacter={deleteCharacter}
              />
            )}
            
            {activeTab === 'scenes' && (
              <ScenesTab
                scenes={scenes}
                characters={characters}
                activeScene={activeScene}
                onSetActiveScene={setActiveScene}
                onCreateScene={createScene}
                onAddDialogueLine={addDialogueLine}
                onUpdateDialogueLine={updateDialogueLine}
                onGenerateDialogue={generateDialogue}
                isGenerating={isGenerating}
              />
            )}
            
            {activeTab === 'practice' && (
              <PracticeTab
                activeScene={activeScene}
                characters={characters}
                onPlayScene={playScene}
                isPlaying={isPlaying}
                onAnalyzeDialogue={analyzeDialogue}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function CharactersTab({ 
  characters, 
  onAddCharacter, 
  onUpdateCharacter, 
  onDeleteCharacter 
}: {
  characters: Character[]
  onAddCharacter: () => void
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void
  onDeleteCharacter: (id: string) => void
}) {
  return (
    <motion.div
      key="characters"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Character Voices</h2>
        <button
          onClick={onAddCharacter}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Character
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={index}
            onUpdate={onUpdateCharacter}
            onDelete={onDeleteCharacter}
          />
        ))}
      </div>
    </motion.div>
  )
}

function CharacterCard({ 
  character, 
  index, 
  onUpdate, 
  onDelete 
}: {
  character: Character
  index: number
  onUpdate: (id: string, updates: Partial<Character>) => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(character)

  const saveEdit = () => {
    onUpdate(character.id, editData)
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={editData.voice}
            onChange={(e) => setEditData(prev => ({ ...prev, voice: e.target.value }))}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Voice description"
          />
          <textarea
            value={editData.personality}
            onChange={(e) => setEditData(prev => ({ ...prev, personality: e.target.value }))}
            rows={3}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Personality traits"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={saveEdit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {character.name.charAt(0)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(character.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{character.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Voice:</strong> {character.voice}
          </p>
          <p className="text-sm text-gray-700">{character.personality}</p>
        </>
      )}
    </motion.div>
  )
}

function ScenesTab({
  scenes,
  characters,
  activeScene,
  onSetActiveScene,
  onCreateScene,
  onAddDialogueLine,
  onUpdateDialogueLine,
  onGenerateDialogue,
  isGenerating
}: {
  scenes: Scene[]
  characters: Character[]
  activeScene: Scene | null
  onSetActiveScene: (scene: Scene) => void
  onCreateScene: () => void
  onAddDialogueLine: (sceneId: string, characterId: string) => void
  onUpdateDialogueLine: (sceneId: string, lineId: string, updates: Partial<DialogueLine>) => void
  onGenerateDialogue: () => void
  isGenerating: boolean
}) {
  return (
    <motion.div
      key="scenes"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dialogue Scenes</h2>
        <button
          onClick={onCreateScene}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Scene
        </button>
      </div>

      {scenes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scene List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Scenes</h3>
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSetActiveScene(scene)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeScene?.id === scene.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{scene.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{scene.lines.length} lines</p>
              </motion.div>
            ))}
          </div>

          {/* Scene Editor */}
          {activeScene && (
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{activeScene.title}</h3>
                <button
                  onClick={onGenerateDialogue}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Dialogue
                </button>
              </div>

              <div className="space-y-4">
                {activeScene.lines.map((line, index) => {
                  const character = characters.find(char => char.id === line.characterId)
                  return (
                    <DialogueLine
                      key={line.id}
                      line={line}
                      character={character}
                      index={index}
                      onUpdate={(updates) => onUpdateDialogueLine(activeScene.id, line.id, updates)}
                    />
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Add line:</span>
                {characters.map(character => (
                  <button
                    key={character.id}
                    onClick={() => onAddDialogueLine(activeScene.id, character.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {character.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No dialogue scenes yet</h3>
          <p className="text-gray-600 mb-4">Create your first dialogue scene to start crafting conversations</p>
          <button
            onClick={onCreateScene}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Create Your First Scene
          </button>
        </div>
      )}
    </motion.div>
  )
}

function DialogueLine({ 
  line, 
  character, 
  index, 
  onUpdate 
}: {
  line: DialogueLine
  character?: Character
  index: number
  onUpdate: (updates: Partial<DialogueLine>) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(line.content)

  const saveEdit = () => {
    onUpdate({ content: editContent })
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {character?.name.charAt(0) || '?'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{character?.name || 'Unknown'}</span>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="w-full text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">{line.content}</p>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function PracticeTab({
  activeScene,
  characters,
  onPlayScene,
  isPlaying,
  onAnalyzeDialogue
}: {
  activeScene: Scene | null
  characters: Character[]
  onPlayScene: () => void
  isPlaying: boolean
  onAnalyzeDialogue: () => any
}) {
  const analysis = activeScene ? onAnalyzeDialogue() : null

  return (
    <motion.div
      key="practice"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Practice & Analysis</h2>

      {activeScene ? (
        <div className="space-y-6">
          {/* Scene Playback */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Scene Playback</h3>
              <button
                onClick={onPlayScene}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isPlaying ? 'Pause' : 'Play'} Scene
              </button>
            </div>
            
            <div className="space-y-3">
              {activeScene.lines.map((line, index) => {
                const character = characters.find(char => char.id === line.characterId)
                return (
                  <div key={line.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {character?.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{character?.name}: </span>
                      <span className="text-gray-700">{line.content}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dialogue Analysis */}
          {analysis && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dialogue Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Authenticity</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(analysis.authenticity * 100)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Character Distinction</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(analysis.characterDistinction * 100)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Subtext</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysis.subtext ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {analysis.suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Suggestions</h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Volume2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scene selected</h3>
          <p className="text-gray-600">Select a dialogue scene to practice and analyze</p>
        </div>
      )}
    </motion.div>
  )
}
