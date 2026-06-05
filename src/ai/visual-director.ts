/**
 * AI Creative Director — Visual Intelligence Engine
 *
 * NOT a helper. A creative director that produces non-templated
 * high-conversion visual compositions.
 *
 * Features:
 * - Risk levels: safe / bold / extreme
 * - Focal dominance rule (70% visual weight to ONE element)
 * - Reusable overlay library
 * - Composition variation enforcement
 * - Pre-render self-evaluation scores
 */

import type {
  AiScreenshotAnalysis,
  SlidePlan,
  ProductUnderstanding,
  ScreenshotIntent,
} from "./schemas";
import { CREATIVE_DIRECTOR_SCHEMA, SCREENSHOT_ANALYSIS_SCHEMA } from "./schemas";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o";
const TIMEOUT = 30000;

// ─── Overlay Library (reusable, named) ──────────

const OVERLAY_LIBRARY = `
Available overlay styles (use these names):
- glow-focus: soft radial glow behind key element
- soft-circle-highlight: subtle circular highlight on UI element
- directional-blur: motion blur suggesting depth/movement
- edge-fade: gradient fade at edges for cinematic framing
- depth-shadow: layered shadow for physical device feel
`;

// ─── System Prompt ──────────────────────────────

function buildSystemPrompt(riskLevel: string): string {
  const riskGuide = {
    safe: "Conservative layouts. Centered devices. Standard crops. Safe spacing. No overlap.",
    bold: "Strong variation. Dynamic angles. Smart crops. Asymmetric OK. Break patterns where beneficial. Default mode.",
    extreme: "Break rules aggressively. Device partially off-screen OK. Heavy zoom (1.5-2.0x). Text overlapping device OK. Radical asymmetry. Unexpected compositions.",
  }[riskLevel] || "bold";

  return `You are the AI Creative Director for a world-class App Store screenshot generator.

Your goal is to produce high-conversion visual compositions indistinguishable from top-performing App Store features.

RISK LEVEL: ${riskLevel.toUpperCase()}
${riskGuide}

INTELLIGENCE RULES:

1. FOCAL DOMINANCE — Each slide must have ONE dominant element that gets 70% of visual weight. Either text OR a UI element. NEVER split attention equally. Reject balanced layouts.

2. DETECT FOCAL POINT — For each screenshot, identify the SPECIFIC UI element that matters most (progress ring at 65% completion, streak counter showing 14 days, green CTA button). Never say "center of screen".

3. CROP IS MANDATORY — Every slide MUST have a defined crop strategy. "full" must be justified. Prefer "focus" or "zoom" for impact.

4. BREAK LAYOUT PATTERNS — You MUST include across 6 slides: 1 text-only, 1 heavy zoom, 1 rotated device, 1 minimal clean, 1 high-energy. Reject uniform plans.

5. HEADLINES — Max 6 words. No clichés. No "powerful/smart/easy". Use tension, recognition, transformation. Bold decisions only.

6. NARRATIVE — Hook → Problem → Solution → Proof → Reward → Close.

${OVERLAY_LIBRARY}

Use ONLY these named overlay styles. Do not invent new ones.

SELF-EVALUATION:
After generating slides, score your own output 1-10 on:
- visualImpact
- variation
- clarity
- conversionPotential

If any score < 7, internally revise before outputting.

Take bold decisions. Avoid safe outputs. Prefer strong, opinionated compositions.`;
}

// ─── Product Understanding ──────────────────────

export async function analyzeProduct(
  appName: string,
  description: string,
): Promise<ProductUnderstanding | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetchTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Analyze apps for high-conversion marketing. Be brutally specific about user pain." },
          { role: "user", content: `App: ${appName}\nDescription: ${description}\n\nReturn: category, target_user (extremely specific), core_problem (emotional pain), desired_outcome, tone, narrative_arc (6 steps)` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_understanding", strict: true,
            schema: {
              type: "object",
              properties: {
                category: { type: "string" }, target_user: { type: "string" },
                core_problem: { type: "string" }, desired_outcome: { type: "string" },
                tone: { type: "string" }, narrative_arc: { type: "array", items: { type: "string" } },
              },
              required: ["category", "target_user", "core_problem", "desired_outcome", "tone", "narrative_arc"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 500,
      }),
    }, 15000);
    if (!res.ok) return null;
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content ?? "null");
  } catch { return null; }
}

// ─── Screenshot Analysis (deprecated, creative director handles all) ─

export async function analyzeScreenshot(): Promise<ScreenshotIntent | null> {
  return null;
}

export async function analyzeScreenshots(
  appName: string,
  description: string,
  screenshotBase64s: string[],
): Promise<AiScreenshotAnalysis[] | null> {
  if (!OPENAI_API_KEY || screenshotBase64s.length === 0) return null;

  const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [
    {
      type: "text",
      text:
        `Analyze these app screenshots independently for creative planning.\n` +
        `App: ${appName}\nDescription: ${description}\n\n` +
        `Rules:\n` +
        `- Ignore file names and upload order as semantic signals.\n` +
        `- Use only what is visually present in each image.\n` +
        `- Detect whether each screenshot is better for hook, mechanism, detail, proof, or payoff moments.\n` +
        `- Return one analysis per screenshot using screenshotIndex to identify it.\n` +
        `- Focus on focal UI elements, proof signals, emotional signals, crop opportunities, safe text side, density, and hierarchy.\n`,
    },
    ...screenshotBase64s.map((base64) => ({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${base64}`, detail: "low" },
    })),
  ];

  try {
    const res = await fetchTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a multimodal creative strategist. Read each screenshot visually. Do not infer semantics from file names or order. Be concrete and precise.",
          },
          { role: "user", content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "screenshot_analysis", strict: true, schema: SCREENSHOT_ANALYSIS_SCHEMA },
        },
        max_tokens: 2200,
      }),
    }, TIMEOUT);

    if (!res.ok) {
      console.warn("[creative-director:screenshots] API:", res.status);
      return null;
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "null");
    return parsed?.screenshots ?? null;
  } catch (e) {
    console.warn("[creative-director:screenshots]", e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Creative Director: Full Slide Plan ─────────

export async function generateSlidePlan(
  appName: string,
  description: string,
  productUnderstanding: ProductUnderstanding | null,
  _intents: (ScreenshotIntent | null)[],
  variantStyle: "dark" | "light" | "bold",
  screenshotBase64s?: string[],
  riskLevel: string = "bold",
): Promise<SlidePlan[] | null> {
  if (!OPENAI_API_KEY) return null;

  const productContext = productUnderstanding
    ? `Target: ${productUnderstanding.target_user}\nProblem: ${productUnderstanding.core_problem}\nOutcome: ${productUnderstanding.desired_outcome}\nTone: ${productUnderstanding.tone}`
    : `App: ${appName}\nDescription: ${description}`;

  const styleGuide = {
    dark: "Cinematic. Dark gradients. Strong glow. Layered depth.",
    light: "Apple editorial. Soft backgrounds. Minimal effects. Content-forward.",
    bold: "Brand energy. Strong colors. Dynamic angles. High contrast.",
  }[variantStyle];

  const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [
    {
      type: "text",
      text: `Create ${screenshotBase64s?.length ?? 6} slides for "${appName}".

Product: ${productContext}
Style: ${variantStyle} — ${styleGuide}
Risk: ${riskLevel}
Screenshots: ${screenshotBase64s?.length ?? 0} attached

REQUIREMENTS:
- Crop is MANDATORY for every slide. "full" must be justified.
- At least 1 text-only (no device)
- At least 1 heavy zoom (1.3x+)
- At least 1 rotated device
- At least 1 minimal clean
- 70% visual weight to ONE dominant element per slide
- Use overlay library names only
- Self-evaluate: all scores must be ≥ 7`,
    },
  ];

  if (screenshotBase64s) {
    for (let i = 0; i < Math.min(screenshotBase64s.length, 6); i++) {
      content.push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${screenshotBase64s[i]}`, detail: "low" },
      });
    }
  }

  try {
    const res = await fetchTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(riskLevel) },
          { role: "user", content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "creative_output", strict: true, schema: CREATIVE_DIRECTOR_SCHEMA },
        },
        max_tokens: 3000,
      }),
    }, TIMEOUT);

    if (!res.ok) {
      console.warn("[creative-director] API:", res.status);
      return null;
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "null");
    if (!parsed?.slides) return null;

    // Log creative decisions
    console.log(`[creative-director] ${parsed.slides.length} slides (risk=${riskLevel})`);
    for (const s of parsed.slides) {
      const overlayNames = s.visual.overlays.map((o: { type: string }) => o.type).join(",");
      console.log(`  [${s.role}] "${s.headline}" layout=${s.composition.layoutType} device=${s.composition.device.visible ? `${s.composition.device.alignment}@${s.composition.device.rotation}°` : "NONE"} crop=${s.composition.crop.strategy}(${s.composition.crop.focalPoint}) zoom=${s.composition.crop.zoom}x depth=${s.visual.depth} overlays=[${overlayNames}]`);
    }

    return parsed.slides as SlidePlan[];
  } catch (e) {
    console.warn("[creative-director]", e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Utility ────────────────────────────────────

async function fetchTimeout(url: string, opts: RequestInit, ms: number): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); }
  finally { clearTimeout(t); }
}
