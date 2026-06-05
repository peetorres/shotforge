# KNOWN FAILURES AND GUARDS — Shotforge V2

> Historical failure registry. Predicted failures. UX traps. Technical traps.

## 1. V1 Failures (Historical)

| ID | Failure | Impact | Resolution |
|----|---------|--------|------------|
| KF-001 | SlidesPanel showed emoji placeholder, not real thumbnails | Poor UX — user couldn't see what they were editing | V2: render mini-previews or use uploaded screenshots |
| KF-002 | Store held single flat `slides[]` — couldn't support variants | Architectural dead end for V2 flow | V2: variant-aware store with `Record<VariantId, Variant>` |
| KF-003 | `handleAddSlide` crashed on null project (TS strict null) | Runtime crash in builder | V2: null guard + TDD prevents this class of error |
| KF-004 | Upload validation existed server-side but had no anti-tests | Could accidentally remove validation without noticing | V2: anti-tests for all validation rules |
| KF-005 | Only Inter font, no typography system | Output felt generic and less premium than benchmark apps | V2: curated typography library with directional pairing rules |

## 2. Predicted Failures (Anticipated)

| ID | Prediction | Probability | Prevention |
|----|-----------|-------------|------------|
| PF-001 | Zustand persist rehydration race — component renders before store hydrated | High | Hydration guard pattern (wait for onFinishHydration) |
| PF-002 | Sharp/Satori memory spike on 6-slide export | Medium | Sequential slide rendering, not parallel |
| PF-003 | /tmp files lost on server restart during active session | Certain (serverless) | UX: "session expired" message, offer re-upload |
| PF-004 | Model rate limiting during candidate generation and evaluation | Medium | Bounded retry budget, repair-first strategy, and premium fallback |
| PF-005 | Large screenshots (>5MB) cause slow preview rendering | Medium | Preview uses half-resolution resize |
| PF-006 | Browser localStorage quota hit (5MB typical) | Low | Partialize store — only persist essentials, not base64 images |
| PF-007 | User pastes non-hex value in custom color input | Medium | Validate on change, reject invalid, keep last valid |
| PF-008 | User navigates away during generation, comes back | Medium | Restore to pre-generation state, let user re-trigger |

## 3. UX Traps

| ID | Trap | Prevention |
|----|------|------------|
| UX-001 | User feels forced to review too many weak options | Surface curated finalists only |
| UX-002 | User thinks finalists are random rather than curated | Rank and present them as finalists, not raw outputs |
| UX-003 | User edits the wrong slide or finalist | Strong selection indicator and persistent finalist identity |
| UX-004 | User expects edits to affect all finalists | Label scope clearly: project-wide, finalist-wide, slide-local |
| UX-005 | User clicks Export without a selected finalist | Keep a default selected finalist and explicit export target |
| UX-006 | User cannot tell why finalists differ | Distinguish them through thesis, layout, and visual language, not only color |

## 4. Technical Traps

| ID | Trap | Prevention |
|----|------|------------|
| TT-001 | Mutating nested finalist objects without spreading | Always create new objects at every nested level |
| TT-002 | useEffect dependency array missing store fields → stale closure | Use Zustand selectors, not destructured values in deps |
| TT-003 | Base64 preview images accumulating in React state → memory leak | Clear previous preview when slide changes, use single state slot |
| TT-004 | archiver stream not properly awaited → truncated ZIP | Use PassThrough + endPromise pattern (already solved in V1) |
| TT-005 | Satori font loading fails silently → empty text in renders | Font cache with explicit error on cache miss |
| TT-006 | Sharp resize with wrong aspect ratio → distorted screenshots | Always use `fit: "cover", position: "top"` |
| TT-007 | Qualitative evaluator logic drifts over time | Use explicit score schema, thresholds, and fixture corpus |
