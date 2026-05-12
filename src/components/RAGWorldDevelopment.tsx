'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIGenerationDisplay } from './RichTextDisplay'
import { 
  Brain, 
  Search, 
  Lightbulb, 
  Users, 
  MapPin, 
  Crown, 
  Zap, 
  BookOpen,
  Sparkles,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react'

interface RAGWorldDevelopmentProps {
  worldId: string
  worldName: string
  onClose: () => void
}

interface DevelopmentResult {
  development: string
  suggestions: string[]
  context: string
  relevantSections: Array<{
    type: string
    section: string
    content: string
    similarity: number
  }>
}

const developmentTypes = [
  { id: 'character', label: 'Character', icon: Users, color: 'blue' },
  { id: 'location', label: 'Location', icon: MapPin, color: 'green' },
  { id: 'culture', label: 'Culture', icon: BookOpen, color: 'purple' },
  { id: 'history', label: 'History', icon: BookOpen, color: 'orange' },
  { id: 'magic', label: 'Magic System', icon: Zap, color: 'yellow' },
  { id: 'politics', label: 'Politics', icon: Crown, color: 'red' },
  { id: 'general', label: 'General', icon: Brain, color: 'brown' }
]

export function RAGWorldDevelopment({ worldId, worldName, onClose }: RAGWorldDevelopmentProps) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('general')
  const [isDeveloping, setIsDeveloping] = useState(false)
  const [result, setResult] = useState<DevelopmentResult | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleDevelop = async () => {
    if (!query.trim()) {
      alert('Please enter a query for world development')
      return
    }

    setIsDeveloping(true)
    setResult(null)

    try {
      const response = await fetch('/api/worlds/develop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          query: query.trim(),
          developmentType: selectedType
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        setShowSuggestions(true)
      } else {
        alert('Failed to develop world: ' + data.error)
      }
    } catch (error) {
      console.error('Error developing world:', error)
      alert('Error developing world')
    } finally {
      setIsDeveloping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal-content w-full max-w-4xl mx-4"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#8D6B4A] to-[#563024] rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-neutral-800 mb-2">RAG World Development</h2>
                <p className="text-neutral-600">Intelligently develop your world: <span className="font-semibold text-[#8D6B4A]">{worldName}</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Development Type Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">What would you like to develop?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {developmentTypes.map((type) => {
                const Icon = type.icon
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-[#8D6B4A] bg-[#F5EDE3]'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      selectedType === type.id ? 'text-[#8D6B4A]' : 'text-neutral-600'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      selectedType === type.id ? 'text-[#3B2418]' : 'text-neutral-700'
                    }`}>
                      {type.label}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Query Input */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Describe what you want to develop</h3>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input form-textarea w-full h-32 resize-none"
                placeholder="e.g., Create a mysterious forest that serves as a gateway between worlds, or develop a complex political system with multiple factions..."
              />
              <div className="absolute bottom-3 right-3 text-sm text-neutral-500">
                {query.length}/500
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDevelop}
              disabled={isDeveloping || !query.trim()}
              className="btn-primary flex items-center gap-2 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeveloping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Developing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Develop World
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="btn-secondary flex items-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              Suggestions
            </motion.button>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="card">
                  <h4 className="text-lg font-bold text-neutral-800 mb-4">Quick Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Create a mysterious ancient library with forbidden knowledge",
                      "Develop a complex magic system with different schools",
                      "Add a political conflict between two major factions",
                      "Create a unique cultural tradition or festival",
                      "Develop a dangerous region with specific threats",
                      "Add a historical event that shaped the world",
                      "Create a unique creature or species",
                      "Develop a trade route or economic system"
                    ].map((suggestion, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <p className="text-sm text-neutral-700">{suggestion}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Development Content */}
                <div className="card">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#8D6B4A]" />
                    Development Result
                  </h3>
                  <AIGenerationDisplay 
                    content={result.development} 
                    type={selectedType}
                    className="!p-0 !shadow-none !border-none"
                  />
                </div>

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="card">
                    <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      AI Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-neutral-700">{suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Relevant Context */}
                {result.relevantSections && result.relevantSections.length > 0 && (
                  <div className="card">
                    <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      Relevant Context Used
                    </h4>
                    <div className="space-y-3">
                      {result.relevantSections.map((section, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-blue-800 uppercase">
                              {section.type}
                            </span>
                            <span className="text-xs text-blue-600">
                              {section.section}
                            </span>
                            <span className="text-xs text-blue-500">
                              {(section.similarity * 100).toFixed(1)}% match
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="btn-secondary px-8"
            >
              Close
            </motion.button>
            {result && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Save development to world
                  console.log('Saving development:', result)
                }}
                className="btn-primary px-8 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Apply to World
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
