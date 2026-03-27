# HANDOFF CONTEXT — Shotforge V2

> Compact operational summary. Read this after SYSTEM_START_HERE.md.
> Updated at every phase completion.

## Last Updated
2026-03-27 | Create + Preview surfaces FROZEN. 135 tests. Full flow functional.

## Current State

### What Exists
- **Branch**: `feat/shotforge-v2`
- **Version**: 0.2.0-alpha.0
- **Tests**: 100 passing (0 failing)
- **Canonical docs**: All 16 documents created and populated
- **V1 source**: DELETED (except style-colors.ts, globals.css, layout.tsx, validation.ts)
- **Engine**: `@appforge/screenshot-gen` — working, untouched

### Completed Phases
- **Phase 0**: V1 cleanup, directory structure, test infra (jsdom, coverage thresholds), VERSION, CHANGELOG
- **Phase 1**: Domain types (ProjectState, Variant, SlideConfig, VariantId, FlowStep, ContentOrigin), business rules (8 validators with TDD + anti-tests), variant factory (createVariants)
- **Phase 2**: Zustand store (variant-aware, isolation-proven via INV-003), copy templates (fallback)
- **Phase 3**: API routes — upload (with validation + anti-tests), generate-copy (with AI fallback RG-010), preview, export
- **Phase 4**: Hooks — generateAllVariants (orchestration), usePreview (debounced), useExport (download trigger)

### What Was Done This Session
1. UX research + 11 HTML prototypes → user approved Direction C + Fixed Right Inspector
2. Created 16 canonical documents (full memory system)
3. Audited previous plan (PLAN_AUDIT.md) — corrected 9 issues, filled 15 gaps
4. Deleted V1 source, created V2 directory structure
5. TDD Phase 1: domain/types.ts, domain/rules.ts (19 tests + 21 anti-tests), domain/variant.ts (13 tests)
6. TDD Phase 2: lib/store.ts (19 tests, INV-003 isolation proven), lib/copy-templates.ts (4 tests)

### Test Summary
| File | Tests |
|------|-------|
| domain/rules.test.ts | 19 (rejection tests) |
| domain/rules.anti.test.ts | 21 (acceptance tests) |
| domain/variant.test.ts | 13 (INV-001, INV-002, INV-008) |
| lib/store.test.ts | 19 (isolation, transitions, selection) |
| lib/copy-templates.test.ts | 4 (RULE-G06 fallback) |
| lib/style-colors.test.ts | 4 (kept from V1) |
| **Total** | **80** |

### Decisions Made
- DEC-001 through DEC-010 (see DECISION_LOG.md)

### Risks Remaining
- No UI components yet (Phase 5-7)
- No CI pipeline for shotforge yet
- /tmp storage is ephemeral (known, accepted for V2)

## Next Steps (In Order)

1. **Phase 5: Shared Components + Create Page** — NavBar, DropZone, ColorPicker, CreateForm
2. **Phase 6: Generate + Choose Pages**
3. **Phase 7: Refine Page** — slide cards row, inspector with 4 sections
4. **Phase 8: Export + E2E**
5. **Phase 9: Hardening**
6. **Phase 10: Doc sync + handoff**

## For Next Instance

1. Read SYSTEM_START_HERE.md first
2. The UX is FULLY APPROVED — do not redesign. Reference `prototypes/shotforge-complete-flow.html`
3. The canonical docs are the source of truth — code must match them
4. Start from "Next Steps" above — Phase 3 (API Routes)
5. Follow EXECUTION_PROTOCOL.md for all work
6. Run `pnpm test` to verify 80 tests pass before making any changes
