import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { GenerateCopyRequest, GeneratedCopy } from "@/lib/types";

export const runtime = "nodejs";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
Visual style: ${req.style}

${fieldGuide}

Rules:
- Keep headlines short (3-6 words per line max)
- Focus on benefit, not feature
- **bold** = brand color highlight, use sparingly (1 word per line)
- Return ONLY valid JSON, no markdown code fences`;
}

export async function POST(req: NextRequest) {
  let body: GenerateCopyRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  let text: string;
  try {
    const result = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: buildPrompt(body),
      maxTokens: 256,
    });
    text = result.text;
  } catch (error) {
    console.error("[generate-copy] AI call failed:", error);
    return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }

  try {
    const copy = JSON.parse(text) as GeneratedCopy;
    return NextResponse.json(copy);
  } catch (error) {
    console.error("[generate-copy] JSON parse failed, raw text:", text);
    return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
