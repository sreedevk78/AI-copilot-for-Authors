'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Lightbulb, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Star,
  Edit3
} from 'lucide-react'
import { StoryGenerator } from '@/lib/writingUtils'
import { StoryIdeaGenerator } from './StoryIdeaGenerator'
import { PlotBuilder } from './PlotBuilder'
import { DialogueCreator } from './DialogueCreator'
import { CharacterBuilder } from './CharacterBuilder'
import { WritingStats } from './WritingStats'
import { VoiceAnalyzer } from './VoiceAnalyzer'

interface Story {
  id: string
  title: string
  genre: string
  status: string
  wordCount: number
  updatedAt: string
}

interface WritingMetrics {
  totalStories: number
  totalWords: number
  averageWordsPerStory: number
  writingStreak: number
}

export function WritingDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stories, setStories] = useState<Story[]>([])
  const [metrics, setMetrics] = useState<WritingMetrics>({
    totalStories: 0,
    totalWords: 0,
    averageWordsPerStory: 0,
    writingStreak: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      // Load user stories and metrics
      const [storiesResponse, metricsResponse] = await Promise.all([
        fetch('/api/stories?authorId=current-user'),
        fetch('/api/writing/stats')
      ])
      
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        setStories(storiesData.data || [])
      }
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData.data || metrics)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'stories', label: 'My Stories', icon: BookOpen },
    { id: 'ideas', label: 'Story Ideas', icon: Lightbulb },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'plots', label: 'Plot Builder', icon: Target },
    { id: 'dialogue', label: 'Dialogue', icon: MessageSquare },
    { id: 'voice', label: 'Voice Analysis', icon: Star }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stories={stories} metrics={metrics} isLoading={isLoading} />
      case 'stories':
        return <StoriesTab stories={stories} onStoryUpdate={loadDashboardData} />
      case 'ideas':
        return <StoryIdeaGenerator />
      case 'characters':
        return <CharacterBuilder />
      case 'plots':
        return <PlotBuilder />
      case 'dialogue':
        return <DialogueCreator />
      case 'voice':
        return <VoiceAnalyzer />
      default:
        return <OverviewTab stories={stories} metrics={metrics} isLoading={isLoading} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                AI Writing Studio
              </h1>
              <p className="text-gray-600 text-lg">
                Unleash your creativity with AI-powered writing tools
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
              New Story
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function OverviewTab({ stories, metrics, isLoading }: { 
  stories: Story[], 
  metrics: WritingMetrics, 
  isLoading: boolean 
}) {
  const recentStories = stories.slice(0, 5)
  const storyIdeas = StoryGenerator.generateStoryIdeas()

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stories"
          value={metrics.totalStories}
          icon={BookOpen}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Words"
          value={metrics.totalWords.toLocaleString()}
          icon={Edit3}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Writing Streak"
          value={`${metrics.writingStreak} days`}
          icon={TrendingUp}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Avg Words/Story"
          value={Math.round(metrics.averageWordsPerStory)}
          icon={BarChart3}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Generate Story Ideas"
            description="Get AI-powered story concepts"
            icon={Lightbulb}
            color="yellow"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Build Characters"
            description="Create compelling characters"
            icon={Users}
            color="blue"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Develop Plot"
            description="Structure your story"
            icon={Target}
            color="green"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Write Dialogue"
            description="Craft authentic conversations"
            icon={MessageSquare}
            color="purple"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Recent Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Recent Stories
          </h2>
          {recentStories.length > 0 ? (
            <div className="space-y-4">
              {recentStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stories yet. Create your first story!</p>
            </div>
          )}
        </div>

        {/* Story Ideas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Story Ideas
          </h2>
          <div className="space-y-3">
            {storyIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <p className="text-sm text-gray-700">{idea}</p>
                <button className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium">
                  Use this idea →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLoading 
}: { 
  title: string
  value: string | number
  icon: any
  color: string
  isLoading: boolean
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '...' : value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  title: string
  description: string
  icon: any
  color: string
  onClick: () => void
}) {
  const colorClasses = {
    yellow: 'from-yellow-400 to-orange-500',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left group"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.button>
  )
}

function StoryCard({ story }: { story: Story }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{story.title}</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {story.genre}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{story.wordCount.toLocaleString()} words</span>
        <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

function StoriesTab({ stories, onStoryUpdate }: { 
  stories: Story[], 
  onStoryUpdate: () => void 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Stories</h2>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
          New Story
        </button>
      </div>
      
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
          <p className="text-gray-600 mb-4">Start your writing journey by creating your first story</p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow">
            Create Your First Story
          </button>
        </div>
      )}
    </div>
  )
}
