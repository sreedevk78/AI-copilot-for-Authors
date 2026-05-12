'use client'

export type StudioTarget =
  | 'assistant'
  | 'ideas'
  | 'characters'
  | 'plots'
  | 'dialogue'
  | 'worlds'
  | 'voice'
  | 'stories'
  | 'verification'

export type AssistantTemplate = 'general' | 'idea' | 'plot' | 'dialogue' | 'world' | 'voice'

const STUDIO_NAVIGATION_EVENT = 'codexcape:studio:navigate'
const ASSISTANT_PROMPT_KEY = 'ai_assistant_prompt'
const ASSISTANT_TEMPLATE_KEY = 'ai_assistant_template'

const legacyEvents: Partial<Record<StudioTarget, string>> = {
  assistant: 'navigateToAssistant',
  characters: 'navigateToCharacterBuilder',
  plots: 'navigateToPlotBuilder',
  worlds: 'navigateToWorldBuilder',
}

export interface StudioNavigationPayload {
  target: StudioTarget
  prompt?: string
  template?: AssistantTemplate
}

export function navigateStudio(payload: StudioNavigationPayload) {
  if (typeof window === 'undefined') return

  if (payload.prompt) {
    window.localStorage.setItem(ASSISTANT_PROMPT_KEY, payload.prompt)
  }

  if (payload.template) {
    window.localStorage.setItem(ASSISTANT_TEMPLATE_KEY, payload.template)
  }

  window.dispatchEvent(new CustomEvent<StudioNavigationPayload>(STUDIO_NAVIGATION_EVENT, {
    detail: payload,
  }))

  const legacyEvent = legacyEvents[payload.target]
  if (legacyEvent) {
    window.dispatchEvent(new CustomEvent(legacyEvent))
  }
}

export function sendPromptToAssistant(prompt: string, template: AssistantTemplate = 'general') {
  navigateStudio({ target: 'assistant', prompt, template })
}

export function subscribeToStudioNavigation(
  handler: (payload: StudioNavigationPayload) => void,
) {
  if (typeof window === 'undefined') return () => {}

  const onModernNavigation = (event: Event) => {
    handler((event as CustomEvent<StudioNavigationPayload>).detail)
  }

  const legacyHandlers: Array<[string, EventListener]> = [
    ['navigateToAssistant', () => handler({ target: 'assistant' })],
    ['navigateToCharacterBuilder', () => handler({ target: 'characters' })],
    ['navigateToPlotBuilder', () => handler({ target: 'plots' })],
    ['navigateToWorldBuilder', () => handler({ target: 'worlds' })],
  ]

  window.addEventListener(STUDIO_NAVIGATION_EVENT, onModernNavigation)
  legacyHandlers.forEach(([eventName, listener]) => {
    window.addEventListener(eventName, listener)
  })

  return () => {
    window.removeEventListener(STUDIO_NAVIGATION_EVENT, onModernNavigation)
    legacyHandlers.forEach(([eventName, listener]) => {
      window.removeEventListener(eventName, listener)
    })
  }
}

