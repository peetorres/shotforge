# TEST STRATEGY — Shotforge V2

> Tests protect real product risks. No theatrical coverage.

## 1. Philosophy

- Test what can break the user experience
- Every test maps to a risk, invariant, or business rule
- Anti-tests where they prevent regression of removed constraints
- Coverage is a signal, not a goal (70% gate, but quality > quantity)

## 2. Test Layers

### 2.1 Domain Tests (unit)

**What**: Pure functions, validation rules, type guards, invariants.
**Where**: `src/domain/*.test.ts`
**Mock**: Nothing (pure functions)
**Maps to**: RULE-V*, RULE-C*, INV-*

| Test | Rule/Invariant | Risk Protected |
|------|---------------|----------------|
| validateMimeType rejects text/plain | RULE-V01 | Invalid file accepted |
| validateMimeType accepts image/png | RULE-V01 (anti) | Valid file rejected |
| validateDimensions rejects 100x100 | RULE-V02 | Undersized image |
| validateBrandColor rejects "red" | RULE-V05 | Invalid color crashes render |
| validateAppName rejects empty | RULE-C01 | Empty project name |
| createVariants returns 3 | INV-001 | Wrong variant count |
| each variant has N slides | INV-002 | Slide count mismatch |

### 2.2 Store Tests (unit)

**What**: Zustand store actions, state transitions, isolation.
**Where**: `src/lib/store.test.ts`
**Mock**: Nothing (in-memory store)
**Maps to**: INV-003, INV-005, INV-010

| Test | Invariant | Risk Protected |
|------|-----------|----------------|
| updateSlide only mutates target variant | INV-003 | Cross-variant leakage |
| updateSlide on variant A doesn't touch B | INV-003 (anti) | Silent corruption |
| selectVariant rejects invalid ID | — | Invalid state |
| setStep follows state machine | INV-010 | Invalid transition |
| user-edited content tracked via origin | INV-005 | Lost edits |

### 2.3 API Contract Tests (integration)

**What**: Request/response shape, validation, error handling.
**Where**: `src/app/api/*/route.test.ts`
**Mock**: File system (for /tmp), Anthropic SDK (for AI)
**Maps to**: API_CONTRACTS.md

| Test | Contract | Risk Protected |
|------|----------|----------------|
| upload rejects text/plain | POST /upload | Invalid file stored |
| upload accepts valid PNG | POST /upload (anti) | Valid file rejected |
| generate-copy returns fallback when AI down | POST /generate-copy | User blocked by AI failure |
| generate-copy returns correct shape for hero | POST /generate-copy | Wrong copy structure |
| preview returns 404 for missing session | POST /preview | Crash on missing data |
| export returns ZIP with correct headers | POST /export | Broken download |

### 2.4 Hook Tests (unit)

**What**: Custom React hooks behavior.
**Where**: `src/hooks/*.test.ts`
**Mock**: fetch (global), store (Zustand vanilla)
**Maps to**: RULE-G*, state machine

| Test | Rule | Risk Protected |
|------|------|----------------|
| useGenerate calls AI for all 3 variants | RULE-G01 | Missing variants |
| useGenerate uses fallback on AI failure | RULE-G06 | Blocked generation |
| useGenerate reports progress correctly | RULE-G05 | Stuck progress UI |
| usePreview debounces at 300ms | — | Server flood |
| usePreview aborts previous request | — | Stale preview |
| useExport prevents double-fire | — | Duplicate downloads |

### 2.5 Component Tests (integration)

**What**: User interaction → DOM result.
**Where**: `src/components/*/*.test.tsx`
**Mock**: API calls, store if needed
**Framework**: @testing-library/react
**Maps to**: RULE-R*, RULE-CH*

| Test | Rule | Risk Protected |
|------|------|----------------|
| CreateForm disables button when name empty | RULE-C05 | Premature generation |
| CreateForm enables button when valid | RULE-C05 (anti) | Stuck user |
| VariantGallery renders 3 strips | RULE-CH01 | Missing variants |
| SlideCardsRow renders N cards | RULE-R01 | Wrong slide count |
| Inspector shows correct slide on click | RULE-R03 | Wrong slide edited |
| Preview button hides inspector | RULE-R04 | Broken preview mode |

### 2.6 Integration Tests (flow)

**What**: Multi-step flows through store + components.
**Where**: `src/__tests__/integration/*.test.ts`
**Mock**: API calls
**Maps to**: State machine, acceptance criterion

| Test | Flow | Risk Protected |
|------|------|----------------|
| create → upload → store has files | Create → Generate | Broken upload pipeline |
| generate → 3 variants in store | Generate → Choose | Missing variants |
| choose variant → refine loads | Choose → Refine | Navigation broken |
| refine edit → store updated | Refine | Lost edits |
| full flow: create → generate → choose → export | E2E | Acceptance criterion |

### 2.7 Fidelity Tests (visual)

**What**: Preview matches export output.
**Where**: `src/__tests__/fidelity/*.test.ts`
**Mock**: Nothing (uses real screenshot-gen)
**Maps to**: INV-004, INV-007

| Test | Invariant | Risk Protected |
|------|-----------|----------------|
| preview and export use same composeSlide() | INV-004 | Render divergence |
| preview config matches export config (except resize) | INV-007 | WYSIWYG violation |

## 3. Anti-Test Protocol

Anti-tests are written ONLY when they protect a specific regression risk.

**When to write anti-test:**
- Validation rule: always (test reject + test accept)
- Invariant enforcement: always (test violation detected + test valid case passes)
- State isolation: always (test mutation isolated + test other state untouched)
- UI enable/disable: always (test disabled + test enabled)

**When NOT to write anti-test:**
- Rendering details (visual, not behavioral)
- Navigation (either works or doesn't)
- Pure UI layout (no behavioral inverse)

## 4. Coverage

### Gate: 70% lines, 70% branches, 70% functions

### Priority Coverage
1. `src/domain/` — 95%+ (pure logic, easy to test)
2. `src/lib/store.ts` — 90%+ (state integrity is critical)
3. `src/app/api/` — 85%+ (validation and error paths)
4. `src/hooks/` — 80%+ (orchestration logic)
5. `src/components/` — 70%+ (interaction behavior, not layout)

### Not Worth Testing
- CSS classes / styling details
- Static text content
- Import/export statements
- Type definitions

## 5. Test Infrastructure

### Vitest Config
```typescript
test: {
  globals: true,
  environment: "jsdom",
  setupFiles: ["./src/test-setup.ts"],
  coverage: {
    provider: "v8",
    reporter: ["text", "json-summary"],
    thresholds: { lines: 70, branches: 70, functions: 70 },
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/**/*.test.{ts,tsx}", "src/test-setup.ts"],
  },
}
```

### Test Setup
```typescript
// src/test-setup.ts
import "@testing-library/jest-dom"
```

### Naming Convention
```
src/domain/rules.ts          → src/domain/rules.test.ts
src/domain/rules.ts          → src/domain/rules.anti.test.ts  (anti-tests)
src/lib/store.ts             → src/lib/store.test.ts
src/components/create/Form.tsx → src/components/create/Form.test.tsx
```
