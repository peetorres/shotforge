/**
 * POST /api/generate-copy
 *
 * Canonical: API_CONTRACTS.md, RULE-G04, RULE-G06
 * RG-010: Returns 200 with fallback copy when AI unavailable — NEVER blocks user
 */

import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { getTemplateCopy } from "@/lib/copy-templates";
import type { GenerateCopyRequest, GeneratedCopy, AppStyle } from "@/domain/types";

export const runtime = "nodejs";

function buildPrompt(req: GenerateCopyRequest): string {
  const screenHint = req.screenshotFilename
    ? req.screenshotFilename.replace(/\.(png|jpg|jpeg)$/i, "").replace(/[-_]/g, " ")
    : "app screen";

  const fieldGuide = req.slideType === "hero"
    ? `Return JSON with: tagline (array of 1-2 short strings), badgeText (1 short uppercase phrase), bullets (array of 4 concise feature bullets). Use **bold** markdown around 1 key word per tagline line.`
    : `Return JSON with: headline (array of 1-2 short strings). Use **bold** markdown around 1 key word.`;

  return `You are an App Store copywriter. Write punchy, benefit-focused copy for the "${screenHint}" screen.

App name: ${req.brand}
App description: ${req.description}
Slide type: ${req.slideType}
Visual style: ${req.style} (variant: ${req.variantName})

${fieldGuide}

Rules:
- Keep headlines short (3-6 words per line max)
- Focus on benefit, not feature
- **bold** = brand color highlight, use sparingly (1 word per line)
- Return ONLY valid JSON, no markdown code fences`;
}

export async function POST(req: NextRequest) {
  let body: GenerateCopyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const slideType = body.slideType as "hero" | "feature-single" | "feature-dual";
  const style = (body.style || "dark") as AppStyle;

  // Attempt AI generation
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: buildPrompt(body),
      maxTokens: 256,
    });

    const parsed = JSON.parse(result.text) as Omit<GeneratedCopy, "contentOrigin">;
    return NextResponse.json({
      ...parsed,
      contentOrigin: "generated_by_ai",
    });
  } catch {
    // RULE-G06, RG-010: Fallback — return template copy, HTTP 200
    const fallback = getTemplateCopy(slideType, style);
    return NextResponse.json(fallback);
  }
}
