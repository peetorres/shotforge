# SHOTFORGE CANON — Product Truth System

> This is the maximum source of truth for Shotforge as a product.
> Every rule has an ID. Tests reference these IDs. If a rule changes, this file updates FIRST.

## Version
v1.0.0 | 2026-03-27

---

## 1. Product Vision

Shotforge turns raw app screenshots into App Store-ready marketing assets in under 60 seconds. Upload screenshots, describe your app, pick a color — AI generates 3 complete variations. Choose, refine, export.

## 2. User Flow

```
CREATE  →  GENERATE  →  CHOOSE  →  REFINE  →  EXPORT
  |            |            |          |          |
  form       AI + render   gallery    editor     ZIP
  input      3 variants    select     tweak      download
```

---

## 3. Entity Model

### 3.1 Project
The root entity. One project per session.

| Field | Type | Source | Persisted | Editable |
|-------|------|--------|-----------|----------|
| sessionId | string (nanoid) | system-generated | yes | no |
| brand | string | user input | yes | yes (create step) |
| description | string | user input | yes | yes (create step) |
| brandColor | hex string | user input | yes | yes (create + refine) |
| uploadedFiles | string[] | upload API | yes | no (immutable after upload) |
| variants | Record<VariantId, Variant> | generation | yes | yes (refine step) |
| selectedVariantId | VariantId \| null | user choice | yes | yes |
| step | FlowStep | system | yes | system-managed |
| createdAt | ISO string | system | yes | no |
| updatedAt | ISO string | system | yes | auto |

### 3.2 Variant
One of 3 generated screenshot sets.

| Field | Type | Source | Persisted | Editable |
|-------|------|--------|-----------|----------|
| id | VariantId | system | yes | no |
| name | string | system | yes | no |
| style | AppStyle | system | yes | yes (refine) |
| backgroundColor | string | system/user | yes | yes (refine) |
| textColor | string | derived | yes | no (derived from style) |
| slides | SlideConfig[] | generation + user edits | yes | yes (refine) |

### 3.3 Slide
One screenshot composition within a variant.

| Field | Type | Source | Editable |
|-------|------|--------|----------|
| type | "hero" \| "feature-single" \| "feature-dual" | generation/user | yes |
| headline | string[] | AI/user | yes |
| screenshot | string | upload reference | yes (swap) |
| angle | number | system default/user | yes |
| appName | string (hero only) | from project.brand | derived |
| tagline | string[] (hero only) | AI/user | yes |
| bullets | string[] (hero only) | AI/user | yes |
| badgeText | string (hero only) | AI/user | yes |
| showStars | boolean (hero only) | system/user | yes |
| contentOrigin | ContentOrigin | system | auto |

### 3.4 ContentOrigin
Every editable field tracks how its current value was produced.

```typescript
type ContentOrigin =
  | "generated_by_ai"      // AI produced this value
  | "edited_by_user"       // User manually changed it
  | "template_fallback"    // AI was unavailable, template used
  | "inherited_from_global"// Derived from project-level field (e.g., brand → appName)
  | "regenerated"          // AI regenerated (overwrote previous)
  | "restored_from_session"// Recovered from persisted session
```

---

## 4. Variant Definitions

| VariantId | Name | Style | Background | Text Color |
|-----------|------|-------|------------|------------|
| midnight | Midnight | dark | `linear-gradient(160deg, #0D0D18, #1a1033)` | #FFFFFF |
| clean | Clean | light | `linear-gradient(160deg, #F5F5F7, #E8E8ED)` | #1D1D1F |
| vivid | Vivid | bold | `linear-gradient(160deg, {brandColor}33, {brandColor}66, #0D0D18)` | #FFFFFF |

---

## 5. Business Rules

### 5.1 Create Step

| Rule | Description |
|------|-------------|
| **RULE-C01** | App name: required, 1-60 chars after trim |
| **RULE-C02** | Description: required, 10-500 chars |
| **RULE-C03** | Screenshots: 1-6 files, PNG or JPEG, >=390x844px, <=10MB each |
| **RULE-C04** | Brand color: valid 7-char hex (#RRGGBB) |
| **RULE-C05** | "Generate" button enabled ONLY when C01 + C03 are satisfied (C02 and C04 have defaults) |
| **RULE-C06** | Total upload size <= 40MB |

### 5.2 Generate Step

| Rule | Description |
|------|-------------|
| **RULE-G01** | System generates exactly 3 variants: midnight, clean, vivid |
| **RULE-G02** | Each variant has exactly N slides (N = uploadedFiles.length) |
| **RULE-G03** | First slide is always type "hero"; remaining are "feature-single" |
| **RULE-G04** | AI generates unique copy per variant per slide (tone matches style) |
| **RULE-G05** | Progress shows 5 sequential steps |
| **RULE-G06** | If AI unavailable, use template fallback copy — NEVER block the user |
| **RULE-G07** | All generated content has contentOrigin = "generated_by_ai" or "template_fallback" |

### 5.3 Choose Step

| Rule | Description |
|------|-------------|
| **RULE-CH01** | All 3 variants displayed as horizontal scroll strips |
| **RULE-CH02** | Each strip shows all N slides as card thumbnails |
| **RULE-CH03** | "Select" sets selectedVariantId, shows export bar |
| **RULE-CH04** | "Refine" navigates to refine step for that variant |
| **RULE-CH05** | Only one variant can be selected at a time |
| **RULE-CH06** | Clicking a slide card opens refine at that specific slide |

### 5.4 Refine Step

| Rule | Description |
|------|-------------|
| **RULE-R01** | All N slides visible side-by-side, responsive to screen width |
| **RULE-R02** | Fixed right inspector panel (272px) with accordion sections |
| **RULE-R03** | Clicking a slide selects it; inspector updates to show that slide |
| **RULE-R04** | "Preview" hides inspector, slides fill full width |
| **RULE-R05** | "Export ZIP" always accessible in top bar |
| **RULE-R06** | Inspector sections: Layout, Background, Title (with AI regen), Device |
| **RULE-R07** | Editing a field sets contentOrigin to "edited_by_user" |
| **RULE-R08** | Background changes apply to ALL slides in the variant |
| **RULE-R09** | Title/headline changes apply ONLY to the selected slide |
| **RULE-R10** | Brand color changes apply to ALL slides in ALL variants (project-level) |

### 5.5 Regenerate Semantics

| Rule | Description |
|------|-------------|
| **RULE-RG01** | "AI Generate" in Title section regenerates copy for SELECTED SLIDE ONLY |
| **RULE-RG02** | If the slide has contentOrigin = "edited_by_user", show confirmation before overwriting |
| **RULE-RG03** | After regeneration, contentOrigin resets to "regenerated" |
| **RULE-RG04** | Regenerate NEVER changes layout, screenshot assignment, or device settings |

### 5.6 Export Rules

| Rule | Description |
|------|-------------|
| **RULE-E01** | Export generates both 6.7" (1290x2796) and 6.1" (1179x2556) for every slide |
| **RULE-E02** | Output: ZIP named `shotforge-{brand-slug}.zip` |
| **RULE-E03** | File naming: `{brand}_{NN}_{type}_{size}.png` |
| **RULE-E04** | Export uses same render engine as preview (screenshot-gen) |
| **RULE-E05** | Export must reflect current refine state exactly (WYSIWYG) |

### 5.7 Validation Rules

| Rule | Description |
|------|-------------|
| **RULE-V01** | Image MIME: `image/png` or `image/jpeg` only |
| **RULE-V02** | Image dimensions: width >= 390, height >= 844 |
| **RULE-V03** | Image file size: <= 10MB |
| **RULE-V04** | Session total upload: <= 40MB |
| **RULE-V05** | Brand color: matches `/^#[0-9A-Fa-f]{6}$/` |
| **RULE-V06** | App name: trimmed length 1-60 |
| **RULE-V07** | Description: trimmed length 10-500 |

---

## 6. Truth Tables

### 6.1 Field Scope

| Field | Scope | Edit in Refine | Affects |
|-------|-------|----------------|---------|
| brandColor | project | yes | all variants, all slides |
| backgroundColor | variant | yes | all slides in that variant |
| textColor | variant (derived) | no | derived from style |
| headline | slide | yes | only that slide |
| screenshot | slide | yes (swap) | only that slide |
| angle | slide | yes | only that slide |
| layout (type) | slide | yes | only that slide |

### 6.2 Content Origin Transitions

| Action | From | To |
|--------|------|----|
| AI generates during Generate step | — | generated_by_ai |
| AI unavailable, template used | — | template_fallback |
| User edits field in Refine | any | edited_by_user |
| User clicks "AI Generate" on clean field | generated_by_ai | regenerated |
| User clicks "AI Generate" on dirty field + confirms | edited_by_user | regenerated |
| Session restored | any | restored_from_session |
| Brand color changed (project-level) | any | inherited_from_global |

---

## 7. Invariants

| ID | Invariant | Severity |
|----|-----------|----------|
| **INV-001** | After generation, `Object.keys(variants).length === 3` | Critical |
| **INV-002** | `variants[id].slides.length === uploadedFiles.length` for all variants | Critical |
| **INV-003** | Editing variant A NEVER mutates variant B or C | Critical |
| **INV-004** | Preview and export use identical render pipeline | Critical |
| **INV-005** | User-edited content is never silently overwritten | Critical |
| **INV-006** | Session restore recovers full state or fails cleanly (no partial) | High |
| **INV-007** | Export output exactly matches preview (WYSIWYG) | High |
| **INV-008** | `variants[id].slides[0].type === "hero"` always (first slide is hero) | Medium |
| **INV-009** | `brandColor` always matches `#[0-9A-Fa-f]{6}` pattern | Medium |
| **INV-010** | `step` transitions follow state machine (no arbitrary jumps) | High |

---

## 8. Acceptance Criterion

The product is DONE when a user can:

1. Open Shotforge
2. Enter app name + description
3. Upload 6 screenshots
4. Pick a brand color
5. Click "Generate 3 Variations"
6. See 3 complete variations, each with 6 slides
7. Select one OR click "Refine"
8. In Refine: see all 6 slides, edit headlines, change background, adjust device
9. Click "Preview" for clean App Store view
10. Click "Export ZIP" and receive a ZIP with 12 PNGs (6 slides x 2 sizes)

If any step fails, the product is not done.
