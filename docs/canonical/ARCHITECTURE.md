# ARCHITECTURE — Shotforge V2

## 1. System Overview

```text
User-visible flow:
  Create → Generate → Preview

Internal flow:
  Upload → Ingest → Perception → Direction → Composition
         → Evaluation → Repair → Curation → Preview → Export
```

Shotforge keeps the UX shell simple while moving complexity into a staged engine.

## 2. Architectural Principles

### 2.1 UX shell is stable

- `src/app/page.tsx` remains the canonical Create surface
- the final preview/edit experience remains one unified output-first surface
- the product should continue to feel like 3 steps

### 2.2 AI decides, renderer executes

- AI handles perception, narrative direction, composition decisions, and scoring inputs
- deterministic rendering executes visuals
- preview and export must remain WYSIWYG

### 2.3 Curation is mandatory

The product must not expose raw attempts. It exposes curated finalists only.

## 3. Source of Truth Model

### 3.1 Client authority

The client store owns:

- project metadata
- generation lifecycle state
- finalist set
- selected finalist
- edit mode
- preview state
- export intent

This state is persisted through one store and one persistence layer only.

### 3.2 Server authority

The server owns only ephemeral assets:

- uploaded screenshots in temp storage
- optional cached perception artifacts
- preview/export render execution

No durable database-backed session model is introduced in this phase.

### 3.3 Derived state

Never persist:

- preview image buffers
- export blobs
- evaluator transient internals unless explicitly needed for debugging

## 4. Core Engine Modules

### 4.1 Ingest

Responsibilities:

- normalize request inputs
- validate image quality and metadata
- build `ProjectBrief`

### 4.2 Perception

Responsibilities:

- visually analyze screenshots
- detect focal areas
- detect safe text zones
- identify density, proof, emotion, and crop opportunities

### 4.3 Direction

Responsibilities:

- produce creative theses
- map story roles across the screenshot set
- generate distinct direction hypotheses

Required theses:

- clarity-first
- brand-signature-first
- campaign-first

### 4.4 Composition

Responsibilities:

- assign layouts
- choose crop and focus behavior
- choose typography system
- choose background treatment
- choose device placement and overlay grammar

### 4.5 Evaluation

Responsibilities:

- score candidate sequences using explicit weighted dimensions
- reject weak candidates
- explain score failures

### 4.6 Repair

Responsibilities:

- target local fixes before full regeneration
- enforce bounded retries
- escalate to safer compositions if needed

### 4.7 Curation

Responsibilities:

- rank candidates
- enforce Top 3 distinction
- build the surfaced `FinalistSet`

## 5. Repository Structure Target

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

## 6. Rendering System

### 6.1 Deterministic premium renderer

The renderer must support:

- curated typography systems
- deterministic derived backgrounds
- focal-aware placement
- editorial layout families
- depth and overlay grammar

### 6.2 Background policy

Backgrounds are:

- deterministic
- derived from brand and screenshot context
- never AI-generated bitmaps

### 6.3 Typography policy

Typography is:

- selected from a curated premium library
- role-aware
- contrast-aware
- part of the composition system, not ad hoc styling

## 7. Finalist System

### 7.1 Candidate generation

The engine generates multiple internal candidates.

### 7.2 Scoring

Use weighted evaluator dimensions:

- premiumFeel
- hierarchyClarity
- screenshotFit
- distinctiveness
- narrativeCoherence
- textReadability
- brandFit
- conversionStrength

### 7.3 Thresholds

Code-level constants:

- `AAA_THRESHOLD = 0.85`
- `PREMIUM_ACCEPTABLE_THRESHOLD = 0.72`
- `MIN_TOP3_DISTANCE = 0.18`

### 7.4 Top 3 distinction

Distinction is measured across:

- creative thesis
- layout family profile
- typography family
- background treatment family
- crop/focal strategy profile

## 8. Route Ownership

Routes are thin adapters only.

### 8.1 API routes

- parse request
- call server service
- return response

### 8.2 Server services

Server services own:

- generation orchestration
- preview request building
- export request building
- file-backed render coordination

## 9. Preview Surface Model

### 9.1 Unified surface

`choose` and `refine` become compatibility shells or route-level entry points into the same underlying Preview state model.

The user should experience:

- ranked finalists
- one selected finalist
- an edit mode within the same surface

### 9.2 State transitions

Preview controls:

- finalist comparison
- finalist selection
- preview mode
- edit mode
- export

without making the product feel split into separate subsystems.

## 10. Error Handling

| Error | UX Response | Recovery |
|------|-------------|----------|
| Upload validation failed | Inline error on Create | User retries |
| AI unavailable | Premium fallback path | User still completes flow |
| Weak candidates | Silent repair/regeneration | User sees curated finalists only |
| Missing temp assets | Show session-expired recovery | Re-upload path |
| Preview render failure | Surface retryable error state | Auto-retry or manual retry |
| Export failure | Explicit error | Retry export |
| Restore failure | Clear invalid state and return to Create | Start fresh |

## 11. Non-Negotiable Constraints

- Create surface is not to be redesigned in this phase
- Preview surface remains output-first
- the system must remain understandable to simple users
- internal complexity must not leak into the UI
- output quality is the primary success metric
