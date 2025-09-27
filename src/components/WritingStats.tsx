'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  Award,
  BookOpen,
  Edit3,
  Zap,
  Heart,
  Star,
  Activity
} from 'lucide-react'

interface WritingSession {
  id: string
  date: string
  duration: number
  wordCount: number
  sessionType: string
  productivity: number
  mood: string
}

interface WritingStats {
  totalWords: number
  totalSessions: number
  averageWordsPerSession: number
  writingStreak: number
  bestDay: {
    date: string
    wordCount: number
  }
  weeklyGoal: number
  weeklyProgress: number
  monthlyGoal: number
  monthlyProgress: number
}

export function WritingStats() {
  const [stats, setStats] = useState<WritingStats>({
    totalWords: 0,
    totalSessions: 0,
    averageWordsPerSession: 0,
    writingStreak: 0,
    bestDay: { date: '', wordCount: 0 },
    weeklyGoal: 5000,
    weeklyProgress: 0,
    monthlyGoal: 20000,
    monthlyProgress: 0
  })
  
  const [recentSessions, setRecentSessions] = useState<WritingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWritingStats()
  }, [])

  const loadWritingStats = async () => {
    try {
      setIsLoading(true)
      // Simulate API call - replace with actual API endpoint
      setTimeout(() => {
        setStats({
          totalWords: 15420,
          totalSessions: 47,
          averageWordsPerSession: 328,
          writingStreak: 12,
          bestDay: { date: '2024-09-20', wordCount: 1250 },
          weeklyGoal: 5000,
          weeklyProgress: 3200,
          monthlyGoal: 20000,
          monthlyProgress: 15420
        })
        
        setRecentSessions([
          {
            id: '1',
            date: '2024-09-27',
            duration: 45,
            wordCount: 420,
            sessionType: 'Writing',
            productivity: 85,
            mood: 'focused'
          },
          {
            id: '2',
            date: '2024-09-26',
            duration: 30,
            wordCount: 280,
            sessionType: 'Editing',
            productivity: 70,
            mood: 'creative'
          },
          {
            id: '3',
            date: '2024-09-25',
            duration: 60,
            wordCount: 650,
            sessionType: 'Writing',
            productivity: 90,
            mood: 'inspired'
          }
        ])
        
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading writing stats:', error)
      setIsLoading(false)
    }
  }

  const weeklyProgressPercentage = (stats.weeklyProgress / stats.weeklyGoal) * 100
  const monthlyProgressPercentage = (stats.monthlyProgress / stats.monthlyGoal) * 100

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Words"
          value={stats.totalWords.toLocaleString()}
          icon={Edit3}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Writing Sessions"
          value={stats.totalSessions.toString()}
          icon={BookOpen}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.writingStreak} days`}
          icon={Zap}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Avg Words/Session"
          value={stats.averageWordsPerSession.toString()}
          icon={BarChart3}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Weekly Goal
            </h3>
            <span className="text-sm text-gray-600">
              {stats.weeklyProgress.toLocaleString()} / {stats.weeklyGoal.toLocaleString()} words
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(weeklyProgressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {Math.round(weeklyProgressPercentage)}% complete
            </span>
            <span className="text-gray-600">
              {stats.weeklyGoal - stats.weeklyProgress} words remaining
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Monthly Goal
            </h3>
            <span className="text-sm text-gray-600">
              {stats.monthlyProgress.toLocaleString()} / {stats.monthlyGoal.toLocaleString()} words
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(monthlyProgressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {Math.round(monthlyProgressPercentage)}% complete
            </span>
            <span className="text-gray-600">
              {stats.monthlyGoal - stats.monthlyProgress} words remaining
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Writing Sessions
          </h3>
          <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">
            View All
          </button>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <WritingSessionCard
                key={session.id}
                session={session}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No writing sessions recorded yet</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Recent Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AchievementCard
            title="First 1000 Words"
            description="Wrote your first 1000 words"
            icon={Star}
            color="yellow"
            isUnlocked={stats.totalWords >= 1000}
          />
          <AchievementCard
            title="Week Streak"
            description="Wrote for 7 consecutive days"
            icon={Zap}
            color="blue"
            isUnlocked={stats.writingStreak >= 7}
          />
          <AchievementCard
            title="Productivity Master"
            description="Averaged 500+ words per session"
            icon={TrendingUp}
            color="green"
            isUnlocked={stats.averageWordsPerSession >= 500}
          />
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
  value: string
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

function WritingSessionCard({ session, index }: { session: WritingSession, index: number }) {
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'focused': return 'text-blue-600 bg-blue-100'
      case 'creative': return 'text-purple-600 bg-purple-100'
      case 'inspired': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 80) return 'from-green-500 to-green-600'
    if (productivity >= 60) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
        {session.sessionType.charAt(0)}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-semibold text-gray-900">{session.sessionType}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(session.mood)}`}>
            {session.mood}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {session.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            {session.wordCount} words
          </span>
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">{session.productivity}%</span>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${getProductivityColor(session.productivity)}`}
            style={{ width: `${session.productivity}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AchievementCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  isUnlocked 
}: {
  title: string
  description: string
  icon: any
  color: string
  isUnlocked: boolean
}) {
  const colorClasses = {
    yellow: 'from-yellow-400 to-yellow-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 transition-all ${
        isUnlocked 
          ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${
          isUnlocked 
            ? `bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}` 
            : 'bg-gray-300'
        } flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <div>
          <h4 className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {title}
          </h4>
          <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {description}
          </p>
        </div>
        {isUnlocked && (
          <div className="ml-auto">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
