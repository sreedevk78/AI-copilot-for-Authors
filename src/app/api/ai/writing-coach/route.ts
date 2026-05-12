import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geminiAI } from '@/lib/geminiService'
import crypto from 'crypto'

/* ────────────────────────────────────────────────────────────
   GET  /api/ai/writing-coach
   Generates 1-2 actionable writing tips grounded in the
   user's actual stories, characters, plots, and generations.
   Returns nothing if the user has no creative content yet.
   ──────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ suggestions: [], hasContent: false })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        writingStyle: true,
        favoriteGenres: true,
        writingGoals: true,
        writingExperience: true,
      },
    })

    if (!user) {
      return NextResponse.json({ suggestions: [], hasContent: false })
    }

    // ── 1. Gather the user's creative portfolio ────────────

    const [stories, characters, plots, generations, voiceProfiles, worlds] =
      await Promise.all([
        prisma.story.findMany({
          where: { authorId: user.id },
          select: {
            id: true,
            title: true,
            genre: true,
            status: true,
            wordCount: true,
            description: true,
            updatedAt: true,
            _count: { select: { chapters: true, characters: true, plots: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        prisma.savedCharacter.findMany({
          where: { userId: user.id },
          select: { name: true, role: true, description: true },
          take: 10,
        }),
        prisma.savedPlot.findMany({
          where: { userId: user.id },
          select: { title: true, description: true, genre: true },
          take: 5,
        }),
        prisma.aIGeneration.findMany({
          where: { userId: user.id },
          select: {
            type: true,
            prompt: true,
            generatedContent: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.voiceProfile.findMany({
          where: { userId: user.id },
          select: { name: true, tone: true, strengths: true, improvements: true },
          take: 3,
        }),
        prisma.world.findMany({
          where: { userId: user.id },
          select: { name: true, genre: true, description: true },
          take: 5,
        }),
      ])

    // ── 2. Gate check: no content → no tips ────────────────

    const hasContent =
      stories.length > 0 ||
      characters.length > 0 ||
      plots.length > 0 ||
      generations.length > 0 ||
      worlds.length > 0

    if (!hasContent) {
      return NextResponse.json({ suggestions: [], hasContent: false })
    }

    // ── 3. Handle refresh: dismiss old tips first ──────────

    if (forceRefresh) {
      await prisma.aISuggestion.updateMany({
        where: { userId: user.id, isDismissed: false },
        data: { isDismissed: true },
      })
    }

    // ── 4. Check for recent undismissed suggestions ────────

    if (!forceRefresh) {
      const recentSuggestions = await prisma.aISuggestion.findMany({
        where: {
          userId: user.id,
          isDismissed: false,
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
      })

      if (recentSuggestions.length > 0) {
        return NextResponse.json({
          suggestions: recentSuggestions.map(formatSuggestion),
          hasContent: true,
        })
      }
    }

    // ── 4. Build context snapshot ──────────────────────────

    const snapshot = buildPortfolioSnapshot({
      stories,
      characters,
      plots,
      generations,
      voiceProfiles,
      worlds,
      userStyle: user.writingStyle,
      genres: user.favoriteGenres,
      goals: user.writingGoals,
      experience: user.writingExperience,
    })

    // ── 5. Call Gemini for real coaching tips ───────────────

    const tipPrompt = `You are a senior creative writing coach and developmental editor. You have access to an author's current portfolio summary below.

AUTHOR PORTFOLIO:
${snapshot}

YOUR TASK:
Analyze this author's actual work — their stories, characters, plots, world-building, and generation history — and produce exactly 1 or 2 highly specific, actionable coaching tips.

RULES:
- Each tip MUST reference a specific piece of the author's work by name (a story title, character name, or world name).
- Tips must be concrete and actionable — not generic advice like "show don't tell".
- Tips should identify a specific weakness, gap, or opportunity visible in their portfolio.
- If they have low word counts, address momentum. If they have many characters but thin plots, address structure. If they have world-building but no story, address that.
- Keep each tip to 1-2 sentences. Be direct, warm, and specific.
- Assign each tip a category from: PLOT_DEVELOPMENT, CHARACTER_SUGGESTION, WORLD_BUILDING, STYLE_IMPROVEMENT, WRITING_TIP, CREATIVE_INSPIRATION

Respond ONLY with a valid JSON array:
[
  {
    "title": "Short punchy title (5-8 words)",
    "tip": "1-2 sentence specific, actionable advice referencing their actual work",
    "category": "CATEGORY_FROM_LIST_ABOVE",
    "storyRef": "Name of the story/character/world referenced, or null"
  }
]`

    let tips: Array<{ title: string; tip: string; category: string; storyRef: string | null }> = []

    try {
      const raw = await geminiAI.generateChatResponse(tipPrompt)
      const parsed = typeof raw === 'string'
        ? JSON.parse(raw.replace(/```json/gi, '').replace(/```/g, '').trim())
        : raw

      if (Array.isArray(parsed)) {
        tips = parsed.slice(0, 2)
      } else if (parsed && typeof parsed === 'object' && parsed.title) {
        tips = [parsed]
      }
    } catch (parseError) {
      console.error('Writing coach: failed to parse AI response', parseError)
      return NextResponse.json({ suggestions: [], hasContent: true })
    }

    if (tips.length === 0) {
      return NextResponse.json({ suggestions: [], hasContent: true })
    }

    // ── 6. Persist to AISuggestion table (dedup by hash) ──

    const saved: any[] = []

    for (const tip of tips) {
      const contentHash = crypto
        .createHash('md5')
        .update(`${user.id}:${tip.title}:${tip.tip}`)
        .digest('hex')

      // Check for duplicate
      const existing = await prisma.aISuggestion.findFirst({
        where: {
          userId: user.id,
          metadata: contentHash,
          isDismissed: false,
        },
      })

      if (existing) {
        saved.push(existing)
        continue
      }

      // Find the referenced story if any
      let storyId: string | null = null
      if (tip.storyRef) {
        const match = stories.find(
          (s) => s.title.toLowerCase() === tip.storyRef?.toLowerCase()
        )
        if (match) storyId = match.id
      }

      const created = await prisma.aISuggestion.create({
        data: {
          type: tip.category || 'WRITING_TIP',
          title: tip.title,
          content: tip.tip,
          context: tip.storyRef || undefined,
          priority: 'MEDIUM',
          metadata: contentHash,
          userId: user.id,
          storyId,
        },
      })

      saved.push(created)
    }

    return NextResponse.json({
      suggestions: saved.map(formatSuggestion),
      hasContent: true,
    })
  } catch (error) {
    console.error('Writing coach error:', error)
    return NextResponse.json(
      { suggestions: [], hasContent: false, error: 'Failed to generate tips' },
      { status: 500 }
    )
  }
}

/* ────────────────────────────────────────────────────────────
   PATCH  /api/ai/writing-coach
   Mark a suggestion as dismissed.
   ──────────────────────────────────────────────────────────── */

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.aISuggestion.updateMany({
      where: { id, userId: user.id },
      data: { isDismissed: true, isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dismiss suggestion error:', error)
    return NextResponse.json({ error: 'Failed to dismiss' }, { status: 500 })
  }
}

/* ── Helpers ────────────────────────────────────────────────── */

function formatSuggestion(s: any) {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    content: s.content,
    context: s.context,
    priority: s.priority,
    storyId: s.storyId,
    createdAt: s.createdAt,
  }
}

function buildPortfolioSnapshot(data: {
  stories: any[]
  characters: any[]
  plots: any[]
  generations: any[]
  voiceProfiles: any[]
  worlds: any[]
  userStyle: string | null
  genres: string | null
  goals: string | null
  experience: string | null
}) {
  const lines: string[] = []

  // User profile
  if (data.experience) lines.push(`Experience level: ${data.experience}`)
  if (data.genres) {
    try {
      const g = JSON.parse(data.genres)
      if (Array.isArray(g) && g.length > 0) lines.push(`Favorite genres: ${g.join(', ')}`)
    } catch { /* ignore */ }
  }
  if (data.goals) {
    try {
      const g = JSON.parse(data.goals)
      if (Array.isArray(g) && g.length > 0) lines.push(`Writing goals: ${g.join(', ')}`)
    } catch { /* ignore */ }
  }

  // Stories
  if (data.stories.length > 0) {
    lines.push(`\nMANUSCRIPTS (${data.stories.length}):`)
    for (const s of data.stories) {
      const parts = [`"${s.title}" — ${s.genre}, ${s.status}, ${s.wordCount.toLocaleString()} words`]
      if (s.description) parts.push(`  Note: ${s.description.slice(0, 120)}`)
      if (s._count.characters > 0) parts.push(`  ${s._count.characters} characters, ${s._count.plots} plot points, ${s._count.chapters} chapters`)
      lines.push(parts.join('\n'))
    }
  }

  // Characters
  if (data.characters.length > 0) {
    lines.push(`\nSAVED CHARACTERS (${data.characters.length}):`)
    for (const c of data.characters) {
      lines.push(`- ${c.name} (${c.role}): ${(c.description || '').slice(0, 80)}`)
    }
  }

  // Plots
  if (data.plots.length > 0) {
    lines.push(`\nSAVED PLOTS (${data.plots.length}):`)
    for (const p of data.plots) {
      lines.push(`- "${p.title}": ${(p.description || '').slice(0, 80)}`)
    }
  }

  // Worlds
  if (data.worlds.length > 0) {
    lines.push(`\nWORLDS (${data.worlds.length}):`)
    for (const w of data.worlds) {
      lines.push(`- "${w.name}" (${w.genre}): ${(w.description || '').slice(0, 80)}`)
    }
  }

  // Voice profiles
  if (data.voiceProfiles.length > 0) {
    lines.push(`\nVOICE PROFILES (${data.voiceProfiles.length}):`)
    for (const v of data.voiceProfiles) {
      const improvements = v.improvements ? (() => { try { return JSON.parse(v.improvements) } catch { return [] } })() : []
      lines.push(`- "${v.name}": tone=${v.tone || 'unknown'}${improvements.length > 0 ? `, needs work on: ${improvements.slice(0, 3).join(', ')}` : ''}`)
    }
  }

  // Recent generations
  if (data.generations.length > 0) {
    lines.push(`\nRECENT AI GENERATIONS (${data.generations.length}):`)
    for (const g of data.generations) {
      const excerpt = typeof g.generatedContent === 'string'
        ? g.generatedContent.slice(0, 150)
        : ''
      lines.push(`- [${g.type}] Prompt: "${g.prompt.slice(0, 80)}"${excerpt ? `\n  Output excerpt: "${excerpt}..."` : ''}`)
    }
  }

  return lines.join('\n')
}
