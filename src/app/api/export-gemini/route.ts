/**
 * GET /api/export-gemini?sessionId=xxx
 *
 * Packages Gemini-generated screenshots as a ZIP file with all required
 * App Store sizes (6.7", 6.5", 6.9").
 *
 * Uses Sharp to resize the base 1290×2796 images to each target dimension.
 * All three sizes have nearly identical aspect ratios (~0.462), so resizing
 * looks correct without any cropping.
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readdir, readFile } from "node:fs/promises";
import archiver from "archiver";
import { PassThrough } from "node:stream";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

// App Store Connect required sizes (portrait)
const STORE_SIZES = [
  { label: "6.7in-1290x2796", w: 1290, h: 2796 },   // iPhone 15 Pro Max, 14 Plus, etc.
  { label: "6.9in-1320x2868", w: 1320, h: 2868 },   // iPhone 16 Pro Max (required if supported)
  { label: "6.5in-1242x2688", w: 1242, h: 2688 },   // iPhone 11 Pro Max (older devices)
] as const;

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId || sessionId.includes("..") || sessionId.includes("/")) {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 400 });
  }

  const geminiDir = join(tmpdir(), `${sessionId}_gemini`);

  // Find all final images
  let finalFiles: string[];
  try {
    const all = await readdir(geminiDir);
    finalFiles = all
      .filter((f) => f.startsWith("final_") && f.endsWith(".jpg"))
      .sort();
  } catch {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  if (finalFiles.length === 0) {
    return NextResponse.json({ error: "NO_IMAGES" }, { status: 404 });
  }

  // Build ZIP
  const passThrough = new PassThrough();
  const chunks: Buffer[] = [];
  passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));

  const endPromise = new Promise<void>((resolve, reject) => {
    passThrough.on("end", resolve);
    passThrough.on("error", reject);
  });

  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.pipe(passThrough);

  for (let i = 0; i < finalFiles.length; i++) {
    const srcPath = join(geminiDir, finalFiles[i]);
    const srcBuffer = await readFile(srcPath);
    const screenshotNum = String(i + 1).padStart(2, "0");

    for (const size of STORE_SIZES) {
      const resized = await sharp(srcBuffer)
        .resize(size.w, size.h, { fit: "fill" })
        .jpeg({ quality: 95 })
        .toBuffer();

      archive.append(resized, {
        name: `${size.label}/screenshot_${screenshotNum}.jpg`,
      });
    }
  }

  await archive.finalize();
  await endPromise;

  const zipBuffer = Buffer.concat(chunks);
  const brandSlug = sessionId.slice(0, 8);

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="lumo-screenshots-${brandSlug}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
