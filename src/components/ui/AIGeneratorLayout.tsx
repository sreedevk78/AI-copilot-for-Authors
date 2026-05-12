'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Archive, BookOpen, Download, Eye, PanelRightClose, Sparkles } from 'lucide-react'
import { ContextDrawer } from './author-os'

interface AIGeneratorLayoutProps {
  title: string
  subtitle: string

  formControls: React.ReactNode
  generateButton: React.ReactNode
  randomButton?: React.ReactNode

  generatedContent: React.ReactNode | null

  savedCount: number
  onExport?: () => void
  savedContent: React.ReactNode
}

export function AIGeneratorLayout({
  title,
  subtitle,
  formControls,
  generateButton,
  randomButton,
  generatedContent,
  savedCount,
  onExport,
  savedContent,
}: AIGeneratorLayoutProps) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-5">
      <div className="grid gap-4">
        <div className="min-w-0 space-y-4">
          <section className="rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-sm)]">
            <div className="border-b border-[var(--cx-border)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--cx-accent)]" />
                    Studio Instrument
                  </p>
                  <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--cx-ink-primary)] sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--cx-ink-secondary)]">
                    {subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setArchiveOpen(true)}
                    className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--cx-ink-secondary)] transition hover:border-[var(--cx-border-hover)]"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {savedCount} saved
                  </button>
                  {generatedContent && (
                    <button
                      type="button"
                      onClick={() => setFocusOpen(true)}
                      className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-3 py-2 text-sm font-medium text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Focus Output
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-4">
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Inputs</p>
                  <h2 className="mt-1 text-base font-semibold text-[var(--cx-ink-primary)]">Set the brief</h2>
                </div>
                {formControls}
              </div>

              <div className="min-h-[360px] rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white">
                <div className="flex items-center justify-between border-b border-[var(--cx-border)] px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Output</p>
                    <h2 className="mt-1 text-base font-semibold text-[var(--cx-ink-primary)]">Draft preview</h2>
                  </div>
                  {generatedContent && (
                    <button
                      type="button"
                      onClick={() => setFocusOpen(true)}
                      className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] text-[var(--cx-ink-muted)] transition hover:text-[var(--cx-ink-primary)]"
                      title="Focus output"
                    >
                      <PanelRightClose className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <AnimatePresence mode="wait">
                    {generatedContent ? (
                      <motion.div key="generated" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {generatedContent}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid min-h-[260px] place-items-center rounded-[var(--cx-radius-sm)] border border-dashed border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-6 py-12 text-center"
                      >
                        <div>
                          <BookOpen className="mx-auto mb-3 h-8 w-8 text-[var(--cx-ink-faint)]" />
                          <p className="font-serif text-lg font-semibold text-[var(--cx-ink-primary)]">The page is clean.</p>
                          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--cx-ink-muted)]">
                            Set the brief, generate, then save or hand off the result.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--cx-border)] bg-[var(--cx-bg-wash)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Actions</p>
                <p className="text-sm text-[var(--cx-ink-muted)]">Generate, randomize, or open saved work.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {generateButton}
                {randomButton}
                <button
                  type="button"
                  onClick={() => setArchiveOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--cx-ink-secondary)] transition hover:border-[var(--cx-border-hover)]"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ContextDrawer title="Saved work" open={archiveOpen} onClose={() => setArchiveOpen(false)}>
        <ArchiveHeader savedCount={savedCount} onExport={onExport} compact />
        <div className="mt-4">
          <SavedContent savedCount={savedCount} savedContent={savedContent} />
        </div>
      </ContextDrawer>

      <ContextDrawer title="Focused output" open={focusOpen} onClose={() => setFocusOpen(false)}>
        <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4">
          {generatedContent || (
            <p className="text-sm text-[var(--cx-ink-muted)]">No generated output yet.</p>
          )}
        </div>
      </ContextDrawer>
    </div>
  )
}

function ArchiveHeader({
  savedCount,
  onExport,
  compact = false,
}: {
  savedCount: number
  onExport?: () => void
  compact?: boolean
}) {
  return (
    <div className={`flex items-center justify-between border-b border-[var(--cx-border)] ${compact ? 'p-3' : 'p-4'}`}>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">Archive</p>
        <h3 className="mt-1 text-base font-semibold text-[var(--cx-ink-primary)]">{savedCount} saved item{savedCount === 1 ? '' : 's'}</h3>
      </div>
      {savedCount > 0 && onExport && (
        <button
          onClick={onExport}
          className="grid h-9 w-9 place-items-center rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] text-[var(--cx-ink-muted)] transition hover:text-[var(--cx-ink-primary)]"
          title="Export"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function SavedContent({
  savedCount,
  savedContent,
}: {
  savedCount: number
  savedContent: React.ReactNode
}) {
  if (savedCount > 0) {
    return <div className="space-y-3">{savedContent}</div>
  }

  return (
    <div className="rounded-[var(--cx-radius-sm)] border border-dashed border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-4 py-12 text-center text-[var(--cx-ink-muted)]">
      <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-35" />
      <p className="text-sm font-medium">Nothing saved from this instrument yet.</p>
    </div>
  )
}
