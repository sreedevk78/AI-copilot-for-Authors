'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Upload, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Eye,
  Brain,
  Palette,
  Mic,
  MicOff,
  Download,
  Share2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  Heart,
  MessageSquare
} from 'lucide-react'
import { WritingAnalyzer } from '@/lib/writingUtils'

interface StyleAnalysis {
  aiAnalysis: string
  characteristics: string[]
  suggestions: string[]
  metrics: {
    wordCount: number
    sentenceCount: number
    paragraphCount: number
    averageWordsPerSentence: number
    readabilityScore: number
    complexity: 'simple' | 'moderate' | 'complex'
  }
  style: {
    tone: string[]
    pacing: 'slow' | 'medium' | 'fast'
    voice: 'first' | 'second' | 'third'
    tense: 'past' | 'present' | 'future'
    characteristics: string[]
  }
  summary: {
    wordCount: number
    complexity: string
    primaryTone: string
    voice: string
    tense: string
  }
}

interface VoiceProfile {
  id: string
  name: string
  description: string
  sampleText: string
  analysis: StyleAnalysis
  isActive: boolean
  createdAt: string
}

export function VoiceAnalyzer() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'profiles' | 'compare'>('analyze')
  const [inputText, setInputText] = useState('')
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])

  const analyzeText = async () => {
    if (!inputText.trim() || inputText.length < 50) {
      alert('Please enter at least 50 characters of text to analyze.')
      return
    }

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/ai/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAnalysis(data.data)
      } else {
        alert('Failed to analyze text. Please try again.')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze text. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveAsProfile = () => {
    if (!analysis || !inputText.trim()) return

    const newProfile: VoiceProfile = {
      id: `profile-${Date.now()}`,
      name: `Voice Profile ${voiceProfiles.length + 1}`,
      description: `Generated from ${analysis.summary.wordCount} words of text`,
      sampleText: inputText,
      analysis,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setVoiceProfiles(prev => [...prev, newProfile])
    setActiveTab('profiles')
  }

  const loadSampleText = () => {
    const sampleTexts = [
      "The old man sat by the window, watching the rain cascade down the glass like tears from heaven. His weathered hands trembled slightly as he reached for his cup of tea, now cold and forgotten. Outside, the world moved in a blur of gray and green, but inside his cottage, time seemed to stand still. Memories flooded his mind like the rain outside—memories of laughter, of love, of days when the sun shone bright and warm.",
      
      "She couldn't believe what she was seeing. The email notification had arrived at exactly 3:47 AM, and now she was wide awake, staring at her laptop screen in disbelief. The words seemed to blur together as she read them again and again. 'Congratulations,' it began, 'you have been selected for the position of...' Her heart raced with excitement and fear. This was it. This was the opportunity she had been waiting for.",
      
      "The laboratory hummed with the quiet efficiency of machines that never slept. Dr. Chen moved between the workstations with practiced precision, her movements a dance of scientific method and creative intuition. Each test tube, each measurement, each calculation brought her closer to the breakthrough that could change everything. But in the back of her mind, a small voice whispered doubt. What if she was wrong? What if all this work led to nothing?"
    ]
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setInputText(randomText)
  }

  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Voice Analyzer</h1>
          </div>
          <p className="text-purple-100">
            Discover your unique writing voice and style patterns
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'analyze'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analyze Text
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'profiles'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Voice Profiles
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'compare'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compare Styles
            </button>
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'analyze' && (
              <AnalyzeTab
                inputText={inputText}
                setInputText={setInputText}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                onAnalyze={analyzeText}
                onLoadSample={loadSampleText}
                onSaveAsProfile={saveAsProfile}
              />
            )}
            
            {activeTab === 'profiles' && (
              <ProfilesTab
                voiceProfiles={voiceProfiles}
                onSelectProfile={(profile) => {
                  setInputText(profile.sampleText)
                  setAnalysis(profile.analysis)
                  setActiveTab('analyze')
                }}
              />
            )}
            
            {activeTab === 'compare' && (
              <CompareTab
                voiceProfiles={voiceProfiles}
                selectedProfiles={selectedProfiles}
                onToggleSelection={toggleProfileSelection}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function AnalyzeTab({
  inputText,
  setInputText,
  analysis,
  isAnalyzing,
  onAnalyze,
  onLoadSample,
  onSaveAsProfile
}: {
  inputText: string
  setInputText: (text: string) => void
  analysis: StyleAnalysis | null
  isAnalyzing: boolean
  onAnalyze: () => void
  onLoadSample: () => void
  onSaveAsProfile: () => void
}) {
  return (
    <motion.div
      key="analyze"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Text Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analyze Your Writing</h2>
          <button
            onClick={onLoadSample}
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Load Sample
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your writing sample here (minimum 50 characters)..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{inputText.length} characters</span>
              <span>{inputText.split(' ').filter(word => word.length > 0).length} words</span>
              <span>{inputText.split('.').length - 1} sentences</span>
            </div>
            
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing || inputText.length < 50}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Voice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Word Count"
                value={analysis.summary.wordCount.toLocaleString()}
                icon={FileText}
                color="blue"
              />
              <StatCard
                title="Complexity"
                value={analysis.summary.complexity}
                icon={Brain}
                color="green"
              />
              <StatCard
                title="Primary Tone"
                value={analysis.summary.primaryTone}
                icon={Heart}
                color="purple"
              />
              <StatCard
                title="Voice"
                value={analysis.summary.voice}
                icon={MessageSquare}
                color="pink"
              />
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Analysis */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">{analysis.aiAnalysis}</p>
              </div>

              {/* Style Characteristics */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  Style Characteristics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.characteristics.map((char, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>

              {/* Writing Metrics */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Writing Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sentences:</span>
                    <span className="font-semibold">{analysis.metrics.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Words/Sentence:</span>
                    <span className="font-semibold">{analysis.metrics.averageWordsPerSentence.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Readability Score:</span>
                    <span className="font-semibold">{Math.round(analysis.metrics.readabilityScore)}/100</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  Improvement Suggestions
                </h3>
                {analysis.suggestions.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No specific suggestions at this time.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onSaveAsProfile}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Voice Profile
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { 
  title: string
  value: string
  icon: any
  color: string
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ProfilesTab({
  voiceProfiles,
  onSelectProfile
}: {
  voiceProfiles: VoiceProfile[]
  onSelectProfile: (profile: VoiceProfile) => void
}) {
  return (
    <motion.div
      key="profiles"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Voice Profiles</h2>
        <span className="text-sm text-gray-600">{voiceProfiles.length} profiles saved</span>
      </div>

      {voiceProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voiceProfiles.map((profile, index) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              index={index}
              onSelect={() => onSelectProfile(profile)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No voice profiles yet</h3>
          <p className="text-gray-600 mb-4">Analyze some text to create your first voice profile</p>
          <button
            onClick={() => {}}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Start Analyzing
          </button>
        </div>
      )}
    </motion.div>
  )
}

function ProfileCard({
  profile,
  index,
  onSelect
}: {
  profile: VoiceProfile
  index: number
  onSelect: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {profile.name.charAt(0)}
        </div>
        <div className="flex items-center gap-2">
          {profile.isActive && (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
          <span className="text-xs text-gray-500">
            {new Date(profile.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{profile.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{profile.description}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Tone:</span>
          <span className="font-medium">{profile.analysis.summary.primaryTone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Complexity:</span>
          <span className="font-medium">{profile.analysis.summary.complexity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Voice:</span>
          <span className="font-medium">{profile.analysis.summary.voice} person</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {profile.analysis.characteristics.slice(0, 3).map((char, index) => (
            <span
              key={index}
              className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
            >
              {char}
            </span>
          ))}
          {profile.analysis.characteristics.length > 3 && (
            <span className="text-xs text-gray-500">
              +{profile.analysis.characteristics.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CompareTab({
  voiceProfiles,
  selectedProfiles,
  onToggleSelection
}: {
  voiceProfiles: VoiceProfile[]
  selectedProfiles: string[]
  onToggleSelection: (profileId: string) => void
}) {
  const selectedProfilesData = voiceProfiles.filter(profile => 
    selectedProfiles.includes(profile.id)
  )

  return (
    <motion.div
      key="compare"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Compare Voice Styles</h2>

      {voiceProfiles.length < 2 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need at least 2 profiles</h3>
          <p className="text-gray-600">Create multiple voice profiles to compare them</p>
        </div>
      ) : (
        <>
          {/* Profile Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Profiles to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voiceProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => onToggleSelection(profile.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProfiles.includes(profile.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 ${
                      selectedProfiles.includes(profile.id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProfiles.includes(profile.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{profile.name}</h4>
                      <p className="text-sm text-gray-600">{profile.analysis.summary.primaryTone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          {selectedProfilesData.length >= 2 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Comparison Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProfilesData.map((profile) => (
                  <div key={profile.id} className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">{profile.name}</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Complexity:</span>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                profile.analysis.summary.complexity === 'simple' ? 'bg-green-500' :
                                profile.analysis.summary.complexity === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: profile.analysis.summary.complexity === 'simple' ? '33%' : 
                                      profile.analysis.summary.complexity === 'moderate' ? '66%' : '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600">Primary Tone:</span>
                        <p className="font-medium">{profile.analysis.summary.primaryTone}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600">Voice:</span>
                        <p className="font-medium">{profile.analysis.summary.voice} person</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600">Word Count:</span>
                        <p className="font-medium">{profile.analysis.summary.wordCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
