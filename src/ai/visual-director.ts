/**
 * Visual Director — AI-powered screenshot analysis + narrative planning
 *
 * Uses OpenAI Responses API with Structured Outputs.
 * AI is the director, deterministic engine is the renderer.
 * Graceful fallback: if AI fails, deterministic defaults take over.
 *
 * DEC: AI is visual director, not final renderer.
 */

import type {
  ScreenshotIntent,
  ProductUnderstanding,
  SlidePlan,
  VariantPlan,
} from "./schemas";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o"; // multimodal, structured outputs
const TIMEOUT = 15000;

// ─── Product Understanding ──────────────────────

export async function analyzeProduct(
  appName: string,
  description: string,
): Promise<ProductUnderstanding | null> {
  if (!OPENAI_API_KEY) {
    console.log("[ai] No OPENAI_API_KEY — skipping product analysis");
    return null;
  }

  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: "user",
          content: `Analyze this app for App Store screenshot marketing.

App name: ${appName}
Description: ${description}

Return a JSON object with:
- category: app category (e.g., "productivity", "education", "fitness")
- target_user: who uses this (specific, e.g., "founders who struggle with consistency")
- core_problem: the main pain point (specific, emotional)
- desired_outcome: what success looks like for the user
- tone: recommended marketing tone (e.g., "honest and confrontational", "warm and supportive")
- narrative_arc: array of 6 narrative steps from hook to identity`,
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_understanding",
            strict: true,
            schema: {
              type: "object",
              properties: {
                category: { type: "string" },
                target_user: { type: "string" },
                core_problem: { type: "string" },
                desired_outcome: { type: "string" },
                tone: { type: "string" },
                narrative_arc: { type: "array", items: { type: "string" } },
              },
              required: ["category", "target_user", "core_problem", "desired_outcome", "tone", "narrative_arc"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 500,
      }),
    }, TIMEOUT);

    if (!res.ok) {
      console.warn("[ai] Product analysis failed:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ProductUnderstanding;
  } catch (e) {
    console.warn("[ai] Product analysis error:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Screenshot Analysis ────────────────────────

export async function analyzeScreenshot(
  imageBase64: string,
  appName: string,
  description: string,
): Promise<ScreenshotIntent | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this app screenshot for App Store marketing.

App: ${appName}
Description: ${description}

Identify:
1. Screenshot type (dashboard/list/detail/progress/reward/onboarding/settings/unknown)
2. Primary focal area (where the eye goes)
3. Key visual element type
4. Best crop strategy for a phone mockup
5. Recommended prominence level (hero/support/detail)
6. Emotional reading
7. Best narrative role for this screen
8. Your confidence (0-1)
9. Up to 4 visual notes`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imageBase64}`, detail: "low" },
            },
          ],
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "screenshot_intent",
            strict: true,
            schema: {
              type: "object",
              properties: {
                screenshot_type: { type: "string", enum: ["dashboard", "list", "detail", "progress", "reward", "onboarding", "settings", "unknown"] },
                focal_area: { type: "string", enum: ["top", "upper-center", "center", "lower-center", "bottom"] },
                key_element: { type: "string", enum: ["chart", "progress-ring", "card", "avatar", "mascot", "button", "number", "text", "illustration", "mixed"] },
                crop_strategy: { type: "string", enum: ["top", "center", "focus-tight", "focus-wide", "full-bleed", "statement-no-device"] },
                prominence: { type: "string", enum: ["hero", "support", "detail"] },
                emotion: { type: "string", enum: ["calm", "intense", "playful", "disciplined", "rewarding", "technical", "premium", "cluttered"] },
                suggested_role: { type: "string", enum: ["hook", "problem", "solution", "mechanism", "progress", "reward", "identity"] },
                confidence: { type: "number" },
                visual_notes: { type: "array", items: { type: "string" } },
              },
              required: ["screenshot_type", "focal_area", "key_element", "crop_strategy", "prominence", "emotion", "suggested_role", "confidence", "visual_notes"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 400,
      }),
    }, TIMEOUT);

    if (!res.ok) {
      console.warn("[ai] Screenshot analysis failed:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ScreenshotIntent;
  } catch (e) {
    console.warn("[ai] Screenshot analysis error:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Slide Plan Generation ──────────────────────

export async function generateSlidePlan(
  appName: string,
  description: string,
  productUnderstanding: ProductUnderstanding | null,
  screenshotIntents: (ScreenshotIntent | null)[],
  variantStyle: "dark" | "light" | "bold",
): Promise<SlidePlan[] | null> {
  if (!OPENAI_API_KEY) return null;

  const intentSummary = screenshotIntents.map((intent, i) =>
    intent
      ? `Screenshot ${i + 1}: ${intent.screenshot_type} (${intent.emotion}), focal: ${intent.focal_area}, key: ${intent.key_element}, suggested: ${intent.suggested_role}`
      : `Screenshot ${i + 1}: not analyzed`,
  ).join("\n");

  const productContext = productUnderstanding
    ? `Target: ${productUnderstanding.target_user}\nProblem: ${productUnderstanding.core_problem}\nOutcome: ${productUnderstanding.desired_outcome}\nTone: ${productUnderstanding.tone}`
    : `App: ${appName}\nDescription: ${description}`;

  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: "user",
          content: `You are an App Store screenshot art director. Create a ${screenshotIntents.length}-slide plan for the "${variantStyle}" variant.

Product context:
${productContext}

Screenshot analysis:
${intentSummary}

Requirements:
- Headlines: max 6 words, use **bold** for 1 key word
- Avoid: powerful, simple, clean, better, easy
- Prefer: tension, recognition, transformation, identity
- Narrative: hook → problem → solution → mechanism → progress → identity
- Mix layouts: some text-only (statement), some device-dominant
- ${variantStyle === "dark" ? "Cinematic, confrontational" : variantStyle === "light" ? "Clear, empathetic" : "Bold, direct"} tone

Return an array of slide plans.`,
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "slide_plans",
            strict: true,
            schema: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      slide_role: { type: "string", enum: ["hook", "problem", "solution", "mechanism", "progress", "reward", "identity"] },
                      headline: { type: "string" },
                      subheadline: { type: ["string", "null"] },
                      layout_mode: { type: "string", enum: ["statement", "hero", "focus", "feature", "detail", "reward"] },
                      device_visibility: { type: "string", enum: ["none", "small", "medium", "large", "dominant"] },
                      device_alignment: { type: "string", enum: ["left", "center", "right", "offset-left", "offset-right"] },
                      device_rotation_deg: { type: "number" },
                      crop_strategy: { type: "string", enum: ["top", "center", "focus-tight", "focus-wide", "full-bleed"] },
                      background_style: { type: "string", enum: ["dark-glow", "soft-light", "brand-halo", "minimal-flat", "reward-burst"] },
                      accent_color_source: { type: "string", enum: ["brand", "screenshot-dominant", "reward-warm", "cool-ui"] },
                      visual_priority: { type: "string", enum: ["text-first", "balanced", "ui-first"] },
                    },
                    required: ["slide_role", "headline", "subheadline", "layout_mode", "device_visibility", "device_alignment", "device_rotation_deg", "crop_strategy", "background_style", "accent_color_source", "visual_priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["slides"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 2000,
      }),
    }, TIMEOUT);

    if (!res.ok) {
      console.warn("[ai] Slide plan generation failed:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return (parsed.slides ?? parsed) as SlidePlan[];
  } catch (e) {
    console.warn("[ai] Slide plan error:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Utility ────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
