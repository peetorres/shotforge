# PERSISTENCE AND RESTORE — Shotforge V2

## 1. Session Lifecycle

```
Create Session → Persist on Every Mutation → Restore on Page Load → Validate → Resume or Reset
```

### Session ID
- Generated: `nanoid()` at Create step
- Format: 21-char alphanumeric
- Used for: localStorage key, /tmp directory name, URL parameter

### Session Duration
- localStorage: survives browser restart (no TTL)
- /tmp files: survive until server restart (ephemeral)
- No server-side session persistence in V2

## 2. Autosave

### Strategy: Save on every mutation

Zustand `persist` middleware handles this automatically.

```typescript
persist(storeCreator, {
  name: "shotforge-v2",
  version: 1,
  partialize: (state) => ({
    project: state.project,           // full project with variants
    activeSlideIndex: state.activeSlideIndex,
  }),
})
```

### What IS persisted
- Project metadata (brand, description, brandColor)
- All 3 variants with all slides
- Selected variant ID
- Active slide index
- Current step
- Session ID

### What is NOT persisted
- isExporting, isGenerating (UI transient state)
- previewMode (always starts as false)
- generationProgress (always starts at 0)
- Preview images (re-fetched from API)

## 3. Restore Flow

### On Page Load (any route)

```
1. Zustand persist middleware rehydrates from localStorage
2. Wait for hydration to complete (onFinishHydration callback)
3. Validate stored data:
   a. Does project exist?
   b. Does project.sessionId match URL parameter?
   c. Is schema version compatible?
   d. Are required fields present?
   e. Do variants exist with correct structure?
4. If valid → resume at stored step
5. If invalid → clear localStorage, redirect to /create
```

### Hydration Guard (Critical)

```typescript
// Every page must wait for hydration before rendering or redirecting
const [hydrated, setHydrated] = useState(false)
useEffect(() => {
  const unsub = useStore.persist.onFinishHydration(() => setHydrated(true))
  if (useStore.persist.hasHydrated()) setHydrated(true)
  return unsub
}, [])

if (!hydrated) return <LoadingScreen />
```

## 4. Schema Versioning

### Current Version: 1

```typescript
{
  name: "shotforge-v2",
  version: 1,
}
```

### Migration Strategy

When schema changes in future versions:

```typescript
migrate: (persisted, version) => {
  if (version === 1) {
    // Transform v1 data to v2 shape
    return migrateV1toV2(persisted)
  }
  return persisted
},
```

### Incompatible Schema

If migration is not possible (too old or corrupted):
- Clear localStorage
- Redirect to /create
- Log to console: "Session incompatible, starting fresh"

## 5. Edge Cases

### Browser Refresh During Generation
- State: `step === "generating"`, `generationProgress > 0`
- Behavior: Restore to `step === "uploaded"` (pre-generation)
- Rationale: /tmp files exist but variants are incomplete
- User sees: Create page with data pre-filled, "Generate" button ready

### Direct URL Access (Deep Link)

| URL | Session Exists | Action |
|-----|---------------|--------|
| /create | any | Show create form (pre-fill if session exists) |
| /generate/[id] | matching | Resume generation |
| /generate/[id] | missing/mismatch | Redirect to /create |
| /choose/[id] | matching + generated | Show choose gallery |
| /choose/[id] | missing or not generated | Redirect to /create |
| /refine/[id] | matching + variant selected | Show refine editor |
| /refine/[id] | missing or no variant | Redirect to /create |

### localStorage Full
- Zustand persist silently fails
- User can still use the app (state in memory)
- Export still works (server-side)
- Preview still works (API-based)

### Multiple Tabs
- Last-write-wins (no cross-tab sync in V2)
- Acceptable: single-user, single-session product

## 6. Recovery Strategies

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Corrupted JSON in localStorage | JSON.parse throws | Clear + redirect |
| Missing required fields | Schema validation | Clear + redirect |
| Wrong schema version | version mismatch | Attempt migration, else clear |
| /tmp files missing (server restart) | 404 on preview/export | Show "session expired" message, keep client state, offer re-upload |
| Partial variant data | variant missing slides | Clear + redirect |

## 7. Data Integrity Checks

On restore, validate:

```typescript
function validateSession(data: unknown): data is PersistedState {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (!d.project || typeof d.project !== 'object') return false
  const p = d.project as Record<string, unknown>

  // Required fields
  if (typeof p.sessionId !== 'string') return false
  if (typeof p.brand !== 'string') return false
  if (!p.variants || typeof p.variants !== 'object') return false

  // Variant structure
  const variants = p.variants as Record<string, unknown>
  for (const id of ['midnight', 'clean', 'vivid']) {
    const v = variants[id] as Record<string, unknown> | undefined
    if (!v) return false
    if (!Array.isArray(v.slides)) return false
  }

  return true
}
```
