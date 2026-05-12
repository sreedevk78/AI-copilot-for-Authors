'use client'

import { useState } from 'react'
import { Copy, Download, History, RefreshCw, Sparkles } from 'lucide-react'
import * as exportUtils from '@/lib/exportUtils'

const templates = {
  idea: 'Generate a creative story idea with a strong premise, compelling characters, a vivid setting, and a central conflict.',
  plot: 'Create a detailed plot outline with a clear beginning, middle, and end.',
  dialogue: 'Write natural dialogue between two characters that reveals personality and moves the story forward.',
}

const tones = ['Creative', 'Professional', 'Casual', 'Formal', 'Conversational', 'Poetic']
const lengths = ['Short', 'Medium', 'Long', 'Very Long']

const safeLoadHistory = () => {
  if (typeof exportUtils.loadHistory === 'function') {
    return exportUtils.loadHistory()
  }

  try {
    const history = localStorage.getItem('writer-history')
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

const safeSaveToHistory = (content: string, settings: Record<string, unknown>, template: string) => {
  if (typeof exportUtils.saveToHistory === 'function') {
    return exportUtils.saveToHistory(content, settings, template)
  }

  try {
    const existingHistory = localStorage.getItem('writer-history')
    const history = existingHistory ? JSON.parse(existingHistory) : []
    history.unshift({
      id: Date.now().toString(),
      content,
      settings,
      template,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('writer-history', JSON.stringify(history.slice(0, 50)))
    return true
  } catch {
    return false
  }
}

export function WriterAssistant() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [tone, setTone] = useState('Creative')
  const [length, setLength] = useState('Medium')
  const [temperature, setTemperature] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const applyTemplate = (template: keyof typeof templates) => {
    setPrompt(templates[template])
  }

  const generate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setOutput('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          template: 'general',
          settings: { tone, length, temperature },
        }),
      })

      if (!response.body) {
        throw new Error('Streaming response unavailable')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let nextOutput = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const events = chunk.split('\n\n').filter(Boolean)

        for (const event of events) {
          if (!event.startsWith('data: ')) continue
          const data = JSON.parse(event.replace('data: ', ''))
          if (data.done) {
            safeSaveToHistory(nextOutput, { tone, length, temperature }, 'general')
            break
          }
          if (data.content) {
            nextOutput += data.content
            setOutput(nextOutput)
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
      setOutput('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportOutput = (format: 'txt' | 'html' | 'md' | 'pdf') => {
    if (!output) return

    if (format === 'txt') exportUtils.exportAsTxt(output)
    if (format === 'html') exportUtils.exportAsHtml(output)
    if (format === 'md') exportUtils.exportAsMarkdown(output)
    if (format === 'pdf') exportUtils.exportAsPdf(output)
  }

  const historyItems = showHistory ? safeLoadHistory() : []

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-[28px] border border-[var(--cx-border)] bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted-600)]">Compatibility Workspace</p>
            <h1 className="font-serif text-4xl font-semibold text-[var(--ink-900)]">AI Writing Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Templates & History"
              onClick={() => setShowHistory((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--cx-border)] bg-white px-4 py-2 text-sm font-semibold"
            >
              <History className="h-4 w-4" />
              Activity
            </button>
            <div className="group relative">
              <button
                type="button"
                title="Export"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--cx-border)] bg-white px-4 py-2 text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {output && (
                <div className="absolute right-0 z-10 mt-2 hidden min-w-36 rounded-2xl border border-[var(--cx-border)] bg-white p-2 shadow-xl group-hover:block">
                  <button type="button" onClick={() => exportOutput('txt')} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5">TXT</button>
                  <button type="button" onClick={() => exportOutput('html')} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5">HTML</button>
                  <button type="button" onClick={() => exportOutput('md')} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5">Markdown</button>
                  <button type="button" onClick={() => exportOutput('pdf')} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5">PDF</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-[var(--cx-border)] bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[var(--ink-900)]">Prompt</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => applyTemplate('idea')} className="rounded-full bg-[var(--surface-page)] px-4 py-2 text-sm font-semibold">Story Idea</button>
            <button type="button" onClick={() => applyTemplate('plot')} className="rounded-full bg-[var(--surface-page)] px-4 py-2 text-sm font-semibold">Plot Outline</button>
            <button type="button" onClick={() => applyTemplate('dialogue')} className="rounded-full bg-[var(--surface-page)] px-4 py-2 text-sm font-semibold">Dialogue</button>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-[220px] w-full rounded-2xl border border-[var(--cx-border)] bg-white p-4 text-[var(--ink-900)]"
            placeholder="Enter your writing prompt here..."
          />
          <button
            type="button"
            onClick={generate}
            disabled={!prompt.trim() || isGenerating}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--ink-900)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </section>

        <aside className="rounded-[28px] border border-[var(--cx-border)] bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[var(--ink-900)]">Settings</h2>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted-700)]">Tone</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)} className="w-full rounded-2xl border border-[var(--cx-border)] bg-white p-3">
              {tones.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted-700)]">Length</span>
            <select value={length} onChange={(event) => setLength(event.target.value)} className="w-full rounded-2xl border border-[var(--cx-border)] bg-white p-3">
              {lengths.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted-700)]">Creativity ({temperature})</span>
            <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-full" />
          </label>
        </aside>
      </div>

      <section className="rounded-[28px] border border-[var(--cx-border)] bg-white/80 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--ink-900)]">Output</h2>
          <button type="button" onClick={() => exportUtils.copyToClipboard(output)} disabled={!output} className="inline-flex items-center gap-2 rounded-full border border-[var(--cx-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>
        <div className="min-h-[180px] rounded-2xl bg-[var(--surface-page)] p-4 text-[var(--ink-900)] whitespace-pre-wrap">
          {output || 'Generated content will appear here'}
        </div>
      </section>

      {showHistory && (
        <section className="rounded-[28px] border border-[var(--cx-border)] bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[var(--ink-900)]">History</h2>
          <div className="space-y-3">
            {historyItems.length > 0 ? historyItems.map((item: any) => (
              <button key={item.id} type="button" onClick={() => setOutput(item.content)} className="block w-full rounded-2xl bg-[var(--surface-page)] p-4 text-left text-sm">
                {item.content.slice(0, 140)}
              </button>
            )) : (
              <p className="text-sm text-[var(--muted-600)]">No history yet.</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
