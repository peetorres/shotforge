# Session Report: AI Visual Director — Layout System Overhaul

> Date: 2026-03-28
> Duration: ~2 hours
> Branch: main (apps/shotforge)
> Status: Implemented, dev-tested, ready for visual validation

---

## Context

The AI Visual Director was generating rich art direction (device alignment, scale, rotation, overlays, backgrounds, depth) but the renderer was only using 3 fields: `zoom`, `offsetX`, `offsetY`. Device was always centered. Layout was hardcoded percentages. Output looked templated despite AI running.

User directive: "If I can recognize a pattern across slides, the system failed."

---

## Changes Made

### Phase 1: `deviceOffsetX` + `deviceScale` (Compositor Positioning)

**Problem:** Every slide centered the device at `(width - deviceWidth) / 2`. No variation.

**Files changed:**
- `packages/screenshot-gen/src/types.ts` — Added `deviceOffsetX` (-40 to 40) and `deviceScale` (0.85-1.3) to HeroSlide, FeatureSingleSlide, DetailSlide, ResultSlide
- `packages/screenshot-gen/src/compositor.ts` — All 4 slide compositors read new fields, offset device position, scale phone height, glow follows device

**Role sensitivity:**
| Role | Offset Range | Scale Range | Behavior |
|------|-------------|-------------|----------|
| Hero | max +/-12% | 0.9-1.15 | Conservative — premium feel |
| Feature | +/-40% | 0.85-1.3 | Full asymmetry, 25% off-canvas |
| Detail | +/-40% | 0.85-1.3 | Full asymmetry, 25% off-canvas |
| Result | +/-35% | 0.85-1.3 | Moderate asymmetry |

### Phase 2: AI Always On

**Problem:** Debug panel showed "AI OFF" with manual toggle and "Run AI Experiment" button.

**Files changed:**
- `apps/shotforge/src/components/preview/ai-debug-panel.tsx` — Removed `aiEnabled` toggle, `onToggle`, `onRunExperiment`. Shows "ALWAYS ON" status. Added per-slide override indicators (zoom, offset, scale).
- `apps/shotforge/src/app/choose/[sessionId]/page.tsx` — Removed `aiResult`, `aiEnabled`, `runAIExperiment` state. AI runs only during Generate (always).

### Phase 3: Role-Aware Zoom

**Problem:** Single min zoom (1.3) for all slides. Too weak for detail slides.

**File changed:** `apps/shotforge/src/app/generate/[sessionId]/page.tsx`

| Slide Type | Min Zoom |
|-----------|----------|
| Hero | 1.1 (conservative) |
| Feature | 1.3 (medium) |
| Detail | 1.5 (aggressive) |
| Result | 1.4 (medium-aggressive) |

### Phase 4: Layout Types (Major Feature)

**Problem:** All slides follow the same layout structure — headline top, device centered below. No structural variation.

**New type:** `LayoutType = "device-center" | "device-left" | "device-right" | "text-only" | "device-dominant" | "zoom-detail"`

**Files changed:**
- `packages/screenshot-gen/src/types.ts` — Added `LayoutType` union type, `layoutType?: LayoutType` to 4 slide interfaces
- `packages/screenshot-gen/src/index.ts` — Re-exported `LayoutType`
- `packages/screenshot-gen/src/compositor.ts` — Complete layout-aware rewrite of `composeFeatureSingleSlide`, `composeDetailSlide`, `composeResultSlide`

**Layout behaviors:**

| Layout | Device | Text | Visual Character |
|--------|--------|------|-----------------|
| `device-center` | Centered below headline | Full-width top | Default template |
| `device-left` | Pinned left, partial overflow | Right side, 45% width | Asymmetric split |
| `device-right` | Pinned right, partial overflow | Left side, 45% width | Mirror asymmetric |
| `text-only` | Not rendered | Full canvas, 84px font | Pure statement |
| `device-dominant` | 95% canvas height | Tiny whisper, 22px | Immersive showcase |
| `zoom-detail` | Frameless, edge-to-edge | Small top label, 28px | Raw UI, no bezel |

**New function:** `createFramelessScreenshot()` — renders raw UI without phone bezel for `zoom-detail` layout. Applies focus crop (removes status bar + tab bar), zoom, offset, rounded corners.

### Phase 5: AI Layout Mapping + Variation Enforcement

**File changed:** `apps/shotforge/src/app/generate/[sessionId]/page.tsx`

**AI → Compositor mapping:**
| AI `layoutType` | Compositor `layoutType` |
|----------------|------------------------|
| `text-only` | `text-only` |
| `device-focus` | `device-dominant` |
| `split` | `device-left` |
| `immersive` | `zoom-detail` |

**Variation enforcement rules:**
1. Consecutive duplicate layouts auto-rotated to next in sequence
2. If <2 unique layouts across all slides → force `device-left`, `zoom-detail`, `device-right`
3. If no `text-only` or `zoom-detail` exists → force `zoom-detail` on last detail slide
4. Hero always stays `device-center` (premium feel)

### Phase 6: Validation + Impact Detection

**In generate page:**
- Counts unique layout types used
- Logs "LAYOUT VARIATION FAILED" if <2 unique layouts
- Auto-fixes by distributing layouts across slides
- Logs per-slide: layout, zoom, offset, scale

### Phase 7: Stability Fix

**Problem:** `ENOENT: no such file or directory` for generate route after type changes.

**Root cause:** Stale `.next` cache referencing old build artifacts.

**Fix:** `rm -rf .next` + clean restart. No files missing or renamed.

---

## Files Modified (Complete List)

### Engine (packages/screenshot-gen/src/)
| File | Lines Changed | Nature |
|------|--------------|--------|
| `types.ts` | +30 | LayoutType union, layoutType field on 4 interfaces |
| `compositor.ts` | ~400 rewritten | 6 layout variants per slide type, frameless renderer |
| `index.ts` | +1 | Re-export LayoutType |

### App (apps/shotforge/src/)
| File | Lines Changed | Nature |
|------|--------------|--------|
| `app/generate/[sessionId]/page.tsx` | ~90 rewritten | Layout mapping, variation enforcement, validation |
| `components/preview/ai-debug-panel.tsx` | Full rewrite | Removed toggle/experiment, added override indicators |
| `app/choose/[sessionId]/page.tsx` | Full rewrite | Removed AI state management |

---

## Verification Status

| Check | Status |
|-------|--------|
| `@appforge/screenshot-gen` builds | PASS |
| TypeScript (shotforge) | PASS (0 errors) |
| Route `/` (Create) | 200 |
| Route `/generate/[sessionId]` | 200 |
| Route `/choose/[sessionId]` | 200 |
| Visual validation | PENDING — needs user test run |

---

## What the AI Now Controls

| Field | AI Controls? | Compositor Reads? | Visible Impact? |
|-------|-------------|-------------------|----------------|
| `layoutType` | YES | YES | YES — fundamentally different layout |
| `zoom` | YES (role-aware min) | YES | YES — tighter crop |
| `offsetX/Y` | YES | YES | YES — focal point shift |
| `deviceOffsetX` | YES | YES | YES — asymmetric positioning |
| `deviceScale` | YES | YES | YES — device size variation |
| `device.alignment` | YES → maps to layoutType | Indirect | YES |
| `device.visible` | YES → maps to text-only | Indirect | YES |
| `device.rotation` | Generated but NOT used | NO | NO |
| `visual.overlays` | Generated but NOT used | NO | NO |
| `visual.background` | Generated but NOT used | NO | NO |
| `visual.depth` | Generated but NOT used | NO | NO |

---

## Next Steps (if visual validation passes)

1. Wire `device.rotation` from AI into compositor `angle` parameter
2. Consider `visual.depth` → glow intensity mapping
3. Fill `AI_EXPERIMENT_RESULTS.md` with test data
4. Make canonical decision DEC-028
5. Clean deprecated files

## Next Steps (if visual validation fails)

1. Check console logs for AI slide plan data
2. Verify AI is returning diverse `layoutType` values
3. Consider hardcoding a diverse layout sequence as fallback
4. Review whether `createFramelessScreenshot()` produces good output
