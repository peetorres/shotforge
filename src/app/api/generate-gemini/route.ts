/**
 * POST /api/generate-gemini
 *
 * Gemini AI screenshot pipeline:
 * 1. Generate benefit headlines for each screenshot (OpenAI → fallback templates)
 * 2. For each screenshot: compose.py scaffold → Gemini enhancement
 * 3. Return image filenames (served via /api/screenshot)
 *
 * Session images saved to /tmp/{sessionId}_gemini/
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { buildScaffold } from "@/lib/scaffold-runner";
import { enhanceScaffold } from "@/lib/gemini-image";

export const runtime = "nodejs";
export const maxDuration = 120;

interface GenerateGeminiRequest {
  sessionId: string;
  filenames: string[];
  brand: string;
  description: string;
  brandColor: string;
}

export interface Benefit {
  verb: string;
  desc: string;
}

export interface GeneratedImage {
  index: number;
  filename: string;
  benefit: Benefit;
}

export async function POST(req: NextRequest) {
  let body: GenerateGeminiRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { sessionId, filenames, brand, description, brandColor } = body;

  if (!sessionId || !filenames?.length || !brand) {
    return NextResponse.json({ error: "MISSING_PARAMS" }, { status: 400 });
  }

  // Validate session directory exists
  const sessionDir = join(tmpdir(), sessionId);
  if (!existsSync(sessionDir)) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  // ── 1. Generate benefits ──────────────────────────────────────────────────
  const benefits = await generateBenefits(brand, description, filenames.length);

  // ── 2. Generate screenshots ───────────────────────────────────────────────
  const results: GeneratedImage[] = [];
  let styleTemplatePath: string | undefined;

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const benefit = benefits[i];

    try {
      // Step A: build scaffold with compose.py
      const scaffoldPath = await buildScaffold({
        sessionId,
        screenshotFilename: filename,
        bgHex: brandColor,
        verb: benefit.verb,
        desc: benefit.desc,
        index: i,
      });

      // Step B: enhance with Gemini
      const geminiOutputPath = join(tmpdir(), `${sessionId}_gemini`, `final_${i}.jpg`);
      await enhanceScaffold({
        scaffoldPath,
        outputPath: geminiOutputPath,
        brand,
        verb: benefit.verb,
        desc: benefit.desc,
        isFirstImage: i === 0,
        styleTemplatePath,
      });

      // First approved image becomes the style template for consistency
      if (i === 0) {
        styleTemplatePath = geminiOutputPath;
      }

      const resultFilename = `gemini_final_${i}.jpg`;
      // Symlink or rename so /api/screenshot can serve it from sessionDir
      const { symlink, unlink } = await import("node:fs/promises");
      const symlinkPath = join(tmpdir(), sessionId, resultFilename);
      try { await unlink(symlinkPath); } catch { /* ignore if not exists */ }
      await symlink(geminiOutputPath, symlinkPath);

      results.push({ index: i, filename: resultFilename, benefit });

      console.log(`[generate-gemini] ✓ ${i + 1}/${filenames.length} — ${benefit.verb} / ${benefit.desc}`);
    } catch (err) {
      console.error(`[generate-gemini] ✗ screenshot ${i} failed:`, err);
      return NextResponse.json(
        { error: "GENERATION_FAILED", detail: err instanceof Error ? err.message : String(err), index: i },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ images: results, brand, sessionId });
}

// ─── Benefit generation ───────────────────────────────────────────────────────

async function generateBenefits(
  brand: string,
  description: string,
  count: number,
): Promise<Benefit[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      return await generateBenefitsWithOpenAI(brand, description, count, openaiKey);
    } catch (err) {
      console.warn("[generate-gemini] OpenAI benefit generation failed, using fallback:", err);
    }
  }
  return generateFallbackBenefits(description, count);
}

async function generateBenefitsWithOpenAI(
  brand: string,
  description: string,
  count: number,
  apiKey: string,
): Promise<Benefit[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You generate high-converting App Store screenshot headlines. Be specific and action-oriented.",
        },
        {
          role: "user",
          content: `App: "${brand}"
Description: "${description}"

Generate exactly ${count} App Store screenshot benefit headlines.
Each headline has two parts:
- verb: single ALL-CAPS action word (MASTER, TRACK, EARN, BUILD, DISCOVER, etc.)
- desc: 2-5 ALL-CAPS words describing the specific user benefit (e.g. "BUSINESS SKILLS DAILY", "YOUR GOALS FASTER")

Rules:
- Each headline highlights a DIFFERENT aspect of the app
- Focus on user outcomes, not features
- Be specific — not "IMPROVE YOUR LIFE" but "TRAIN DECISION SKILLS DAILY"
- desc must fit on one line when rendered in large bold type

Return valid JSON only: {"benefits": [{"verb": "...", "desc": "..."}, ...]}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { benefits?: Benefit[] };

  if (!parsed.benefits?.length) throw new Error("No benefits in OpenAI response");
  return parsed.benefits.slice(0, count);
}

const FALLBACK_TEMPLATES: Benefit[] = [
  { verb: "MASTER", desc: "SKILLS THAT MATTER" },
  { verb: "TRACK", desc: "YOUR DAILY PROGRESS" },
  { verb: "EARN", desc: "REWARDS AS YOU LEARN" },
  { verb: "BUILD", desc: "HABITS THAT STICK" },
  { verb: "DISCOVER", desc: "NEW PATHS FORWARD" },
  { verb: "LEVEL UP", desc: "EVERY SINGLE DAY" },
];

function generateFallbackBenefits(description: string, count: number): Benefit[] {
  const templates = [...FALLBACK_TEMPLATES];

  // Simple keyword matching to pick more relevant templates
  const desc = description.toLowerCase();
  if (desc.includes("business") || desc.includes("work") || desc.includes("skills")) {
    templates[0] = { verb: "MASTER", desc: "BUSINESS SKILLS" };
  }
  if (desc.includes("learn") || desc.includes("education") || desc.includes("course")) {
    templates[1] = { verb: "LEARN", desc: "AT YOUR OWN PACE" };
  }
  if (desc.includes("habit") || desc.includes("daily") || desc.includes("streak")) {
    templates[2] = { verb: "BUILD", desc: "UNBREAKABLE HABITS" };
  }
  if (desc.includes("progress") || desc.includes("track") || desc.includes("goal")) {
    templates[3] = { verb: "TRACK", desc: "EVERY WIN" };
  }

  return templates.slice(0, count);
}
