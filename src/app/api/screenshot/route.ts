/**
 * GET /api/screenshot?sessionId=xxx&filename=yyy
 *
 * Serves raw uploaded screenshots from /tmp for CSS preview renderer.
 * Security: validates sessionId format and filename (no path traversal).
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const filename = req.nextUrl.searchParams.get("filename");

  if (!sessionId || !filename) {
    return NextResponse.json({ error: "MISSING_PARAMS" }, { status: 400 });
  }

  // Security: prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "INVALID_FILENAME" }, { status: 400 });
  }
  if (sessionId.includes("..") || sessionId.includes("/") || sessionId.includes("\\")) {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 400 });
  }

  const filePath = join(tmpdir(), sessionId, filename);

  try {
    const buffer = await readFile(filePath);
    const ext = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": ext,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
