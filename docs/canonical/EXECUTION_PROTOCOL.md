# EXECUTION PROTOCOL — Shotforge V2

> How any agent or developer must work in this repository.

## 1. Before Any Change

```
1. Read SYSTEM_START_HERE.md
2. Read HANDOFF_CONTEXT.md (current state)
3. Identify which canonical docs your change touches
4. Read those docs fully
5. Check REGRESSION_GUARDS.md — does your change touch any guarded area?
6. Check KNOWN_FAILURES_AND_GUARDS.md — is there a known trap?
7. Only then begin implementation
```

## 2. During Implementation

### Code Changes
- Write test FIRST (TDD)
- Write anti-test if the test protects validation, invariant, or isolation
- Run tests, verify RED
- Implement minimum code to pass
- Run tests, verify GREEN
- Refactor if needed, verify still GREEN

### Document Changes
- Update canonical docs BEFORE or ALONGSIDE code changes
- Never leave a decision only in code comments
- If you discover a new invariant, add it to SHOTFORGE_CANON.md
- If you discover a new failure mode, add it to KNOWN_FAILURES_AND_GUARDS.md
- If you make an architectural decision, add it to DECISION_LOG.md

### Rule: No Orphan Decisions
Every decision must live in at least one canonical doc. "I decided X because Y" in a code comment is NOT sufficient.

## 3. Before Declaring Done

```
1. All tests pass: pnpm test
2. Type check passes: pnpm typecheck
3. Build succeeds: pnpm build
4. No invariant violated (check INV-* list)
5. No regression guard broken (check RG-* list)
6. Update HANDOFF_CONTEXT.md with:
   - What was done
   - What changed
   - Decisions made
   - Risks remaining
   - Next steps
7. Update CHANGELOG.md
8. Update DECISION_LOG.md if any decisions were made
9. Commit with descriptive message referencing rule/decision IDs
```

## 4. Commit Message Format

```
feat(shotforge): description [RULE-C01, INV-003]

- What changed
- Why
- Which rules/invariants/guards affected

Co-Authored-By: claude-flow <ruv@ruv.net>
```

## 5. File Size Rule

No file exceeds 500 lines. If it does:
1. Identify logical boundaries
2. Split into focused modules
3. Each module has a single responsibility
4. Update imports, tests, and docs

## 6. When Encountering Ambiguity

```
1. Check SHOTFORGE_CANON.md — is there a rule?
2. Check DECISION_LOG.md — was this decided before?
3. If no: document the ambiguity, make a decision, record it
4. Never implement based on assumption without recording it
```

## 7. When Encountering a Bug

```
1. Check KNOWN_FAILURES_AND_GUARDS.md — was this predicted?
2. If yes: follow the prevention mechanism
3. If no: fix it, then:
   a. Add to KNOWN_FAILURES_AND_GUARDS.md
   b. Create a regression guard in REGRESSION_GUARDS.md
   c. Write a test that catches it
   d. Update HANDOFF_CONTEXT.md
```

## 8. Phase Completion Protocol

At the end of each implementation phase:

```
1. Run full test suite
2. Verify build
3. Update HANDOFF_CONTEXT.md with phase summary
4. Update CHANGELOG.md
5. Update VERSION if applicable
6. Verify no regression guards broken
7. Record any new decisions in DECISION_LOG.md
8. Record any new failure modes in KNOWN_FAILURES_AND_GUARDS.md
9. Commit all changes (code + docs together)
```

## 9. Handoff Between Instances

When handing off to a new agent/session:

The receiving instance MUST:
1. Read SYSTEM_START_HERE.md
2. Read HANDOFF_CONTEXT.md
3. Understand current state before writing any code
4. NOT restart work already completed
5. NOT reopen decisions already made (unless finding a critical flaw)
6. Continue from the exact point described in HANDOFF_CONTEXT.md
