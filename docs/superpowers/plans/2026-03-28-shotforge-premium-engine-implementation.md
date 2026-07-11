# Shotforge Premium Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-architect Shotforge internally into a premium AI-directed App Store creative system while preserving the current Create experience and the current final Preview visual surface.

**Architecture:** Keep the outer product shell stable and premium while replacing the internal generation flow with a staged engine: ingest, perception, direction, composition, evaluation, repair, and curation. Centralize state, formalize contracts, thin the API routes, and integrate the new engine behind the existing Preview-first UX.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest, Zustand, `@appforge/screenshot-gen`, multimodal LLM APIs, deterministic rendering pipeline

---

## State Authority

Shotforge should use a hybrid authority model with one client source of truth for product UI state and one server source of truth for ephemeral render inputs.

### Client authority

The centralized app store owns:

- hydrated session metadata
- generation lifecycle state
- finalist set and ranking
- selected finalist
- edit mode and editor state
- preview mode
- export intent

This state is persisted through one store and one persistence layer only. No page component may write directly to `localStorage`.

### Server authority

The server owns only ephemeral generation and render assets:

- uploaded screenshot files in temporary storage
- cached perception artifacts if implemented
- rendered preview/export payload generation

No server-side business session model is introduced in this phase. The client remains authoritative for session state; the server remains authoritative for transient file-backed assets.

### Hydration and restore rules

- the client store hydrates before route-specific rendering
- invalid persisted state redirects to Create
- missing server assets must keep client state intact and surface a re-upload recovery path
- regenerate must preserve the current finalist/editing model until a replacement finalist set is accepted

## Evaluator Artifacts

The evaluator and curator must use explicit artifacts, not qualitative interpretation.

### Score schema

Create a weighted score schema in core contracts or a dedicated scoring module with these dimensions:

- `premiumFeel`: weight 0.20
- `hierarchyClarity`: weight 0.15
- `screenshotFit`: weight 0.15
- `distinctiveness`: weight 0.10
- `narrativeCoherence`: weight 0.15
- `textReadability`: weight 0.10
- `brandFit`: weight 0.10
- `conversionStrength`: weight 0.05

Use a normalized 0-1 range per dimension.

### Thresholds

Store explicit constants in code:

- `AAA_THRESHOLD = 0.85`
- `PREMIUM_ACCEPTABLE_THRESHOLD = 0.72`
- `MIN_TOP3_DISTANCE = 0.18`

### Distinction rule

Top 3 distinction is measured using a deterministic distance function across:

- direction thesis
- layout family distribution
- typography family selection
- background treatment family
- focal/crop strategy profile

No two Top 3 finalists may score below `MIN_TOP3_DISTANCE` unless fewer than 3 candidates clear `AAA_THRESHOLD`.

### Fixture corpus

Use a fixed deterministic fixture corpus for tests:

- 1 productivity app set
- 1 consumer/social app set
- 1 wellness or learning app set

These fixtures should drive perception, composition, evaluator, and final visual acceptance checks.
Chunk 3 creates this corpus. All later chunks must reuse it unchanged unless the plan is explicitly revised.

## File Structure Target

### Keep frozen

- `src/app/page.tsx`
- `src/components/preview/preview-surface.tsx` as visual reference for the unified Preview surface

### Create

- `src/core/contracts.ts`
- `src/core/session.ts`
- `src/core/finalists.ts`
- `src/core/scoring.ts`
- `src/pipeline/ingest/service.ts`
- `src/pipeline/perception/adapter.ts`
- `src/pipeline/perception/fixtures.ts`
- `src/pipeline/perception/service.ts`
- `src/pipeline/direction/service.ts`
- `src/pipeline/composition/service.ts`
- `src/pipeline/evaluation/service.ts`
- `src/pipeline/repair/service.ts`
- `src/pipeline/curation/service.ts`
- `src/rendering/backgrounds/derived-background.ts`
- `src/rendering/typography/library.ts`
- `src/rendering/placement/focal-placement.ts`
- `src/server/generation/run-generation.ts`
- `src/server/preview/build-preview-request.ts`
- `src/server/routes/preview-surface-routing.ts`
- `src/app-state/store.ts`
- `src/app-state/persist.ts`
- `src/app-state/guards.ts`
- `src/ui/preview/`
- `src/ui/editor/`
- `docs/canonical/PREVIEW_UNIFIED_FLOW.md` if a new canonical doc is required instead of overloading existing docs

### Modify

- `docs/canonical/SHOTFORGE_CANON.md`
- `docs/canonical/ARCHITECTURE.md`
- `docs/canonical/STATE_MACHINE.md`
- `docs/canonical/API_CONTRACTS.md`
- `docs/canonical/HANDOFF_CONTEXT.md`
- `docs/canonical/IMPLEMENTATION_ROADMAP.md`
- `docs/canonical/DECISION_LOG.md`
- `src/ai/visual-director.ts`
- `src/lib/store.ts`
- `src/hooks/use-generate.ts`
- `src/hooks/use-preview.ts`
- `src/hooks/use-preview-cache.ts`
- `src/hooks/use-export.ts`
- `src/app/generate/[sessionId]/page.tsx`
- `src/app/choose/[sessionId]/page.tsx`
- `src/app/refine/[sessionId]/page.tsx`
- `src/app/api/analyze/route.ts`
- `src/app/api/generate-copy/route.ts`
- `src/app/api/preview/route.ts`
- `src/app/api/export/route.ts`
- `src/domain/types.ts`
- `src/domain/variant.ts`

### Test files

- `src/core/contracts.test.ts`
- `src/core/scoring.test.ts`
- `src/pipeline/perception/adapter.test.ts`
- `src/pipeline/perception/service.test.ts`
- `src/pipeline/direction/service.test.ts`
- `src/pipeline/composition/service.test.ts`
- `src/pipeline/evaluation/service.test.ts`
- `src/pipeline/repair/service.test.ts`
- `src/pipeline/curation/service.test.ts`
- `src/rendering/backgrounds/derived-background.test.ts`
- `src/rendering/typography/library.test.ts`
- `src/app-state/store.test.ts`
- `src/app/api/analyze/route.test.ts`
- `src/app/api/preview/route.test.ts`
- `src/app/api/export/route.test.ts`
- `src/__tests__/integration/preview-flow.test.tsx`
- `src/__tests__/integration/finalist-curation.test.ts`
- `src/__tests__/fidelity/preview-export-fidelity.test.ts`
- `src/__tests__/fidelity/premium-visual-acceptance.test.ts`

## Chunk 1: Canonical Alignment

### Task 1: Update the product contract to the 3-step Preview-first model

**Files:**
- Modify: `docs/canonical/SHOTFORGE_CANON.md`
- Modify: `docs/canonical/STATE_MACHINE.md`
- Modify: `docs/canonical/ARCHITECTURE.md`
- Modify: `docs/canonical/API_CONTRACTS.md`
- Modify: `docs/canonical/DECISION_LOG.md`
- Modify: `docs/canonical/IMPLEMENTATION_ROADMAP.md`
- Modify: `docs/canonical/HANDOFF_CONTEXT.md`
- Test: none

- [ ] **Step 1: Write the contract changes directly in the docs**

Add:
- Preview unified flow as the official user-facing model
- Top 3 finalists as the default surfaced set
- expanded finalists only when they add real value
- internal candidate generation, scoring, repair, and curation as mandatory engine behavior
- Create freeze and Preview surface freeze as explicit product constraints

- [ ] **Step 2: Update the slide model language**

Rewrite the docs so the slide vocabulary matches the final narrative model the engine will support. Do not leave the old simplified slide contract in place if the system is moving to a richer narrative taxonomy.

- [ ] **Step 3: Record the architecture decision**

Add a new `DEC-*` entry that formally freezes:
- Create surface
- Preview unified flow
- hybrid creative direction system
- deterministic derived backgrounds
- internal candidate curation

- [ ] **Step 4: Manual verification**

Check that no canonical doc still describes:
- Choose and Refine as the primary product split
- page-level localStorage as the final state model
- "generate 3 and show them" without scoring/repair

- [ ] **Step 5: Commit**

```bash
git add docs/canonical docs/superpowers/specs/2026-03-28-shotforge-premium-engine-design.md
git commit -m "docs: align Shotforge canon with premium preview-first architecture"
```

## Chunk 2: Core Contracts and State Boundary

### Task 2: Introduce the new core engine contracts

**Files:**
- Create: `src/core/contracts.ts`
- Create: `src/core/contracts.test.ts`
- Create: `src/core/session.ts`
- Create: `src/core/finalists.ts`
- Create: `src/core/scoring.ts`
- Modify: `src/domain/types.ts`
- Test: `src/core/scoring.test.ts`

- [ ] **Step 1: Write failing tests for the new contract types**

Test:
- `ProjectBrief`
- `ScreenshotAnalysis`
- `NarrativeDirection`
- `SequenceCandidate`
- `ScoredSequence`
- `RepairAction`
- `FinalistSet`
- score dimension schema
- threshold constants

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/core/contracts.test.ts src/core/scoring.test.ts`
Expected: FAIL with missing module or missing exports

- [ ] **Step 3: Implement the contract modules**

Rules:
- `src/domain/types.ts` should become a compatibility layer or be slimmed down
- put pipeline-facing contracts in `src/core/contracts.ts`
- keep public types focused and explicit

- [ ] **Step 4: Run tests**

Run: `pnpm test -- src/core/contracts.test.ts src/core/scoring.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core src/domain/types.ts
git commit -m "refactor: add Shotforge premium engine contracts"
```

### Task 3: Replace ad hoc page persistence with centralized app state design

**Files:**
- Create: `src/app-state/store.ts`
- Create: `src/app-state/persist.ts`
- Create: `src/app-state/guards.ts`
- Modify: `src/lib/store.ts`
- Modify: `src/lib/store.test.ts`
- Create: `src/app-state/store.test.ts`

- [ ] **Step 1: Write failing tests for centralized state responsibilities**

Test:
- hydration guard
- selected finalist state
- edit mode state
- generation lifecycle state
- restore behavior
- preview/export sync state

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test -- src/app-state/store.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement centralized state modules**

Requirements:
- one source of truth
- persistence outside page components
- route guards based on store state
- no final page should write raw localStorage directly
- client owns session state, server owns ephemeral files only

- [ ] **Step 4: Keep `src/lib/store.ts` as temporary adapter or replace usages**

Do not leave two competing stores in active use.

- [ ] **Step 5: Run tests**

Run: `pnpm test -- src/app-state/store.test.ts src/lib/store.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app-state src/lib/store.ts src/lib/store.test.ts
git commit -m "refactor: centralize Shotforge application state"
```

## Chunk 3: Premium Engine Skeleton

### Task 4: Extract the current AI flow into staged pipeline modules

**Files:**
- Create: `src/pipeline/ingest/service.ts`
- Create: `src/pipeline/perception/adapter.ts`
- Create: `src/pipeline/perception/fixtures.ts`
- Create: `src/pipeline/perception/service.ts`
- Create: `src/pipeline/direction/service.ts`
- Create: `src/pipeline/composition/service.ts`
- Modify: `src/ai/visual-director.ts`
- Test: `src/pipeline/perception/adapter.test.ts`
- Test: `src/pipeline/perception/service.test.ts`
- Test: `src/pipeline/direction/service.test.ts`
- Test: `src/pipeline/composition/service.test.ts`

- [ ] **Step 1: Write failing tests for the perception adapter and staged pipeline**

Test:
- perception adapter interface supports live multimodal and deterministic fixture-backed implementations
- ingest validates format and image quality in addition to normalization
- perception returns screenshot analysis records
- direction returns three distinct creative theses
- composition creates candidate sequences with typography, crop, layout, and background intent

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test -- src/pipeline/perception/adapter.test.ts src/pipeline/perception/service.test.ts src/pipeline/direction/service.test.ts src/pipeline/composition/service.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the perception adapter contract and deterministic fixture corpus**

Requirements:
- define a perception adapter interface
- provide deterministic fixture-backed implementation for tests and local development
- define failure and timeout degradation behavior

- [ ] **Step 4: Implement ingest**

Responsibilities:
- normalize screenshot metadata
- validate format and image quality
- prepare project brief
- return deterministic inputs for downstream services

- [ ] **Step 5: Implement perception**

Responsibilities:
- consume the adapter contract rather than calling a model directly
- return screenshot-level focus, safe zones, and crop opportunities

- [ ] **Step 6: Implement direction**

Responsibilities:
- produce clarity-first, brand-signature-first, and campaign-first directions

- [ ] **Step 7: Implement composition**

Responsibilities:
- produce candidate sequences
- include layout, crop, typography, and background intent

- [ ] **Step 8: Leave `src/ai/visual-director.ts` as a compatibility wrapper if needed**

It may delegate to the new pipeline until all call sites are moved.

- [ ] **Step 9: Run tests**

Run: `pnpm test -- src/pipeline/perception/adapter.test.ts src/pipeline/perception/service.test.ts src/pipeline/direction/service.test.ts src/pipeline/composition/service.test.ts`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/pipeline src/ai/visual-director.ts
git commit -m "refactor: split Shotforge generation into staged pipeline services"
```

### Task 5: Add evaluator, repair, and curation services

**Files:**
- Create: `src/pipeline/evaluation/service.ts`
- Create: `src/pipeline/repair/service.ts`
- Create: `src/pipeline/curation/service.ts`
- Create: `src/pipeline/evaluation/service.test.ts`
- Create: `src/pipeline/repair/service.test.ts`
- Create: `src/pipeline/curation/service.test.ts`
- Create: `src/__tests__/integration/finalist-curation.test.ts`

- [ ] **Step 1: Write failing tests**

Test:
- evaluation scores candidates across premium criteria
- repair suggests bounded targeted actions
- curation returns Top 3 with distinction rules
- curation can expose extras only if they clear threshold

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test -- src/pipeline/evaluation/service.test.ts src/pipeline/repair/service.test.ts src/pipeline/curation/service.test.ts src/__tests__/integration/finalist-curation.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement evaluator service**

Requirements:
- support `AAA threshold`
- support `premium acceptable threshold`
- emit reasoned score dimensions, not one opaque number

- [ ] **Step 4: Implement repair service**

Requirements:
- avoid infinite loops
- prefer targeted fixes over full restart
- record retry budget use

- [ ] **Step 5: Implement curation service**

Requirements:
- choose Top 3
- enforce minimum distinction among Top 3
- support optional expanded finalists

- [ ] **Step 6: Run tests**

Run: `pnpm test -- src/pipeline/evaluation/service.test.ts src/pipeline/repair/service.test.ts src/pipeline/curation/service.test.ts src/__tests__/integration/finalist-curation.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/pipeline/evaluation src/pipeline/repair src/pipeline/curation src/__tests__/integration/finalist-curation.test.ts
git commit -m "feat: add Shotforge evaluation, repair, and finalist curation"
```

## Chunk 4: Server and API Integration

### Task 6: Move route logic into server services before renderer rewiring

**Files:**
- Create: `src/server/generation/run-generation.ts`
- Create: `src/server/preview/build-preview-request.ts`
- Create: `src/server/routes/preview-surface-routing.ts`
- Modify: `src/app/api/analyze/route.ts`
- Modify: `src/app/api/generate-copy/route.ts`
- Modify: `src/app/api/preview/route.ts`
- Modify: `src/app/api/export/route.ts`
- Test: `src/app/api/analyze/route.test.ts`
- Test: `src/app/api/generate-copy/route.test.ts`
- Test: `src/app/api/preview/route.test.ts`
- Test: `src/app/api/export/route.test.ts`

- [ ] **Step 1: Write failing tests**

Test:
- routes stay thin
- generation orchestration delegates to server services
- preview surface routing is explicit
- route contracts are preserved while ownership moves out of route handlers

- [ ] **Step 2: Run tests**

Run: `pnpm test -- src/app/api/analyze/route.test.ts src/app/api/generate-copy/route.test.ts src/app/api/preview/route.test.ts src/app/api/export/route.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement server services**

Rules:
- route files only parse request, call service, return response
- generation orchestration lives in `src/server/generation/run-generation.ts`
- preview request building lives in server/rendering adapters
- define unified Preview routing decision explicitly:
  - keep `choose/[sessionId]` and `refine/[sessionId]` as compatibility shells
  - redirect or hydrate the same underlying Preview surface state

- [ ] **Step 4: Run tests**

Run: `pnpm test -- src/app/api/analyze/route.test.ts src/app/api/generate-copy/route.test.ts src/app/api/preview/route.test.ts src/app/api/export/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server src/app/api
git commit -m "refactor: move Shotforge route logic into server services"
```

## Chunk 5: Renderer Upgrade

### Task 7: Introduce deterministic derived backgrounds

**Files:**
- Create: `src/rendering/backgrounds/derived-background.ts`
- Create: `src/rendering/backgrounds/derived-background.test.ts`
- Modify: `src/server/preview/build-preview-request.ts`
- Modify: `src/server/generation/run-generation.ts`
- Modify: `src/lib/style-colors.ts`

- [ ] **Step 1: Write failing tests**

Test:
- renderer background builder can create derived backgrounds from brand and screenshot analysis
- background output is deterministic
- no bitmap AI generation is used

- [ ] **Step 2: Run tests**

Run: `pnpm test -- src/rendering/backgrounds/derived-background.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement derived background builder**

Support:
- brand-derived gradients
- screenshot-derived tonal extraction
- depth overlays
- glow and texture intent

- [ ] **Step 4: Wire server preview/export adapters to derived background inputs**

Do not diverge preview and export background behavior.

- [ ] **Step 5: Run tests**

Run: `pnpm test -- src/rendering/backgrounds/derived-background.test.ts src/app/api/preview/route.test.ts src/app/api/export/route.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/rendering/backgrounds src/server/preview/build-preview-request.ts src/server/generation/run-generation.ts src/lib/style-colors.ts
git commit -m "feat: add deterministic derived backgrounds to Shotforge rendering"
```

### Task 8: Add curated typography library and focal placement rules

**Files:**
- Create: `src/rendering/typography/library.ts`
- Create: `src/rendering/typography/library.test.ts`
- Create: `src/rendering/placement/focal-placement.ts`
- Modify: `src/server/preview/build-preview-request.ts`
- Modify: `src/server/generation/run-generation.ts`

- [ ] **Step 1: Write failing tests**

Test:
- typography system selects only curated premium families
- role-specific headline rules are enforced
- focal placement respects screenshot analysis safe zones

- [ ] **Step 2: Run tests**

Run: `pnpm test -- src/rendering/typography/library.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement typography library**

Requirements:
- finite curated set
- per-direction pairing rules
- weight, tracking, and balancing metadata

- [ ] **Step 4: Implement focal placement helper**

Requirements:
- use screenshot analysis
- improve text placement and crop positioning

- [ ] **Step 5: Wire server preview/export adapters**

Ensure preview/export share the same typography and placement inputs through the server adapters, not directly in routes.

- [ ] **Step 6: Run tests**

Run: `pnpm test -- src/rendering/typography/library.test.ts src/app/api/preview/route.test.ts src/app/api/export/route.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/rendering/typography src/rendering/placement src/server/preview/build-preview-request.ts src/server/generation/run-generation.ts
git commit -m "feat: add premium typography and focal placement rules"
```

## Chunk 6: Preview Integration

### Task 9: Replace split Choose/Refine state flow with unified Preview orchestration

**Files:**
- Modify: `src/app/generate/[sessionId]/page.tsx`
- Modify: `src/app/choose/[sessionId]/page.tsx`
- Modify: `src/app/refine/[sessionId]/page.tsx`
- Modify: `src/components/preview/preview-surface.tsx`
- Modify: `src/components/refine/inspector.tsx`
- Modify: `src/hooks/use-generate.ts`
- Modify: `src/hooks/use-preview.ts`
- Modify: `src/hooks/use-preview-cache.ts`
- Modify: `src/hooks/use-export.ts`
- Create or move: `src/ui/preview/*`
- Create or move: `src/ui/editor/*`
- Test: `src/__tests__/integration/preview-flow.test.tsx`

- [ ] **Step 1: Write failing integration tests**

Test:
- generation lands in unified Preview state
- finalist ranking appears correctly
- edit mode does not break preview mode
- export uses the currently selected finalist

- [ ] **Step 2: Run tests**

Run: `pnpm test -- src/__tests__/integration/preview-flow.test.tsx`
Expected: FAIL

- [ ] **Step 3: Refactor generate page to store finalist set centrally**

Do not write final product state directly from page-local code.

- [ ] **Step 4: Refactor choose/refine pages into unified Preview behavior**

Rules:
- preserve current visual direction
- reduce product split, not increase it
- support finalist comparison and inline editing cleanly

- [ ] **Step 5: Move hooks to centralized state-aware behavior**

Rules:
- no duplicated preview cache authority
- no page-local persistence
- export reads from centralized selected finalist state

- [ ] **Step 6: Run tests**

Run: `pnpm test -- src/__tests__/integration/preview-flow.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/generate src/app/choose src/app/refine src/components/preview src/components/refine src/hooks src/ui
git commit -m "refactor: unify Shotforge Preview flow and finalist state"
```

## Chunk 7: Fidelity and Hardening

### Task 10: Rebuild the premium quality safety net

**Files:**
- Create: `src/__tests__/fidelity/preview-export-fidelity.test.ts`
- Create: `src/__tests__/fidelity/premium-visual-acceptance.test.ts`
- Modify: existing preview/export tests
- Modify: `src/app-state/guards.ts`
- Modify: `src/app-state/persist.ts`

- [ ] **Step 1: Write failing fidelity and guard tests**

Test:
- preview/export use the same composition inputs
- restore works after refresh
- invalid state redirects safely
- no visible candidate below premium-acceptable threshold
- visual acceptance gate runs against the fixed fixture corpus
- manual finalist review checkpoint is recorded in the implementation checklist

- [ ] **Step 2: Run tests**

Run: `pnpm test -- src/__tests__/fidelity/preview-export-fidelity.test.ts src/__tests__/fidelity/premium-visual-acceptance.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement missing guardrails**

Add:
- hydration guard enforcement
- restore validation
- selected finalist validity checks
- preview/export fidelity assertions
- visual fixture snapshot or equivalent visual acceptance assertions
- named manual review checklist for finalist quality on fixture corpus

Record the manual review in:

- `docs/canonical/HANDOFF_CONTEXT.md`
- `docs/canonical/REGRESSION_GUARDS.md` if a new guard/checklist line is needed

- [ ] **Step 4: Run targeted tests**

Run:
- `pnpm test -- src/__tests__/fidelity/preview-export-fidelity.test.ts`
- `pnpm test -- src/__tests__/fidelity/premium-visual-acceptance.test.ts`
- `pnpm test -- src/app/api/preview/route.test.ts src/app/api/export/route.test.ts`
- `pnpm test -- src/app-state/store.test.ts`

Expected: PASS

- [ ] **Step 5: Run full suite**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 6: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 7: Run build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/__tests__/fidelity src/app-state
git commit -m "test: harden Shotforge premium engine fidelity and guards"
```

## Execution Notes

- Do not redesign the Create surface.
- Do not degrade the current premium feel of the final Preview surface.
- Prefer compatibility wrappers during migration if that reduces instability.
- The old implementation may remain temporarily behind adapters, but no new product logic should be added to the old ad hoc paths.
- Use TDD for each new service and state boundary.
- Keep route handlers thin.
- Keep renderer decisions deterministic.
- Keep AI freedom inside bounded curated systems.

## Suggested Execution Order

1. Chunk 1
2. Chunk 2
3. Chunk 3
4. Chunk 4
5. Chunk 5
6. Chunk 6
7. Chunk 7

## Known Follow-Up Inputs

Before production tuning, collect:

- preferred primary and fallback model stack
- cost budget per generation
- latency budget
- premium visual references
- evaluator benchmark corpus

Plan complete and saved to `docs/superpowers/plans/2026-03-28-shotforge-premium-engine-implementation.md`. Ready to execute?
