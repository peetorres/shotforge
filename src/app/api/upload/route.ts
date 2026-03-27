/**
 * POST /api/upload
 *
 * Canonical: API_CONTRACTS.md, RULE-V01..V04, RULE-C03
 * RG-007: Invalid uploads must never be accepted
 */

import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdir, writeFile } from "node:fs/promises";
import { validateUploadedFile } from "./validation";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILES = 6;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }

  const sessionId = formData.get("sessionId") as string | null;
  if (!sessionId) {
    return NextResponse.json({ error: "MISSING_SESSION_ID" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (files.length === 0) {
    return NextResponse.json({ error: "NO_FILES" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "TOO_MANY_FILES" }, { status: 400 });
  }

  // RULE-V04: Check total size
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "SESSION_TOO_LARGE" }, { status: 400 });
  }

  const sessionDir = join(tmpdir(), sessionId);
  await mkdir(sessionDir, { recursive: true });

  const filenames: string[] = [];

  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await validateUploadedFile(buffer, file.name, file.type, file.size);

      if (!result.valid) {
        return NextResponse.json(
          { error: result.error, filename: file.name },
          { status: 400 },
        );
      }

      await writeFile(join(sessionDir, file.name), buffer);
      filenames.push(file.name);
    }

    return NextResponse.json({ filenames });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[upload] unexpected error:", detail);
    return NextResponse.json({ error: "UPLOAD_FAILED", detail }, { status: 500 });
  }
}
