# API CONTRACTS — Shotforge V2

> Every endpoint defined formally. No vague APIs.

## POST /api/upload

**Purpose**: Validate and persist screenshot files to server temp storage.

### Request
```
Content-Type: multipart/form-data
Body:
  sessionId: string (nanoid)
  files: File[] (1-6 images)
```

### Response — Success (200)
```json
{ "filenames": ["screen1.png", "screen2.png", ...] }
```

### Response — Error (400)
```json
{ "error": "INVALID_TYPE" | "TOO_SMALL" | "TOO_LARGE" | "INVALID_IMAGE" | "NO_FILES" | "SESSION_TOO_LARGE", "filename": "screen1.txt" }
```

### Validation Rules
| Check | Rule | Error Code |
|-------|------|------------|
| MIME type | RULE-V01: image/png or image/jpeg | INVALID_TYPE |
| Dimensions | RULE-V02: width >= 390, height >= 844 | TOO_SMALL |
| File size | RULE-V03: <= 10MB | TOO_LARGE |
| Total size | RULE-V04: session total <= 40MB | SESSION_TOO_LARGE |
| File count | RULE-C03: 1-6 files | NO_FILES |

### Behavior
- Creates `/tmp/{sessionId}/` directory
- Saves validated files with original names
- Returns ordered filenames array
- Idempotent: re-uploading replaces files

### Timeout: 30s

---

## POST /api/generate-copy

**Purpose**: Generate AI marketing copy for one slide.

### Request
```json
{
  "brand": "Sensei",
  "description": "Gamified learning for founders",
  "slideType": "hero" | "feature-single" | "feature-dual",
  "screenshotFilename": "screen1.png",
  "style": "dark" | "light" | "bold",
  "variantName": "Midnight"
}
```

### Response — Success (200)
```json
{
  "tagline": ["Your app, **elevated**"],
  "badgeText": "NEW RELEASE",
  "bullets": ["Feature one", "Feature two", "Feature three", "Feature four"],
  "headline": ["**Smart** learning"],
  "contentOrigin": "generated_by_ai"
}
```
Fields present depend on `slideType`:
- hero: tagline, badgeText, bullets
- feature-single/dual: headline

### Response — Error (503)
```json
{ "error": "AI_UNAVAILABLE", "contentOrigin": "template_fallback" }
```

### Fallback Behavior (RULE-G06)
If ANTHROPIC_API_KEY missing or API call fails:
- Return HTTP 200 (not 503) with template copy
- Set `contentOrigin: "template_fallback"`
- Caller treats it as success — user is NEVER blocked

### Timeout: 15s
### Cache: None (each call is unique per variant/style combination)

---

## POST /api/preview

**Purpose**: Render one slide as a half-resolution PNG for live preview.

### Request
```json
{
  "sessionId": "abc123",
  "slide": { /* SlideConfig */ },
  "brand": "Sensei",
  "brandColor": "#6366F1",
  "style": "dark" | "light" | "bold",
  "outputSize": "6.7" | "6.1"
}
```

### Response — Success (200)
```json
{ "image": "base64-encoded-png-string" }
```

### Response — Error
| Code | Error | Reason |
|------|-------|--------|
| 404 | SESSION_NOT_FOUND | /tmp/{sessionId} doesn't exist |
| 400 | INVALID_SIZE | outputSize not in ["6.7", "6.1"] |
| 500 | RENDER_FAILED | screenshot-gen threw error |

### Behavior
- Reads screenshot from `/tmp/{sessionId}/{filename}`
- Calls `composeSlide()` from screenshot-gen
- Resizes to half-width for speed
- Returns base64 PNG

### Timeout: 30s
### Debounce: Client-side 300ms (not server-enforced)

---

## POST /api/export

**Purpose**: Render all slides at full resolution, return as ZIP.

### Request
```json
{
  "sessionId": "abc123",
  "projectState": {
    "brand": "Sensei",
    "brandColor": "#6366F1",
    "style": "dark",
    "slides": [ /* SlideConfig[] */ ],
    "uploadedFiles": ["screen1.png", ...]
  },
  "sizes": ["6.7", "6.1"]
}
```

### Response — Success (200)
```
Content-Type: application/zip
Content-Disposition: attachment; filename="shotforge-sensei.zip"
Body: binary ZIP data
```

### Response — Error
| Code | Error | Reason |
|------|-------|--------|
| 404 | SESSION_NOT_FOUND | /tmp/{sessionId} doesn't exist |
| 500 | EXPORT_FAILED | Render or archive error |

### ZIP Contents
```
shotforge-sensei/
  sensei_01_hero_6.7.png
  sensei_01_hero_6.1.png
  sensei_02_feature-single_6.7.png
  sensei_02_feature-single_6.1.png
  ...
```

### Timeout: 60s
### Idempotent: Yes (same input = same output)

---

## Contract Versioning

All contracts are v1. If breaking changes are needed:
1. Add `"contractVersion": 2` to request
2. Server supports both v1 and v2 during migration
3. Document change in DECISION_LOG.md
4. Update this file
