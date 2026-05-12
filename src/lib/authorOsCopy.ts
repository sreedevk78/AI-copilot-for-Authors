import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Bot,
  Brain,
  Compass,
  Feather,
  FileText,
  Globe2,
  Layers3,
  Library,
  Lightbulb,
  MessageSquare,
  PenLine,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'

export type ProductArea = 'desk' | 'studio' | 'library' | 'assistant'
export type StudioMode = 'ideas' | 'characters' | 'plots' | 'dialogue' | 'worlds' | 'voice'

export interface ProductNavItem {
  id: ProductArea
  label: string
  description: string
  eyebrow: string
  icon: LucideIcon
}

export interface StudioModeItem {
  id: StudioMode
  label: string
  shortLabel: string
  command: string
  description: string
  brief: string
  prompt: string
  icon: LucideIcon
}

export const authorNav: ProductNavItem[] = [
  {
    id: 'desk',
    label: 'Desk',
    description: 'Overview & next moves',
    eyebrow: 'Author OS',
    icon: Compass,
  },
  {
    id: 'studio',
    label: 'Studio',
    description: 'Creative instruments',
    eyebrow: 'Studio',
    icon: Layers3,
  },
  {
    id: 'library',
    label: 'Library',
    description: 'Manuscripts & tools',
    eyebrow: 'Library',
    icon: Library,
  },
  {
    id: 'assistant',
    label: 'Muse',
    description: 'AI writing partner',
    eyebrow: 'Muse',
    icon: Brain,
  },
]

export const studioModes: StudioModeItem[] = [
  {
    id: 'ideas',
    label: 'Story Ideas',
    shortLabel: 'Ideas',
    command: 'Generate Idea',
    description: 'Premises, sparks, and fresh directions.',
    brief: 'Turn a spark into a premise with tension, shape, and stakes.',
    prompt: 'Help me generate a story idea with a strong premise, conflict, and emotional hook.',
    icon: Lightbulb,
  },
  {
    id: 'characters',
    label: 'Develop Cast',
    shortLabel: 'Cast',
    command: 'Develop Cast',
    description: 'Motivations, flaws, and pressure.',
    brief: 'Build people who want something, hide something, and change things.',
    prompt: 'Help me develop a character with motivation, contradiction, backstory, and story function.',
    icon: Users,
  },
  {
    id: 'plots',
    label: 'Shape Arc',
    shortLabel: 'Arc',
    command: 'Shape Arc',
    description: 'Structure, turns, and pacing.',
    brief: 'Convert material into a dramatic line with turning points that earn attention.',
    prompt: 'Help me shape this story into a strong plot arc with turning points and escalation.',
    icon: Target,
  },
  {
    id: 'dialogue',
    label: 'Dialogue Room',
    shortLabel: 'Dialogue',
    command: 'Draft Dialogue',
    description: 'Subtext, voice, and conflict.',
    brief: 'Draft exchanges that reveal pressure, personality, and what nobody says directly.',
    prompt: 'Help me draft dialogue with subtext, character voice, and narrative movement.',
    icon: MessageSquare,
  },
  {
    id: 'worlds',
    label: 'World Bible',
    shortLabel: 'Worlds',
    command: 'Build World',
    description: 'Lore, rules, and RAG context.',
    brief: 'Make setting usable: rules, tensions, history, and details that generate plot.',
    prompt: 'Help me expand this world with coherent rules, culture, conflicts, and story hooks.',
    icon: Globe2,
  },
  {
    id: 'voice',
    label: 'Tune Voice',
    shortLabel: 'Voice',
    command: 'Tune Voice',
    description: 'Style analysis and author voice.',
    brief: 'Study the prose, name its signature, and make every generation more intentional.',
    prompt: 'Help me analyze and tune the voice of this writing sample.',
    icon: PenLine,
  },
]

export const deskCopy = {
  eyebrow: 'What\'s on deck',
  headline: 'Your writing command center.',
  body: 'Manuscripts, studio instruments, and your AI partner — everything orbits one surface. Start with the next best move.',
  primaryAction: 'Next Best Move',
  secondaryAction: 'New Manuscript',
  pulse: 'Manuscript Pulse',
  queue: 'Draft Queue',
  moves: 'Suggested Moves',
}

export const libraryCopy = {
  title: 'Library',
  subtitle: 'Manuscripts, archived work, and system tools — accessible without leaving the writing surface.',
  manuscripts: 'Manuscripts',
  systems: 'System Tools',
}

export const assistantCopy = {
  title: 'Ask the Muse',
  subtitle: 'Bring a scene, a problem, or a half-formed instinct. The assistant stays close to the work.',
}

export const commandGroups = {
  primary: 'Actions',
  studio: 'Studio Instruments',
  systems: 'Systems',
}

export const commandIcons = {
  manuscript: FileText,
  assistant: Bot,
  spark: Sparkles,
  book: BookOpen,
  feather: Feather,
}
