import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateUploadedFile } from "./validation";

export const runtime = "nodejs";
const MAX_SESSION_BYTES = 40 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const sessionId = formData.get("sessionId");
  const files = formData.getAll("files") as File[];

  if (!sessionId || typeof sessionId !== "string")
    return NextResponse.json({ error: "MISSING_SESSION_ID" }, { status: 400 });
  if (!files.length)
    return NextResponse.json({ error: "NO_FILES" }, { status: 400 });

  const sessionDir = join(tmpdir(), sessionId);
  await mkdir(sessionDir, { recursive: true });

  const savedFilenames: string[] = [];
  let totalBytes = 0;

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateUploadedFile(buffer, file.name, file.type, file.size);
    if (!validation.valid)
      return NextResponse.json({ error: validation.error, filename: file.name }, { status: 400 });

    // TODO: replace /tmp with R2 for production
    totalBytes += file.size;
    if (totalBytes > MAX_SESSION_BYTES)
      return NextResponse.json({ error: "SESSION_TOO_LARGE" }, { status: 400 });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    await writeFile(join(sessionDir, safeName), buffer);
    savedFilenames.push(safeName);
  }

  return NextResponse.json({ filenames: savedFilenames });
}
