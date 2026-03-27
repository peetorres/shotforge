# PLAN AUDIT — Shotforge V2

> Critical audit of the plan produced during planning phase.

## 1. What to Approve

| Item | Verdict | Reason |
|------|---------|--------|
| 4-step flow (Create → Generate → Choose → Refine) | Approve | User-approved after 11 prototype iterations |
| 3 variants (Midnight/Clean/Vivid) | Approve | Clear product decision |
| Variant-aware store with `Record<VariantId, Variant>` | Approve | Correct architectural response to the product requirement |
| TDD London School | Approve | User requirement, fits domain-heavy logic well |
| Reuse @appforge/screenshot-gen as-is | Approve | Engine works, no changes needed |
| Delete V1 src and rebuild | Approve | V1 architecture fundamentally incompatible |
| Template fallback for AI | Approve | Critical for resilience |
| Schema versioning on persist | Approve | Prevents data loss |

## 2. What to Reject or Correct

| Item | Issue | Correction |
|------|-------|------------|
| **Universal anti-tests** | Plan mandated anti-test for EVERY test. This is theatrical for non-behavioral tests. | Anti-tests only where they protect validation, invariant enforcement, or state isolation. See TEST_STRATEGY.md §3. |
| **~130 tests estimate** | Inflated by universal anti-tests and premature component tests. | Realistic estimate: 80-100 tests. Quality over count. |
| **Phase ordering by UI first** | Plan put Create page (Phase 6) before establishing persistence, restore, and render pipeline. | Reorder: persistence and render pipeline before any UI. See §4 below. |
| **No state machine** | Plan had `step` as a string with no formal transitions. | Full state machine created (STATE_MACHINE.md). |
| **No regenerate semantics** | Plan mentioned AI copy but didn't define what happens when user regenerates after manual edits. | Full regenerate rules defined (RULE-RG01..RG04). |
| **No persistence/restore** | Plan said "Zustand persist" with no depth on restore, validation, deep links, schema migration. | Full persistence architecture created (PERSISTENCE_AND_RESTORE.md). |
| **No content origin tracking** | Plan had no concept of who produced a value (AI vs user vs template). | ContentOrigin enum defined with transition table. |
| **Missing API: generate-copy fallback** | Plan said fallback but the API contract returned 503, which IS an error. | Corrected: return 200 with template + contentOrigin flag. |
| **CSS-in-JS via inline styles** | V1 used `style={{...}}` on everything. No design system. | Full design system with CSS custom properties. See DESIGN_SYSTEM.md. |

## 3. What Was Missing

| Gap | Severity | Now Addressed In |
|-----|----------|-----------------|
| State machine | Critical | STATE_MACHINE.md |
| Persistence & restore | Critical | PERSISTENCE_AND_RESTORE.md |
| Regenerate semantics | High | SHOTFORGE_CANON.md §5.5 |
| Content origin tracking | High | SHOTFORGE_CANON.md §3.4 |
| Formal API contracts | High | API_CONTRACTS.md |
| Design system | High | DESIGN_SYSTEM.md |
| Regression guards | High | REGRESSION_GUARDS.md (10 guards) |
| Known failure registry | Medium | KNOWN_FAILURES_AND_GUARDS.md |
| Execution protocol | Medium | EXECUTION_PROTOCOL.md |
| Handoff mechanism | Medium | HANDOFF_CONTEXT.md |
| Decision log | Medium | DECISION_LOG.md |
| Preview/export fidelity rules | High | ARCHITECTURE.md §4, INV-004, INV-007 |
| Field scope truth table | Medium | SHOTFORGE_CANON.md §6.1 |
| Deep link behavior | Medium | PERSISTENCE_AND_RESTORE.md §5 |
| Browser refresh during generation | Medium | PERSISTENCE_AND_RESTORE.md §5 |

## 4. Corrected Phase Order

The original plan ordered phases by UI layer (Create first, then Generate, etc.). This is wrong because:
- UI depends on store, which depends on types
- Render pipeline must be proven before any preview UI
- Persistence must work before any page that restores state

**Corrected order (risk-first, not feature-first):**

See IMPLEMENTATION_ROADMAP.md for the definitive phased plan.
