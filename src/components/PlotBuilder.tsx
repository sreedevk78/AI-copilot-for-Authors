'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  CheckCircle,
  Circle,
  Sparkles,
  BookOpen,
  Users,
  Zap,
  Heart,
  Save,
  RefreshCw
} from 'lucide-react'
import { StoryGenerator } from '@/lib/writingUtils'

interface PlotPoint {
  id: string
  title: string
  description: string
  type: 'setup' | 'inciting' | 'rising' | 'climax' | 'resolution'
  isCompleted: boolean
  order: number
}

interface StoryStructure {
  id: string
  name: string
  description: string
  points: PlotPoint[]
}

const STORY_STRUCTURES = [
  {
    name: 'Three-Act Structure',
    description: 'Classic storytelling format with setup, confrontation, and resolution',
    points: [
      { type: 'setup', title: 'Setup', description: 'Introduce characters and world' },
      { type: 'inciting', title: 'Inciting Incident', description: 'Event that starts the story' },
      { type: 'rising', title: 'Rising Action', description: 'Build tension and obstacles' },
      { type: 'climax', title: 'Climax', description: 'Highest point of conflict' },
      { type: 'resolution', title: 'Resolution', description: 'Wrap up the story' }
    ]
  },
  {
    name: 'Hero\'s Journey',
    description: 'Mythological structure following the hero\'s transformation',
    points: [
      { type: 'setup', title: 'Call to Adventure', description: 'Hero receives a call to action' },
      { type: 'inciting', title: 'Refusal of the Call', description: 'Hero hesitates or refuses' },
      { type: 'rising', title: 'Meeting the Mentor', description: 'Hero meets a guide or teacher' },
      { type: 'climax', title: 'The Ordeal', description: 'Hero faces their greatest challenge' },
      { type: 'resolution', title: 'Return with Elixir', description: 'Hero returns transformed' }
    ]
  },
  {
    name: 'Five-Act Structure',
    description: 'Shakespearean structure with detailed development',
    points: [
      { type: 'setup', title: 'Exposition', description: 'Introduction of characters and setting' },
      { type: 'inciting', title: 'Rising Action', description: 'Conflict begins to develop' },
      { type: 'rising', title: 'Climax', description: 'Turning point of the story' },
      { type: 'climax', title: 'Falling Action', description: 'Consequences of the climax' },
      { type: 'resolution', title: 'Resolution', description: 'Final outcome' }
    ]
  }
]

export function PlotBuilder() {
  const [selectedStructure, setSelectedStructure] = useState<StoryStructure | null>(null)
  const [customPoints, setCustomPoints] = useState<PlotPoint[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PlotPoint | null>(null)

  const selectStructure = (structure: typeof STORY_STRUCTURES[0]) => {
    const plotPoints: PlotPoint[] = structure.points.map((point, index) => ({
      id: `point-${index}`,
      title: point.title,
      description: point.description,
      type: point.type as any,
      isCompleted: false,
      order: index
    }))

    setSelectedStructure({
      id: `structure-${Date.now()}`,
      name: structure.name,
      description: structure.description,
      points: plotPoints
    })
    setCustomPoints(plotPoints)
  }

  const addCustomPoint = () => {
    const newPoint: PlotPoint = {
      id: `point-${Date.now()}`,
      title: 'New Plot Point',
      description: 'Describe what happens in this plot point',
      type: 'setup',
      isCompleted: false,
      order: customPoints.length
    }
    setCustomPoints(prev => [...prev, newPoint])
    setEditingPoint(newPoint)
    setIsEditing(true)
  }

  const updatePoint = (id: string, updates: Partial<PlotPoint>) => {
    setCustomPoints(prev => 
      prev.map(point => 
        point.id === id ? { ...point, ...updates } : point
      )
    )
  }

  const deletePoint = (id: string) => {
    setCustomPoints(prev => prev.filter(point => point.id !== id))
  }

  const toggleCompletion = (id: string) => {
    updatePoint(id, { isCompleted: !customPoints.find(p => p.id === id)?.isCompleted })
  }

  const generatePlotPoint = async (point: PlotPoint) => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PLOT_DEVELOPMENT',
          prompt: `Develop a detailed plot point for "${point.title}". This is a ${point.type} type scene. Provide specific details about what happens, character motivations, and how it advances the story.`,
          length: 'medium'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        updatePoint(point.id, { description: data.data.content })
      }
    } catch (error) {
      console.error('Error generating plot point:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const savePlot = () => {
    // Save plot to database
    console.log('Saving plot:', { structure: selectedStructure, points: customPoints })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Plot Builder</h1>
          </div>
          <p className="text-green-100">
            Structure your story with proven narrative frameworks or create your own
          </p>
        </div>

        <div className="p-6">
          {!selectedStructure ? (
            <StructureSelector onSelect={selectStructure} />
          ) : (
            <div className="space-y-6">
              {/* Current Structure Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStructure.name}</h2>
                  <p className="text-gray-600">{selectedStructure.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedStructure(null)
                      setCustomPoints([])
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Change Structure
                  </button>
                  <button
                    onClick={savePlot}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Plot
                  </button>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">
                    {customPoints.filter(p => p.isCompleted).length} / {customPoints.length} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(customPoints.filter(p => p.isCompleted).length / customPoints.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Plot Points */}
              <div className="space-y-4">
                {customPoints.map((point, index) => (
                  <PlotPointCard
                    key={point.id}
                    point={point}
                    index={index}
                    onUpdate={updatePoint}
                    onDelete={deletePoint}
                    onToggleCompletion={toggleCompletion}
                    onGenerate={generatePlotPoint}
                    isGenerating={isGenerating}
                  />
                ))}
              </div>

              {/* Add Custom Point */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addCustomPoint}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Custom Plot Point
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StructureSelector({ onSelect }: { onSelect: (structure: typeof STORY_STRUCTURES[0]) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Story Structure</h2>
        <p className="text-gray-600">Select a proven narrative framework to guide your story development</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STORY_STRUCTURES.map((structure, index) => (
          <motion.div
            key={structure.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onSelect(structure)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{structure.name}</h3>
            </div>
            
            <p className="text-gray-600 mb-4">{structure.description}</p>
            
            <div className="space-y-2">
              {structure.points.map((point, pointIndex) => (
                <div key={pointIndex} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                  </div>
                  <span className="text-gray-700">{point.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-purple-600 font-medium">Use this structure →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PlotPointCard({ 
  point, 
  index, 
  onUpdate, 
  onDelete, 
  onToggleCompletion, 
  onGenerate,
  isGenerating 
}: { 
  point: PlotPoint
  index: number
  onUpdate: (id: string, updates: Partial<PlotPoint>) => void
  onDelete: (id: string) => void
  onToggleCompletion: (id: string) => void
  onGenerate: (point: PlotPoint) => void
  isGenerating: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(point.title)
  const [editDescription, setEditDescription] = useState(point.description)

  const saveEdit = () => {
    onUpdate(point.id, { title: editTitle, description: editDescription })
    setIsEditing(false)
  }

  const typeColors = {
    setup: 'from-blue-500 to-blue-600',
    inciting: 'from-yellow-500 to-orange-500',
    rising: 'from-green-500 to-green-600',
    climax: 'from-red-500 to-red-600',
    resolution: 'from-purple-500 to-purple-600'
  }

  const typeLabels = {
    setup: 'Setup',
    inciting: 'Inciting Incident',
    rising: 'Rising Action',
    climax: 'Climax',
    resolution: 'Resolution'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-xl border-2 transition-all ${
        point.isCompleted 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Completion Toggle */}
          <button
            onClick={() => onToggleCompletion(point.id)}
            className="mt-1"
          >
            {point.isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 hover:text-green-500 transition-colors" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${typeColors[point.type]}`}>
                    {typeLabels[point.type]}
                  </span>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-700 leading-relaxed">{point.description}</p>
              </>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onGenerate(point)}
                disabled={isGenerating}
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                title="Generate with AI"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(point.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
