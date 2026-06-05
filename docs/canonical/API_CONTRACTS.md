# API CONTRACTS — Shotforge V2

> Formal HTTP contracts. Routes stay thin; server services own orchestration.

## POST /api/upload

**Purpose:** Validate and persist screenshot files to temp storage.

### Request

`multipart/form-data`

- `sessionId: string`
- `files: File[]`

### Success

```json
{ "filenames": ["screen1.png", "screen2.png"] }
```

### Error

```json
{ "error": "INVALID_TYPE" | "TOO_SMALL" | "TOO_LARGE" | "INVALID_IMAGE" | "NO_FILES" | "SESSION_TOO_LARGE", "filename": "screen1.png" }
```

### Notes

- creates `/tmp/{sessionId}/`
- replaces prior upload for same session
- server remains authoritative for temp files only

## POST /api/analyze

**Purpose:** Run ingest, perception, direction, and composition preparation for a session.

### Request

```json
{
  "sessionId": "abc123",
  "brand": "Sensei",
  "description": "Gamified learning for founders",
  "filenames": ["screen1.png", "screen2.png"],
  "variantStyle": "dark",
  "riskLevel": "safe"
}
```

### Success

```json
{
  "projectBrief": {},
  "screenshotAnalyses": [],
  "directions": [],
  "candidates": [],
  "timings": {},
  "aiUsed": true
}
```

### Error

```json
{ "error": "ANALYZE_FAILED" }
```

### Notes

- route is a thin adapter
- internal service may use deterministic fixtures or live multimodal analysis
- failure should degrade to safer composition paths, not block the user

## POST /api/generate-copy

**Purpose:** Generate or repair copy for one slide role.

### Request

```json
{
  "brand": "Sensei",
  "description": "Gamified learning for founders",
  "slideRole": "hero",
  "screenshotFilename": "screen1.png",
  "style": "dark",
  "variantName": "Midnight"
}
```

### Success

```json
{
  "headline": ["Build habits", "**that stick**"],
  "tagline": ["Your app, **elevated**"],
  "badgeText": "NEW",
  "bullets": ["Track progress", "Stay consistent"],
  "contentOrigin": "generated_by_ai"
}
```

### Fallback

If AI is unavailable:

- return `200`
- return premium fallback copy
- set `contentOrigin: "template_fallback"`

The user must never be blocked by model failure.

## POST /api/preview

**Purpose:** Render one selected finalist slide as preview PNG.

### Request

```json
{
  "sessionId": "abc123",
  "slide": {},
  "brand": "Sensei",
  "brandColor": "#6366F1",
  "style": "dark",
  "backgroundTreatment": "brand-glow-editorial",
  "typographySystem": "editorial-sans-tight",
  "outputSize": "6.7"
}
```

### Success

```json
{ "image": "base64-encoded-png" }
```

### Error

| Code | Error | Reason |
|------|-------|--------|
| 404 | `SESSION_NOT_FOUND` | temp assets missing |
| 400 | `INVALID_SIZE` | invalid output size |
| 500 | `RENDER_FAILED` | render pipeline failed |

### Notes

- preview uses the same render pipeline as export
- only resolution differs
- derived backgrounds and typography must flow through the same renderer inputs

## POST /api/export

**Purpose:** Export the selected finalist as ZIP.

### Request

```json
{
  "sessionId": "abc123",
  "selectedFinalist": {
    "brand": "Sensei",
    "brandColor": "#6366F1",
    "style": "dark",
    "backgroundTreatment": "brand-glow-editorial",
    "typographySystem": "editorial-sans-tight",
    "slides": []
  },
  "sizes": ["6.7", "6.1"]
}
```

### Success

Binary ZIP response with:

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="shotforge-{brand}.zip"`

### Error

| Code | Error | Reason |
|------|-------|--------|
| 404 | `SESSION_NOT_FOUND` | temp assets missing |
| 500 | `EXPORT_FAILED` | render or archive failed |

### Notes

- export must reflect current selected finalist state exactly
- same rendering config family as preview

## Versioning Rule

Breaking contract changes require:

1. explicit version bump in request payload where needed
2. DECISION_LOG update
3. canonical doc update
