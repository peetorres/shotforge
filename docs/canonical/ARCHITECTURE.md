# ARCHITECTURE — Shotforge V2

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐ │
│  │  Create   │→│ Generate  │→│ Choose  │→│  Refine    │ │
│  │  Page     │  │  Page     │  │  Page   │  │  Page     │ │
│  └────┬─────┘  └────┬─────┘  └───┬────┘  └────┬──────┘ │
│       │              │            │             │        │
│       └──────────────┴────────────┴─────────────┘        │
│                         │                                │
│                    ┌────▼────┐                            │
│                    │ Zustand  │ ← persist → localStorage  │
│                    │  Store   │                            │
│                    └────┬────┘                            │
│                         │                                │
├─────────────────────────┼────────────────────────────────┤
│                    Server (API)                           │
│                         │                                │
│  ┌──────────┐  ┌───────▼────┐  ┌──────────┐  ┌────────┐│
│  │ /upload   │  │/gen-copy   │  │ /preview  │  │/export ││
│  │ (files)   │  │(AI/fallbk) │  │ (render)  │  │ (ZIP)  ││
│  └──────────┘  └────────────┘  └─────┬────┘  └───┬────┘│
│                                       │           │      │
│                              ┌────────▼───────────▼────┐ │
│                              │  @appforge/screenshot-gen│ │
│                              │  (Satori + Sharp)        │ │
│                              └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 2. Source of Truth Classification

| Data | Owner | Storage | Lifetime |
|------|-------|---------|----------|
| Project metadata (brand, desc, color) | Client store | localStorage | Session |
| Uploaded screenshot files | Server (/tmp) | Filesystem | Session (ephemeral) |
| Variant definitions (3 sets) | Client store | localStorage | Session |
| Slide configurations | Client store | localStorage | Session |
| Generated AI copy | Client store (from API) | localStorage | Session |
| Preview images | Client (base64 from API) | Memory only | Ephemeral (re-rendered) |
| Export ZIP | Server (generated on demand) | Ephemeral | Download only |

### Client State (Zustand)
- Project metadata
- All 3 variants with slides
- UI state (activeSlideIndex, selectedVariantId, step)
- Persisted to localStorage via Zustand `persist` middleware

### Server State
- Uploaded files in `/tmp/{sessionId}/`
- No database. No user accounts. Stateless API.

### Derived State (never stored)
- Preview images (re-rendered from store data)
- Export artifacts (generated on demand)
- Validation results (computed from current values)

## 3. Store Shape

```typescript
interface ShotforgeStore {
  // ─── Project ────────────────────────
  project: ProjectState | null

  // ─── UI State ───────────────────────
  activeSlideIndex: number
  isExporting: boolean
  isGenerating: boolean
  generationProgress: number  // 0-5 for the 5 generation steps
  previewMode: boolean        // true = inspector hidden

  // ─── Actions ────────────────────────
  setProject: (project: ProjectState) => void
  updateProject: (patch: Partial<ProjectData>) => void
  setStep: (step: FlowStep) => void

  // ─── Variant Actions ────────────────
  selectVariant: (id: VariantId) => void
  updateVariantStyle: (variantId: VariantId, patch: VariantStylePatch) => void

  // ─── Slide Actions ──────────────────
  setActiveSlide: (index: number) => void
  updateSlide: (variantId: VariantId, slideIndex: number, patch: SlidePatch) => void

  // ─── Generation ─────────────────────
  setGenerationProgress: (step: number) => void
  setVariantSlides: (variantId: VariantId, slides: SlideConfig[]) => void

  // ─── Export/Preview ─────────────────
  setIsExporting: (v: boolean) => void
  togglePreviewMode: () => void

  // ─── Reset ──────────────────────────
  reset: () => void
}
```

### Store Invariant Enforcement

The store MUST enforce:
- `selectVariant` rejects ids not in `["midnight", "clean", "vivid"]`
- `updateSlide` only mutates `variants[variantId].slides[slideIndex]`, never other variants
- `setStep` follows state machine transitions (no arbitrary jumps)
- All mutations update `project.updatedAt`

### Persistence Config

```typescript
persist(storeCreator, {
  name: "shotforge-v2",
  version: 1,                          // schema version for migration
  partialize: (state) => ({
    project: state.project,
    activeSlideIndex: state.activeSlideIndex,
  }),
  migrate: (persisted, version) => {    // handle schema evolution
    if (version === 0) return persisted  // future migrations here
    return persisted
  },
})
```

## 4. Render Pipeline

```
Store Data → View Model → Preview Request → screenshot-gen → PNG Buffer → base64

Same pipeline for preview and export:
  Preview: composeSlide() → sharp.resize(half) → base64 response
  Export:  generateScreenshots() → full-res PNGs → archiver → ZIP
```

### Fidelity Guarantee (INV-004, INV-007)

Both preview and export call `@appforge/screenshot-gen`. The ONLY difference:
- Preview: half-resolution for speed, single slide
- Export: full-resolution, all slides, all sizes

Same `ResolvedConfig`, same `composeSlide()` function, same font loading, same glow effects.

## 5. API Boundary

| Endpoint | Method | Purpose | Stateful? |
|----------|--------|---------|-----------|
| `/api/upload` | POST | Validate + save screenshots to /tmp | Yes (writes files) |
| `/api/generate-copy` | POST | Generate AI copy for one slide | No |
| `/api/preview` | POST | Render one slide as base64 PNG | Yes (reads files) |
| `/api/export` | POST | Render all slides, return ZIP | Yes (reads files) |

All APIs are session-scoped via `sessionId` parameter. No auth required.

## 6. Component Architecture

```
app/
  layout.tsx                    ← root: fonts, metadata, global CSS
  page.tsx                      ← Step 1: Create
  generate/[sessionId]/page.tsx ← Step 2: Generate
  choose/[sessionId]/page.tsx   ← Step 3: Choose
  refine/[sessionId]/page.tsx   ← Step 4: Refine

components/
  shared/                       ← reused across steps
    NavBar                      ← step indicator, export button
    DropZone                    ← file upload
    ColorPicker                 ← brand color selection
  create/                       ← Step 1 components
    CreateForm                  ← all inputs in one form
    ScreenshotGrid              ← 6-slot thumbnail grid
  generate/                     ← Step 2 components
    ProgressScreen              ← animated loading
  choose/                       ← Step 3 components
    VariantGallery              ← 3 variant strips
    VariantStrip                ← 1 variant's slide cards
    ExportBar                   ← sticky bottom bar
  refine/                       ← Step 4 components
    SlideCardsRow               ← all slides side-by-side
    Inspector                   ← right panel container
    LayoutSection               ← slide type selector
    BackgroundSection           ← background preset grid
    TitleSection                ← headline editor + AI button
    DeviceSection               ← rotation, scale, offset
```

## 7. Data Flow Per Step

### Create → Generate
1. User fills form → store updated via `setProject()`
2. User clicks Generate → POST /api/upload with files
3. On success → `setStep("generate")`, navigate to /generate/[sessionId]

### Generate → Choose
1. For each variant (midnight, clean, vivid):
   - For each slide: POST /api/generate-copy → receive AI text
   - Build SlideConfig[] with copy + uploaded file references
   - `setVariantSlides(variantId, slides)`
2. On all complete → `setStep("choose")`, navigate to /choose/[sessionId]

### Choose → Refine
1. User clicks "Refine" on a variant → `selectVariant(id)`, `setStep("refine")`
2. Navigate to /refine/[sessionId]

### Refine → Export
1. User edits in inspector → `updateSlide()` or `updateVariantStyle()`
2. Each change triggers debounced preview re-render
3. User clicks "Export" → POST /api/export with full variant data → ZIP download

## 8. Error Handling Strategy

| Error | UX Response | Recovery |
|-------|------------|----------|
| Upload validation failed | Inline error on Create form | User corrects and retries |
| AI copy generation failed | Use template fallback silently | User can trigger "AI Generate" later in Refine |
| Preview render failed | Show placeholder with error state | Auto-retry on next change |
| Export failed | Toast error with retry button | User clicks retry |
| Session restore failed | Redirect to Create, clear storage | Start fresh |
| Invalid deep link (no session) | Redirect to Create | Start fresh |
