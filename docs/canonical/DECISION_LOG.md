# DECISION LOG — Shotforge V2

> Chronological record of all significant decisions.

## Format

```
### DEC-NNN: Title
- **Date**: YYYY-MM-DD
- **Context**: Why this decision came up
- **Decision**: What was decided
- **Alternatives Rejected**: What was considered and why not
- **Affected Docs**: Which canonical docs were updated
- **Affected Code**: Which modules are impacted
- **Regression Risk**: New risks introduced
- **Follow-up**: Any action items
```

---

### DEC-001: Direction C (One-Click AI) as primary flow
- **Date**: 2026-03-27
- **Context**: 3 UX directions prototyped (A: Apple guided, B: Studio Pro, C: One-Click AI)
- **Decision**: Direction C — single input page, AI generates everything, user chooses
- **Alternatives Rejected**: A (too many steps), B (too complex for first-time users)
- **Affected Docs**: SHOTFORGE_CANON.md §2
- **Regression Risk**: None (foundational decision)

### DEC-002: Fixed right inspector for Refine step
- **Date**: 2026-03-27
- **Context**: 4 refine approaches prototyped (inline expand, focus mode, mix-match, appscreens-center, fixed-right)
- **Decision**: All slides visible side-by-side + fixed right inspector panel (272px)
- **Alternatives Rejected**: Bottom drawer (controls too hidden), center inspector (disrupts slide flow), inline expand (limited control space)
- **Affected Docs**: DESIGN_SYSTEM.md §4.2, SHOTFORGE_CANON.md RULE-R*
- **Regression Risk**: None

### DEC-003: Preview button to toggle inspector visibility
- **Date**: 2026-03-27
- **Context**: User wanted to see clean App Store view of all slides
- **Decision**: "Preview" button in navbar hides inspector, slides fill full width
- **Affected Docs**: STATE_MACHINE.md (previewing state), DESIGN_SYSTEM.md
- **Regression Risk**: None

### DEC-004: 3 fixed variants (Midnight, Clean, Vivid)
- **Date**: 2026-03-27
- **Context**: How many and which style variants to generate
- **Decision**: Exactly 3: Midnight (dark), Clean (light), Vivid (brand gradient)
- **Alternatives Rejected**: User-defined styles (too complex for V2), 5+ variants (decision paralysis)
- **Affected Docs**: SHOTFORGE_CANON.md §4, INV-001
- **Regression Risk**: None

### DEC-005: Variant-aware store with Record<VariantId, Variant>
- **Date**: 2026-03-27
- **Context**: V1 had flat `slides[]`. V2 needs 3 independent variant sets.
- **Decision**: Store uses `variants: Record<VariantId, Variant>` with strict isolation
- **Alternatives Rejected**: 3 separate stores (unnecessary complexity), flat array with variant tag (error-prone)
- **Affected Docs**: ARCHITECTURE.md §3, REGRESSION_GUARDS.md RG-001
- **Regression Risk**: RG-001 (cross-variant leakage)

### DEC-006: Template fallback when AI unavailable
- **Date**: 2026-03-27
- **Context**: AI API can be down, rate limited, or key missing
- **Decision**: Server returns 200 with template copy + `contentOrigin: "template_fallback"`. User never blocked.
- **Alternatives Rejected**: Show error and block (terrible UX), client-side fallback (duplicated logic)
- **Affected Docs**: API_CONTRACTS.md POST /generate-copy, SHOTFORGE_CANON.md RULE-G06, RG-010
- **Regression Risk**: RG-010

### DEC-007: Content origin tracking for every editable field
- **Date**: 2026-03-27
- **Context**: Need to know if content was AI-generated or user-edited for regenerate safety
- **Decision**: `ContentOrigin` enum tracked per field, transitions defined in truth table
- **Alternatives Rejected**: Boolean `isDirty` (too coarse, loses provenance information)
- **Affected Docs**: SHOTFORGE_CANON.md §3.4, §6.2
- **Regression Risk**: RG-003

### DEC-008: Schema versioning in Zustand persist
- **Date**: 2026-03-27
- **Context**: localStorage data may outlive code versions
- **Decision**: version: 1 with migrate function. Incompatible data → clear and restart.
- **Affected Docs**: PERSISTENCE_AND_RESTORE.md §4
- **Regression Risk**: RG-009

### DEC-009: Rebuild from scratch (not incremental refactor)
- **Date**: 2026-03-27
- **Context**: V1 architecture (flat slides, single project, 3-panel builder) fundamentally incompatible with V2 flow
- **Decision**: Delete all V1 src/ except style-colors.ts and globals.css. Rebuild.
- **Alternatives Rejected**: Incremental refactor (would carry too much V1 debt and wrong abstractions)
- **Affected Docs**: IMPLEMENTATION_ROADMAP.md
- **Regression Risk**: None (clean slate)

### DEC-011: Unified Preview surface (Choose + Refine merged)
- **Date**: 2026-03-27
- **Context**: Refine as separate page felt disconnected. Editing should be inline.
- **Decision**: Merge Choose + Refine into one "Preview" surface with Browse/Edit modes. Edit mode slides in sidebar, collapses editorial, keeps strip interactive. No page navigation.
- **Alternatives Rejected**: Separate Refine page (felt like different app), full-screen editor (lost gallery context)
- **Affected Docs**: ARCHITECTURE.md, SHOTFORGE_CANON.md, STATE_MACHINE.md
- **Regression Risk**: None (simplification)

### DEC-013: Create uses centered landing-style layout (sidebar rejected)
- **Date**: 2026-03-27
- **Context**: Tested both sidebar+preview split (Option B) and centered card (Option A). User preferred centered.
- **Decision**: Create is a centered landing page with hero headline + card form. No sidebar. No split screen.
- **Alternatives Rejected**: Sidebar+preview split (Option B saved as page-option-b.tsx, deprecated)
- **Affected Docs**: SHOTFORGE_CANON.md, DESIGN_SYSTEM.md

### DEC-014: Ghost progressive disclosure pattern
- **Date**: 2026-03-27
- **Context**: Hiding fields completely confused users. They couldn't see the full flow.
- **Decision**: All fields visible from start in muted/ghost state (opacity 0.25, pointer-events none). Activate sequentially as user progresses.
- **Affected Docs**: SHOTFORGE_CANON.md

### DEC-015: CTA wording — "Generate screenshots →"
- **Date**: 2026-03-27
- **Context**: Compared "Generate screenshots →", "Generate 3 variations →", "Create App Store screenshots →"
- **Decision**: "Generate screenshots →" — clearest outcome, no jargon, matches product promise
- **Rationale**: "variations" is internal concept user doesn't need. "Create App Store" too long. "Generate screenshots" = exact what happens.

### DEC-016: Tailwind v4 @layer base fix for dark theme
- **Date**: 2026-03-27
- **Context**: Tailwind v4 preflight overrode body background to white and color to black, breaking the dark theme
- **Decision**: Wrap all base styles in `@layer base {}` in globals.css to ensure correct cascade order
- **Affected Docs**: DESIGN_SYSTEM.md, KNOWN_FAILURES_AND_GUARDS.md

### DEC-019: Lumo branding finalized — copy, tone, naming
- **Date**: 2026-03-28
- **Context**: Phase 1 final polish. Branding needed consolidation.
- **Decisions**:
  - Brand badge: "✦ Lumo" (was "✦ AI-Powered")
  - Hero headline: "Make it satisfying to look at." — emotional, outcome-oriented
  - Subtitle: "App Store screenshots. Generated, not designed." — positioning statement
  - Description helper: "· better results" (was "· improves AI copy")
  - Microcopy: "Ready." when CTA enabled, "Name your app to start" when empty
  - CTA: "Generate screenshots →" (confirmed from DEC-015)
- **Tone**: confident, minimal, sharp, product-first. No hype. No generic SaaS.

### DEC-020: Phase 1 canonical baseline frozen
- **Date**: 2026-03-28
- **Decision**: Create + Preview + Visual System + Branding all frozen as Phase 1 canonical baseline.
- **No structural changes without explicit DEC entry.**

### DEC-018: Canonical Visual System — Lumo (Glass Precision + controlled glow)
- **Date**: 2026-03-28
- **Context**: 3 visual variants evaluated (Glass Precision, Depth & Glow, Editorial Minimal)
- **Decision**: Glass Precision as base, with controlled glow from Depth & Glow and typographic restraint from Editorial
- **Reasoning**: Glass scores highest on Trust (9), Longevity (9), Brand alignment (10), Conversion (9), Scalability (9)
- **Rejected**: Depth & Glow (too cinematic), Editorial Minimal (too cold)
- **Integrated from rejected**: Controlled glow (7% opacity, 100px blur), typographic restraint (weight 800, tracking -1.5)

### DEC-017: Create surface frozen as canonical entry experience
- **Date**: 2026-03-27
- **Context**: After multiple iterations, the centered landing-style Create with ghost progressive disclosure reached production quality
- **Decision**: Freeze Create. No structural changes unless proven UX regression.

### DEC-012: Preview surface frozen as canonical reference
- **Date**: 2026-03-27
- **Context**: After 15+ structural iterations, the Preview surface reached AAA-level layout, motion, and interaction quality.
- **Decision**: Freeze this surface. No structural changes unless proven UX regression. Use as reference for motion, shadows, and interaction patterns elsewhere in the product.
- **Affected Docs**: HANDOFF_CONTEXT.md
- **Regression Risk**: None

### DEC-010: TDD London School with selective anti-tests
- **Date**: 2026-03-27
- **Context**: User requirement for rigorous testing with anti-tests
- **Decision**: TDD for all domain logic and store. Anti-tests for validation rules, invariant enforcement, and state isolation. Not universal anti-tests.
- **Alternatives Rejected**: Universal anti-tests (theatrical for non-behavioral tests)
- **Affected Docs**: TEST_STRATEGY.md
- **Regression Risk**: None
