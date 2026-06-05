# SYSTEM START HERE — Shotforge V2

> This is the entry point for any agent, developer, or AI instance working on Shotforge.
> Read this file FIRST. Follow the reading order. Do not skip steps.

## What Is Shotforge

Shotforge is an AI-directed App Store creative system. Users upload raw app screenshots, describe their app briefly, and receive a curated set of premium finalists that feel like work from a strong App Store marketing designer. They compare finalists in one Preview surface, optionally refine the selected direction, and export with confidence.

## Current State

- **Version**: 0.2.0-alpha.0 (V2 rebuild in progress)
- **Branch**: `feat/shotforge-v2`
- **V1 Status**: Deprecated. Source exists but is being replaced.
- **V2 Status**: Canon reset complete for the premium Preview-first direction. Implementation in progress.
- **Engine**: `@appforge/screenshot-gen` — fully functional, untouched. Satori + Sharp compositor.

## Architecture Summary

```
User Flow:  Create → Generate → Preview

Internal:   Upload → Ingest → Perception → Direction → Composition
          → Evaluation → Repair → Curation → Preview → Export

State:      Centralized client store + persisted session state
Render:     Deterministic premium renderer on top of @appforge/screenshot-gen
API:        Thin Next.js Route Handlers delegating to server services
UI:         Next.js 15 App Router, React 19, Tailwind v4
```

## Immutable Decisions

These are resolved. Do not reopen.

| ID | Decision | Reason |
|----|----------|--------|
| D-001 | 3-step visible flow: Create → Generate → Preview | Reduces friction and matches the approved product direction |
| D-002 | 3 variants: Midnight (dark), Clean (light), Vivid (brand gradient) | User-approved |
| D-003 | Direction C (One-Click AI) + Fixed Right Inspector | User chose after comparing 3 directions |
| D-004 | Final Preview shell stays visually frozen while internals evolve | Preserves the approved shell |
| D-005 | Preview/editor stay in one unified surface | Simplifies the user experience |
| D-006 | Reuse @appforge/screenshot-gen as-is | Engine works, no changes needed |
| D-007 | Internal engine is staged and quality-gated | Required for premium output quality |
| D-008 | TDD London School with anti-tests where they add value | User requirement |
| D-009 | Fallback copy templates when AI unavailable | User must never be blocked |
| D-010 | /tmp storage now, R2 later | Explicit phased approach |

## Critical Invariants

These must NEVER be violated:

- **INV-001**: Preview only surfaces curated finalists, never raw attempts
- **INV-002**: Top 3 finalists must be meaningfully distinct unless fewer than 3 candidates clear AAA threshold
- **INV-003**: Editing one finalist NEVER affects another finalist's data
- **INV-004**: Preview rendering must use the same engine as export (screenshot-gen)
- **INV-005**: User manual edits are NEVER silently overwritten
- **INV-006**: Session restore must recover full state or fail gracefully (never partial corruption)
- **INV-007**: Export output must exactly match preview (WYSIWYG fidelity)

## Known Risks (Active)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Premium quality regression | Critical | Evaluator thresholds + fixture corpus + manual review |
| Cross-finalist data leakage | Critical | Store isolation + integration tests |
| Preview/export divergence | High | Same render pipeline, fidelity tests |
| Lost edits on regenerate | High | Dirty tracking + user confirmation |
| Broken restore after refresh | High | Schema versioning + validation |
| Stale preview after edit | Medium | Debounced re-render on store change |

## Mandatory Reading Order

Read these in order before doing ANY work:

1. `SYSTEM_START_HERE.md` (this file)
2. `docs/canonical/HANDOFF_CONTEXT.md` — current state, recent changes, next steps
3. `docs/canonical/SHOTFORGE_CANON.md` — product truth, rules, entities, invariants
4. `docs/canonical/STATE_MACHINE.md` — formal state transitions
5. `docs/canonical/ARCHITECTURE.md` — system architecture, state authority, render pipeline
6. `docs/canonical/API_CONTRACTS.md` — all endpoint contracts
7. `docs/canonical/DESIGN_SYSTEM.md` — tokens, components, layout rules
8. `docs/canonical/PERSISTENCE_AND_RESTORE.md` — session lifecycle, recovery
9. `docs/canonical/TEST_STRATEGY.md` — what to test, why, how
10. `docs/canonical/REGRESSION_GUARDS.md` — what must never break
11. `docs/canonical/KNOWN_FAILURES_AND_GUARDS.md` — historical failure registry
12. `docs/canonical/DECISION_LOG.md` — chronological decision history
13. `docs/canonical/EXECUTION_PROTOCOL.md` — how to work in this repo
14. `docs/canonical/IMPLEMENTATION_ROADMAP.md` — premium-engine execution phases

## Checklists

### Before Writing Code
- [ ] Read SYSTEM_START_HERE.md
- [ ] Read HANDOFF_CONTEXT.md
- [ ] Read relevant canonical docs for the area you're touching
- [ ] Check REGRESSION_GUARDS.md for affected guards
- [ ] Check KNOWN_FAILURES_AND_GUARDS.md for related failure patterns
- [ ] Confirm your change doesn't violate any invariant (INV-*)

### Before Changing Architecture
- [ ] Read ARCHITECTURE.md fully
- [ ] Read STATE_MACHINE.md for affected transitions
- [ ] Create or update ADR in docs/canonical/DECISION_LOG.md
- [ ] Update ARCHITECTURE.md with the change
- [ ] Update affected contracts in API_CONTRACTS.md
- [ ] Add regression guard if introducing new risk

### Before Changing UX
- [ ] Read DESIGN_SYSTEM.md
- [ ] Read SHOTFORGE_CANON.md for affected rules
- [ ] Verify change aligns with immutable decisions (D-*)
- [ ] Update DESIGN_SYSTEM.md if new pattern introduced
- [ ] Reference approved prototype: `prototypes/shotforge-complete-flow.html`

### Before Declaring Done
- [ ] All relevant tests pass
- [ ] No invariant violated
- [ ] No regression guard broken
- [ ] HANDOFF_CONTEXT.md updated
- [ ] DECISION_LOG.md updated (if decisions were made)
- [ ] CHANGELOG.md updated
- [ ] Build succeeds: `pnpm build`
- [ ] Type check passes: `pnpm typecheck`
