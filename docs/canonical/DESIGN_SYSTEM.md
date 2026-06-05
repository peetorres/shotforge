# DESIGN SYSTEM — Shotforge V2

> Canonical visual language. Reference: `prototypes/shotforge-complete-flow.html`

## 1. Design Principles

| Principle | Meaning |
|-----------|---------|
| **Invisible complexity** | The product is complex; the interface is not. Hide orchestration. |
| **One thing at a time** | Each step has one job. Don't overwhelm. |
| **Real-time feedback** | Every edit shows its effect immediately. |
| **WYSIWYG** | Preview is truth. What you see is what you export. |
| **Dark-first** | The app is dark. The screenshots may be light. Don't confuse the two. |
| **Curated output** | Users should feel they are reviewing finalists, not raw attempts. |
| **Premium with signature** | Finalists should feel top-tier and intentionally differentiated, not cosmetically varied. |

## 2. Foundations

### 2.1 Colors

```css
/* ─── Background ─── */
--bg:        #09090b;    /* app background */
--surface:   #111113;    /* panels, cards */
--surface-2: #1c1c1e;    /* elevated surfaces */
--surface-3: #27272a;    /* interactive hover */
--surface-4: #3f3f46;    /* borders, scrollbars */

/* ─── Text ─── */
--text:      #fafafa;    /* primary */
--text-2:    #a1a1aa;    /* secondary */
--text-3:    #52525b;    /* tertiary */
--text-4:    #71717a;    /* disabled, hints */

/* ─── Accent ─── */
--indigo:    #6366f1;    /* primary action, selection */
--purple:    #8b5cf6;    /* gradients, brand */
--green:     #22c55e;    /* success, export, done */
--orange:    #f59e0b;    /* vivid variant tag */
--red:       #ef4444;    /* error, destructive */
--pink:      #ec4899;    /* gradient accent */
--blue:      #3b82f6;    /* info */
--cyan:      #06b6d4;    /* info variant */
```

### 2.2 Typography

| Use | Size | Weight | Tracking |
|-----|------|--------|----------|
| Hero heading | clamp(32px, 5vw, 56px) | 900 | -2px |
| Section heading | 18-28px | 800 | -1px |
| Body | 14-15px | 400 | 0 |
| Label | 11px | 600 | 0.5px uppercase |
| Caption/hint | 10-11px | 500 | 0 |
| Code/mono | 10px | 500 | 0 |

Font stack: `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif`

### 2.3 Spacing

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | icon gaps, tight padding |
| sm | 8px | form field spacing |
| md | 14-16px | section padding, card gaps |
| lg | 20-24px | page padding, panel padding |
| xl | 32-40px | section separation |
| 2xl | 48-80px | page-level vertical spacing |

### 2.4 Radius

| Token | Value | Use |
|-------|-------|-----|
| xs | 4-5px | tags, small badges |
| sm | 6-7px | buttons, inputs, nav tabs |
| md | 10-12px | cards, panels |
| lg | 14-16px | modals, large cards |
| xl | 20px | slide cards, major surfaces |
| pill | 100px | badges, hero CTA |
| device | 28-32px | main slide frame in canvas |

### 2.5 Borders

```css
--border-subtle:  1px solid rgba(255,255,255,0.04);  /* section separators */
--border-default: 1px solid rgba(255,255,255,0.06);  /* panels, cards */
--border-input:   1px solid rgba(255,255,255,0.08);  /* form inputs */
--border-selected: 2-3px solid var(--indigo);         /* selected items */
```

### 2.6 Elevation / Shadows

| Level | Shadow | Use |
|-------|--------|-----|
| 0 | none | flat surfaces |
| 1 | 0 8px 28px rgba(0,0,0,0.3) | slide cards |
| 2 | 0 16px 48px rgba(0,0,0,0.4) | hovered cards |
| 3 | 0 20px 60px rgba(0,0,0,0.5) | input card, modals |
| selected | 0 0 0 4px rgba(99,102,241,0.12) | selected items |

### 2.7 Motion

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| fast | 120ms | ease | hover states, toggles |
| normal | 200ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | transitions |
| smooth | 350ms | cubic-bezier(0.16, 1, 0.3, 1) | layout shifts, panel open/close |
| fade-up | 500ms | ease + 20px translateY | page entrance |

Reduced motion: respect `prefers-reduced-motion: reduce` — disable translateY, keep opacity.

### 2.8 Z-Index

| Layer | Value | Use |
|-------|-------|-----|
| base | 0 | content |
| card | 1 | elevated cards |
| sticky | 10 | sticky headers |
| panel | 20 | inspector panel |
| nav | 50 | top navigation |
| overlay | 100 | modals |
| toast | 200 | notifications |
| nav-fixed | 200 | fixed navbar |

## 3. Component States

Every interactive component must handle:

| State | Visual |
|-------|--------|
| default | base styling |
| hover | lighter surface, subtle transform |
| active/pressed | slight scale or color shift |
| focus | indigo ring (box-shadow: 0 0 0 3px rgba(99,102,241,0.12)) |
| selected | indigo border + subtle glow |
| disabled | 50% opacity, cursor: not-allowed |
| loading | spinner or skeleton |
| error | red border or red text |

## 4. Layout System

### 4.1 App Shell

```
┌──────────────────────────────────────────────┐
│  NavBar (48px, fixed top, full width)         │
├──────────────────────────────────────────────┤
│  Page Content (flex: 1, scrollable or fixed)  │
└──────────────────────────────────────────────┘
```

### 4.2 Preview / Edit Layout

```
┌──────────────────────────────────┬────────────┐
│  Ranked Preview Surface          │  Editor     │
│  finalist comparison + selected  │  (272px)    │
│  creative direction              │  inline     │
└──────────────────────────────────┴────────────┘
```

Edit mode lives inside the same surface. It must not feel like a separate product.

### 4.3 Slide Card Sizing (Refine)

```css
width: calc((100% - 5 * 14px) / 6);  /* 6 cards + 5 gaps */
min-width: 80px;
max-width: 200px;
aspect-ratio: 1290 / 2796;
```

### 4.4 Finalist Presentation

- Show Top 3 ranked finalists by default
- Additional finalists only appear if they are competitive and useful
- The selected finalist owns the main preview focus
- Comparison and editing share one visual shell

## 5. Component Catalog

### NavBar
- Height: 48px, fixed top
- Left: brand logo (gradient text)
- Center: step indicators (pill tabs)
- Right: action buttons (Preview, Export)
- Background: bg with blur backdrop

### DropZone
- Dashed border, 16px radius
- Hover: indigo border + subtle bg
- Drag active: indigo border + 6% indigo bg
- Shows icon + title + subtitle + constraint text

### ColorPicker
- Row of 36x36 swatches with 10px radius
- Selected: white border + subtle glow
- Supports custom color input

### Inspector
- 272px fixed right panel
- Surface background
- Accordion sections with icon + title + chevron
- Each section: header clickable, body toggleable

### SlideCard
- Rounded (20px radius)
- Number badge (top-left)
- Type badge (top-right)
- Selected: indigo border + elevation
- Contains: headline text + device mock + glow effect

### ExportBar
- Fixed bottom, 68px height
- Blur backdrop
- Shows: selected name + size badges + download button
- Enters from bottom with slide-up animation

## 6. AAA Visual Grammar

These rules are derived from premium App Store references and must guide both AI direction and deterministic rendering.

### 6.1 One thesis per slide

- Every slide must communicate one primary idea
- Headline, screenshot, and background must reinforce the same idea
- Balanced "everything matters equally" compositions are rejected

### 6.2 Hierarchy must be brutal

- Headline must be instantly readable
- Supporting text is optional and secondary
- Device or screenshot content must have a clearly assigned role: hero, proof, detail, or context
- If text and screenshot compete equally, the composition is wrong

### 6.3 Backgrounds support the message

- Backgrounds may be bold, atmospheric, minimal, or branded
- Backgrounds must never become the main subject unless the thesis explicitly demands it
- Backgrounds are built deterministically from brand and screenshot context

### 6.4 Typography is directional

- Headline typography carries mood and authority
- Typography must come from a curated library
- Tight tracking, strong weight, and short line lengths are preferred for premium impact
- Weak generic typography degrades the product immediately

### 6.5 Device role must be intentional

- The device can be dominant, framed proof, close detail, or absent
- Centering a device by default is not acceptable
- Crop, zoom, and alignment must be justified by the screenshot's strongest visual information

### 6.6 Sequencing matters

- Finalists must feel like deliberate App Store stories, not independent cards
- A strong sequence typically moves through hook, understanding, proof, utility, and close
- The first slide must establish the thesis decisively

### 6.7 Acceptable style families

The engine should be able to express at least these premium families:

- editorial dark
- bright branded system
- soft premium clarity
- campaign social energy

### 6.8 What to reject

- generic gradient plus centered phone layouts
- long headlines with weak hierarchy
- decorative backgrounds with no relationship to the app
- visual noise outside the focal message
- finalists that differ only by color palette
## 7. Anti-Patterns (Never Do)

- Never use light backgrounds for the app UI (only for screenshot content)
- Never use border-radius > 20px on cards (except device frame mock which uses 28-32px)
- Never use opacity < 0.4 for interactive elements
- Never animate width/height directly (use transform or grid-template)
- Never use box-shadow for borders (use actual borders)
- Never mix spacing scales (always use defined tokens)
- Never use color outside the defined palette
