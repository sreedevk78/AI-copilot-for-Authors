'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Check, Command, Search, X } from 'lucide-react'

export interface ShellNavItem<T extends string> {
  id: T
  label: string
  description: string
  eyebrow?: string
  icon: LucideIcon
}

export interface PaletteCommand {
  id: string
  title: string
  detail: string
  group: string
  shortcut?: string
  icon: LucideIcon
  action: () => void
}

/* ═══════════════════════════════════════════════════════════════
   AppShell — root layout: dark sidebar + canvas area
   ═══════════════════════════════════════════════════════════════ */
export function AppShell<T extends string>({
  navItems,
  activeItem,
  onNavigate,
  sessionName,
  sessionEmail,
  children,
  mobileAction,
}: {
  navItems: ShellNavItem<T>[]
  activeItem: T
  onNavigate: (id: T) => void
  sessionName: string
  sessionEmail: string
  children: ReactNode
  mobileAction?: ReactNode
}) {
  return (
    <main className="author-os-shell min-h-screen text-[var(--cx-ink-primary)]">
      <div className="author-os-atmosphere" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1560px] px-3 py-3 sm:px-4 lg:px-5">
        <SidebarNav
          navItems={navItems}
          activeItem={activeItem}
          onNavigate={onNavigate}
          sessionName={sessionName}
          sessionEmail={sessionEmail}
        />
        <div className="min-w-0 flex-1 pb-20 lg:pb-0 lg:pl-5">{children}</div>
      </div>
      <MobileNav navItems={navItems} activeItem={activeItem} onNavigate={onNavigate} action={mobileAction} />
    </main>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SidebarNav — dark vertical sidebar (desktop only)
   ═══════════════════════════════════════════════════════════════ */
export function SidebarNav<T extends string>({
  navItems,
  activeItem,
  onNavigate,
  sessionName,
  sessionEmail,
}: {
  navItems: ShellNavItem<T>[]
  activeItem: T
  onNavigate: (id: T) => void
  sessionName: string
  sessionEmail: string
}) {
  return (
    <aside className="hidden h-[calc(100vh-1.5rem)] w-[240px] shrink-0 flex-col rounded-[var(--cx-radius-lg)] bg-[var(--cx-bg-deep)] text-[var(--cx-ink-inverse)] shadow-[var(--cx-shadow-dark-lg)] lg:sticky lg:top-3 lg:flex">
      {/* Logo */}
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent)]">
            <Command className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold leading-none tracking-tight">CodeXcape</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">Author OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`group flex w-full items-center gap-3 rounded-[var(--cx-radius-sm)] px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[var(--cx-radius-xs)] ${
                isActive ? 'bg-[var(--cx-accent)] text-white' : 'text-white/40'
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className={`block truncate text-[11px] ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                  {item.description}
                </span>
              </span>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[var(--cx-accent)]" />}
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mx-3 mb-3 rounded-[var(--cx-radius-sm)] border border-white/8 bg-white/4 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--cx-accent)]/20 text-[var(--cx-accent-muted)]">
            <span className="text-xs font-bold">{sessionName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/80">{sessionName}</p>
            <p className="truncate text-[11px] text-white/30">{sessionEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MobileNav — bottom bar (mobile/tablet only)
   ═══════════════════════════════════════════════════════════════ */
function MobileNav<T extends string>({
  navItems,
  activeItem,
  onNavigate,
  action,
}: {
  navItems: ShellNavItem<T>[]
  activeItem: T
  onNavigate: (id: T) => void
  action?: ReactNode
}) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-1 rounded-[var(--cx-radius-lg)] border border-[var(--cx-border)] bg-white/92 p-1.5 shadow-[var(--cx-shadow-xl)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeItem === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[var(--cx-radius-sm)] px-2 py-2 text-[10px] font-semibold ${
              isActive
                ? 'bg-[var(--cx-ink-primary)] text-white'
                : 'text-[var(--cx-ink-muted)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
      {action}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TopBar — page header with breadcrumb + actions
   ═══════════════════════════════════════════════════════════════ */
export function TopBar({
  eyebrow,
  title,
  icon: Icon,
  actions,
}: {
  eyebrow: string
  title: string
  icon: LucideIcon
  actions: ReactNode
}) {
  return (
    <header className="sticky top-3 z-30 mb-4 rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white/90 px-4 py-3 shadow-[var(--cx-shadow-sm)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--cx-ink-muted)]">{eyebrow}</p>
            <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-[var(--cx-ink-primary)] sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CommandButton — trigger for the command palette
   ═══════════════════════════════════════════════════════════════ */
export function CommandButton({
  onClick,
  compact = false,
}: {
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => { event.preventDefault(); onClick() }}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white text-sm font-medium text-[var(--cx-ink-secondary)] transition hover:border-[var(--cx-border-hover)] hover:text-[var(--cx-ink-primary)] ${
        compact ? 'h-10 w-10 px-0' : 'px-3 py-2'
      }`}
      title="Open command palette"
    >
      <Search className="h-3.5 w-3.5" />
      {!compact && (
        <>
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-[var(--cx-border)] bg-[var(--cx-bg-panel)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--cx-ink-muted)] sm:inline">
            ⌘K
          </kbd>
        </>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CommandPalette — Raycast-inspired search modal
   ═══════════════════════════════════════════════════════════════ */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: PaletteCommand[]
}) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(true)
      }
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange])

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return commands
    return commands.filter((command) =>
      `${command.title} ${command.detail} ${command.group}`.toLowerCase().includes(normalized)
    )
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce<Record<string, PaletteCommand[]>>((groups, command) => {
      groups[command.group] = groups[command.group] || []
      groups[command.group].push(command)
      return groups
    }, {})
  }, [filteredCommands])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-[12vh] w-full max-w-xl overflow-hidden rounded-[var(--cx-radius-lg)] border border-[var(--cx-border-dark)] bg-[var(--cx-bg-deep)] text-[var(--cx-ink-inverse)] shadow-[var(--cx-shadow-dark-lg)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <Search className="h-4 w-4 text-white/30" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 flex-1 border-none !bg-transparent p-0 text-base text-white outline-none placeholder:text-white/30 focus:!shadow-none focus:!ring-0"
                placeholder="Type a command or search..."
              />
              <button
                type="button"
                aria-label="Close command palette"
                onPointerDownCapture={(event) => { event.preventDefault(); event.stopPropagation(); onOpenChange(false) }}
                onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); onOpenChange(false) }}
                onClickCapture={(event) => { event.preventDefault(); event.stopPropagation(); onOpenChange(false) }}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); onOpenChange(false) }}
                className="flex items-center gap-1.5 rounded-[var(--cx-radius-xs)] bg-white/8 px-2.5 py-1.5 text-[11px] font-medium text-white/40 hover:bg-white/12 hover:text-white/60"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-white/30">No matching commands.</div>
              ) : (
                Object.entries(groupedCommands).map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">{group}</p>
                    <div className="space-y-0.5">
                      {items.map((command) => {
                        const Icon = command.icon
                        return (
                          <button
                            key={command.id}
                            type="button"
                            onClick={() => { command.action(); onOpenChange(false) }}
                            className="flex w-full items-center gap-3 rounded-[var(--cx-radius-sm)] px-3 py-2.5 text-left text-white/70 transition hover:bg-white/8 hover:text-white"
                          >
                            <span className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-xs)] bg-white/6 text-[var(--cx-accent-muted)]">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">{command.title}</span>
                              <span className="block truncate text-[11px] text-white/35">{command.detail}</span>
                            </span>
                            {command.shortcut && (
                              <kbd className="rounded border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[10px] text-white/25">
                                {command.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SurfacePanel — content section with optional header
   ═══════════════════════════════════════════════════════════════ */
export function SurfacePanel({
  eyebrow,
  title,
  children,
  action,
  className = '',
}: {
  eyebrow?: string
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={`surface-panel rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white shadow-[var(--cx-shadow-xs)] ${className}`}>
      {(eyebrow || title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cx-ink-muted)]">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--cx-ink-primary)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MetricPill — compact stat display
   ═══════════════════════════════════════════════════════════════ */
export function MetricPill({
  label,
  value,
  icon: Icon,
  tone = 'sage',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'sage' | 'ink' | 'brass' | 'blue'
}) {
  const toneClass = {
    sage: 'bg-[var(--cx-sage-soft)] text-[var(--cx-sage-strong)]',
    ink: 'bg-[var(--cx-ink-primary)] text-white',
    brass: 'bg-[var(--cx-amber-soft)] text-[var(--cx-amber-strong)]',
    blue: 'bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]',
  }[tone]

  return (
    <div className="rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[var(--cx-ink-muted)]">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-[var(--cx-ink-primary)]">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EmptyState — placeholder for empty content areas
   ═══════════════════════════════════════════════════════════════ */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-[var(--cx-radius-md)] border border-dashed border-[var(--cx-border)] bg-[var(--cx-bg-wash)] px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[var(--cx-radius-md)] bg-white text-[var(--cx-ink-faint)] shadow-[var(--cx-shadow-xs)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-[var(--cx-ink-primary)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cx-ink-muted)]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--cx-shadow-sm)] transition hover:bg-[var(--cx-accent-hover)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ProgressLine — thin accent-colored progress bar
   ═══════════════════════════════════════════════════════════════ */
export function ProgressLine({
  value,
}: {
  value: number
}) {
  const clampedValue = Math.max(0, Math.min(100, value))
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cx-bg-panel)]">
      <div
        className="h-full rounded-full bg-[var(--cx-accent)] transition-all duration-500"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ContextDrawer — slide-in side panel
   ═══════════════════════════════════════════════════════════════ */
export function ContextDrawer({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          onMouseDown={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-[var(--cx-border)] bg-white p-5 shadow-[var(--cx-shadow-2xl)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--cx-ink-primary)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-[var(--cx-bg-panel)] text-[var(--cx-ink-muted)] hover:text-[var(--cx-ink-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
