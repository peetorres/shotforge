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

### DEC-010: TDD London School with selective anti-tests
- **Date**: 2026-03-27
- **Context**: User requirement for rigorous testing with anti-tests
- **Decision**: TDD for all domain logic and store. Anti-tests for validation rules, invariant enforcement, and state isolation. Not universal anti-tests.
- **Alternatives Rejected**: Universal anti-tests (theatrical for non-behavioral tests)
- **Affected Docs**: TEST_STRATEGY.md
- **Regression Risk**: None
