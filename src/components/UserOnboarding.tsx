'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  FileText,
  Brain,
  Target,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Sparkles,
  BookOpen,
  PenTool,
  Lightbulb,
  Globe,
  Heart,
  Zap,
  Command,
} from 'lucide-react'

interface OnboardingData {
  writingExperience: string
  favoriteGenres: string[]
  writingGoals: string[]
  previousWorks: string
  writingStyle: {
    tone: string
    complexity: string
    pacing: string
    dialogueStyle: string
  }
  interests: string[]
}

const WRITING_EXPERIENCE = [
  { value: 'BEGINNER', label: 'Just starting out', description: 'New to creative writing', icon: Sparkles },
  { value: 'INTERMEDIATE', label: 'Some experience', description: 'Written a few stories', icon: PenTool },
  { value: 'ADVANCED', label: 'Regular writer', description: 'Write frequently', icon: BookOpen },
  { value: 'PROFESSIONAL', label: 'Professional', description: 'Published or aspiring author', icon: Target },
]

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Horror',
  'Literary Fiction', 'Young Adult', 'Historical Fiction', 'Dystopian',
  'Adventure', 'Crime', 'Comedy', 'Drama', 'Action', 'Supernatural'
]

const WRITING_GOALS = [
  'Complete my first novel', 'Improve character development', 'Master dialogue writing',
  'Build a consistent writing habit', 'Get published', 'Explore different genres',
  'Develop my unique voice', 'Create compelling plots', 'Build a writing community',
  'Learn world-building techniques'
]

const WRITING_STYLES = {
  tone: [
    { value: 'FORMAL', label: 'Formal & Academic', description: 'Precise, scholarly tone' },
    { value: 'CASUAL', label: 'Casual & Conversational', description: 'Friendly, approachable style' },
    { value: 'POETIC', label: 'Poetic & Lyrical', description: 'Beautiful, flowing prose' },
    { value: 'DRAMATIC', label: 'Dramatic & Intense', description: 'High emotion, powerful impact' },
    { value: 'HUMOROUS', label: 'Witty & Humorous', description: 'Light-hearted, entertaining' }
  ],
  complexity: [
    { value: 'SIMPLE', label: 'Simple & Clear', description: 'Easy to read and understand' },
    { value: 'MODERATE', label: 'Moderate Complexity', description: 'Balanced sophistication' },
    { value: 'COMPLEX', label: 'Complex & Rich', description: 'Intricate, layered prose' }
  ],
  pacing: [
    { value: 'FAST', label: 'Fast-paced', description: 'Quick action, rapid progression' },
    { value: 'MODERATE', label: 'Steady pace', description: 'Balanced rhythm' },
    { value: 'SLOW', label: 'Slow & Deliberate', description: 'Thoughtful, detailed exploration' }
  ],
  dialogueStyle: [
    { value: 'NATURAL', label: 'Natural Speech', description: 'Realistic conversations' },
    { value: 'STYLIZED', label: 'Stylized & Artistic', description: 'Poetic, crafted dialogue' },
    { value: 'MINIMAL', label: 'Minimal & Direct', description: 'Concise, to the point' }
  ]
}

const INTERESTS = [
  'Character Development', 'Plot Structure', 'World Building', 'Dialogue Writing',
  'Descriptive Writing', 'Pacing', 'Genre Exploration', 'Voice Development',
  'Research Methods', 'Editing Techniques', 'Publishing Process', 'Marketing'
]

export function UserOnboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    writingExperience: '',
    favoriteGenres: [],
    writingGoals: [],
    previousWorks: '',
    writingStyle: {
      tone: '',
      complexity: '',
      pacing: '',
      dialogueStyle: ''
    },
    interests: []
  })

  const steps = [
    { id: 'welcome', title: 'Welcome to CodeXcape', description: "Let's personalize your experience", component: WelcomeStep },
    { id: 'experience', title: 'Your writing experience', description: 'Tell us about your background', component: ExperienceStep },
    { id: 'genres', title: 'Favorite genres', description: 'What types of stories do you love?', component: GenresStep },
    { id: 'goals', title: 'Writing goals', description: 'What do you want to achieve?', component: GoalsStep },
    { id: 'style', title: 'Style preferences', description: 'Help us understand your voice', component: StyleStep },
    { id: 'works', title: 'Previous works', description: 'Share any existing writing (optional)', component: WorksStep },
    { id: 'interests', title: 'Areas of interest', description: 'What would you like to improve?', component: InterestsStep },
    { id: 'complete', title: 'All set', description: 'Your personalized experience is ready', component: CompleteStep },
  ]

  const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }
  const handleComplete = () => { onComplete(data) }

  const CurrentComponent = steps[currentStep].component

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cx-bg-canvas)] p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--cx-ink-secondary)]">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-[var(--cx-ink-muted)]">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cx-bg-panel)]">
            <motion.div
              className="h-full rounded-full bg-[var(--cx-accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-[var(--cx-radius-lg)] border border-[var(--cx-border)] bg-white p-8 shadow-[var(--cx-shadow-md)]">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">{steps[currentStep].title}</h1>
            <p className="mt-2 text-sm text-[var(--cx-ink-secondary)]">{steps[currentStep].description}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CurrentComponent data={data} setData={setData} onNext={nextStep} onPrev={prevStep} onComplete={handleComplete} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Shared navigation buttons ──────────────────────────────── */
function NavButtons({
  onPrev,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  showPrev = true,
}: {
  onPrev?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showPrev?: boolean
}) {
  return (
    <div className="mt-8 flex justify-between">
      {showPrev ? (
        <button type="button" onClick={onPrev} className="flex items-center gap-2 text-sm font-medium text-[var(--cx-ink-secondary)] transition hover:text-[var(--cx-ink-primary)]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <div />}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ── Chip selector ──────────────────────────────────────────── */
function ChipGrid({ items, selected, onToggle, columns = 'grid-cols-2 md:grid-cols-4' }: { items: string[], selected: string[], onToggle: (item: string) => void, columns?: string }) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {items.map((item) => {
        const isSelected = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-[var(--cx-radius-sm)] border px-3 py-2.5 text-sm font-medium transition ${
              isSelected
                ? 'border-[var(--cx-accent)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]'
                : 'border-[var(--cx-border)] bg-white text-[var(--cx-ink-secondary)] hover:border-[var(--cx-border-hover)]'
            }`}
          >
            {isSelected && <Check className="mr-1.5 inline h-3.5 w-3.5" />}
            {item}
          </button>
        )
      })}
    </div>
  )
}

/* ── Steps ──────────────────────────────────────────────────── */
function WelcomeStep({ onNext }: any) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[var(--cx-radius-lg)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
        <Sparkles className="h-8 w-8" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[var(--cx-ink-primary)]">Let&apos;s set up your writing workspace</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--cx-ink-secondary)]">
          A few quick questions will help us personalize your AI assistant, suggest better prompts, and match generation output to your voice.
        </p>
      </div>
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-3">
        {[
          { icon: Brain, label: 'AI-powered analysis' },
          { icon: Target, label: 'Personalized output' },
          { icon: Heart, label: 'Your unique voice' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-4">
            <item.icon className="h-5 w-5 text-[var(--cx-accent)]" />
            <span className="text-xs font-medium text-[var(--cx-ink-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="mx-auto flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]"
      >
        Get started <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function ExperienceStep({ data, setData, onNext, onPrev }: any) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {WRITING_EXPERIENCE.map((exp) => {
          const Icon = exp.icon
          const isSelected = data.writingExperience === exp.value
          return (
            <button
              key={exp.value}
              type="button"
              onClick={() => setData({ ...data, writingExperience: exp.value })}
              className={`flex items-start gap-4 rounded-[var(--cx-radius-md)] border p-5 text-left transition ${
                isSelected
                  ? 'border-[var(--cx-accent)] bg-[var(--cx-accent-soft)]'
                  : 'border-[var(--cx-border)] bg-white hover:border-[var(--cx-border-hover)]'
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--cx-radius-sm)] ${
                isSelected ? 'bg-[var(--cx-accent)] text-white' : 'bg-[var(--cx-bg-panel)] text-[var(--cx-ink-muted)]'
              }`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-[var(--cx-ink-primary)]">{exp.label}</p>
                <p className="mt-0.5 text-sm text-[var(--cx-ink-muted)]">{exp.description}</p>
              </div>
            </button>
          )
        })}
      </div>
      <NavButtons onPrev={onPrev} onNext={onNext} nextDisabled={!data.writingExperience} />
    </div>
  )
}

function GenresStep({ data, setData, onNext, onPrev }: any) {
  const toggleGenre = (genre: string) => {
    setData({
      ...data,
      favoriteGenres: data.favoriteGenres.includes(genre)
        ? data.favoriteGenres.filter((g: string) => g !== genre)
        : [...data.favoriteGenres, genre]
    })
  }
  return (
    <div>
      <p className="mb-4 text-center text-sm text-[var(--cx-ink-secondary)]">Select all genres you enjoy (choose multiple)</p>
      <ChipGrid items={GENRES} selected={data.favoriteGenres} onToggle={toggleGenre} />
      <NavButtons onPrev={onPrev} onNext={onNext} nextDisabled={data.favoriteGenres.length === 0} />
    </div>
  )
}

function GoalsStep({ data, setData, onNext, onPrev }: any) {
  const toggleGoal = (goal: string) => {
    setData({
      ...data,
      writingGoals: data.writingGoals.includes(goal)
        ? data.writingGoals.filter((g: string) => g !== goal)
        : [...data.writingGoals, goal]
    })
  }
  return (
    <div>
      <p className="mb-4 text-center text-sm text-[var(--cx-ink-secondary)]">What are your main writing goals?</p>
      <ChipGrid items={WRITING_GOALS} selected={data.writingGoals} onToggle={toggleGoal} columns="grid-cols-1 md:grid-cols-2" />
      <NavButtons onPrev={onPrev} onNext={onNext} nextDisabled={data.writingGoals.length === 0} />
    </div>
  )
}

function StyleStep({ data, setData, onNext, onPrev }: any) {
  const updateStyle = (key: keyof typeof data.writingStyle, value: string) => {
    setData({ ...data, writingStyle: { ...data.writingStyle, [key]: value } })
  }

  const renderGroup = (type: keyof typeof WRITING_STYLES, title: string) => (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[var(--cx-ink-primary)]">{title}</h3>
      <div className="space-y-1.5">
        {WRITING_STYLES[type].map((option) => {
          const isSelected = data.writingStyle[type] === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateStyle(type, option.value)}
              className={`w-full rounded-[var(--cx-radius-sm)] border px-4 py-3 text-left text-sm transition ${
                isSelected
                  ? 'border-[var(--cx-accent)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]'
                  : 'border-[var(--cx-border)] bg-white text-[var(--cx-ink-secondary)] hover:border-[var(--cx-border-hover)]'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="ml-2 text-xs opacity-70">{option.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div>
      <p className="mb-6 text-center text-sm text-[var(--cx-ink-secondary)]">Help us understand your preferred writing style</p>
      <div className="grid gap-6 md:grid-cols-2">
        {renderGroup('tone', 'Tone & Voice')}
        {renderGroup('complexity', 'Complexity')}
        {renderGroup('pacing', 'Pacing')}
        {renderGroup('dialogueStyle', 'Dialogue')}
      </div>
      <NavButtons
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled={!data.writingStyle.tone || !data.writingStyle.complexity || !data.writingStyle.pacing || !data.writingStyle.dialogueStyle}
      />
    </div>
  )
}

function WorksStep({ data, setData, onNext, onPrev }: any) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => { setData({ ...data, previousWorks: e.target?.result as string }) }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--cx-radius-md)] border-2 border-dashed border-[var(--cx-border)] p-8 text-center">
        <Upload className="mx-auto mb-3 h-10 w-10 text-[var(--cx-ink-faint)]" />
        <p className="font-medium text-[var(--cx-ink-primary)]">Upload your writing</p>
        <p className="mt-1 text-sm text-[var(--cx-ink-muted)]">Accepts .txt or .docx files</p>
        <input type="file" accept=".txt,.docx" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="mt-4 inline-block cursor-pointer rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]">
          Choose file
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--cx-ink-primary)]">Or paste your writing here:</label>
        <textarea
          className="w-full rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4 text-sm text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)] focus:ring-2 focus:ring-[var(--cx-accent-soft)]"
          rows={6}
          placeholder="Paste previous writing for AI analysis..."
          value={data.previousWorks}
          onChange={(e) => setData({ ...data, previousWorks: e.target.value })}
        />
      </div>

      <NavButtons onPrev={onPrev} onNext={onNext} nextLabel="Next (optional)" />
    </div>
  )
}

function InterestsStep({ data, setData, onNext, onPrev }: any) {
  const toggleInterest = (interest: string) => {
    setData({
      ...data,
      interests: data.interests.includes(interest)
        ? data.interests.filter((i: string) => i !== interest)
        : [...data.interests, interest]
    })
  }
  return (
    <div>
      <p className="mb-4 text-center text-sm text-[var(--cx-ink-secondary)]">What aspects of writing would you like to focus on?</p>
      <ChipGrid items={INTERESTS} selected={data.interests} onToggle={toggleInterest} columns="grid-cols-2 md:grid-cols-3" />
      <NavButtons onPrev={onPrev} onNext={onNext} nextDisabled={data.interests.length === 0} />
    </div>
  )
}

function CompleteStep({ data, onComplete }: any) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--cx-sage-soft)] text-[var(--cx-sage)]">
        <Check className="h-8 w-8" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[var(--cx-ink-primary)]">Your workspace is ready</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cx-ink-secondary)]">
          Your AI assistant will now provide suggestions that match your unique style and goals.
        </p>
      </div>

      <div className="mx-auto max-w-sm rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-5 text-left">
        <h3 className="mb-3 text-sm font-semibold text-[var(--cx-ink-primary)]">Profile summary</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Experience', WRITING_EXPERIENCE.find((e) => e.value === data.writingExperience)?.label || '—'],
            ['Genres', `${data.favoriteGenres.length} selected`],
            ['Goals', `${data.writingGoals.length} goals`],
            ['Interests', `${data.interests.length} areas`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-[var(--cx-ink-muted)]">{label}</span>
              <span className="font-medium text-[var(--cx-ink-primary)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mx-auto flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cx-accent-hover)]"
      >
        <Zap className="h-4 w-4" /> Start writing
      </button>
    </div>
  )
}
