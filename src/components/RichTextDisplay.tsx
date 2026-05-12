'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface RichTextDisplayProps {
  content: string
  className?: string
  showHeader?: boolean
  title?: string
}

export function RichTextDisplay({ 
  content, 
  className = '', 
  showHeader = false, 
  title = 'AI Generated Content' 
}: RichTextDisplayProps) {
  
  // Function to format the content with proper HTML structure
  const formatContent = (text: string): ReactNode => {
    if (!text) return null

    // Split content into sections based on common patterns
    const sections = text.split(/(?=\n\n|\n#|\n##|\n###|\n\*\*|\n-|\n\d+\.)/)
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim()
      if (!trimmedSection) return null

      // Handle headers
      if (trimmedSection.startsWith('#')) {
        const level = trimmedSection.match(/^#+/)?.[0].length || 1
        const text = trimmedSection.replace(/^#+\s*/, '')
        
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        
        return (
          <HeaderTag 
            key={index}
            className={`font-bold text-gray-900 mb-4 ${
              level === 1 ? 'text-2xl' : 
              level === 2 ? 'text-xl' : 
              level === 3 ? 'text-lg' : 'text-base'
            }`}
          >
            {text}
          </HeaderTag>
        )
      }

      // Handle bold text
      if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**')) {
        const text = trimmedSection.replace(/\*\*/g, '')
        return (
          <p key={index} className="font-bold text-gray-900 mb-3 text-lg">
            {text}
          </p>
        )
      }

      // Handle lists
      if (trimmedSection.startsWith('- ') || trimmedSection.startsWith('* ')) {
        const items = trimmedSection.split('\n').filter(item => item.trim().startsWith('- ') || item.trim().startsWith('* '))
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-[var(--cx-ink-primary)] leading-relaxed">
                {item.replace(/^[-*]\s*/, '')}
              </li>
            ))}
          </ul>
        )
      }

      // Handle numbered lists
      if (/^\d+\./.test(trimmedSection)) {
        const items = trimmedSection.split('\n').filter(item => /^\d+\./.test(item.trim()))
        return (
          <ol key={index} className="list-decimal list-inside mb-4 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-[var(--cx-ink-primary)] leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        )
      }

      // Handle regular paragraphs
      return (
        <p key={index} className="text-[var(--cx-ink-primary)] leading-relaxed mb-4">
          {trimmedSection}
        </p>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#FDFBF7] rounded-xl border border-[var(--cx-border)] shadow-sm ${className}`}
    >
      {showHeader && (
        <div className="border-b border-[var(--cx-border)] px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {title}
          </h3>
        </div>
      )}
      
      <div className="p-6 prose prose-lg max-w-none">
        <div className="space-y-4">
          {formatContent(content)}
        </div>
      </div>
    </motion.div>
  )
}

// Specialized component for world building content
export function WorldBuildingDisplay({ content, className = '' }: { content: string, className?: string }) {
  const formatWorldContent = (text: string): ReactNode => {
    if (!text) return null

    // Try to parse as JSON first (structured world data)
    try {
      const worldData = JSON.parse(text)
      return (
        <div className="space-y-6">
          {/* Overview */}
          {worldData.description && (
            <div className="bg-gradient-to-r from-[#F5EDE3] to-[#F2EFE8] p-6 rounded-lg border border-[#D8C2A4]">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded"></div>
                World Overview
              </h3>
              <p className="text-blue-800 leading-relaxed text-lg">{worldData.description}</p>
            </div>
          )}

          {/* Magic System */}
          {worldData.magicSystem && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded"></div>
                Magic System
              </h3>
              <div className="text-purple-800 leading-relaxed">
                {typeof worldData.magicSystem === 'string' ? (
                  <p>{worldData.magicSystem}</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(worldData.magicSystem).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="ml-2">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Political System */}
          {worldData.politicalSystem && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
              <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-amber-500 rounded"></div>
                Political System
              </h3>
              <div className="text-amber-800 leading-relaxed">
                {typeof worldData.politicalSystem === 'string' ? (
                  <p>{worldData.politicalSystem}</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(worldData.politicalSystem).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="ml-2">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Characters */}
          {worldData.characters && Array.isArray(worldData.characters) && worldData.characters.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded"></div>
                Characters
              </h3>
              <div className="grid gap-4">
                {worldData.characters.map((character: any, index: number) => (
                  <div key={index} className="bg-[#FDFBF7] p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 text-lg mb-2">{character.name}</h4>
                    <div className="space-y-2 text-green-700">
                      {character.role && (
                        <p><span className="font-semibold">Role:</span> {character.role}</p>
                      )}
                      {character.description && (
                        <p><span className="font-semibold">Description:</span> {character.description}</p>
                      )}
                      {character.motivation && (
                        <p><span className="font-semibold">Motivation:</span> {character.motivation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {worldData.rules && Array.isArray(worldData.rules) && worldData.rules.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-red-500 rounded"></div>
                World Rules
              </h3>
              <ul className="list-disc list-inside space-y-2 text-red-800">
                {worldData.rules.map((rule: string, index: number) => (
                  <li key={index} className="leading-relaxed">{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    } catch {
      // Fallback to regular text formatting
      return formatContent(text)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#FDFBF7] rounded-xl border border-[var(--cx-border)] shadow-sm ${className}`}
    >
      <div className="p-6">
        <div className="space-y-4">
          {formatWorldContent(content)}
        </div>
      </div>
    </motion.div>
  )
}

// Component for general AI generation content
export function AIGenerationDisplay({ 
  content, 
  type, 
  className = '' 
}: { 
  content: string, 
  type: string, 
  className?: string 
}) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'character': return '👤'
      case 'plot': return '📖'
      case 'dialogue': return '💬'
      case 'world': return '🌍'
      case 'story': return '📚'
      default: return '✨'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'character': return 'from-blue-50 to-cyan-50 border-[#D8C2A4] text-blue-900'
      case 'plot': return 'from-purple-50 to-pink-50 border-purple-200 text-purple-900'
      case 'dialogue': return 'from-green-50 to-emerald-50 border-green-200 text-green-900'
      case 'world': return 'from-amber-50 to-orange-50 border-amber-200 text-amber-900'
      case 'story': return 'from-[#F5EDE3] to-[#F2EFE8] border-[#D8C2A4] text-[#2A1711]'
      default: return 'from-gray-50 to-slate-50 border-[var(--cx-border)] text-gray-900'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${getTypeColor(type)} rounded-xl border shadow-sm ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getTypeIcon(type)}</span>
          <h3 className="text-lg font-bold capitalize">{type} Generation</h3>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="space-y-4">
            {formatContent(content)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper function for formatting content (used by other components)
export function formatContent(text: string): ReactNode {
  if (!text) return null

  const sections = text.split(/(?=\n\n|\n#|\n##|\n###|\n\*\*|\n-|\n\d+\.)/)
  
  return sections.map((section, index) => {
    const trimmedSection = section.trim()
    if (!trimmedSection) return null

    // Handle headers
    if (trimmedSection.startsWith('#')) {
      const level = trimmedSection.match(/^#+/)?.[0].length || 1
      const text = trimmedSection.replace(/^#+\s*/, '')
      
      const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
      
      return (
        <HeaderTag 
          key={index}
          className={`font-bold text-gray-900 mb-4 ${
            level === 1 ? 'text-2xl' : 
            level === 2 ? 'text-xl' : 
            level === 3 ? 'text-lg' : 'text-base'
          }`}
        >
          {text}
        </HeaderTag>
      )
    }

    // Handle bold text
    if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**')) {
      const text = trimmedSection.replace(/\*\*/g, '')
      return (
        <p key={index} className="font-bold text-gray-900 mb-3 text-lg">
          {text}
        </p>
      )
    }

    // Handle lists
    if (trimmedSection.startsWith('- ') || trimmedSection.startsWith('* ')) {
      const items = trimmedSection.split('\n').filter(item => item.trim().startsWith('- ') || item.trim().startsWith('* '))
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-2">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-[var(--cx-ink-primary)] leading-relaxed">
              {item.replace(/^[-*]\s*/, '')}
            </li>
          ))}
        </ul>
      )
    }

    // Handle numbered lists
    if (/^\d+\./.test(trimmedSection)) {
      const items = trimmedSection.split('\n').filter(item => /^\d+\./.test(item.trim()))
      return (
        <ol key={index} className="list-decimal list-inside mb-4 space-y-2">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-[var(--cx-ink-primary)] leading-relaxed">
              {item.replace(/^\d+\.\s*/, '')}
            </li>
          ))}
        </ol>
      )
    }

    // Handle regular paragraphs
    return (
      <p key={index} className="text-[var(--cx-ink-primary)] leading-relaxed mb-4">
        {trimmedSection}
      </p>
    )
  })
}
