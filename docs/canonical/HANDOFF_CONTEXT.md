# HANDOFF CONTEXT — Shotforge V2

> Compact operational summary. Read this after SYSTEM_START_HERE.md.
> Updated at every phase completion.

## Last Updated
2026-03-28 | CANON RESET FOR PREMIUM ENGINE. Create + final Preview shell FROZEN. Product truth moved to Create → Generate → Preview. Premium engine architecture approved.

## Current State

### What Exists
- **Branch**: `feat/shotforge-v2`
- **Version**: 0.2.0-alpha.0
- **Tests**: existing suite still reflects the earlier architecture and needs migration
- **Canonical docs**: reset to the premium Preview-first direction
- **V1 source**: DELETED (except style-colors.ts, globals.css, layout.tsx, validation.ts)
- **Engine**: `@appforge/screenshot-gen` — working, untouched
- **UX Constraint**: `src/app/page.tsx` remains frozen; final Preview shell remains frozen

### Current Architectural Reality
- Existing code contains useful pieces for upload, preview, export, and the current shell
- Existing docs and code had diverged
- Canonical direction is now explicitly:
  - unified Preview
  - curated finalists
  - staged premium engine
  - deterministic derived backgrounds
  - curated typography

### What Was Done This Session
1. Product direction confirmed: simple users must get AAA App Store screenshots without enterprise-level design spend
2. Preview unified model approved as the final UX direction
3. Premium engine architecture spec written and approved
4. Implementation plan written, reviewed, and approved
5. Canonical docs reset to the premium Preview-first truth
6. AAA visual grammar derived from benchmark references and added to the design system

### Test Summary
- Existing tests still matter, but they no longer fully cover the intended premium architecture
- The next implementation phase must introduce:
  - engine contract tests
  - evaluator tests
  - finalist curation tests
  - fidelity tests
  - premium visual acceptance checks

### Decisions Made
- Core baseline decisions are preserved
- New governing decisions are DEC-025 through DEC-030

### Risks Remaining
- Existing implementation still reflects the pre-reset architecture in many places
- Centralized state model is not yet fully integrated
- Engine is not yet using full perception → direction → composition → evaluation → repair → curation flow
- Output quality is not yet benchmarked against the new AAA standard

## Next Steps (In Order)

1. **Contracts + state authority in code** — create core contracts, scoring schema, centralized store path
2. **Engine skeleton** — ingest, perception adapter, direction, composition
3. **Evaluator + repair + curation** — quality as a system property
4. **Renderer upgrade** — deterministic derived backgrounds, curated typography, focal placement
5. **Preview integration** — unified finalist state in the frozen Preview shell
6. **Hardening** — fidelity, restore, visual acceptance, benchmark review

## For Next Instance

1. Read SYSTEM_START_HERE.md first
2. The UX shell is FULLY APPROVED — do not redesign Create or the final Preview shell
3. The canonical docs are the source of truth again — code must be migrated to match them
4. Start from the premium implementation plan in `docs/superpowers/plans/2026-03-28-shotforge-premium-engine-implementation.md`
5. Follow EXECUTION_PROTOCOL.md for all work
6. Treat output quality as the primary metric, not just passing tests
