# IMPLEMENTATION ROADMAP — Shotforge V2

> Premium-engine roadmap with frozen Create and Preview UX shells.

## Phase A: Canon and Contracts

**Objective:** Align docs to the real product direction.

Tasks:

1. Formalize Preview unified flow
2. Freeze Create and Preview surfaces in canon
3. Define finalist model and quality thresholds
4. Define staged engine modules and state authority

Exit gate:

- canonical docs describe the same product we intend to build
- no doc still treats Choose and Refine as the final product split

## Phase B: Core Contracts and State

**Objective:** Create the internal type system for the premium engine and centralized app state.

Tasks:

1. Add engine contracts
2. Add evaluator score schema and thresholds
3. Add finalist set model
4. Centralize persistence and hydration
5. Remove page-level `localStorage` authority

Exit gate:

- one store is the client source of truth
- restore behavior is explicit and testable

## Phase C: Engine Skeleton

**Objective:** Build the staged engine path.

Tasks:

1. Ingest
2. Perception
3. Direction
4. Composition
5. Compatibility wrapper over existing AI path while migration is in progress

Exit gate:

- staged pipeline exists and is testable with deterministic fixtures

## Phase D: Evaluation, Repair, and Curation

**Objective:** Turn generation quality into a system property.

Tasks:

1. Weighted evaluator
2. Repair strategy with bounded retry budget
3. Top 3 distinction logic
4. Finalist curation logic

Exit gate:

- weak candidates are rejected or repaired before surfacing
- Top 3 distinction is enforced

## Phase E: Premium Renderer Upgrade

**Objective:** Raise visual output quality.

Tasks:

1. Deterministic derived backgrounds
2. Curated typography systems
3. Focal-aware placement
4. Stronger layout and overlay grammar

Exit gate:

- preview and export stay WYSIWYG
- renderer can express the premium direction language

## Phase F: Server and Route Refactor

**Objective:** Keep HTTP routes thin and move orchestration into server services.

Tasks:

1. Move generation orchestration to server services
2. Move preview/export request building to adapters
3. Preserve existing route contracts where possible

Exit gate:

- routes parse input and return output only

## Phase G: Preview Integration

**Objective:** Integrate the premium engine into the frozen Preview shell.

Tasks:

1. Route generation into finalist set creation
2. Unify choose/refine behavior around one Preview state model
3. Preserve current premium shell
4. Enable edit mode inside Preview

Exit gate:

- user flow feels like Create → Generate → Preview
- editing stays inside the same surface

## Phase H: Hardening and Benchmarking

**Objective:** Prove output quality and reliability.

Tasks:

1. Fidelity tests
2. Restore and route guard tests
3. Premium threshold tests
4. Fixture corpus visual acceptance checks
5. Manual finalist quality review against benchmark references

Exit gate:

- preview/export fidelity proven
- restore behavior proven
- output quality is benchmarked against premium references

## Phase I: Final Sync

**Objective:** Bring docs and code back to perfect alignment.

Tasks:

1. Update handoff context
2. Update regression guards
3. Update changelog and version
4. Verify `SYSTEM_START_HERE.md`

Exit gate:

- any new engineer or agent can understand the final product from canonical docs alone
