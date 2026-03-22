import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { readFile, mkdir } from "node:fs/promises";
import archiver from "archiver";
import { PassThrough } from "node:stream";
import { generateScreenshots } from "@appforge/screenshot-gen";
import { resolveStyleColors } from "@/lib/style-colors";
import type { ExportRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: ExportRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  const { sessionId, projectState, sizes = ["6.7", "6.1"] } = body;

  // TODO: replace /tmp with R2 for production
  const screenshotsDir = join(tmpdir(), sessionId);
  if (!existsSync(screenshotsDir))
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });

  const outputDir = join(tmpdir(), `${sessionId}_export`);
  await mkdir(outputDir, { recursive: true });

  const colors = resolveStyleColors(projectState.style);

  try {
    const result = await generateScreenshots({
      brand: projectState.brand, brandColor: projectState.brandColor,
      backgroundColor: colors.backgroundColor, textColor: colors.textColor,
      font: "Inter", deviceModel: "iphone-15-pro-max",
      outputDir, screenshotsDir, outputSizes: sizes, slides: projectState.slides,
    });

    // Set up listeners BEFORE finalize() to avoid race condition
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];
    passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));
    const endPromise = new Promise<void>((resolve, reject) => {
      passThrough.on("end", resolve);
      passThrough.on("error", reject);
    });

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(passThrough);

    for (const filePath of result.files) {
      const fileBuffer = await readFile(filePath);
      const filename = filePath.split("/").pop()!;
      archive.append(fileBuffer, { name: filename });
    }

    await archive.finalize();
    await endPromise;

    const zipBuffer = Buffer.concat(chunks);
    const brandSlug = projectState.brand.toLowerCase().replace(/\s+/g, "-");

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="shotforge-${brandSlug}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[export] failed:", detail);
    return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });
  }
}
