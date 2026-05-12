'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  Target,
  Globe,
  PenTool,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Brain,
  BookOpen,
  Feather,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import { navigateStudio, type StudioTarget, type AssistantTemplate } from '@/lib/assistantBridge'

/* ── Types ──────────────────────────────────────────────────── */

interface CoachTip {
  id: string
  type: string
  title: string
  content: string
  context: string | null
  priority: string
  storyId: string | null
  createdAt: string
}

interface UserWritingStyle {
  tone: string
  complexity: string
  pacing: string
  dialogueStyle: string
  experience: string
  favoriteGenres: string[]
  writingGoals: string[]
  interests: string[]
}

/* ── Per-type visual theming ────────────────────────────────── */

const TYPE_THEME: Record<string, {
  icon: typeof Lightbulb
  label: string
  accent: string        // tailwind text color
  accentBg: string      // tailwind bg for badge
  accentBorder: string  // tailwind border for icon container
  headerAccent: string  // left border highlight color
}> = {
  WRITING_TIP: {
    icon: Lightbulb,
    label: 'Writing Tip',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    headerAccent: 'border-l-amber-400',
  },
  CHARACTER_SUGGESTION: {
    icon: MessageSquare,
    label: 'Character',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    headerAccent: 'border-l-blue-400',
  },
  PLOT_DEVELOPMENT: {
    icon: Target,
    label: 'Plot',
    accent: 'text-violet-600',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    headerAccent: 'border-l-violet-400',
  },
  WORLD_BUILDING: {
    icon: Globe,
    label: 'World',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    headerAccent: 'border-l-emerald-400',
  },
  STYLE_IMPROVEMENT: {
    icon: PenTool,
    label: 'Style',
    accent: 'text-rose-600',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-200',
    headerAccent: 'border-l-rose-400',
  },
  CREATIVE_INSPIRATION: {
    icon: Sparkles,
    label: 'Inspiration',
    accent: 'text-fuchsia-600',
    accentBg: 'bg-fuchsia-50',
    accentBorder: 'border-fuchsia-200',
    headerAccent: 'border-l-fuchsia-400',
  },
}

/* ── Priority config ────────────────────────────────────────── */

const PRIORITY_CONFIG: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  URGENT: { icon: AlertTriangle, label: 'Urgent', color: 'text-red-600' },
  HIGH:   { icon: Zap, label: 'High', color: 'text-orange-600' },
  MEDIUM: { icon: Clock, label: 'Medium', color: 'text-[var(--cx-ink-muted)]' },
  LOW:    { icon: Clock, label: 'Low', color: 'text-[var(--cx-ink-faint)]' },
}

/* ── Studio mapping ─────────────────────────────────────────── */

const TYPE_TO_TARGET: Record<string, { target: StudioTarget; template: AssistantTemplate }> = {
  WRITING_TIP:          { target: 'assistant', template: 'general' },
  CHARACTER_SUGGESTION: { target: 'characters', template: 'general' },
  PLOT_DEVELOPMENT:     { target: 'plots', template: 'plot' },
  WORLD_BUILDING:       { target: 'worlds', template: 'world' },
  STYLE_IMPROVEMENT:    { target: 'voice', template: 'voice' },
  CREATIVE_INSPIRATION: { target: 'ideas', template: 'idea' },
}

/* ── Storage keys ───────────────────────────────────────────── */

const CACHE_KEY = 'writing-coach-last-fetch'
const DISMISS_KEY = 'writing-coach-dismissed-session'
const FEEDBACK_KEY = 'writing-coach-feedback'
const CACHE_TTL = 30 * 60 * 1000

/* ── Component ──────────────────────────────────────────────── */

export function PersonalizedAISuggestions() {
  const { data: session, status } = useSession()
  const [tips, setTips] = useState<CoachTip[]>([])
  const [userStyle, setUserStyle] = useState<UserWritingStyle | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const fetchedRef = useRef(false)

  /* ── Load user writing style ──────────────────────────────── */

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return

    const loadStyle = async () => {
      try {
        const res = await fetch('/api/user/writing-style')
        if (res.ok) {
          const data = await res.json()
          if (data.success) setUserStyle(data.style)
        }
      } catch (error) {
        console.error('Failed to load writing style:', error)
      }
    }

    loadStyle()
  }, [status, session])

  /* ── Load previously saved feedback ───────────────────────── */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FEEDBACK_KEY)
      if (saved) setFeedbackGiven(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  /* ── Fetch tips from backend ──────────────────────────────── */

  const fetchTips = useCallback(async (forceRefresh = false) => {
    // Don't fetch if user dismissed all tips this session
    const sessionDismissed = sessionStorage.getItem(DISMISS_KEY)
    if (sessionDismissed === 'true' && !forceRefresh) return

    // Rate limit: skip if fetched within TTL (unless force refresh)
    if (!forceRefresh) {
      const lastFetch = localStorage.getItem(CACHE_KEY)
      if (lastFetch && Date.now() - parseInt(lastFetch, 10) < CACHE_TTL) {
        // Still within TTL — the server will return cached/persisted tips
      }
    }

    if (forceRefresh) {
      setIsRefreshing(true)
      // Clear cache to force new generation
      localStorage.removeItem(CACHE_KEY)
      sessionStorage.removeItem(DISMISS_KEY)
    } else {
      setIsLoading(true)
    }

    try {
      const url = forceRefresh
        ? '/api/ai/writing-coach?refresh=true'
        : '/api/ai/writing-coach'
      const res = await fetch(url)
      if (!res.ok) return

      const data = await res.json()

      if (!data.hasContent || !data.suggestions || data.suggestions.length === 0) {
        return
      }

      setTips(data.suggestions)
      setIsVisible(true)
      setCurrentIndex(0)
      localStorage.setItem(CACHE_KEY, Date.now().toString())
    } catch (error) {
      console.error('Failed to fetch coaching tips:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || fetchedRef.current) return
    fetchedRef.current = true

    // Delay fetch to avoid blocking initial dashboard render
    const timer = setTimeout(() => fetchTips(false), 5000)
    return () => clearTimeout(timer)
  }, [status, session, fetchTips])

  /* ── Listen for contextual suggestion requests from other components ── */

  useEffect(() => {
    const handleContextualRequest = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail?.context) {
        // Store the context and trigger a refresh
        localStorage.setItem('writing-coach-context', detail.context)
        fetchTips(true)
      }
    }

    window.addEventListener('requestWritingCoachTip', handleContextualRequest)
    return () => window.removeEventListener('requestWritingCoachTip', handleContextualRequest)
  }, [fetchTips])

  /* ── Actions ──────────────────────────────────────────────── */

  const dismissTip = useCallback(async (id: string) => {
    setDismissedId(id)

    try {
      await fetch('/api/ai/writing-coach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error('Failed to dismiss tip:', error)
    }

    setTimeout(() => {
      setTips(prev => {
        const next = prev.filter(t => t.id !== id)
        if (next.length === 0) setIsVisible(false)
        else setCurrentIndex(i => Math.min(i, next.length - 1))
        return next
      })
      setDismissedId(null)
    }, 500)
  }, [])

  const dismissAll = useCallback(async () => {
    for (const tip of tips) {
      fetch('/api/ai/writing-coach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tip.id }),
      }).catch(() => {})
    }

    sessionStorage.setItem(DISMISS_KEY, 'true')
    setTips([])
    setIsVisible(false)
    setCurrentIndex(0)
  }, [tips])

  const openInStudio = useCallback((tip: CoachTip) => {
    const mapping = TYPE_TO_TARGET[tip.type] || TYPE_TO_TARGET.WRITING_TIP

    const prompt = tip.context
      ? `Based on my work "${tip.context}": ${tip.content}`
      : tip.content

    localStorage.setItem('ai_assistant_prompt', prompt)
    localStorage.setItem('ai_assistant_template', mapping.template)

    navigateStudio({
      target: mapping.target,
      prompt,
      template: mapping.template,
    })

    dismissTip(tip.id)
  }, [dismissTip])

  const giveFeedback = useCallback((tipId: string, vote: 'up' | 'down') => {
    setFeedbackGiven(prev => {
      const next = { ...prev, [tipId]: vote }
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const prevTip = () => setCurrentIndex(i => i > 0 ? i - 1 : tips.length - 1)
  const nextTip = () => setCurrentIndex(i => i < tips.length - 1 ? i + 1 : 0)

  /* ── Render ───────────────────────────────────────────────── */

  const current = tips[currentIndex]

  if (!isVisible || !current) return null

  const theme = TYPE_THEME[current.type] || TYPE_THEME.WRITING_TIP
  const Icon = theme.icon
  const isDismissing = dismissedId === current.id
  const priority = PRIORITY_CONFIG[current.priority] || PRIORITY_CONFIG.MEDIUM
  const PriorityIcon = priority.icon
  const tipFeedback = feedbackGiven[current.id]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -12, x: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-5 right-5 z-50 w-[400px] max-w-[calc(100vw-2.5rem)]"
      >
        <div className={`overflow-hidden rounded-[var(--cx-radius-lg)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-xl)] border-l-[3px] ${theme.headerAccent}`}>

          {/* ── Notification badge ─────────────────────── */}
          {tips.length > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 z-10 grid h-5 w-5 place-items-center rounded-full bg-[var(--cx-accent)] text-[10px] font-bold text-white shadow-md"
            >
              {tips.length}
            </motion.div>
          )}

          {/* ── Header ──────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-[var(--cx-radius-sm)] border ${theme.accentBg} ${theme.accentBorder} ${theme.accent}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--cx-ink-primary)]">Writing Coach</p>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.accentBg} ${theme.accent}`}>
                    {theme.label}
                  </span>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${priority.color}`}>
                    <PriorityIcon className="h-3 w-3" />
                    {priority.label}
                  </span>
                  {tips.length > 1 && (
                    <span className="text-[10px] text-[var(--cx-ink-faint)]">
                      {currentIndex + 1}/{tips.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Refresh button */}
              <button
                type="button"
                onClick={() => fetchTips(true)}
                disabled={isRefreshing}
                className="grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] text-[var(--cx-ink-muted)] transition hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)] disabled:opacity-50"
                title="Get new tips"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              {tips.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevTip}
                    className="grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] text-[var(--cx-ink-muted)] transition hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextTip}
                    className="grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] text-[var(--cx-ink-muted)] transition hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)]"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => dismissTip(current.id)}
                className="grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] text-[var(--cx-ink-muted)] transition hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)]"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────── */}
          <div className="px-4 py-4">
            <h3 className="text-sm font-bold leading-snug text-[var(--cx-ink-primary)]">
              {current.title}
            </h3>

            {/* Rich content area with expand/collapse */}
            <div className={`mt-2 ${!isExpanded ? 'max-h-[80px] overflow-hidden' : ''} relative`}>
              <div className="prose prose-sm prose-slate max-w-none text-[13px] leading-relaxed text-[var(--cx-ink-secondary)] prose-p:my-1 prose-strong:text-[var(--cx-ink-primary)]">
                <ReactMarkdown>{current.content}</ReactMarkdown>
              </div>
              {!isExpanded && current.content.length > 200 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            {current.content.length > 200 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs font-medium text-[var(--cx-accent)] hover:underline"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {/* Story/work reference badge */}
            {current.context && (
              <div className="mt-3 flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 text-[var(--cx-ink-faint)]" />
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--cx-ink-muted)]">
                  Re: {current.context}
                </span>
              </div>
            )}

            {/* Personalization context panel */}
            {userStyle && (
              <div className="mt-3 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="h-3 w-3 text-[var(--cx-ink-faint)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--cx-ink-muted)]">
                    Personalized for you
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {userStyle.tone && (
                    <span className="rounded-full border border-[var(--cx-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--cx-ink-secondary)]">
                      <Feather className="mr-0.5 inline h-2.5 w-2.5" />
                      {userStyle.tone}
                    </span>
                  )}
                  {userStyle.complexity && (
                    <span className="rounded-full border border-[var(--cx-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--cx-ink-secondary)]">
                      {userStyle.complexity}
                    </span>
                  )}
                  {userStyle.favoriteGenres?.[0] && (
                    <span className="rounded-full border border-[var(--cx-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--cx-ink-secondary)]">
                      {userStyle.favoriteGenres[0]}
                    </span>
                  )}
                  {userStyle.writingGoals?.[0] && (
                    <span className="rounded-full border border-[var(--cx-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--cx-ink-secondary)]">
                      {userStyle.writingGoals[0]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Tip feedback ─────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-4 py-2">
            <span className="text-[10px] text-[var(--cx-ink-faint)]">Was this helpful?</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => giveFeedback(current.id, 'up')}
                className={`grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] transition ${
                  tipFeedback === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-[var(--cx-ink-faint)] hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)]'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => giveFeedback(current.id, 'down')}
                className={`grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] transition ${
                  tipFeedback === 'down'
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-[var(--cx-ink-faint)] hover:bg-[var(--cx-bg-panel)] hover:text-[var(--cx-ink-primary)]'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────── */}
          <div className="flex items-center gap-2 border-t border-[var(--cx-border)] px-4 py-3">
            <button
              type="button"
              onClick={() => openInStudio(current)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Open in Studio
            </button>
            <button
              type="button"
              onClick={() => dismissTip(current.id)}
              disabled={isDismissing}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--cx-radius-sm)] border px-3 py-2 text-sm font-medium transition ${
                isDismissing
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                  : 'border-[var(--cx-border)] bg-white text-[var(--cx-ink-secondary)] hover:border-[var(--cx-border-hover)] hover:text-[var(--cx-ink-primary)]'
              }`}
            >
              {isDismissing ? <Check className="h-3.5 w-3.5" /> : null}
              {isDismissing ? 'Done' : 'Dismiss'}
            </button>
          </div>

          {/* ── Dot navigation + dismiss all ─────────────── */}
          {tips.length > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--cx-border-subtle)] px-4 py-2">
              <div className="flex gap-1">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? `w-4 ${theme.accentBg.replace('bg-', 'bg-').replace('50', '400')} bg-[var(--cx-accent)]`
                        : 'w-1.5 bg-[var(--cx-border)]'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={dismissAll}
                className="text-[10px] font-medium text-[var(--cx-ink-muted)] transition hover:text-[var(--cx-ink-primary)]"
              >
                Dismiss all
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ────────────────────────────────────────────────────────────
   Utility: trigger contextual suggestions from other components.
   
   Usage from any component:
     import { requestWritingCoachTip } from '@/components/PersonalizedAISuggestions'
     requestWritingCoachTip('User just finished writing a chapter about...')
   ──────────────────────────────────────────────────────────── */

export function requestWritingCoachTip(context: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('requestWritingCoachTip', {
    detail: { context },
  }))
}
