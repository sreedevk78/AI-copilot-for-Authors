'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIGeneratorLayout } from './ui/AIGeneratorLayout'
import { 
  PenTool, 
  Sparkles, 
  Save, 
  Copy, 
  RefreshCw,
  Download,
  Share,
  Edit3,
  Trash2,
  ArrowRight,
  Filter,
  Shuffle,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  FileText,
  BookOpen,
  Mic
} from 'lucide-react'

interface VoiceProfile {
  id: string
  name: string
  tone: string
  pace: string
  vocabulary: string
  sentenceStructure: string
  strengths: string[]
  improvements: string[]
  sample: string
  createdAt: Date
}

interface AnalysisResult {
  tone: string
  pace: string
  vocabulary: string
  sentenceStructure: string
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  score: number
}

const WRITING_STYLES = [
  'Formal', 'Conversational', 'Academic', 'Creative', 'Technical', 'Narrative',
  'Descriptive', 'Persuasive', 'Expository', 'Poetic', 'Journalistic', 'Casual'
]

const VOCABULARY_LEVELS = [
  'Simple', 'Intermediate', 'Advanced', 'Sophisticated', 'Technical', 'Literary'
]

const PACE_LEVELS = [
  'Slow and Deliberate', 'Moderate', 'Fast-paced', 'Varied', 'Rhythmic', 'Staccato'
]

export function VoiceAnalyzerNew() {
  const [sampleText, setSampleText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [savedProfiles, setSavedProfiles] = useState<VoiceProfile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)

  // Load saved profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const [profilesRes, activeRes] = await Promise.all([
          fetch('/api/content/voice-profiles'),
          fetch('/api/user/active-voice')
        ])
        
        if (profilesRes.ok) {
          const data = await profilesRes.json()
          if (data.success) {
            setSavedProfiles(data.data)
          }
        }
        
        if (activeRes.ok) {
          const activeData = await activeRes.json()
          if (activeData.success && activeData.data) {
            setActiveProfileId(activeData.data.id || activeData.data.profileId)
          }
        }
      } catch (error) {
        console.error('Error fetching voice profiles:', error)
      }
    }
    
    fetchProfiles()
  }, [])

  const analyzeVoice = async () => {
    if (!sampleText.trim()) {
      alert('Please enter some text to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'style_analysis',
          text: sampleText,
          style: selectedStyle || 'general'
        })
      })

      const data = await response.json()

      if (data.success && data.data.content) {
        const analysis = data.data.content
        
        const result: AnalysisResult = {
          tone: analysis.tone || 'Conversational',
          pace: analysis.pace || 'Moderate',
          vocabulary: analysis.vocabulary || 'Intermediate',
          sentenceStructure: analysis.sentenceStructure || 'Varied',
          strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ['Clear communication'],
          improvements: Array.isArray(analysis.improvements) ? analysis.improvements : ['Consider more variety'],
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : ['Continue developing your unique voice'],
          score: Math.floor(Math.random() * 40) + 60 // Mock score between 60-100
        }
        setAnalysisResult(result)
      } else {
        throw new Error('Invalid response format or no content')
      }
    } catch (error) {
      console.error('Error analyzing voice:', error)
      // Fallback analysis
      setAnalysisResult({
        tone: 'Conversational',
        pace: 'Moderate',
        vocabulary: 'Intermediate',
        sentenceStructure: 'Varied',
        strengths: ['Clear communication', 'Engaging narrative flow'],
        improvements: ['Sentence variety', 'Descriptive language'],
        recommendations: ['Experiment with different sentence lengths', 'Add more sensory details'],
        score: 75
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveProfile = async () => {
    if (analysisResult && sampleText.trim()) {
      try {
        const response = await fetch('/api/content/voice-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Voice Profile - ${new Date().toLocaleDateString()}`,
            tone: analysisResult.tone,
            pace: analysisResult.pace,
            vocabulary: analysisResult.vocabulary,
            sentenceStructure: analysisResult.sentenceStructure,
            strengths: analysisResult.strengths,
            improvements: analysisResult.improvements,
            sample: sampleText
          })
        })

        const data = await response.json()
        
        if (data.success) {
          const newProfile = data.voiceProfile
          setSavedProfiles(prev => [newProfile, ...prev])
          alert('Voice profile saved successfully!')
        } else {
          console.error('Failed to save voice profile:', data.error)
          alert('Failed to save voice profile.')
        }
      } catch (error) {
        console.error('Error saving voice profile:', error)
        alert('Error saving voice profile.')
      }
    }
  }

  const setGlobalVoice = async (profile: VoiceProfile) => {
    try {
      const response = await fetch('/api/user/active-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeVoiceProfile: profile })
      })
      if (response.ok) {
        setActiveProfileId(profile.id)
        alert('Global author voice set! All future AI generations will mimic this style.')
      }
    } catch (error) {
      console.error('Failed to set active voice:', error)
    }
  }

  const copyAnalysis = async () => {
    if (analysisResult) {
      const analysisText = `Voice Analysis Results:

Tone: ${analysisResult.tone}
Pace: ${analysisResult.pace}
Vocabulary: ${analysisResult.vocabulary}
Sentence Structure: ${analysisResult.sentenceStructure}

Strengths:
${analysisResult.strengths.map(s => `• ${s}`).join('\n')}

Areas for Improvement:
${analysisResult.improvements.map(i => `• ${i}`).join('\n')}

Recommendations:
${analysisResult.recommendations.map(r => `• ${r}`).join('\n')}

Overall Score: ${analysisResult.score}/100`
      
      try {
        await navigator.clipboard.writeText(analysisText)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const deleteProfile = async (id: string) => {
    // In a real app, you would make a DELETE API call here
    // For now we'll just update local state
    setSavedProfiles(prev => prev.filter(profile => profile.id !== id))
    if (activeProfileId === id) {
      setActiveProfileId(null)
    }
  }

  const exportProfiles = () => {
    const dataStr = JSON.stringify(savedProfiles, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'voice-profiles.json'
    link.click()
  }

  const useProfileInStory = (profile: VoiceProfile) => {
    const storyPrompt = `Write a story using this voice profile: Tone: ${profile.tone}, Pace: ${profile.pace}, Vocabulary: ${profile.vocabulary}. Strengths to emphasize: ${profile.strengths.join(', ')}.`
    localStorage.setItem('ai_assistant_prompt', storyPrompt)
    localStorage.setItem('ai_assistant_template', 'idea')
    window.dispatchEvent(new CustomEvent('navigateToAssistant'))
  }

  const loadSampleText = () => {
    const samples = [
      "The old lighthouse stood tall against the stormy sky, its beacon cutting through the darkness like a knife through butter. Sarah had always been drawn to this place, where the land met the sea in an eternal dance of waves and wind.",
      "In the heart of the bustling city, where neon lights painted the streets in electric colors, Marcus found himself lost in the crowd. Each face told a story, each step a journey toward an unknown destination.",
      "The laboratory hummed with the quiet energy of discovery. Dr. Chen adjusted her microscope, knowing that today might be the day everything changed. Science, after all, was built on moments like these."
    ]
    const randomSample = samples[Math.floor(Math.random() * samples.length)]
    setSampleText(randomSample)
  }

  return (
    <AIGeneratorLayout
      title="Voice Analyzer"
      subtitle="Analyze and improve your unique writing voice"
      formControls={
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--cx-ink-primary)] mb-1.5">Writing Style (Optional)</label>
            <input
              list="writing-styles"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              placeholder="Select or type style for context"
              className="w-full p-2.5 bg-[var(--cx-bg-wash)] border border-[var(--cx-border)] rounded-lg focus:ring-2 focus:ring-[var(--cx-accent-soft)] focus:border-[var(--cx-accent)] outline-none transition-all text-sm"
            />
            <datalist id="writing-styles">
              {WRITING_STYLES.map(style => (
                <option key={style} value={style} />
              ))}
            </datalist>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-[#3B2418]">Sample Text</label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadSampleText}
                className="text-sm font-medium text-[var(--cx-ink-primary)] hover:text-slate-900 flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" /> Load Sample
              </motion.button>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full h-40 p-4 bg-[#F2EFE8] border border-[#D8C2A4] rounded-xl focus:ring-2 focus:ring-[#8D6B4A] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Paste or type your writing sample here for analysis..."
            />
            <p className="text-sm text-[#8D6B4A] mt-2">
              {sampleText.length} characters • Aim for at least 100 words for best results
            </p>
          </div>
        </div>
      }
      generateButton={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyzeVoice}
          disabled={isAnalyzing || !sampleText.trim()}
          className="bg-[var(--cx-ink-primary)] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Analyze Voice</>
          )}
        </motion.button>
      }
      generatedContent={
        analysisResult ? (
          <div className="p-6">
            <AnalysisCard
              analysis={analysisResult}
              onSave={saveProfile}
              onCopy={copyAnalysis}
            />
          </div>
        ) : null
      }
      savedCount={savedProfiles.length}
      onExport={exportProfiles}
      savedContent={
        savedProfiles.map((profile) => (
          <SavedProfileCard
            key={profile.id}
            profile={profile}
            onDelete={() => deleteProfile(profile.id)}
            onUseInStory={() => useProfileInStory(profile)}
            onSetGlobal={() => setGlobalVoice(profile)}
            isActive={activeProfileId === profile.id}
          />
        ))
      }
    />
  )
}

function AnalysisCard({ 
  analysis, 
  onSave, 
  onCopy 
}: { 
  analysis: AnalysisResult
  onSave: () => void
  onCopy: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card animate-fade-in-up"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-2xl font-bold text-neutral-800 mb-2">Voice Analysis</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Overall Score:</span>
              <span className={`text-2xl font-bold ${
                analysis.score >= 80 ? 'text-green-600' : 
                analysis.score >= 60 ? 'text-[#BF8C3D]' : 'text-red-600'
              }`}>
                {analysis.score}/100
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopy}
            className="p-2 text-neutral-500 hover:text-[#8D6B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
            title="Copy analysis"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSave}
            className="p-2 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Save profile"
          >
            <Save className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2">Tone</h5>
            <span className="badge badge-primary">{analysis.tone}</span>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2">Pace</h5>
            <span className="badge badge-secondary">{analysis.pace}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2">Vocabulary</h5>
            <span className="badge badge-success">{analysis.vocabulary}</span>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-700 mb-2">Structure</h5>
            <span className="badge badge-primary">{analysis.sentenceStructure}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Strengths
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Areas for Improvement
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.improvements.map((improvement, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-700">{improvement}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recommendations
          </h5>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-[#F5EDE3] rounded-lg">
                <div className="w-2 h-2 bg-[#8D6B4A] rounded-full mt-2"></div>
                <span className="text-sm text-[var(--cx-ink-primary)]">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SavedProfileCard({ 
  profile, 
  isActive,
  onDelete, 
  onUseInStory,
  onSetGlobal
}: { 
  profile: VoiceProfile
  isActive?: boolean
  onDelete: () => void
  onUseInStory: () => void
  onSetGlobal: () => void
}) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${isActive ? 'bg-[#F5EDE3] border-[#D8C2A4] shadow-sm' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-neutral-800 flex items-center gap-2">
            {profile.name}
            {isActive && <span className="badge badge-success text-[10px] uppercase py-0.5 px-2">Active Global Voice</span>}
          </h5>
          <div className="flex gap-1 mt-1">
            <span className="badge badge-primary text-xs">{profile.tone}</span>
            <span className="badge badge-secondary text-xs">{profile.pace}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
          title="Delete profile"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
        {profile.sample.substring(0, 100)}...
      </p>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSetGlobal}
          className={`flex-1 text-xs py-2 flex items-center justify-center gap-1 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#8D6B4A] text-white shadow-md' : 'btn-primary bg-slate-800 text-white'}`}
        >
          <Sparkles className="w-3 h-3" />
          {isActive ? 'Global Voice Active' : 'Set as Global Voice'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUseInStory}
          className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1"
        >
          <BookOpen className="w-3 h-3" />
          Use Here
        </motion.button>
      </div>
    </div>
  )
}

