'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  Bot,
  BookOpen,
  Copy,
  Download,
  Feather,
  Lightbulb,
  PenTool,
  Send,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  User,
  Users,
  Zap,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { assistantCopy } from '@/lib/authorOsCopy'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

const QUICK_PROMPTS = [
  { icon: Lightbulb, text: 'Find the hook', prompt: 'I need a sharper story hook. Give me several high-concept options with emotional stakes.' },
  { icon: BookOpen, text: 'Map the draft', prompt: 'Create a clean plot outline with act breaks, turning points, and escalation.' },
  { icon: Target, text: 'Pressure-test the arc', prompt: 'Help me find weak points in this plot and suggest stronger alternatives.' },
  { icon: Users, text: 'Sharpen the scene', prompt: 'Write dialogue with subtext, conflict, and distinct character voices.' },
  { icon: PenTool, text: 'Polish the prose', prompt: 'Review this passage for rhythm, clarity, voice, and unnecessary friction.' },
  { icon: Zap, text: 'Invent the turn', prompt: 'Suggest a surprising plot turn that still feels earned by the story.' },
]

const TONES = ['Professional', 'Creative', 'Casual', 'Formal', 'Conversational', 'Poetic']
const LENGTHS = ['Short', 'Medium', 'Long', 'Very Long']

export function UnifiedAssistant() {
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [tone, setTone] = useState('Creative')
  const [length, setLength] = useState('Medium')
  const [temperature, setTemperature] = useState(0.7)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('unified-chat-sessions')
    if (saved) {
      try {
        const sessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          createdAt: new Date(session.createdAt),
        }))
        setChatSessions(sessions)
        if (sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(sessions[0].id)
          setMessages(sessions[0].messages)
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error)
      }
    }

    const handleNavigateToAssistant = () => {
      const prompt = localStorage.getItem('ai_assistant_prompt')
      if (prompt) {
        setCurrentMessage(prompt)
        localStorage.removeItem('ai_assistant_prompt')
      }
    }

    window.addEventListener('navigateToAssistant', handleNavigateToAssistant)
    return () => window.removeEventListener('navigateToAssistant', handleNavigateToAssistant)
  }, [])

  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('unified-chat-sessions', JSON.stringify(chatSessions))
    }
  }, [chatSessions])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || currentMessage.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setCurrentMessage('')
    setIsTyping(true)

    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = Date.now().toString()
      setCurrentSessionId(sessionId)
    }

    try {
      let fullPrompt = text
      if (updatedMessages.length === 1) {
        fullPrompt = `[Context: Use a ${tone} tone. Length should be ${length}.]\n\n${text}`
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          prompt: fullPrompt,
          settings: { tone, length, temperature },
        }),
      })

      const data = await response.json()

      let aiResponse = 'I hit a snag processing that request. Try again with a little more context.'
      if (data.success && data.data.content) {
        aiResponse = data.data.content
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      const sessionTitle = text.length > 50 ? `${text.substring(0, 50)}...` : text
      const session: ChatSession = {
        id: sessionId,
        title: sessionTitle,
        messages: finalMessages,
        createdAt: currentSessionId ? chatSessions.find((item) => item.id === sessionId)?.createdAt || new Date() : new Date(),
      }

      setChatSessions((prev) => {
        const filtered = prev.filter((item) => item.id !== sessionId)
        return [session, ...filtered]
      })
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I hit a snag. Try again, or send a smaller piece of context.',
        timestamp: new Date(),
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
  }

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find((item) => item.id === sessionId)
    if (session) {
      setMessages(session.messages)
      setCurrentSessionId(sessionId)
    }
  }

  const deleteSession = (sessionId: string) => {
    const newSessions = chatSessions.filter((item) => item.id !== sessionId)
    setChatSessions(newSessions)
    if (newSessions.length === 0) {
      localStorage.removeItem('unified-chat-sessions')
    }
    if (currentSessionId === sessionId) {
      startNewChat()
    }
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const exportChat = () => {
    const currentSession = chatSessions.find((item) => item.id === currentSessionId)
    if (currentSession) {
      const chatText = currentSession.messages
        .map((msg) => `${msg.type === 'user' ? 'You' : 'Muse'}: ${msg.content}`)
        .join('\n\n')

      const dataBlob = new Blob([chatText], { type: 'text/plain' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `muse-${currentSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden border border-[var(--cx-border)] bg-white rounded-[var(--cx-radius-md)] xl:flex xl:h-[760px] xl:flex-col">
          <div className="border-b border-[var(--cx-border)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Sessions</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--cx-ink-primary)]">Conversation rail</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {chatSessions.length > 0 ? (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => loadSession(session.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        loadSession(session.id)
                      }
                    }}
                    className={`group w-full border p-3 text-left transition ${
                      currentSessionId === session.id
                        ? 'border-[var(--cx-accent)] bg-[var(--cx-accent-soft)]'
                        : 'border-[var(--cx-border)] bg-white hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Archive className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cx-ink-muted)]" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-[var(--cx-ink-primary)]">{session.title}</p>
                        <p className="mt-1 text-xs text-[var(--cx-ink-muted)]">{session.messages.length} messages</p>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteSession(session.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            deleteSession(session.id)
                          }
                        }}
                        className="grid h-7 w-7 place-items-center text-[var(--cx-ink-muted)] opacity-0 transition hover:text-[var(--cx-rose)] group-hover:opacity-100"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid h-full place-items-center border border-dashed border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-5 text-center">
                <div>
                  <Bot className="mx-auto mb-3 h-8 w-8 text-[var(--cx-ink-faint)]" />
                  <p className="text-sm font-medium text-[var(--cx-ink-muted)]">No saved conversations yet.</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="flex h-[760px] min-w-0 flex-col overflow-hidden rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-sm)]">
          <div className="border-b border-[var(--cx-border)] bg-white/90 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] text-white">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Context room</p>
                  <h1 className="text-xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">{assistantCopy.title}</h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cx-ink-muted)]">{assistantCopy.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings((value) => !value)}
                  className={`inline-flex items-center gap-2 border border-[var(--cx-border)] px-3 py-2 text-sm font-semibold ${
                    showSettings ? 'bg-[var(--cx-ink-primary)] text-white' : 'bg-white text-[var(--cx-ink-primary)]'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  Controls
                </button>
                <button
                  type="button"
                  onClick={startNewChat}
                  className="border border-[var(--cx-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cx-ink-primary)]"
                >
                  New Thread
                </button>
                {currentSessionId && (
                  <button
                    type="button"
                    onClick={exportChat}
                    className="grid h-10 w-10 place-items-center border border-[var(--cx-border)] bg-white text-[var(--cx-ink-muted)]"
                    title="Export thread"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-[var(--cx-border)] bg-[var(--cx-bg-wash)]"
              >
                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  <SettingSelect label="Tone" value={tone} onChange={setTone} options={TONES} />
                  <SettingSelect label="Length" value={length} onChange={setLength} options={LENGTHS} />
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cx-ink-muted)]">
                      Heat ({temperature})
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(parseFloat(event.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto bg-[var(--cx-bg-wash)] p-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <div className="w-full max-w-3xl text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-[var(--cx-amber)]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--cx-ink-primary)]">
                    Bring the hard part.
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--cx-ink-muted)]">
                    Ask for structure, tension, prose, pacing, or a way through the sentence that refuses to move.
                  </p>
                  <div className="mt-8 grid gap-2 sm:grid-cols-2">
                    {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                      <PromptButton key={prompt.text} prompt={prompt} onClick={() => sendMessage(prompt.prompt)} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} onCopy={copyMessage} />
                ))}
                {isTyping && (
                  <div className="flex items-center gap-3 text-[var(--cx-ink-muted)]">
                    <div className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-xs)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce bg-[var(--cx-ink-faint)]" />
                      <span className="h-2 w-2 animate-bounce bg-[var(--cx-ink-faint)]" style={{ animationDelay: '0.1s' }} />
                      <span className="h-2 w-2 animate-bounce bg-[var(--cx-ink-faint)]" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-[var(--cx-border)] bg-white/95 p-4 backdrop-blur">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(event) => setCurrentMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage()
                  }
                }}
                className="min-w-0 flex-1 border border-[var(--cx-border)] bg-white px-4 py-3 text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)]"
                placeholder="Ask for the next move, a stronger scene, or cleaner prose..."
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isTyping || !currentMessage.trim()}
                className="grid h-12 w-12 place-items-center bg-[var(--cx-ink-primary)] text-white disabled:opacity-50"
                title="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border border-[var(--cx-border)] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Brief presets</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--cx-ink-primary)]">Start with intent</h2>
            <div className="mt-4 space-y-2">
              {QUICK_PROMPTS.map((prompt) => (
                <PromptButton key={prompt.text} prompt={prompt} onClick={() => sendMessage(prompt.prompt)} compact />
              ))}
            </div>
          </div>

          <div className="border border-[var(--cx-border)] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Current context</p>
            <div className="mt-4 grid gap-2 text-sm">
              <ContextLine label="Tone" value={tone} icon={Feather} />
              <ContextLine label="Length" value={length} icon={Sparkles} />
              <ContextLine label="Heat" value={temperature.toFixed(1)} icon={Sliders} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SettingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cx-ink-muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-[var(--cx-border)] bg-white p-3 text-sm text-[var(--cx-ink-primary)] outline-none focus:border-[var(--cx-accent)]"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function PromptButton({
  prompt,
  onClick,
  compact = false,
}: {
  prompt: typeof QUICK_PROMPTS[number]
  onClick: () => void
  compact?: boolean
}) {
  const Icon = prompt.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 border border-[var(--cx-border)] bg-white text-left transition hover:bg-white ${compact ? 'p-3' : 'p-4'}`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--cx-radius-xs)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--cx-ink-primary)]">{prompt.text}</span>
        {!compact && <span className="mt-1 block line-clamp-2 text-xs leading-5 text-[var(--cx-ink-muted)]">{prompt.prompt}</span>}
      </span>
    </button>
  )
}

function ContextLine({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: any
}) {
  return (
    <div className="flex items-center justify-between border border-[var(--cx-border)] bg-white px-3 py-2">
      <span className="flex items-center gap-2 text-[var(--cx-ink-muted)]">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-semibold text-[var(--cx-ink-primary)]">{value}</span>
    </div>
  )
}

function MessageBubble({
  message,
  onCopy,
}: {
  message: Message
  onCopy: (content: string) => void
}) {
  const isUser = message.type === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'ml-auto max-w-[86%] flex-row-reverse' : 'mr-auto max-w-[92%]'}`}
    >
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-[var(--cx-radius-xs)] ${isUser ? 'bg-[var(--cx-amber-soft)] text-[var(--cx-amber-strong)]' : 'bg-[var(--cx-ink-primary)] text-white'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-[var(--cx-radius-md)] p-4 bg-[var(--cx-ink-primary)] text-white' : 'border-[var(--cx-border)] bg-white text-[var(--cx-ink-primary)] shadow-[var(--cx-shadow-xs)] rounded-[var(--cx-radius-md)]'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-a:text-[var(--cx-accent)]">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--cx-ink-faint)] ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && (
            <button
              type="button"
              onClick={() => onCopy(message.content)}
              className="text-[var(--cx-ink-muted)] hover:text-[var(--cx-ink-primary)]"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
