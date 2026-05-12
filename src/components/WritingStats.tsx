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
  PenTool,
  Star,
  Zap
} from 'lucide-react'

interface WritingStats {
  totalWords: number
  totalStories: number
  writingStreak: number
  averageWordsPerDay: number
  favoriteGenre: string
  productivityScore: number
  weeklyGoal: number
  weeklyProgress: number
  monthlyGoal: number
  monthlyProgress: number
}

interface DailyProgress {
  date: string
  words: number
  stories: number
}

export function WritingStats() {
  const [stats, setStats] = useState<WritingStats>({
    totalWords: 0,
    totalStories: 0,
    writingStreak: 0,
    averageWordsPerDay: 0,
    favoriteGenre: 'Fantasy',
    productivityScore: 0,
    weeklyGoal: 5000,
    weeklyProgress: 0,
    monthlyGoal: 20000,
    monthlyProgress: 0
  })
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalWords: 45678,
        totalStories: 12,
        writingStreak: 15,
        averageWordsPerDay: 1250,
        favoriteGenre: 'Fantasy',
        productivityScore: 87,
        weeklyGoal: 5000,
        weeklyProgress: 3750,
        monthlyGoal: 20000,
        monthlyProgress: 12500
      })

      setDailyProgress([
        { date: '2024-01-20', words: 1200, stories: 1 },
        { date: '2024-01-21', words: 850, stories: 0 },
        { date: '2024-01-22', words: 2100, stories: 2 },
        { date: '2024-01-23', words: 1500, stories: 1 },
        { date: '2024-01-24', words: 1800, stories: 1 },
        { date: '2024-01-25', words: 2200, stories: 2 },
        { date: '2024-01-26', words: 1100, stories: 1 }
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-[#BF8C3D]'
    return 'text-red-600'
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-[#2A1711] mb-4 flex items-center justify-center gap-3">
          <BarChart3 className="w-10 h-10 text-[#563024]" />
          Writing Statistics
        </h1>
        <p className="text-[var(--cx-ink-secondary)] text-lg">
          Track your writing progress and achievements
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Words"
          value={stats.totalWords.toLocaleString()}
          icon={PenTool}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Stories"
          value={stats.totalStories}
          icon={BookOpen}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Writing Streak"
          value={`${stats.writingStreak} days`}
          icon={Zap}
          color="yellow"
          isLoading={isLoading}
        />
        <StatCard
          title="Daily Average"
          value={`${stats.averageWordsPerDay.toLocaleString()}`}
          icon={TrendingUp}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Progress Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2A1711]">Weekly Goal</h3>
            <Target className="w-6 h-6 text-[#8D6B4A]" />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-[var(--cx-ink-secondary)] mb-2">
              <span>{stats.weeklyProgress.toLocaleString()} / {stats.weeklyGoal.toLocaleString()} words</span>
              <span>{getProgressPercentage(stats.weeklyProgress, stats.weeklyGoal).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(stats.weeklyProgress, stats.weeklyGoal)}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-[var(--cx-ink-secondary)]">
            {stats.weeklyGoal - stats.weeklyProgress > 0 
              ? `${(stats.weeklyGoal - stats.weeklyProgress).toLocaleString()} words to go!`
              : 'Goal achieved! 🎉'
            }
          </p>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2A1711]">Monthly Goal</h3>
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-[var(--cx-ink-secondary)] mb-2">
              <span>{stats.monthlyProgress.toLocaleString()} / {stats.monthlyGoal.toLocaleString()} words</span>
              <span>{getProgressPercentage(stats.monthlyProgress, stats.monthlyGoal).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(stats.monthlyProgress, stats.monthlyGoal)}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-[var(--cx-ink-secondary)]">
            {stats.monthlyGoal - stats.monthlyProgress > 0 
              ? `${(stats.monthlyGoal - stats.monthlyProgress).toLocaleString()} words to go!`
              : 'Goal achieved! 🎉'
            }
          </p>
        </motion.div>
      </div>

      {/* Daily Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2A1711]">Daily Progress (Last 7 Days)</h3>
          <Clock className="w-6 h-6 text-[#563024]" />
        </div>
        
        <div className="space-y-4">
          {dailyProgress.map((day, index) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-16 text-sm text-[var(--cx-ink-secondary)]">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{day.words} words</span>
                  <span>{day.stories} stories</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((day.words / 2500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2A1711]">Achievements</h3>
          <Award className="w-6 h-6 text-[#BF8C3D]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AchievementBadge
            title="First Story"
            description="Completed your first story"
            icon={BookOpen}
            achieved={true}
          />
          <AchievementBadge
            title="Word Master"
            description="Wrote 10,000 words"
            icon={PenTool}
            achieved={true}
          />
          <AchievementBadge
            title="Streak Keeper"
            description="7-day writing streak"
            icon={Zap}
            achieved={stats.writingStreak >= 7}
          />
          <AchievementBadge
            title="Productive Writer"
            description="80% productivity score"
            icon={Star}
            achieved={stats.productivityScore >= 80}
          />
          <AchievementBadge
            title="Genre Explorer"
            description="Wrote in 5 different genres"
            icon={Target}
            achieved={false}
          />
          <AchievementBadge
            title="Speed Writer"
            description="Wrote 2000 words in a day"
            icon={TrendingUp}
            achieved={stats.averageWordsPerDay >= 2000}
          />
        </div>
      </motion.div>
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
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--cx-ink-secondary)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#2A1711]">
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

function AchievementBadge({ 
  title, 
  description, 
  icon: Icon, 
  achieved 
}: { 
  title: string
  description: string
  icon: any
  achieved: boolean
}) {
  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      achieved 
        ? 'border-yellow-400 bg-yellow-50' 
        : 'border-[var(--cx-border)] bg-[var(--cx-bg-wash)]'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          achieved 
            ? 'bg-yellow-400 text-yellow-900' 
            : 'bg-gray-300 text-[var(--cx-ink-secondary)]'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className={`font-semibold ${achieved ? 'text-yellow-900' : 'text-[#3B2418]'}`}>
            {title}
          </h4>
          <p className={`text-sm ${achieved ? 'text-yellow-700' : 'text-[#8D6B4A]'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}