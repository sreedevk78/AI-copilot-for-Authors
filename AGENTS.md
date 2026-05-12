# AGENTS.md

## Project Mission

This repository is an AI co-assistant platform for authors.

Your mission is to:
1. Perform a complete UI/UX redesign.
2. Simplify the user experience.
3. Reduce navigation clutter.
4. Consolidate overlapping functionality safely.
5. Preserve ALL existing capabilities and workflows.
6. Improve architecture and maintainability without regressions.

This is NOT a cosmetic reskin task.

The goal is a fundamentally more polished, intentional, premium product experience while retaining all functional power.

---

# CORE NON-NEGOTIABLE RULES

## 1. NEVER DELETE FUNCTIONALITY

Do not remove a capability simply because:
- it appears redundant
- another feature is similar
- two flows overlap
- the UI feels crowded

If multiple functions do similar things:
- unify them internally
- consolidate the UI surface
- preserve all behaviors underneath

Preserve behavior through:
- wrappers
- adapters
- variants
- configuration modes
- internal branching
- shared core services
- feature composition

If uncertain:
PRESERVE FIRST.

---

## 2. UI SIMPLIFICATION ≠ FEATURE LOSS

The navigation, dashboard, taskbar, sidebars, and toolbar areas SHOULD become cleaner and smaller.

However:
- all previous powers/features must still exist
- similar tabs should be merged under umbrella workflows
- overlapping actions should become grouped experiences
- advanced functionality may move into contextual menus/modals/panels
- duplicate entry points may be removed ONLY if the underlying capability still exists elsewhere

The user-facing surface should shrink.
The underlying capability set should not.

---

## 3. THIS MUST FEEL LIKE A FULL REDESIGN

Do NOT:
- merely change colors
- slightly tweak spacing
- add parallax and stop
- keep the same layout structure
- apply a superficial theme

Instead:
- rethink information architecture
- redesign layouts from first principles
- redesign component hierarchy
- redesign navigation flow
- redesign interaction flow
- redesign dashboard composition
- redesign spacing and typography systems
- redesign panel organization
- redesign how users discover actions

The final result should feel like:
- a completely reimagined product
- professionally designed
- intentional
- cohesive
- premium
- modern
- calm
- editorial
- highly polished

Avoid generic AI-generated SaaS aesthetics.

---

# DESIGN LANGUAGE

Use the provided reference image ONLY as inspiration for:
- hierarchy
- spacing
- composition
- atmosphere
- typography scale
- layout balance
- visual calmness
- premium polish
- navigation cleanliness

DO NOT copy:
- text
- branding
- products
- imagery
- illustrations
- content

The redesign should embody:
- generous whitespace
- strong typography
- balanced composition
- subtle gradients
- elegant depth
- restrained shadows
- clean sections
- minimal noise
- structured focus
- premium dashboard aesthetics

The product must still strongly feel like:
an AI co-assistant for authors.

---

# REQUIRED EXECUTION STRATEGY

## PHASE 1 — FULL CODEBASE AUDIT

Before changing anything:

Read the ENTIRE repository carefully.

Map:
- routes
- pages
- layouts
- components
- utilities
- hooks
- services
- state management
- feature systems
- panels
- modals
- drawers
- tabs
- navigation structures
- toolbars
- sidebars
- taskbars
- workflows
- content pipelines
- AI interactions
- writing flows
- editing flows
- generation flows

Identify:
- duplicated logic
- overlapping workflows
- fragmented UI systems
- repeated components
- inconsistent patterns
- multiple implementations of similar behavior
- unsafe architectural areas
- tightly coupled systems
- opportunities for abstraction

DO NOT begin major implementation before understanding the system deeply.

---

## PHASE 2 — INFORMATION ARCHITECTURE REDESIGN

Rebuild the UX structure intentionally.

Goals:
- reduce clutter
- reduce visible taskbar items
- reduce repeated controls
- reduce repeated tabs
- group related functionality
- improve discoverability
- improve workflow clarity

For overlapping tabs/features:
- unify them into umbrella systems
- preserve unique capabilities through modes/variants
- create cleaner entry points

The new UX should:
- require fewer visible navigation items
- feel cleaner
- feel easier to understand
- still expose all advanced capabilities

---

## PHASE 3 — SAFE FUNCTION CONSOLIDATION

When multiple functions/components/services do similar work:

DO:
- create shared internal systems
- create shared abstractions
- create reusable primitives
- create compatibility wrappers
- create configurable variants
- merge duplicated logic safely

DO NOT:
- aggressively delete code
- collapse flows blindly
- remove edge cases
- remove alternate behaviors
- simplify by sacrificing capability

The resulting architecture should:
- reduce duplication
- improve maintainability
- preserve all existing behavior
- improve extensibility

The final codebase may legitimately become larger if required to preserve behavior safely.

That is acceptable.

Correctness > fewer lines.

---

## PHASE 4 — FULL UI IMPLEMENTATION

Rebuild the interface comprehensively.

Required improvements:
- typography hierarchy
- spacing system
- dashboard composition
- responsive layout quality
- visual consistency
- interaction polish
- navigation hierarchy
- action grouping
- panel organization
- motion subtlety
- visual density
- component consistency
- onboarding clarity
- workflow continuity

The interface should feel:
- premium
- structured
- focused
- modern
- trustworthy
- thoughtfully designed

Not:
- cluttered
- template-based
- AI-generated
- noisy
- over-decorated

---

## PHASE 5 — VERIFICATION & REGRESSION PROTECTION

Before completion:

Verify:
- every major route
- every important interaction
- every workflow
- every modal
- every tab
- every editor
- every generation flow
- every AI action
- every form
- every panel
- every dashboard interaction

Ensure:
- no feature disappeared
- no workflow broke
- no edge case vanished
- no important button behavior changed unintentionally
- consolidated systems still support all previous use cases

Add:
- tests
- validation
- runtime guards
- fallback handling
where appropriate.

---

# CONSOLIDATION DECISION RULE

If two things are similar:

DO NOT immediately delete one.

Instead:
1. identify shared behavior
2. extract common logic
3. create a unified internal system
4. preserve unique behaviors through:
   - modes
   - variants
   - adapters
   - configuration
   - wrappers
5. simplify the UI surface
6. preserve the underlying power

This rule applies to:
- tabs
- buttons
- workflows
- AI tools
- panels
- generators
- editors
- commands
- routes
- services
- utilities
- hooks
- components

---

# EXPECTED OUTPUT QUALITY

Act like:
- a senior product designer
- a senior frontend architect
- a senior UX strategist
- a senior systems engineer

Do not optimize for:
- speed
- minimum edits
- shortest diff

Optimize for:
- quality
- cohesion
- maintainability
- correctness
- polish
- architectural integrity
- long-term scalability

---

# FINAL OUTPUT REQUIREMENTS

When work is complete, provide:

1. UI redesign summary
2. Information architecture summary
3. Consolidation/refactor summary
4. Compatibility wrappers/adapters added
5. Major systems merged
6. Navigation simplification summary
7. Files changed
8. Risks/follow-up areas
9. Remaining technical debt
10. Verification/testing summary

---

# FINAL REMINDER

Do NOT perform:
- shallow redesigns
- cosmetic-only edits
- simplistic merging
- destructive cleanup
- feature loss disguised as simplification

This task requires:
deep reading,
deep planning,
deep architectural reasoning,
and a complete rethinking of the product experience.

Preserve the power.
Reduce the clutter.
Rebuild the experience.
