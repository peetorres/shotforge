# AI Visual Director — Experiment Results

> Decision-ready evaluation artifact.
> Fill after each test run. Canonical decision at bottom.

---

## Experiment Configuration

| Field | Value |
|-------|-------|
| Branch | `feat/shotforge-v2` |
| Commit | `1ecb1a6` |
| Model | `gpt-4o` |
| Feature flag | `OPENAI_API_KEY` in `.env.local` |
| AI scope | Headlines only (crop/role logged, not applied) |
| Fallback | Deterministic copy templates (always runs) |

---

## Test Runs

### Run 1

| Field | Value |
|-------|-------|
| Date | |
| App name | |
| App description | |
| Category | |
| Screenshots count | |
| Total generation time | |
| AI time only | |
| Deterministic render time | |
| Timeout/fallback occurrences | |

#### Cost Estimate

| Metric | Value |
|--------|-------|
| Estimated input tokens | |
| Estimated output tokens | |
| Estimated cost (this batch) | |
| Projected cost per 100 batches | |
| Projected cost per 1,000 batches | |

#### Quality Comparison

| Slide | Deterministic Headline | AI Headline | AI Improved? | Notes |
|-------|----------------------|-------------|-------------|-------|
| 1 (hero) | "You don't need **motivation.**" | | | |
| 2 (statement) | "You keep **starting.**" | | | |
| 3 (feature) | "Structure beats **willpower**" | | | |
| 4 (detail) | "No friction." | | | |
| 5 (result) | "Day 30. **Still here.**" | | | |
| 6 (feature) | "One habit. **Every day.**" | | | |

#### Impact Assessment

| Dimension | Improved? | Notes |
|-----------|----------|-------|
| Hook strength | | |
| Narrative coherence | | |
| Specificity | | |
| Emotional impact | | |
| Anything made worse? | | |

#### Renderer Fields

| Field | Generated? | Logged? | Applied? |
|-------|-----------|---------|----------|
| headline | ✓ | ✓ | ✓ |
| slide_role | ✓ | ✓ | ✗ |
| crop_strategy | ✓ | ✓ | ✗ |
| device_visibility | ✓ | ✓ | ✗ |
| device_alignment | ✓ | ✓ | ✗ |
| device_rotation | ✓ | ✓ | ✗ |
| background_style | ✓ | ✓ | ✗ |
| visual_priority | ✓ | ✓ | ✗ |

#### Failure Analysis

| Issue | Count | Details |
|-------|-------|---------|
| Schema failures | | |
| Retries | | |
| Timeouts | | |
| Fallback triggers | | |
| Malformed outputs | | |

---

### Run 2

_(Copy Run 1 template and fill)_

---

### Run 3

_(Copy Run 1 template and fill)_

---

## Aggregate Findings

### Performance Summary

| Metric | Run 1 | Run 2 | Run 3 | Average |
|--------|-------|-------|-------|---------|
| Total time | | | | |
| AI time | | | | |
| Cost per batch | | | | |

### Quality Summary

| Dimension | Runs improved / total | Verdict |
|-----------|----------------------|---------|
| Hook | /3 | |
| Narrative | /3 | |
| Specificity | /3 | |
| Emotional impact | /3 | |
| Worse than deterministic | /3 | |

### Cost Projection

| Scale | Monthly cost (est.) |
|-------|-------------------|
| 10 batches/day | |
| 100 batches/day | |
| 1,000 batches/day | |

---

## Next Field Recommendation

After evaluating headlines, the next AI field to wire into the renderer should be:

- [ ] **Crop strategy** — would AI crop improve screenshot focus?
- [ ] **Slide role** — would AI role assignment improve narrative flow?
- [ ] **Device alignment** — would asymmetric placement improve composition?
- [ ] **None** — deterministic is sufficient

Recommendation: _____________

Justification: _____________

---

## CANONICAL DECISION

**Select ONE:**

- [ ] **KEEP DETERMINISTIC ONLY** — AI did not materially improve results
- [ ] **KEEP AI FOR COPY ONLY** — AI headlines are better, but renderer should stay deterministic
- [ ] **EXPAND AI TO CROP + ROLE** — AI headlines + crop + role improve output enough to justify cost
- [ ] **EXPAND AI FURTHER** — AI should control more rendering decisions

**Justification:**

_(Written after 3+ test runs. Must reference specific quality improvements or lack thereof.)_

---

## Action Items

If APPROVED:
- Update `DECISION_LOG.md` with DEC-028: AI Visual Director canonical decision
- Move AI from experiment to production pipeline
- Wire approved fields into renderer
- Add regression guards for AI behavior

If REJECTED:
- Update `DECISION_LOG.md` with DEC-028: AI rejected — record why
- Remove AI pipeline code or mark as deprecated
- Keep deterministic copy templates as canonical
- Document what AI couldn't improve and why
