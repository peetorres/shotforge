/**
 * POST /api/analyze — AI Creative Director Pipeline
 *
 * Sends screenshots + product info to Creative Director.
 * Returns rich composition plans with self-evaluation scores.
 * Falls back gracefully if AI unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readFile } from "node:fs/promises";
import { analyzeProduct, generateSlidePlan } from "@/ai/visual-director";
import type { SlidePlan } from "@/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AnalyzeRequest {
  sessionId: string;
  brand: string;
  description: string;
  filenames: string[];
  variantStyle: "dark" | "light" | "bold";
  riskLevel?: "safe" | "bold" | "extreme";
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  const { sessionId, brand, description, filenames, variantStyle, riskLevel = "bold" } = body;
  const timings: Record<string, number> = {};
  const t0 = Date.now();

  // Step 1: Product understanding
  console.log("[analyze] Step 1: Product understanding");
  const t1 = Date.now();
  const productUnderstanding = await analyzeProduct(brand, description);
  timings.productAnalysis = Date.now() - t1;

  // Step 2: Load screenshots
  console.log("[analyze] Step 2: Loading screenshots");
  const t2 = Date.now();
  const screenshotsDir = join(tmpdir(), sessionId);
  const base64s: string[] = [];
  for (const filename of filenames) {
    try {
      const buffer = await readFile(join(screenshotsDir, filename));
      base64s.push(buffer.toString("base64"));
    } catch { /* skip */ }
  }
  timings.screenshotLoad = Date.now() - t2;

  // Step 3: Creative Director
  console.log(`[analyze] Step 3: Creative Director (risk=${riskLevel})`);
  const t3 = Date.now();
  const slidePlans = await generateSlidePlan(
    brand, description, productUnderstanding, [],
    variantStyle, base64s.length > 0 ? base64s : undefined, riskLevel,
  );
  timings.creativePlan = Date.now() - t3;

  timings.total = Date.now() - t0;
  console.log(`[analyze] Total: ${timings.total}ms (product:${timings.productAnalysis}ms screenshots:${timings.screenshotLoad}ms creative:${timings.creativePlan}ms)`);

  return NextResponse.json({
    productUnderstanding,
    screenshotIntents: [],
    slidePlans,
    aiUsed: !!(slidePlans && slidePlans.length > 0),
    timings,
    riskLevel,
  });
}
