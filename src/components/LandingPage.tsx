'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Globe2,
  Layers3,
  Lightbulb,
  MessageSquare,
  PenLine,
  Sparkles,
  Target,
  Users,
  Zap,
  Command,
  Shield,
  Clock,
  Star,
} from 'lucide-react'
import Link from 'next/link'

const STUDIO_FEATURES = [
  { icon: Lightbulb, title: 'Story Ideas', description: 'Generate premises with tension, stakes, and emotional hooks.' },
  { icon: Users, title: 'Develop Cast', description: 'Build characters with motivation, contradiction, and story function.' },
  { icon: Target, title: 'Shape Arc', description: 'Convert material into dramatic structure with turning points.' },
  { icon: MessageSquare, title: 'Dialogue Room', description: 'Draft exchanges that reveal pressure and personality.' },
  { icon: Globe2, title: 'World Bible', description: 'Build coherent settings with rules, culture, and story hooks.' },
  { icon: PenLine, title: 'Tune Voice', description: 'Analyze prose and lock your author signature.' },
]

const PROCESS_STEPS = [
  { num: '01', title: 'Brief the instrument', description: 'Choose a studio mode and set your creative constraints — genre, tone, themes, and context.' },
  { num: '02', title: 'Generate with intent', description: 'AI creates drafts grounded in your story world. Every output connects to your existing characters, lore, and arc.' },
  { num: '03', title: 'Refine and ship', description: 'Save results, hand them to the Muse for further development, or export in your preferred format.' },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Novelist',
    content: 'The story bible feature alone changed how I handle continuity. My world-building is finally persistent across sessions.',
    initials: 'SC',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Screenwriter',
    content: 'The dialogue room understands subtext. I feed it a scene brief and get exchanges that actually reveal character.',
    initials: 'MR',
  },
  {
    name: 'Emily Watson',
    role: 'Fiction Writer',
    content: 'Having every tool orbit one desk means I never lose context. The command palette is faster than any writing app I\'ve used.',
    initials: 'EW',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--cx-bg-canvas)]">
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--cx-border)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)]">
              <Command className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--cx-ink-primary)]">CodeXcape</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="rounded-[var(--cx-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--cx-ink-secondary)] transition hover:text-[var(--cx-ink-primary)]">
                Sign in
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--cx-ink-secondary)]">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-24">
        {/* Gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--cx-accent)] opacity-[0.06] blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--cx-sage)] opacity-[0.04] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cx-border)] bg-white px-4 py-1.5 text-xs font-medium text-[var(--cx-ink-secondary)] shadow-[var(--cx-shadow-xs)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--cx-accent)]" />
              The operating system for authors
            </div>

            <h1 className="font-serif text-5xl font-semibold leading-[1.08] tracking-tight text-[var(--cx-ink-primary)] sm:text-7xl">
              Where stories<br />
              <span className="text-gradient">take shape.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--cx-ink-secondary)]">
              Six creative instruments, a persistent story bible, and an AI writing partner — all orbiting one desk. Build characters, shape arcs, tune voice, and ship manuscripts without losing context.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2.5 rounded-[var(--cx-radius-sm)] bg-[var(--cx-ink-primary)] px-7 py-3.5 text-base font-semibold text-white shadow-[var(--cx-shadow-lg)] transition hover:shadow-[var(--cx-shadow-xl)]"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/auth/signin">
                <button className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] border border-[var(--cx-border)] bg-white px-7 py-3.5 text-base font-medium text-[var(--cx-ink-primary)] transition hover:bg-[var(--cx-bg-panel)]">
                  Sign in
                </button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-[var(--cx-ink-muted)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Your stories stay yours</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Powered by Gemini 2.5</span>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Persistent world context</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Studio Instruments ──────────────────────────────── */}
      <section className="border-t border-[var(--cx-border)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cx-accent)]">Studio</p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-[var(--cx-ink-primary)] sm:text-5xl">
              Six instruments, one desk.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--cx-ink-secondary)]">
              Each tool is purpose-built for a stage of the creative process. Generate, save, and hand off results without switching apps.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STUDIO_FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white p-6 transition hover:border-[var(--cx-border-hover)] hover:shadow-[var(--cx-shadow-sm)]"
                >
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent-soft)] text-[var(--cx-accent)] transition group-hover:bg-[var(--cx-accent)] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--cx-ink-primary)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cx-ink-secondary)]">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="border-t border-[var(--cx-border)] bg-[var(--cx-bg-panel)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cx-accent)]">Process</p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-[var(--cx-ink-primary)] sm:text-5xl">
              Three steps from spark to draft.
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 text-5xl font-serif font-bold text-[var(--cx-accent)] opacity-25">{step.num}</div>
                <h3 className="text-lg font-semibold text-[var(--cx-ink-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--cx-ink-secondary)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="border-t border-[var(--cx-border)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cx-accent)]">Writers</p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-[var(--cx-ink-primary)] sm:text-5xl">
              Trusted by authors who ship.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-[var(--cx-radius-md)] border border-[var(--cx-border)] bg-white p-6"
              >
                <p className="text-sm leading-7 text-[var(--cx-ink-secondary)] italic font-serif">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--cx-accent-soft)] text-[var(--cx-accent)]">
                    <span className="text-xs font-bold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--cx-ink-primary)]">{testimonial.name}</p>
                    <p className="text-xs text-[var(--cx-ink-muted)]">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-[var(--cx-border)]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[var(--cx-radius-lg)] bg-[var(--cx-bg-deep)] px-8 py-16 text-center sm:px-16"
          >
            <h2 className="font-serif text-4xl font-semibold text-[var(--cx-ink-inverse)] sm:text-5xl">
              Your desk is ready.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/50">
              Start with one idea. The studio, library, and muse will be there when you need them.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-[var(--cx-radius-sm)] bg-[var(--cx-accent)] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--cx-accent-hover)]"
                >
                  <Sparkles className="h-4 w-4" />
                  Get started free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[var(--cx-border)] bg-[var(--cx-bg-deep)] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-[var(--cx-radius-xs)] bg-white/10">
                  <Command className="h-3.5 w-3.5 text-white/60" />
                </div>
                <span className="text-sm font-semibold text-white/80">CodeXcape</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/35">
                The operating system for authors.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Studio</h3>
              <ul className="space-y-2.5 text-sm text-white/35">
                <li className="cursor-pointer transition hover:text-white/60">Story Ideas</li>
                <li className="cursor-pointer transition hover:text-white/60">Develop Cast</li>
                <li className="cursor-pointer transition hover:text-white/60">Shape Arc</li>
                <li className="cursor-pointer transition hover:text-white/60">Dialogue Room</li>
                <li className="cursor-pointer transition hover:text-white/60">World Bible</li>
                <li className="cursor-pointer transition hover:text-white/60">Tune Voice</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Resources</h3>
              <ul className="space-y-2.5 text-sm text-white/35">
                <li className="cursor-pointer transition hover:text-white/60">Documentation</li>
                <li className="cursor-pointer transition hover:text-white/60">API Reference</li>
                <li className="cursor-pointer transition hover:text-white/60">Tutorials</li>
                <li className="cursor-pointer transition hover:text-white/60">Community</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Connect</h3>
              <ul className="space-y-2.5 text-sm text-white/35">
                <li className="cursor-pointer transition hover:text-white/60">GitHub</li>
                <li className="cursor-pointer transition hover:text-white/60">Twitter</li>
                <li className="cursor-pointer transition hover:text-white/60">Discord</li>
                <li className="cursor-pointer transition hover:text-white/60">Contact</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 md:flex-row">
            <p className="text-xs text-white/25">© 2024 CodeXcape. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-white/25">
              <span className="cursor-pointer transition hover:text-white/40">Privacy</span>
              <span className="cursor-pointer transition hover:text-white/40">Terms</span>
              <span className="cursor-pointer transition hover:text-white/40">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}