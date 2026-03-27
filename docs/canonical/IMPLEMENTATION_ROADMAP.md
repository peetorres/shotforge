# IMPLEMENTATION ROADMAP — Shotforge V2

> Phased execution plan. Risk-first ordering.

## Phase 0: Foundation
**Objective**: Clean repo, install deps, set up infrastructure.
**Why now**: Nothing can be built without a clean foundation.

### Tasks
1. Delete V1 source files (keep: style-colors.ts, style-colors.test.ts, globals.css, layout.tsx, validation.ts)
2. Create directory structure for V2
3. Add dev dependencies: @testing-library/react, @testing-library/jest-dom, @vitest/coverage-v8, jsdom
4. Update vitest.config.ts: jsdom environment, coverage thresholds (70%), setup file
5. Create src/test-setup.ts
6. Update package.json scripts: add lint, test:coverage
7. Create CHANGELOG.md, VERSION file (0.2.0-alpha.0)

### Exit Gate
- `pnpm test` runs (0 tests, no errors)
- `pnpm typecheck` passes
- Directory structure matches ARCHITECTURE.md §6
- All canonical docs committed

### Memory Updates
- HANDOFF_CONTEXT.md: Phase 0 complete
- CHANGELOG.md: v0.2.0-alpha.0

---

## Phase 1: Domain Layer (Types + Rules + Variants)
**Objective**: Establish the type system and business rule validators.
**Why now**: Everything depends on correct types and validated inputs.
**Risk covered**: RG-007 (invalid upload), INV-001, INV-002, INV-008, INV-009

### Tasks (TDD cycle for each)
1. `src/domain/types.ts` — ProjectState, Variant, SlideConfig, VariantId, FlowStep, ContentOrigin
2. `src/domain/rules.ts` — validateMimeType, validateDimensions, validateFileSize, validateTotalSize, validateBrandColor, validateAppName, validateDescription
3. `src/domain/rules.test.ts` — test each rule rejects invalid input
4. `src/domain/rules.anti.test.ts` — test each rule accepts valid input
5. `src/domain/variant.ts` — createVariants(), VARIANT_DEFINITIONS
6. `src/domain/variant.test.ts` — INV-001, INV-002, INV-008

### Exit Gate
- All domain tests pass (expect ~20 tests)
- Types compile with strict null checks
- Rules map 1:1 to SHOTFORGE_CANON.md RULE-V*, RULE-C*

---

## Phase 2: Store + Persistence
**Objective**: Variant-aware Zustand store with persistence and restore.
**Why now**: Every UI component reads from the store. Store bugs = global bugs.
**Risk covered**: RG-001 (cross-variant leakage), RG-004 (broken restore), RG-009 (schema mismatch), INV-003, INV-005, INV-010

### Tasks (TDD cycle)
1. `src/lib/store.ts` — ShotforgeStore with all actions from ARCHITECTURE.md §3
2. `src/lib/store.test.ts` — test every action, test invariant enforcement
3. Store isolation tests: updateSlide on variant A doesn't touch B (INV-003)
4. Step transition tests: only valid transitions per STATE_MACHINE.md (INV-010)
5. Content origin tracking: edits set "edited_by_user" (INV-005)
6. Persistence: validate restore, handle corrupted data, schema versioning
7. `src/lib/build-slides.ts` — build slide sets for all 3 variants
8. `src/lib/build-slides.test.ts`
9. `src/lib/copy-templates.ts` — fallback copy for each slide type
10. `src/lib/copy-templates.test.ts`

### Exit Gate
- Store tests pass (~25 tests including anti-tests)
- Cross-variant isolation proven
- Restore with invalid data fails gracefully
- Build succeeds

---

## Phase 3: API Routes
**Objective**: Server-side upload, AI copy, preview, export.
**Why now**: UI needs working APIs. Render pipeline must be proven.
**Risk covered**: RG-002 (preview/export divergence), RG-006 (silent export), RG-007 (invalid upload), RG-010 (AI blocks user)

### Tasks (TDD cycle)
1. `src/app/api/upload/route.ts` — reuse existing validation.ts, add anti-tests
2. `src/app/api/upload/validation.test.ts` — tests + anti-tests for all RULE-V*
3. `src/app/api/generate-copy/route.ts` — AI with fallback (RULE-G06)
4. `src/app/api/generate-copy/route.test.ts` — mock Anthropic, test fallback
5. `src/app/api/preview/route.ts` — compose + resize (same as V1, proven)
6. `src/app/api/preview/route.test.ts` — mock composeSlide, test 404 on missing session
7. `src/app/api/export/route.ts` — full render + ZIP (same as V1, proven)
8. `src/app/api/export/route.test.ts` — mock generateScreenshots, test ZIP headers
9. Fidelity test: preview and export use same config structure

### Exit Gate
- All API tests pass (~16 tests)
- Fallback copy works without API key
- Upload rejects all invalid inputs and accepts all valid
- Export returns proper ZIP headers

---

## Phase 4: Hooks
**Objective**: Client-side orchestration for generation, preview, export.
**Why now**: Hooks bridge store and API. Must work before any UI.
**Risk covered**: RG-005 (stale preview), RG-006 (silent export), RG-010 (AI blocks)

### Tasks (TDD cycle)
1. `src/hooks/use-generate.ts` — orchestrate 3 variants × N slides, progress tracking
2. `src/hooks/use-generate.test.ts` — mock fetch, test progress, test fallback
3. `src/hooks/use-preview.ts` — debounced preview with abort
4. `src/hooks/use-preview.test.ts` — test debounce, abort, error states
5. `src/hooks/use-export.ts` — ZIP download with error handling
6. `src/hooks/use-export.test.ts` — test download trigger, double-fire prevention

### Exit Gate
- Hook tests pass (~12 tests)
- useGenerate handles AI failure gracefully
- usePreview debounces correctly
- useExport prevents double-fire

---

## Phase 5: Shared Components + Create Page
**Objective**: Build shared UI primitives and the Create step.
**Why now**: Create is step 1, the entry point. Shared components needed for all steps.
**Risk covered**: RULE-C01..C06

### Tasks
1. `src/components/shared/nav-bar.tsx` — step indicators + actions
2. `src/components/shared/drop-zone.tsx` — drag-drop upload
3. `src/components/shared/color-picker.tsx` — brand color swatches
4. `src/components/create/create-form.tsx` — all-in-one form
5. `src/components/create/screenshot-grid.tsx` — 6-slot thumbnail grid
6. `src/app/page.tsx` — Create page (step 1)
7. Component tests: form validation, button enable/disable, file rejection

### Exit Gate
- Create page renders, form validates, uploads work
- Component tests pass (~12 tests)
- Design matches prototype and DESIGN_SYSTEM.md

---

## Phase 6: Generate + Choose Pages
**Objective**: The AI generation flow and variant gallery.
**Why now**: Core product loop — generate and choose.
**Risk covered**: RULE-G*, RULE-CH*, INV-001, INV-002

### Tasks
1. `src/components/generate/progress-screen.tsx` — animated progress
2. `src/app/generate/[sessionId]/page.tsx` — generation orchestration
3. `src/components/choose/variant-strip.tsx` — one variant's slide cards
4. `src/components/choose/variant-gallery.tsx` — all 3 strips
5. `src/components/choose/export-bar.tsx` — sticky bottom export
6. `src/app/choose/[sessionId]/page.tsx` — choose page
7. Integration test: create → generate → 3 variants in store → choose renders

### Exit Gate
- Full create → generate → choose flow works
- 3 variants with correct slides generated
- Select and Refine buttons functional
- Integration test passes

---

## Phase 7: Refine Page
**Objective**: The visual editor — the product's power feature.
**Why now**: After all data and rendering is proven.
**Risk covered**: RG-001, RG-003, RG-005, RULE-R*, RULE-RG*

### Tasks
1. `src/components/refine/slide-cards-row.tsx` — all slides side-by-side
2. `src/components/refine/inspector.tsx` — right panel container
3. `src/components/refine/layout-section.tsx` — slide type selector
4. `src/components/refine/background-section.tsx` — preset grid
5. `src/components/refine/title-section.tsx` — headline + AI regenerate
6. `src/components/refine/device-section.tsx` — rotation, scale, offset
7. `src/app/refine/[sessionId]/page.tsx` — refine page with preview toggle
8. Preview integration: edits trigger debounced re-render
9. Regenerate with dirty guard (RULE-RG02)

### Exit Gate
- Refine page renders all slides
- Inspector edits update store correctly
- Preview mode works (toggle inspector)
- Regenerate respects dirty state
- Component tests pass (~16 tests)

---

## Phase 8: Export + End-to-End
**Objective**: Complete the loop. Export works. Full flow tested.
**Why now**: Everything is in place. Time to prove it works end-to-end.
**Risk covered**: RG-002, RG-006, RULE-E*, acceptance criterion

### Tasks
1. Wire export button in Refine navbar
2. Wire export bar in Choose page
3. Integration test: full create → generate → choose → refine → export
4. Fidelity test: preview matches export
5. Manual QA: test with real screenshots

### Exit Gate
- Full flow works end-to-end
- ZIP downloads with correct files
- Integration test passes
- Build succeeds
- All tests pass

---

## Phase 9: Hardening
**Objective**: Error states, edge cases, recovery, polish.
**Why now**: Happy path works. Now harden it.

### Tasks
1. Error states for all API failures (upload, generate, preview, export)
2. Session restore: test refresh on every page
3. Deep link handling: test direct URL access to every route
4. Schema migration: test with old localStorage data
5. Loading states: skeleton/spinner for all async operations
6. Run regression guard verification checklist

### Exit Gate
- All regression guards verified
- All known failures have prevention mechanisms active
- Error states render gracefully
- `pnpm test` coverage >= 70%
- Build + typecheck pass

---

## Phase 10: Documentation Sync + Handoff
**Objective**: Ensure docs match reality. Perfect handoff state.
**Why now**: Code is done. Docs must be the truth.

### Tasks
1. Audit every canonical doc against implemented code
2. Update HANDOFF_CONTEXT.md with final state
3. Update VERSION to 0.2.0
4. Write CHANGELOG.md final entry
5. Verify SYSTEM_START_HERE.md is accurate
6. Commit everything

### Exit Gate
- Any new agent can read SYSTEM_START_HERE.md and understand the entire system
- No doc contradicts the code
- No code exists without doc coverage
- Product is demonstrable: upload 6 screenshots → see 3 variations → refine → export
