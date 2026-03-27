/**
 * POST /api/preview
 *
 * Canonical: API_CONTRACTS.md
 * INV-004: Uses same render engine as export (screenshot-gen)
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { access } from "node:fs/promises";
import sharp from "sharp";
import { composeSlide, OUTPUT_SIZES } from "@appforge/screenshot-gen";
import type { ResolvedConfig } from "@appforge/screenshot-gen";
import { resolveStyleColors } from "@/lib/style-colors";
import type { PreviewRequest } from "@/domain/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: PreviewRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { sessionId, slide, brand, brandColor, style, outputSize = "6.7" } = body;

  const screenshotsDir = join(tmpdir(), sessionId);
  try {
    await access(screenshotsDir);
  } catch {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  const targetSize = OUTPUT_SIZES.find((s) => s.suffix === outputSize);
  if (!targetSize) {
    return NextResponse.json({ error: "INVALID_SIZE" }, { status: 400 });
  }

  const colors = resolveStyleColors(style);

  // INV-004: Same config structure as export — only difference is preview resize
  const config: ResolvedConfig = {
    brand,
    brandColor,
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    font: "Inter",
    deviceModel: "iphone-15-pro-max",
    outputDir: screenshotsDir,
    screenshotsDir,
    outputSizes: [targetSize],
    slides: [slide],
  };

  try {
    const fullBuffer = await composeSlide(slide, config, targetSize);
    const previewBuffer = await sharp(fullBuffer)
      .resize({ width: Math.round(targetSize.width / 2) })
      .png()
      .toBuffer();
    return NextResponse.json({ image: previewBuffer.toString("base64") });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "RENDER_FAILED", detail }, { status: 500 });
  }
}
