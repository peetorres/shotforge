# KNOWN FAILURES AND GUARDS — Shotforge V2

> Historical failure registry. Predicted failures. UX traps. Technical traps.

## 1. V1 Failures (Historical)

| ID | Failure | Impact | Resolution |
|----|---------|--------|------------|
| KF-001 | SlidesPanel showed emoji placeholder, not real thumbnails | Poor UX — user couldn't see what they were editing | V2: render mini-previews or use uploaded screenshots |
| KF-002 | Store held single flat `slides[]` — couldn't support variants | Architectural dead end for V2 flow | V2: variant-aware store with `Record<VariantId, Variant>` |
| KF-003 | `handleAddSlide` crashed on null project (TS strict null) | Runtime crash in builder | V2: null guard + TDD prevents this class of error |
| KF-004 | Upload validation existed server-side but had no anti-tests | Could accidentally remove validation without noticing | V2: anti-tests for all validation rules |
| KF-005 | Only Inter font, no font selection | Poor customization, worse than competitors | V2 backlog: font selection in Refine inspector |

## 2. Predicted Failures (Anticipated)

| ID | Prediction | Probability | Prevention |
|----|-----------|-------------|------------|
| PF-001 | Zustand persist rehydration race — component renders before store hydrated | High | Hydration guard pattern (wait for onFinishHydration) |
| PF-002 | Sharp/Satori memory spike on 6-slide export | Medium | Sequential slide rendering, not parallel |
| PF-003 | /tmp files lost on server restart during active session | Certain (serverless) | UX: "session expired" message, offer re-upload |
| PF-004 | AI rate limiting during 18-call generation burst (6 slides × 3 variants) | Medium | Sequential calls with retry, fallback on 429 |
| PF-005 | Large screenshots (>5MB) cause slow preview rendering | Medium | Preview uses half-resolution resize |
| PF-006 | Browser localStorage quota hit (5MB typical) | Low | Partialize store — only persist essentials, not base64 images |
| PF-007 | User pastes non-hex value in custom color input | Medium | Validate on change, reject invalid, keep last valid |
| PF-008 | User navigates away during generation, comes back | Medium | Restore to pre-generation state, let user re-trigger |

## 3. UX Traps

| ID | Trap | Prevention |
|----|------|------------|
| UX-001 | User thinks "Generate" will only make 1 version | Label clearly: "Generate 3 Variations" |
| UX-002 | User doesn't realize they can refine after choosing | "Refine" button prominent, not just "Select" |
| UX-003 | User edits wrong slide (inspector shows slide 3 but they think it's slide 1) | Clear selection indicator: blue border + number badge in inspector |
| UX-004 | User expects changes in Refine to affect all variants | Background = variant-wide, headline = slide-only, brand color = project-wide. Label scope clearly. |
| UX-005 | User clicks Export but hasn't selected a variant | Disable export until variant selected, or export currently viewed variant |
| UX-006 | User doesn't know what "Midnight/Clean/Vivid" mean | Show visual preview, not just names |

## 4. Technical Traps

| ID | Trap | Prevention |
|----|------|------------|
| TT-001 | Mutating nested objects in Zustand without spreading | Always create new objects: `{ ...variant, slides: [...slides] }` |
| TT-002 | useEffect dependency array missing store fields → stale closure | Use Zustand selectors, not destructured values in deps |
| TT-003 | Base64 preview images accumulating in React state → memory leak | Clear previous preview when slide changes, use single state slot |
| TT-004 | archiver stream not properly awaited → truncated ZIP | Use PassThrough + endPromise pattern (already solved in V1) |
| TT-005 | Satori font loading fails silently → empty text in renders | Font cache with explicit error on cache miss |
| TT-006 | Sharp resize with wrong aspect ratio → distorted screenshots | Always use `fit: "cover", position: "top"` |
