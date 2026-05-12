'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Gauge,
  LayoutGrid,
  LogOut,
  PenLine,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { BackendVerification } from './BackendVerification'
import { CharacterBuilderNew } from './CharacterBuilderNew'
import { DialogueCreatorNew } from './DialogueCreatorNew'
import { PersonalizedAISuggestions } from './PersonalizedAISuggestions'
import { PlotBuilderNew } from './PlotBuilderNew'
import { StoryIdeaGeneratorNew } from './StoryIdeaGeneratorNew'
import { UnifiedAssistant } from './UnifiedAssistant'
import { VoiceAnalyzerNew } from './VoiceAnalyzerNew'
import { WorldBuilder } from './WorldBuilder'
import {
  AppShell,
  CommandButton,
  CommandPalette,
  EmptyState,
  MetricPill,
  ProgressLine,
  SurfacePanel,
  TopBar,
  type PaletteCommand,
} from './ui/author-os'
import {
  assistantCopy,
  authorNav,
  commandGroups,
  commandIcons,
  deskCopy,
  libraryCopy,
  studioModes,
  type ProductArea,
  type StudioMode,
} from '@/lib/authorOsCopy'
import { sendPromptToAssistant, subscribeToStudioNavigation, type StudioTarget } from '@/lib/assistantBridge'

interface Story {
  id: string
  title: string
  description?: string
  genre: string
  status: string
  wordCount: number
  targetWordCount?: number | null
  updatedAt: string | Date
}

interface WritingMetrics {
  totalStories: number
  totalWords: number
  averageWordsPerStory: number
  writingStreak: number
}

type LibraryViewMode = 'manuscripts' | 'systems'

const studioTargetMap: Partial<Record<StudioTarget, StudioMode>> = {
  ideas: 'ideas',
  characters: 'characters',
  plots: 'plots',
  dialogue: 'dialogue',
  worlds: 'worlds',
  voice: 'voice',
}

const genreOptions = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Literary Fiction',
  'Young Adult',
  'Historical Fiction',
  'Dystopian',
]

const nextMoves: Array<{
  label: string
  description: string
  mode: StudioMode
  icon: LucideIcon
}> = [
  {
    label: 'Develop Cast',
    description: 'Pressure-test motives, flaws, secrets, and relationships.',
    mode: 'characters',
    icon: studioModes.find((mode) => mode.id === 'characters')!.icon,
  },
  {
    label: 'Shape Arc',
    description: 'Turn loose scenes into a cleaner dramatic spine.',
    mode: 'plots',
    icon: studioModes.find((mode) => mode.id === 'plots')!.icon,
  },
  {
    label: 'Tune Voice',
    description: 'Lock the prose signature before generating more.',
    mode: 'voice',
    icon: studioModes.find((mode) => mode.id === 'voice')!.icon,
  },
]

export function WritingDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeArea, setActiveArea] = useState<ProductArea>('desk')
  const [activeStudioMode, setActiveStudioMode] = useState<StudioMode>('ideas')
  const [libraryView, setLibraryView] = useState<LibraryViewMode>('manuscripts')
  const [stories, setStories] = useState<Story[]>([])
  const [metrics, setMetrics] = useState<WritingMetrics>({
    totalStories: 0,
    totalWords: 0,
    averageWordsPerStory: 0,
    writingStreak: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      const userId = (session?.user as any)?.id || ''
      const response = await fetch(`/api/stories?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        const nextStories: Story[] = data.data || []
        const totalWords = nextStories.reduce((sum, story) => sum + (story.wordCount || 0), 0)
        setStories(nextStories)
        setMetrics({
          totalStories: nextStories.length,
          totalWords,
          averageWordsPerStory: nextStories.length > 0 ? totalWords / nextStories.length : 0,
          writingStreak: 0,
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      loadDashboardData()
    }
  }, [status, router, loadDashboardData])

  useEffect(() => {
    return subscribeToStudioNavigation(({ target }) => {
      if (target === 'assistant') {
        setActiveArea('assistant')
        return
      }

      if (target === 'stories') {
        setActiveArea('library')
        setLibraryView('manuscripts')
        return
      }

      const studioMode = studioTargetMap[target]
      if (studioMode) {
        setActiveArea('studio')
        setActiveStudioMode(studioMode)
      }
    })
  }, [])

  const openStudioMode = useCallback((mode: StudioMode) => {
    setActiveArea('studio')
    setActiveStudioMode(mode)
  }, [])

  const commands = useMemo<PaletteCommand[]>(() => {
    const CommandManuscript = commandIcons.manuscript
    const CommandAssistant = commandIcons.assistant
    const CommandBook = commandIcons.book

    return [
      {
        id: 'new-manuscript',
        title: 'New Manuscript',
        detail: 'Open the manuscript setup sheet.',
        group: commandGroups.primary,
        shortcut: 'N',
        icon: CommandManuscript,
        action: () => setShowCreateStory(true),
      },
      {
        id: 'ask-muse',
        title: 'Ask the Muse',
        detail: 'Move into the conversation workspace.',
        group: commandGroups.primary,
        shortcut: 'A',
        icon: CommandAssistant,
        action: () => setActiveArea('assistant'),
      },
      {
        id: 'open-library',
        title: 'Open Manuscript Library',
        detail: 'Review drafts, statuses, and saved systems.',
        group: commandGroups.primary,
        icon: CommandBook,
        action: () => {
          setActiveArea('library')
          setLibraryView('manuscripts')
        },
      },
      ...studioModes.map((mode) => ({
        id: `studio-${mode.id}`,
        title: mode.command,
        detail: mode.brief,
        group: commandGroups.studio,
        icon: mode.icon,
        action: () => openStudioMode(mode.id),
      })),
      {
        id: 'run-verification',
        title: 'Run Verification',
        detail: 'Open preserved backend verification tools.',
        group: commandGroups.systems,
        icon: ShieldCheck,
        action: () => {
          setActiveArea('library')
          setLibraryView('systems')
          setShowVerification(true)
        },
      },
    ]
  }, [openStudioMode])

  const activeAreaMeta = useMemo(
    () => authorNav.find((item) => item.id === activeArea) || authorNav[0],
    [activeArea],
  )

  const topBarTitle = activeArea === 'library'
    ? libraryCopy.title
    : activeArea === 'assistant'
      ? assistantCopy.title
      : activeAreaMeta.label

  if (status === 'loading') {
    return <AuthorLoadingState />
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <AppShell
      navItems={authorNav}
      activeItem={activeArea}
      onNavigate={(area) => {
        setActiveArea(area)
        if (area === 'library') setLibraryView('manuscripts')
      }}
      sessionName={session?.user?.name || 'Writer'}
      sessionEmail={session?.user?.email || ''}
      mobileAction={<CommandButton compact onClick={() => setCommandOpen(true)} />}
    >
      <TopBar
        eyebrow={activeAreaMeta.eyebrow || 'Author OS'}
        title={topBarTitle}
        icon={activeAreaMeta.icon}
        actions={
          <>
            <CommandButton onClick={() => setCommandOpen(true)} />
            <button
              type="button"
              onClick={() => setShowCreateStory(true)}
              className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--cx-ink-primary)] transition hover:border-[var(--cx-border-hover)]"
            >
              <Plus className="h-4 w-4" />
              New Manuscript
            </button>
            <button
              type="button"
              onClick={() => setActiveArea('assistant')}
              className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--cx-shadow-md)] transition hover:bg-[var(--cx-ink-secondary)]"
            >
              <Bot className="h-4 w-4" />
              Ask the Muse
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white text-[var(--cx-ink-muted)] transition hover:text-[var(--cx-ink-primary)]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        }
      />

      <motion.section
        key={`${activeArea}-${activeStudioMode}-${libraryView}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
      >
        {activeArea === 'desk' && (
          <DeskView
            stories={stories}
            metrics={metrics}
            isLoading={isLoading}
            onCreateStory={() => setShowCreateStory(true)}
            onNavigateArea={setActiveArea}
            onNavigateStudio={openStudioMode}
          />
        )}

        {activeArea === 'studio' && (
          <StudioView activeMode={activeStudioMode} setActiveMode={setActiveStudioMode} />
        )}

        {activeArea === 'library' && (
          <LibraryView
            stories={stories}
            isLoading={isLoading}
            view={libraryView}
            setView={setLibraryView}
            showVerification={showVerification}
            onToggleVerification={() => setShowVerification((value) => !value)}
            onCreateStory={() => setShowCreateStory(true)}
            onStoryUpdate={loadDashboardData}
          />
        )}

        {activeArea === 'assistant' && <AssistantView />}
      </motion.section>

      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onCreated={() => {
            setShowCreateStory(false)
            loadDashboardData()
            setActiveArea('library')
            setLibraryView('manuscripts')
          }}
        />
      )}

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} commands={commands} />
      <PersonalizedAISuggestions />
    </AppShell>
  )
}

function DeskView({
  stories,
  metrics,
  isLoading,
  onCreateStory,
  onNavigateArea,
  onNavigateStudio,
}: {
  stories: Story[]
  metrics: WritingMetrics
  isLoading: boolean
  onCreateStory: () => void
  onNavigateArea: (area: ProductArea) => void
  onNavigateStudio: (mode: StudioMode) => void
}) {
  const recentStories = stories.slice(0, 4)
  const focusStory = stories[0]
  const targetWords = focusStory?.targetWordCount || 80000
  const progress = focusStory ? (focusStory.wordCount / targetWords) * 100 : 0

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="overflow-hidden rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-md)]">
          <div className="grid min-h-[480px] gap-8 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-8">
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--cx-accent)]" />
                  {deskCopy.eyebrow}
                </div>
                <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-[var(--cx-ink-primary)] md:text-5xl">
                  {deskCopy.headline}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--cx-ink-secondary)]">
                  {deskCopy.body}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => focusStory ? sendPromptToAssistant(createStoryPrompt(focusStory), 'plot') : onCreateStory()}
                  className="group flex items-center justify-between rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-5 py-4 text-left text-white shadow-[var(--cx-shadow-lg)]"
                >
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">Next Best Move</span>
                    <span className="mt-1 block font-semibold">{focusStory ? `Continue ${focusStory.title}` : 'Start a manuscript'}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={onCreateStory}
                  className="flex items-center justify-between rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-5 py-4 text-left text-[var(--cx-ink-primary)] transition hover:bg-[var(--cx-bg-wash)]"
                >
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Open File</span>
                    <span className="mt-1 block font-semibold">{deskCopy.secondaryAction}</span>
                  </span>
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-4">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Studio Modes</p>
              <div className="space-y-1">
                {studioModes.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onNavigateStudio(mode.id)}
                      className="group flex w-full items-center gap-3 rounded-[var(--cx-radius-sm)] px-3 py-2.5 text-left transition hover:bg-white"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--cx-radius-xs)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--cx-ink-primary)]">{mode.label}</span>
                        <span className="block truncate text-[11px] text-[var(--cx-ink-muted)]">{mode.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <SurfacePanel eyebrow="Live Index" title={deskCopy.pulse}>
          <div className="grid gap-3">
            <MetricPill label="Manuscripts" value={isLoading ? '...' : metrics.totalStories} icon={BookOpen} tone="sage" />
            <MetricPill label="Words Banked" value={isLoading ? '...' : metrics.totalWords.toLocaleString()} icon={PenLine} tone="ink" />
            <MetricPill label="Average Draft" value={isLoading ? '...' : metrics.averageWordsPerStory.toFixed(0)} icon={Gauge} tone="blue" />
            <MetricPill label="Writing Streak" value={isLoading ? '...' : `${metrics.writingStreak} days`} icon={Clock3} tone="brass" />
          </div>
          {focusStory && (
            <div className="mt-5 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--cx-ink-primary)]">{focusStory.title}</p>
                  <p className="text-xs text-[var(--cx-ink-muted)]">{focusStory.wordCount.toLocaleString()} / {targetWords.toLocaleString()} words</p>
                </div>
                <span className="rounded-full bg-[var(--cx-amber-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--cx-amber-strong)]">
                  Focus
                </span>
              </div>
              <ProgressLine value={progress} />
            </div>
          )}
        </SurfacePanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <SurfacePanel
          eyebrow="In Motion"
          title={deskCopy.queue}
          action={
            <button
              type="button"
              onClick={() => onNavigateArea('library')}
              className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--cx-ink-primary)] transition hover:border-[var(--cx-border-hover)]"
            >
              Open Library
            </button>
          }
        >
          {recentStories.length > 0 ? (
            <div className="space-y-2">
              {recentStories.map((story) => <StoryQueueRow key={story.id} story={story} />)}
            </div>
          ) : (
            <EmptyState
              icon={Archive}
              title="No drafts on the desk"
              description="Create a manuscript, then return here for progress and next-step guidance."
              actionLabel="New Manuscript"
              onAction={onCreateStory}
            />
          )}
        </SurfacePanel>

        <SurfacePanel eyebrow="Suggested" title={deskCopy.moves}>
          <div className="grid gap-3 md:grid-cols-3">
            {nextMoves.map((move) => {
              const Icon = move.icon
              return (
                <button
                  key={move.label}
                  type="button"
                  onClick={() => onNavigateStudio(move.mode)}
                  className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4 text-left transition hover:border-[var(--cx-border-hover)] hover:shadow-[var(--cx-shadow-xs)]"
                >
                  <span className="mb-4 grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="block font-semibold text-[var(--cx-ink-primary)]">{move.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--cx-ink-muted)]">{move.description}</span>
                </button>
              )
            })}
          </div>
        </SurfacePanel>
      </section>
    </div>
  )
}

function StudioView({
  activeMode,
  setActiveMode,
}: {
  activeMode: StudioMode
  setActiveMode: (mode: StudioMode) => void
}) {
  const activeModeMeta = studioModes.find((mode) => mode.id === activeMode) || studioModes[0]
  const ActiveModeIcon = activeModeMeta.icon

  return (
    <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
      <SurfacePanel eyebrow="Studio Modes" title="Choose the instrument" className="xl:sticky xl:top-6 xl:h-[calc(100vh-4rem)] xl:overflow-y-auto">
        <div className="space-y-1">
          {studioModes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`group flex w-full items-center gap-3 rounded-[var(--cx-radius-sm)] px-3 py-2.5 text-left transition ${
                  isActive
                    ? 'border border-[var(--cx-accent)] bg-[var(--cx-accent-soft)]'
                    : 'border border-transparent hover:bg-[var(--cx-bg-wash)]'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--cx-radius-xs)] ${isActive ? 'bg-[var(--cx-accent)] text-white' : 'bg-[var(--cx-bg-panel)] text-[var(--cx-ink-muted)]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[var(--cx-ink-primary)]">{mode.label}</span>
                  <span className="block truncate text-[11px] text-[var(--cx-ink-muted)]">{mode.command}</span>
                </span>
                {isActive && <CheckCircle2 className="h-4 w-4 text-[var(--cx-accent)]" />}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => sendPromptToAssistant(activeModeMeta.prompt, 'general')}
          className="mt-5 flex w-full items-center justify-between rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]"
        >
          Ask about this mode
          <Bot className="h-4 w-4" />
        </button>
      </SurfacePanel>

      <div className="min-w-0 overflow-hidden rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-sm)]">
        <div className="border-b border-[var(--cx-border)] bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] text-white">
                <ActiveModeIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Active Instrument</p>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">{activeModeMeta.label}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--cx-ink-secondary)]">{activeModeMeta.brief}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => sendPromptToAssistant(activeModeMeta.prompt, 'general')}
              className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--cx-ink-primary)] transition hover:border-[var(--cx-border-hover)]"
            >
              <Sparkles className="h-4 w-4" />
              Ask the Muse
            </button>
          </div>
        </div>
        <div className="bg-[var(--cx-bg-wash)]">
          {activeMode === 'ideas' && <StoryIdeaGeneratorNew />}
          {activeMode === 'characters' && <CharacterBuilderNew />}
          {activeMode === 'plots' && <PlotBuilderNew />}
          {activeMode === 'dialogue' && <DialogueCreatorNew />}
          {activeMode === 'worlds' && <WorldBuilder />}
          {activeMode === 'voice' && <VoiceAnalyzerNew />}
        </div>
      </div>
    </div>
  )
}

function LibraryView({
  stories,
  isLoading,
  view,
  setView,
  showVerification,
  onToggleVerification,
  onCreateStory,
  onStoryUpdate,
}: {
  stories: Story[]
  isLoading: boolean
  view: LibraryViewMode
  setView: (view: LibraryViewMode) => void
  showVerification: boolean
  onToggleVerification: () => void
  onCreateStory: () => void
  onStoryUpdate: () => void
}) {
  return (
    <div className="space-y-4">
      <SurfacePanel
        eyebrow="Library"
        title={libraryCopy.subtitle}
        action={
          <div className="flex rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-0.5">
            {[
              { id: 'manuscripts' as const, label: libraryCopy.manuscripts },
              { id: 'systems' as const, label: libraryCopy.systems },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  setView(item.id)
                }}
                onClick={() => setView(item.id)}
                className={`rounded-[var(--cx-radius-xs)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition ${
                  view === item.id ? 'bg-[var(--cx-ink-primary)] text-white shadow-sm' : 'text-[var(--cx-ink-muted)] hover:text-[var(--cx-ink-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      >
        {view === 'manuscripts' ? (
          <ManuscriptsView stories={stories} isLoading={isLoading} onCreateStory={onCreateStory} onStoryUpdate={onStoryUpdate} />
        ) : (
          <SystemToolsView showVerification={showVerification} onToggleVerification={onToggleVerification} />
        )}
      </SurfacePanel>
    </div>
  )
}

function ManuscriptsView({
  stories,
  isLoading,
  onCreateStory,
  onStoryUpdate,
}: {
  stories: Story[]
  isLoading: boolean
  onCreateStory: () => void
  onStoryUpdate: () => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 skeleton" />
        ))}
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="The shelf is waiting"
        description="Start a manuscript and the library becomes your map of drafts, progress, and context."
        actionLabel="New Manuscript"
        onAction={onCreateStory}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)]">
      <div className="grid grid-cols-[minmax(0,1fr)_110px_130px] gap-4 border-b border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--cx-ink-muted)] max-md:hidden">
        <span>Manuscript</span>
        <span>Words</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-[var(--cx-border-subtle)]">
        {stories.map((story) => (
          <ManuscriptRow key={story.id} story={story} onStoryUpdate={onStoryUpdate} />
        ))}
      </div>
    </div>
  )
}

function SystemToolsView({
  showVerification,
  onToggleVerification,
}: {
  showVerification: boolean
  onToggleVerification: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Preserved workflow</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--cx-ink-primary)]">Backend Verification</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cx-ink-secondary)]">
              Developer-facing checks remain available here, but they no longer compete with author work in the main navigation.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleVerification}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]"
          >
            <Settings className="h-4 w-4" />
            {showVerification ? 'Hide Verification' : 'Run Verification'}
          </button>
        </div>
      </div>

      {showVerification && (
        <div className="overflow-hidden rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white">
          <BackendVerification />
        </div>
      )}
    </div>
  )
}

function AssistantView() {
  return (
    <div className="overflow-hidden rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-sm)]">
      <UnifiedAssistant />
    </div>
  )
}

function StoryQueueRow({ story }: { story: Story }) {
  const targetWords = story.targetWordCount || 80000
  const progress = (story.wordCount / targetWords) * 100

  return (
    <button
      type="button"
      onClick={() => sendPromptToAssistant(createStoryPrompt(story), 'plot')}
      className="grid w-full gap-3 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4 text-left transition hover:border-[var(--cx-border-hover)] hover:shadow-[var(--cx-shadow-xs)] md:grid-cols-[minmax(0,1fr)_160px]"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--cx-ink-primary)]">{story.title}</p>
        <p className="mt-1 truncate text-sm text-[var(--cx-ink-muted)]">{story.genre} / {story.status}</p>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--cx-ink-muted)]">
          <span>{story.wordCount.toLocaleString()} words</span>
          <ChevronRight className="h-4 w-4" />
        </div>
        <ProgressLine value={progress} />
      </div>
    </button>
  )
}

function ManuscriptRow({
  story,
  onStoryUpdate,
}: {
  story: Story
  onStoryUpdate: () => void
}) {
  const targetWords = story.targetWordCount || 80000
  const progress = (story.wordCount / targetWords) * 100

  const deleteStory = async () => {
    if (!window.confirm(`Delete "${story.title}"?`)) return

    const response = await fetch(`/api/stories/${story.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      onStoryUpdate()
    }
  }

  return (
    <article className="grid gap-4 px-4 py-4 transition hover:bg-[var(--cx-bg-wash)] md:grid-cols-[minmax(0,1fr)_110px_130px] md:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--cx-accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--cx-accent)]">
            {story.genre}
          </span>
          <span className="text-xs text-[var(--cx-ink-muted)]">Touched {formatDate(story.updatedAt)}</span>
        </div>
        <h3 className="truncate text-lg font-semibold tracking-tight text-[var(--cx-ink-primary)]">{story.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--cx-ink-muted)]">{story.description || 'No working note yet.'}</p>
        <div className="mt-3 max-w-lg">
          <ProgressLine value={progress} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--cx-ink-primary)]">{story.wordCount.toLocaleString()}</p>
        <p className="text-xs text-[var(--cx-ink-muted)]">of {targetWords.toLocaleString()}</p>
      </div>

      <div className="flex flex-wrap gap-2 md:justify-end">
        <button
          type="button"
          onClick={() => sendPromptToAssistant(createStoryPrompt(story), 'plot')}
          className="rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]"
        >
          Continue Draft
        </button>
        <button
          type="button"
          onClick={deleteStory}
          className="grid h-9 w-9 place-items-center rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white text-[var(--cx-ink-muted)] transition hover:border-[var(--cx-rose)] hover:text-[var(--cx-rose)]"
          title="Delete manuscript"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}

function CreateStoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    genre: '',
    tags: [] as string[],
  })

  const createStory = async () => {
    if (!newStory.title || !newStory.genre) {
      alert('Please fill in title and genre')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/stories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to create manuscript')
        return
      }

      setNewStory({ title: '', description: '', genre: '', tags: [] })
      onCreated()
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Error creating manuscript')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="w-full max-w-xl rounded-[var(--cx-radius-lg)] border border-[var(--cx-border)] bg-white p-6 shadow-[var(--cx-shadow-2xl)]"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">New file</p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">Open a manuscript</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--cx-ink-secondary)]">Give the draft enough shape for the OS to track it.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Title *</span>
            <input
              type="text"
              value={newStory.title}
              onChange={(event) => setNewStory((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
              placeholder="The title readers will remember"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Genre *</span>
            <select
              value={newStory.genre}
              onChange={(event) => setNewStory((prev) => ({ ...prev, genre: event.target.value }))}
              className="w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
            >
              <option value="">Select genre</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Working note</span>
            <textarea
              value={newStory.description}
              onChange={(event) => setNewStory((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[120px] w-full resize-y rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-3 text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
              placeholder="A premise, image, promise, or problem"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={createStory}
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)] disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Manuscript
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--cx-ink-primary)] transition hover:bg-[var(--cx-bg-panel)]"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function AuthorLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cx-bg-canvas)]">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[var(--cx-border)] border-t-[var(--cx-accent)]" />
        <h2 className="text-lg font-semibold text-[var(--cx-ink-primary)]">Preparing the desk</h2>
        <p className="mt-2 text-sm text-[var(--cx-ink-muted)]">Loading manuscripts, tools, and context.</p>
      </div>
    </div>
  )
}

function formatDate(date: string | Date) {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'recently'
  return parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function createStoryPrompt(story: Story) {
  return `Continue working on "${story.title}". Genre: ${story.genre}. Status: ${story.status}. Current note: ${story.description || 'No description yet.'} Help me find the strongest next move.`
}
