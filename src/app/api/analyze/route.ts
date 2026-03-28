/**
 * POST /api/analyze — AI Visual Director Pipeline
 *
 * Analyzes screenshots + product → returns structured slide plans.
 * Uses OpenAI for visual intelligence.
 * Falls back to deterministic defaults if AI unavailable.
 *
 * Layer 2 of the 3-layer pipeline:
 *   L1: Deterministic engine (always works)
 *   L2: AI analysis (this endpoint)
 *   L3: Resolution (merge AI plan into renderer)
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readFile } from "node:fs/promises";
import { analyzeProduct, analyzeScreenshot, generateSlidePlan } from "@/ai/visual-director";
import type { ScreenshotIntent, ProductUnderstanding, SlidePlan } from "@/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AnalyzeRequest {
  sessionId: string;
  brand: string;
  description: string;
  filenames: string[];
  variantStyle: "dark" | "light" | "bold";
}

interface AnalyzeResponse {
  productUnderstanding: ProductUnderstanding | null;
  screenshotIntents: (ScreenshotIntent | null)[];
  slidePlans: SlidePlan[] | null;
  aiUsed: boolean;
  timings: Record<string, number>;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { sessionId, brand, description, filenames, variantStyle } = body;
  const timings: Record<string, number> = {};
  const t0 = Date.now();

  // Step 1: Product understanding
  console.log("[analyze] Step 1: Product understanding");
  const productStart = Date.now();
  const productUnderstanding = await analyzeProduct(brand, description);
  timings.productAnalysis = Date.now() - productStart;
  console.log(`[analyze] Product analysis: ${timings.productAnalysis}ms, result: ${productUnderstanding ? "OK" : "FALLBACK"}`);

  // Step 2: Screenshot analysis (parallel)
  console.log("[analyze] Step 2: Analyzing", filenames.length, "screenshots");
  const screenshotStart = Date.now();
  const screenshotsDir = join(tmpdir(), sessionId);

  const screenshotIntents: (ScreenshotIntent | null)[] = await Promise.all(
    filenames.map(async (filename) => {
      try {
        const buffer = await readFile(join(screenshotsDir, filename));
        const base64 = buffer.toString("base64");
        return analyzeScreenshot(base64, brand, description);
      } catch (e) {
        console.warn(`[analyze] Failed to read ${filename}:`, e);
        return null;
      }
    }),
  );

  timings.screenshotAnalysis = Date.now() - screenshotStart;
  const analyzed = screenshotIntents.filter(Boolean).length;
  console.log(`[analyze] Screenshots: ${timings.screenshotAnalysis}ms, ${analyzed}/${filenames.length} analyzed`);

  // Step 3: Generate slide plan
  console.log("[analyze] Step 3: Generating slide plan");
  const planStart = Date.now();
  const slidePlans = await generateSlidePlan(brand, description, productUnderstanding, screenshotIntents, variantStyle);
  timings.slidePlanGeneration = Date.now() - planStart;
  console.log(`[analyze] Slide plan: ${timings.slidePlanGeneration}ms, result: ${slidePlans ? `${slidePlans.length} slides` : "FALLBACK"}`);

  timings.total = Date.now() - t0;
  console.log(`[analyze] Total: ${timings.total}ms`);

  const response: AnalyzeResponse = {
    productUnderstanding,
    screenshotIntents,
    slidePlans,
    aiUsed: !!(productUnderstanding || analyzed > 0 || slidePlans),
    timings,
  };

  return NextResponse.json(response);
}
