# AI Preview Architecture — Visual Intelligence System

## 3-Layer Pipeline

```
Layer 1: Deterministic Engine (Sharp + Satori)
  → ALWAYS produces valid output
  → Current slide types: hero, statement, feature, detail, result, contrast
  → Fallback when AI unavailable

Layer 2: AI Analysis (OpenAI)
  → Screenshot understanding (visual intent per image)
  → Product understanding (target user, problem, outcome)
  → Slide plan generation (layout + copy + composition)
  → Optional — graceful degradation to L1

Layer 3: Resolution
  → Merges AI slide plans into L1 renderer input
  → AI fields override defaults where present
  → Missing fields → deterministic defaults
  → Always produces valid render
```

## AI is a Visual Director, NOT a Renderer

- AI outputs structured layout decisions (JSON)
- Deterministic engine renders final pixels
- AI never generates images
- AI never touches Sharp/Satori

## API

### POST /api/analyze

Input: sessionId, brand, description, filenames, variantStyle
Output: productUnderstanding, screenshotIntents[], slidePlans[], timings

### Fallback Rules

| Failure | Behavior |
|---------|----------|
| No OPENAI_API_KEY | Skip all AI, use deterministic defaults |
| Product analysis fails | Use app name + description as-is |
| Screenshot analysis fails | Mark as "unknown", use default crop/role |
| Slide plan fails | Use NARRATIVE_SEQUENCE defaults |
| Structured output parse fails | Retry once, then fallback |
| Timeout (15s per call) | Abort, use fallback |

## Models

- Primary: gpt-4o (multimodal, structured outputs)
- Fallback: deterministic copy templates
