# REGRESSION GUARDS — Shotforge V2

> Things that must NEVER break. Each guard has a formal protection mechanism.

## Guard Registry

### RG-001: Cross-Variant Data Leakage
- **Risk**: Editing Midnight variant accidentally mutates Clean or Vivid
- **Severity**: Critical
- **Origin**: Architectural — shared store with nested objects, JS reference sharing
- **Trigger**: `updateSlide()` or `updateVariantStyle()` with shallow copy instead of deep
- **Prevention**: Store action creates new objects at every level; never mutates in place
- **Tests**: `store.test.ts` — "updateSlide only mutates target variant"
- **Anti-test**: `store.test.ts` — "other variants unchanged after slide update"
- **Docs**: ARCHITECTURE.md §3, SHOTFORGE_CANON.md INV-003

### RG-002: Preview/Export Divergence
- **Risk**: Preview shows different output than exported PNG
- **Severity**: Critical (WYSIWYG violation)
- **Origin**: Different config or code path between preview and export
- **Trigger**: Preview uses different defaults, different resize logic, or cached stale data
- **Prevention**: Both use `composeSlide()` from screenshot-gen with identical `ResolvedConfig`
- **Tests**: `fidelity.test.ts` — "preview config matches export config"
- **Docs**: ARCHITECTURE.md §4, SHOTFORGE_CANON.md INV-004, INV-007

### RG-003: Lost User Edits on Regenerate
- **Risk**: User manually edits headline, clicks AI regenerate, edit is silently overwritten
- **Severity**: High (data loss)
- **Origin**: Regenerate replaces entire slide copy without checking dirty state
- **Trigger**: `ai_regenerate_requested` on slide with `contentOrigin === "edited_by_user"`
- **Prevention**: Check contentOrigin before overwrite; show confirmation dialog
- **Tests**: `rules.test.ts` — "regenerate on dirty slide requires confirmation"
- **Docs**: SHOTFORGE_CANON.md RULE-RG01..RG04, INV-005

### RG-004: Broken Restore After Refresh
- **Risk**: User refreshes browser, app shows blank or crashes
- **Severity**: High (session loss)
- **Origin**: Zustand hydration race condition, or schema mismatch
- **Trigger**: Page component renders before hydration completes
- **Prevention**: Hydration guard pattern — wait for `onFinishHydration` before render
- **Tests**: `persistence.test.ts` — "restore succeeds with valid data"
- **Anti-test**: `persistence.test.ts` — "restore fails gracefully with corrupted data"
- **Docs**: PERSISTENCE_AND_RESTORE.md §3, §6

### RG-005: Stale Preview After Refine Edit
- **Risk**: User changes headline but preview still shows old text
- **Severity**: Medium (trust violation)
- **Origin**: Preview not re-triggered after store mutation
- **Trigger**: Store mutation doesn't invalidate cached preview
- **Prevention**: usePreview hook watches store slice; debounced re-render on change
- **Tests**: `usePreview.test.ts` — "re-fetches when slide data changes"
- **Docs**: ARCHITECTURE.md §4, STATE_MACHINE.md side effects

### RG-006: Silent Export Failure
- **Risk**: User clicks Export, nothing happens, no error shown
- **Severity**: High (broken core feature)
- **Origin**: Fetch error not caught, or ZIP blob URL not triggered
- **Trigger**: Network error, server crash, or browser blob handling failure
- **Prevention**: Try/catch around fetch + explicit error state + toast notification
- **Tests**: `useExport.test.ts` — "shows error on failed export"
- **Docs**: API_CONTRACTS.md POST /export, STATE_MACHINE.md export_failed

### RG-007: Invalid Upload Accepted
- **Risk**: Non-image file or undersized image passes validation
- **Severity**: High (crashes render pipeline)
- **Origin**: Missing or bypassed validation in upload route
- **Trigger**: File with wrong MIME, corrupt header, or tiny dimensions
- **Prevention**: Server-side validation with sharp metadata check
- **Tests**: `validation.test.ts` — all RULE-V* tests
- **Docs**: API_CONTRACTS.md POST /upload, SHOTFORGE_CANON.md RULE-V*

### RG-008: State Machine Invalid Transition
- **Risk**: User lands on /refine without having generated variants
- **Severity**: Medium (crash or empty UI)
- **Origin**: Direct URL navigation, broken redirect, or skipped step
- **Trigger**: Deep link to step that requires prior state
- **Prevention**: Route guards check store state; redirect if preconditions not met
- **Tests**: `integration/full-flow.test.ts` — "deep link to refine without data redirects"
- **Docs**: STATE_MACHINE.md, PERSISTENCE_AND_RESTORE.md §5

### RG-009: Schema Mismatch on Restore
- **Risk**: New code version can't read old localStorage data
- **Severity**: Medium (session loss)
- **Origin**: Store shape changed between versions without migration
- **Trigger**: Deploy new version while user has V1 data in localStorage
- **Prevention**: Schema versioning + migrate function in Zustand persist config
- **Tests**: `persistence.test.ts` — "migrates v1 data to v2 format"
- **Docs**: PERSISTENCE_AND_RESTORE.md §4

### RG-010: AI Blocks User Flow
- **Risk**: AI API key missing or rate limited, user stuck on Generate screen
- **Severity**: High (complete blocker)
- **Origin**: No fallback when AI unavailable
- **Trigger**: Missing ANTHROPIC_API_KEY or 429/503 from API
- **Prevention**: Template fallback copy always available (RULE-G06)
- **Tests**: `generate-copy.test.ts` — "returns template when AI unavailable"
- **Docs**: SHOTFORGE_CANON.md RULE-G06, API_CONTRACTS.md POST /generate-copy

---

## Guard Verification Checklist

Before any release, verify:

- [ ] RG-001: Run store isolation tests
- [ ] RG-002: Run fidelity tests
- [ ] RG-003: Test regenerate on dirty slide manually
- [ ] RG-004: Refresh browser on each step, verify restore
- [ ] RG-005: Edit headline, verify preview updates
- [ ] RG-006: Kill server during export, verify error shown
- [ ] RG-007: Upload a .txt file, verify rejected
- [ ] RG-008: Navigate directly to /refine/fake-id, verify redirect
- [ ] RG-009: Change persist version, verify migration or clean reset
- [ ] RG-010: Remove API key, verify generation completes with fallback
- [ ] RG-011: Create page has no vertical scroll on standard laptop (1440×900)
- [ ] RG-012: All Create fields visible from initial state (ghost structure)
- [ ] RG-013: CTA always visible without scrolling
- [ ] RG-014: Progressive disclosure activates correctly (name → desc+upload → color)
- [ ] RG-015: Create must visually match Preview dark theme family
- [ ] RG-016: No reintroduction of sidebar Create layout
- [ ] RG-017: Screenshot thumbnails appear and remain stable after upload
- [ ] RG-018: No data loss on Create → Generate transition
- [ ] RG-019: Visual system must not change without explicit DEC entry
- [ ] RG-020: No reintroduction of alternative visual themes in production
- [ ] RG-021: Glow must remain controlled (≤ 7% opacity, ≤ 100px blur)
- [ ] RG-022: Glass blur must remain subtle (≤ 16px backdrop-filter)
- [ ] RG-023: Preview must remain output-first, not UI-first
- [ ] RG-024: Headline locked: "Make it look right." — no changes without DEC
- [ ] RG-025: Subtitle locked: "App Store screenshots that convert."
- [ ] RG-026: Navbar must NOT contain legacy "Shotforge" branding
- [ ] RG-027: Drop zone must NOT use dashed border style
- [ ] RG-028: CTA label locked: "Generate screenshots →"
- [ ] RG-029: Lumo badge must remain present and subtle
