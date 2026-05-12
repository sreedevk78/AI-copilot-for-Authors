'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  X, 
  Check, 
  Lightbulb, 
  MessageSquare, 
  Target,
  Globe,
  PenTool,
  Brain,
  ArrowRight,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react'

interface AISuggestion {
  id: string
  type: string
  title: string
  content: string
  context?: string
  priority: string
  isRead: boolean
  isDismissed: boolean
  createdAt: Date
}

interface AISuggestionPopupProps {
  suggestions: AISuggestion[]
  onDismiss: (id: string) => void
  onMarkRead: (id: string) => void
  onApply: (suggestion: AISuggestion) => void
}

const SUGGESTION_TYPES = {
  WRITING_TIP: { icon: Lightbulb, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  CHARACTER_SUGGESTION: { icon: MessageSquare, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', borderColor: 'border-[#D8C2A4]' },
  PLOT_DEVELOPMENT: { icon: Target, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  WORLD_BUILDING: { icon: Globe, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  STYLE_IMPROVEMENT: { icon: PenTool, color: 'from-[#8D6B4A] to-[#563024]', bgColor: 'bg-[#F5EDE3]', borderColor: 'border-[#D8C2A4]' },
  CREATIVE_INSPIRATION: { icon: Sparkles, color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' }
}

const PRIORITY_COLORS = {
  LOW: 'text-[#8D6B4A]',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600'
}

export function AISuggestionPopup({ suggestions, onDismiss, onMarkRead, onApply }: AISuggestionPopupProps) {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const unreadSuggestions = suggestions.filter(s => !s.isDismissed && !s.isRead)
  const currentSuggestion = unreadSuggestions[currentSuggestionIndex]

  useEffect(() => {
    if (unreadSuggestions.length > 0) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [unreadSuggestions.length])

  const handleNext = () => {
    if (currentSuggestionIndex < unreadSuggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1)
    } else {
      setCurrentSuggestionIndex(0)
    }
  }

  const handlePrev = () => {
    if (currentSuggestionIndex > 0) {
      setCurrentSuggestionIndex(currentSuggestionIndex - 1)
    } else {
      setCurrentSuggestionIndex(unreadSuggestions.length - 1)
    }
  }

  const handleDismiss = () => {
    if (currentSuggestion) {
      onDismiss(currentSuggestion.id)
      if (unreadSuggestions.length === 1) {
        setIsVisible(false)
      } else {
        handleNext()
      }
    }
  }

  const handleApply = () => {
    if (currentSuggestion) {
      onApply(currentSuggestion)
      onMarkRead(currentSuggestion.id)
      handleNext()
    }
  }

  if (!isVisible || !currentSuggestion) {
    return null
  }

  const suggestionType = SUGGESTION_TYPES[currentSuggestion.type as keyof typeof SUGGESTION_TYPES] || SUGGESTION_TYPES.WRITING_TIP
  const IconComponent = suggestionType.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <div className={`${suggestionType.bgColor} ${suggestionType.borderColor} border-2 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${suggestionType.color} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2A1711] text-sm">AI Suggestion</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[currentSuggestion.priority as keyof typeof PRIORITY_COLORS]}`}>
                      {currentSuggestion.priority}
                    </span>
                    <span className="text-xs text-[#8D6B4A]">
                      {new Date(currentSuggestion.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-[#FDFBF7]/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-[#3B2418]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-bold text-[#2A1711] mb-2">{currentSuggestion.title}</h4>
            <p className="text-[#3B2418] text-sm leading-relaxed mb-4">
              {currentSuggestion.content}
            </p>
            
            {currentSuggestion.context && (
              <div className="bg-[#FDFBF7]/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-[#3B2418]" />
                  <span className="text-xs font-medium text-[#3B2418]">Context</span>
                </div>
                <p className="text-xs text-[#3B2418]">{currentSuggestion.context}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className={`flex-1 bg-gradient-to-r ${suggestionType.color} text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200`}
              >
                <Check className="w-4 h-4" />
                Apply Suggestion
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMarkRead(currentSuggestion.id)}
                className="px-4 py-2 text-[#3B2418] hover:text-[#2A1711] transition-colors text-sm font-medium"
              >
                Mark Read
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          {unreadSuggestions.length > 1 && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8D6B4A]">
                    {currentSuggestionIndex + 1} of {unreadSuggestions.length}
                  </span>
                  <div className="flex gap-1">
                    {unreadSuggestions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSuggestionIndex ? 'bg-slate-600' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrev}
                    className="p-2 hover:bg-[#FDFBF7]/20 rounded-full transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-[#3B2418] rotate-180" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNext}
                    className="p-2 hover:bg-[#FDFBF7]/20 rounded-full transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-[#3B2418]" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Badge */}
        {unreadSuggestions.length > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
          >
            {unreadSuggestions.length}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing AI suggestions
export function useAISuggestions(userId?: string) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/ai-suggestions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuggestions(data.data.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt)
          })))
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissSuggestion = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDismissed: true })
      })
      
      if (response.ok) {
        setSuggestions(prev => prev.map(s => 
          s.id === id ? { ...s, isDismissed: true } : s
        ))
      }
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })
      
      if (response.ok) {
        setSuggestions(prev => prev.map(s => 
          s.id === id ? { ...s, isRead: true } : s
        ))
      }
    } catch (error) {
      console.error('Failed to mark suggestion as read:', error)
    }
  }

  const generateSuggestion = async (context: string, type: string) => {
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          context,
          userId
        })
      })
      
      if (response.ok) {
        await fetchSuggestions() // Refresh suggestions
      }
    } catch (error) {
      console.error('Failed to generate suggestion:', error)
    }
  }

  useEffect(() => {
    fetchSuggestions()
    
    // Poll for new suggestions every 30 seconds
    const interval = setInterval(fetchSuggestions, 30000)
    return () => clearInterval(interval)
  }, [userId])

  return {
    suggestions,
    loading,
    dismissSuggestion,
    markAsRead,
    generateSuggestion,
    refreshSuggestions: fetchSuggestions
  }
}
