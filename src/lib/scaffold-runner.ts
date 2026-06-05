/**
 * Scaffold Runner — calls compose.py via Python subprocess
 *
 * compose.py lives in the ASO skill directory. It uses Pillow to composite:
 * - Background fill
 * - Bold headline text (verb + descriptor)
 * - iPhone device frame
 * - App screenshot inside the frame
 *
 * Output: 1290×2796 PNG at outputPath
 */

import { join } from "node:path";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";

const COMPOSE_SCRIPT = process.env.SCAFFOLD_SCRIPT_PATH
  ?? join(homedir(), ".claude", "skills", "aso-appstore-screenshots", "compose.py");

interface ScaffoldOptions {
  sessionId: string;
  screenshotFilename: string;
  bgHex: string;
  verb: string;
  desc: string;
  index: number;
}

export async function buildScaffold(opts: ScaffoldOptions): Promise<string> {
  const { sessionId, screenshotFilename, bgHex, verb, desc, index } = opts;

  const sessionDir = join(tmpdir(), sessionId);
  const geminiDir = join(tmpdir(), `${sessionId}_gemini`);
  await mkdir(geminiDir, { recursive: true });

  const screenshotPath = join(sessionDir, screenshotFilename);
  const outputPath = join(geminiDir, `scaffold_${index}.png`);

  await runPython([
    COMPOSE_SCRIPT,
    "--bg", bgHex,
    "--verb", verb,
    "--desc", desc,
    "--screenshot", screenshotPath,
    "--output", outputPath,
  ]);

  return outputPath;
}

function runPython(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", args, { timeout: 30_000 });
    const stderr: string[] = [];

    proc.stderr.on("data", (data: Buffer) => stderr.push(data.toString()));
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`compose.py failed (exit ${code}): ${stderr.join("")}`));
      }
    });
    proc.on("error", reject);
  });
}
