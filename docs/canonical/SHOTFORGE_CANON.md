# SHOTFORGE CANON — Product Truth System

> Maximum source of truth for Shotforge as a product.
> If the product changes, this file changes first.

## Version
v2.0.0-draft | 2026-03-28

---

## 1. Product Vision

Shotforge turns raw product screenshots into App Store-ready creative directions with premium quality, strong narrative intent, and low user effort.

The promise is:

- upload screenshots
- describe the app briefly
- receive a small curated set of strong finalists
- optionally refine
- export with confidence

Shotforge is not a screenshot decoration tool. It is an AI-directed App Store creative system.

## 2. User Flow

Visible user flow:

```text
CREATE → GENERATE → PREVIEW
```

Export is an action inside Preview, not a separate user-facing step.

Internal system flow:

```text
INGEST → PERCEPTION → DIRECTION → COMPOSITION → EVALUATION → REPAIR → CURATION → PREVIEW → EXPORT
```

## 3. Product Model

### 3.1 Project

One project per session.

| Field | Type | Source | Persisted | Editable |
|-------|------|--------|-----------|----------|
| sessionId | string | system | yes | no |
| brand | string | user input | yes | yes |
| description | string | user input | yes | yes |
| brandColor | hex string | user input | yes | yes |
| uploadedFiles | string[] | upload API | yes | no |
| finalists | FinalistSet | generation pipeline | yes | partly |
| selectedFinalistId | string \| null | user choice | yes | yes |
| step | FlowStep | system | yes | system-managed |
| createdAt | ISO string | system | yes | no |
| updatedAt | ISO string | system | yes | auto |

### 3.2 FinalistSet

Visible output package shown to the user.

| Field | Type | Description |
|-------|------|-------------|
| top3 | Finalist[] | default visible finalists |
| additional | Finalist[] | optional extra finalists if competitive |
| scoringVersion | string | evaluator schema version |
| generatedAt | ISO string | generation timestamp |

### 3.3 Finalist

One curated creative direction.

| Field | Type | Description |
|-------|------|-------------|
| id | string | stable finalist id |
| rank | number | ranked order |
| thesis | "clarity-first" \| "brand-signature-first" \| "campaign-first" \| string | creative thesis |
| style | AppStyle | base visual mode |
| backgroundTreatment | string | renderer background family |
| typographySystem | string | curated typography family |
| score | FinalistScore | evaluator result |
| slides | SlideConfig[] | rendered sequence definition |

### 3.4 Slide Roles

The engine may use a richer narrative role system than the minimal UI taxonomy.

Canonical roles:

- `hero`
- `statement`
- `feature`
- `detail`
- `proof`
- `close`

The renderer may still map these to implementation-level slide types while preserving the narrative role.

### 3.5 ContentOrigin

```typescript
type ContentOrigin =
  | "generated_by_ai"
  | "edited_by_user"
  | "template_fallback"
  | "inherited_from_global"
  | "regenerated"
  | "restored_from_session"
```

## 4. Creative Direction Model

### 4.1 Required Creative Theses

The system must attempt to produce finalists that are meaningfully distinct.

Required primary theses:

- `clarity-first`
- `brand-signature-first`
- `campaign-first`

These are not colorways. They are distinct storytelling and composition hypotheses.

### 4.2 Premium Quality Standard

The system fails if it produces generic, merely pleasant screenshot layouts.

The system succeeds only when the user regularly receives finalists that plausibly resemble the work of a strong App Store marketing designer.

### 4.3 Finalist Delivery Rule

- Show Top 3 finalists by default
- Enforce minimum distinction across the Top 3
- Only show additional finalists if they clear the premium-acceptable threshold and add real value
- Never show visibly weak outputs just to fill a slot

## 5. Business Rules

### 5.1 Create

| Rule | Description |
|------|-------------|
| **RULE-C01** | App name required, 1-60 chars after trim |
| **RULE-C02** | Description required, 10-500 chars |
| **RULE-C03** | Screenshots: 1-6 files, PNG or JPEG, >=390x844px, <=10MB each |
| **RULE-C04** | Brand color must match `#RRGGBB` |
| **RULE-C05** | "Generate" button is enabled only when C01 and C03 are satisfied |
| **RULE-C06** | Total upload size <= 40MB |
| **RULE-C07** | Create surface remains visually frozen unless explicit product decision changes it |

### 5.2 Generate

| Rule | Description |
|------|-------------|
| **RULE-G01** | The system must internally generate multiple candidate directions before curation |
| **RULE-G02** | The system must attempt to produce Top 3 finalists with meaningful distinction |
| **RULE-G03** | The first visible slide in every finalist is a hero role |
| **RULE-G04** | AI must analyze screenshots visually, not rely only on filenames or index |
| **RULE-G05** | AI copy and composition must be style-aware and role-aware |
| **RULE-G06** | If AI is unavailable, the user must never be blocked |
| **RULE-G07** | Every generated field must track content origin |
| **RULE-G08** | Retry and repair are bounded; no infinite generation loop is allowed |

### 5.3 Preview

| Rule | Description |
|------|-------------|
| **RULE-P01** | Preview is the primary post-generation surface |
| **RULE-P02** | Preview shows ranked finalists, not raw generation attempts |
| **RULE-P03** | The final surface must remain output-first and visually simple |
| **RULE-P04** | Entering edit mode must preserve the same surface, not feel like entering another app |
| **RULE-P05** | Preview and export must remain WYSIWYG |
| **RULE-P06** | Additional finalists, if shown, must feel like competitive options, not leftovers |

### 5.4 Edit

| Rule | Description |
|------|-------------|
| **RULE-E01** | Editing one finalist must never mutate another finalist |
| **RULE-E02** | Editing a field changes its content origin to `edited_by_user` |
| **RULE-E03** | Brand color changes are project-wide |
| **RULE-E04** | Slide-local headline changes affect only the selected slide |
| **RULE-E05** | Variant or finalist background changes affect all slides in that finalist only |
| **RULE-E06** | AI regenerate on dirty content requires confirmation |

### 5.5 Quality

| Rule | Description |
|------|-------------|
| **RULE-Q01** | No candidate below the premium-acceptable threshold may be surfaced |
| **RULE-Q02** | The evaluator must score premium feel, hierarchy, screenshot fit, distinctiveness, narrative coherence, readability, brand fit, and conversion strength |
| **RULE-Q03** | If fewer than 3 finalists clear AAA threshold, repair/retry must run before surfacing results |
| **RULE-Q04** | Derived backgrounds must be deterministic and based on brand and screenshot context, not AI bitmap generation |
| **RULE-Q05** | Typography must be selected from a curated premium library |

### 5.6 Export

| Rule | Description |
|------|-------------|
| **RULE-X01** | Export generates 6.7" and 6.1" outputs for every slide in the selected finalist |
| **RULE-X02** | Output ZIP name is `shotforge-{brand-slug}.zip` |
| **RULE-X03** | Export uses the same render pipeline as preview |
| **RULE-X04** | Export reflects the current edited state exactly |

### 5.7 Validation

| Rule | Description |
|------|-------------|
| **RULE-V01** | MIME must be `image/png` or `image/jpeg` |
| **RULE-V02** | Width >= 390 and height >= 844 |
| **RULE-V03** | File size <= 10MB |
| **RULE-V04** | Session total <= 40MB |
| **RULE-V05** | Brand color matches `/^#[0-9A-Fa-f]{6}$/` |
| **RULE-V06** | App name trimmed length 1-60 |
| **RULE-V07** | Description trimmed length 10-500 |

## 6. Truth Tables

### 6.1 Scope

| Field | Scope | Edit Surface | Affects |
|-------|-------|--------------|---------|
| brandColor | project | preview editor | all finalists |
| backgroundTreatment | finalist | preview editor | all slides in finalist |
| typographySystem | finalist | internal system, maybe future editor | all slides in finalist |
| headline | slide | preview editor | selected slide only |
| screenshot | slide | future swap support | selected slide only |
| crop/focal placement | slide | internal system first | selected slide only |

### 6.2 ContentOrigin Transitions

| Action | From | To |
|--------|------|----|
| AI generates | — | generated_by_ai |
| AI unavailable, premium fallback used | — | template_fallback |
| User edits field | any | edited_by_user |
| User confirms regenerate on dirty field | edited_by_user | regenerated |
| Session restored | any | restored_from_session |
| Project-level inheritance applied | any | inherited_from_global |

## 7. Invariants

| ID | Invariant | Severity |
|----|-----------|----------|
| **INV-001** | Preview always surfaces curated finalists, never raw attempts | Critical |
| **INV-002** | Top 3 finalists must be meaningfully distinct unless fewer than 3 candidates pass AAA threshold | Critical |
| **INV-003** | Editing finalist A never mutates finalist B | Critical |
| **INV-004** | Preview and export use identical render pipeline | Critical |
| **INV-005** | User-edited content is never silently overwritten | Critical |
| **INV-006** | Session restore recovers full state or fails cleanly | High |
| **INV-007** | Export matches preview output exactly | High |
| **INV-008** | The first visible slide in a finalist is always a hero role | Medium |
| **INV-009** | Brand color always matches `#[0-9A-Fa-f]{6}` | Medium |
| **INV-010** | The product remains perceptibly 3 steps to the user | High |

## 8. Acceptance Criterion

Shotforge is done when a user can:

1. Open the Create surface
2. Enter app name and description
3. Upload screenshots
4. Set a brand color
5. Click "Generate screenshots"
6. Receive a ranked set of strong finalists
7. Compare finalists in one unified Preview surface
8. Edit the selected finalist without leaving that surface
9. Export with confidence that the result matches preview

If the system frequently returns generic, weak, or visibly uncurated outputs, it is not done.
