# Shotforge Premium Engine Design

Date: 2026-03-28
Status: Draft for review
Scope: Product architecture, premium generation engine, repository organization, implementation milestones

## 1. Product Intent

Shotforge is not a screenshot decoration tool. It is an AI-directed App Store creative system that transforms raw product screenshots into premium, conversion-oriented marketing sequences.

The user promise is:

- upload screenshots
- describe the app briefly
- receive a small set of strong finalists
- optionally refine
- export with confidence

The product must feel simple and clean on the outside while hiding substantial creative and technical complexity internally.

## 2. Frozen UX Constraints

These are fixed unless a future explicit product decision changes them.

### 2.1 Create Surface Freeze

The Create experience in [src/app/page.tsx](/Users/peetorres/AppForge/apps/shotforge/src/app/page.tsx) is retained as the canonical entry experience.

Constraints:

- centered landing-style composition stays
- ghost progressive disclosure stays
- overall visual language stays
- no extra setup complexity is added to the user flow

### 2.2 Preview Surface Freeze

The current final surface direction across [src/app/choose/[sessionId]/page.tsx](/Users/peetorres/AppForge/apps/shotforge/src/app/choose/[sessionId]/page.tsx), [src/app/refine/[sessionId]/page.tsx](/Users/peetorres/AppForge/apps/shotforge/src/app/refine/[sessionId]/page.tsx), and [src/components/preview/preview-surface.tsx](/Users/peetorres/AppForge/apps/shotforge/src/components/preview/preview-surface.tsx) becomes the basis of the product's unified Preview surface.

Constraints:

- the product should feel like 3 steps
- Create remains step 1
- Generate remains internal/orchestration-heavy
- Preview becomes the primary decision and editing surface
- the UI stays simple, clean, premium, and output-first

## 3. Product Direction

### 3.1 Chosen Product Mode

Shotforge will use a hybrid creative direction system:

- AI has real authority over narrative, composition, crop, focus, typography selection, and background treatment
- deterministic rendering guarantees consistency, editability, and export fidelity
- the system is judged by the quality of the final creative output, not by the existence of AI features

### 3.2 Quality Goal

The target is "premium with signature":

- consistently top-tier output
- clear visual distinction among the strongest finalists
- strong brand and narrative personality
- no generic template feel

### 3.3 Failure Standard

If the system merely produces prettified screenshots with average layouts, it fails as a product.

The product succeeds only if the user regularly receives finalist options that plausibly resemble work produced by a strong App Store marketing designer at a top product company.

## 4. Final UX Model

### 4.1 User-Facing Flow

The intended user-facing flow is:

1. Create
2. Generate
3. Preview

Within Preview, the user can:

- compare finalists
- inspect a ranked top set
- enter edit mode
- refine selected details
- export

This preserves the perception of a 3-step product while allowing substantial internal sophistication.

### 4.2 Finalist Presentation Model

Default delivery:

- show Top 3 finalists
- enforce minimum distinction between them

Expanded delivery:

- internally generate and rank a larger candidate pool
- show additional finalists only when the system detects genuine competitive value
- never surface visibly weak outputs to complete a number

### 4.3 Guard Against Empty Quality

The system must not simply generate 3 outputs and hope.

Instead:

- generate multiple candidates internally
- score them
- repair weak areas
- retry with bounded attempts
- surface only finalists that pass a premium acceptance threshold

## 5. Engine Philosophy

The premium engine is built on this split:

- AI decides
- renderer executes
- evaluator judges
- repair orchestrator improves

This removes dependence on single-pass prompting and turns quality into a system property.

## 6. Premium Engine Architecture

### 6.1 Module Overview

The engine is composed of 8 modules.

#### 1. Session Ingest

Inputs:

- brand
- description
- screenshots
- optional future metadata

Outputs:

- `ProjectBrief`
- normalized screenshot assets
- technical quality checks

Responsibilities:

- normalize input
- validate format and image quality
- derive base metadata for downstream modules

#### 2. Visual Perception

Outputs:

- `ScreenshotAnalysis[]`

Responsibilities:

- identify focal elements
- detect UI density and composition
- determine safe and unsafe text regions
- identify proof moments, emotional moments, and detail opportunities
- identify crop opportunities
- derive screenshot-level color and hierarchy signals

This is a required multimodal layer. The engine must understand screenshots visually, not infer only from file order or filename.

#### 3. Product Narrative Director

Outputs:

- `NarrativeDirection[]`

Responsibilities:

- infer product tension and promise
- map screenshots to persuasive sequence roles
- produce distinct creative theses

Required theses:

- clarity-first
- brand-signature-first
- campaign-first

These are not color themes. They are storytelling and visual-direction hypotheses.

#### 4. Composition Director

Outputs:

- `SequenceCandidate[]`

Responsibilities:

- assign slide roles
- choose screenshot-to-role pairing
- choose layout grammar
- choose crop strategy and focus
- choose typography system
- choose background treatment
- choose device placement and visual weight
- choose overlay behavior

The composition director defines how each sequence should feel.

#### 5. Deterministic Premium Renderer

Outputs:

- preview-ready renders
- export-ready renders

Responsibilities:

- execute the composition decisions faithfully
- maintain WYSIWYG between preview and export
- support premium visual grammar

The renderer must evolve to support:

- curated typography library
- editorial layout families
- deterministic derived backgrounds
- overlay and depth systems
- safe-zone-aware text placement
- stronger crop and focal placement logic
- stronger hierarchy and balancing rules

#### 6. Multimodal Evaluator

Outputs:

- `ScoredSequence[]`

Responsibilities:

- score rendered or semi-rendered sequences against premium criteria
- reject weak candidates
- identify the reason for weakness

Scoring dimensions include:

- premium feel
- hierarchy clarity
- screenshot fit
- distinctiveness
- narrative coherence
- text readability
- brand fit
- conversion strength

#### 7. Repair Orchestrator

Outputs:

- repaired candidates or targeted regeneration instructions

Responsibilities:

- avoid expensive full restarts when local repair is enough
- regenerate weak slides selectively
- change crop, screenshot assignment, layout, typography, or background treatment where needed

Repair exists to turn "mostly strong" into "finalist quality" without full restart.

#### 8. Finalist Curator

Outputs:

- `FinalistSet`

Responsibilities:

- choose Top 3 finalists
- enforce minimum difference among the Top 3
- allow expanded finalists only when extra candidates are truly competitive
- hide weak outputs from the user

## 7. Background and Typography Strategy

### 7.1 Background Strategy

Background generation is deterministic and derived, not AI bitmap generation.

The AI decides:

- mood
- depth level
- energy level
- use of glow, texture, blur, extraction, and layering

The renderer builds the background from:

- gradients
- brand color derivations
- screenshot-derived tones
- blurred geometric light
- masked shapes
- depth overlays
- deterministic texture systems

This preserves:

- fidelity
- consistency
- editability
- export predictability

### 7.2 Typography Strategy

Typography must use a curated premium system, not arbitrary free-form font generation.

The AI may select within a curated set, but not invent outside it.

The typography system should support:

- primary headline families
- secondary editorial families
- role-specific weight and tracking rules
- contrast-aware text color behavior
- line-break and balance constraints

Typography is a major premium lever and must be treated as a system, not a decoration.

## 8. Quality and Retry Policy

### 8.1 Internal Candidate Strategy

The engine should generate a larger candidate set internally and not expose that raw set to the user.

The visible experience should remain:

- simple
- curated
- premium

### 8.2 Retry Policy

The product must not enter an infinite generation loop.

Policy:

- bounded retry count per direction
- targeted repair preferred over full regeneration
- fallback to more conservative composition if needed
- expand surfaced finalists only when the additional candidates meet a premium-acceptable threshold

### 8.3 Acceptance Thresholds

The engine should operate with at least two thresholds:

- `AAA threshold`
- `premium acceptable threshold`

Only candidates above the premium acceptable threshold may ever be shown to the user.

## 9. Repository Organization Target

The current codebase should be reorganized around explicit boundaries.

### 9.1 Proposed Structure

```text
src/
  core/
  pipeline/
    ingest/
    perception/
    direction/
    composition/
    evaluation/
    repair/
    curation/
  rendering/
    tokens/
    typography/
    backgrounds/
    layouts/
    overlays/
    placement/
    renderer/
  app-state/
  ui/
    create/
    preview/
    editor/
    shared/
  server/
```

### 9.2 Mapping from Current Code

- `src/domain/*` moves toward `src/core/*`
- `src/ai/visual-director.ts` is split across `perception`, `direction`, and `composition`
- `src/lib/store.ts` becomes `src/app-state/store.ts`
- route logic should delegate to `src/server/*` and `src/pipeline/*`
- `src/components/choose/*` and `src/components/refine/*` converge toward `src/ui/preview/*` and `src/ui/editor/*`
- `src/hooks/*` are retained only where they serve the final UI state model

## 10. State Model Direction

The current pattern of direct page-level `localStorage` manipulation should be replaced by a single state system.

Requirements:

- one store as source of truth
- centralized persistence
- centralized hydration
- route guards based on state
- preview state managed by product logic, not page-local ad hoc code

The state model must support:

- session lifecycle
- generation lifecycle
- finalist ranking
- selected finalist
- edit mode
- preview/export synchronization

## 11. What Must Not Stay As-Is

The following are not acceptable as final architecture:

- docs and product contract diverging from code
- page-level `localStorage` as practical source of truth
- generation without mandatory evaluation
- fallback visuals that feel materially weaker than premium outputs
- partial refine implementation with placeholder or stub behavior
- experimental AI paths without formal place in the pipeline

## 12. Implementation Milestones

### Milestone A: Product and Contract Alignment

- formalize Preview unified flow
- update canonical docs
- define finalist behavior
- define new engine schemas

### Milestone B: Structural Reorganization

- create target folders
- move core and app-state responsibilities
- thin route handlers
- isolate rendering from AI orchestration

### Milestone C: Premium Engine v1

- implement ingest
- implement perception
- implement direction
- implement composition
- wire deterministic rendering

### Milestone D: Evaluation and Repair

- implement scoring
- implement reject/retry policy
- implement targeted repair
- implement finalist curation logic

### Milestone E: Preview Integration

- unify choose/refine behavior under Preview
- move UI onto centralized state
- preserve current premium UI direction
- expose finalist ranking and editing cleanly

### Milestone F: Quality Hardening

- fidelity testing
- route and restore guards
- premium threshold verification
- visual regression and final output review

## 13. Open Inputs Needed Later

Implementation will later benefit from:

- preferred model stack and fallback stack
- latency budget
- cost budget per generation
- top-tier visual references for calibration
- evaluator benchmark examples

These are not needed to approve the architecture, but they are needed to tune the production-grade engine.

## 14. Recommendation

Proceed with a full internal re-architecture while preserving the current Create and Preview visual product surfaces.

The next step after approving this document is to write a phased implementation plan that:

- updates the canonical docs first
- establishes the new schemas and folder structure
- builds the premium engine incrementally
- integrates it back into the frozen UX shell
