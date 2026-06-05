/**
 * Gemini Image Enhancement
 *
 * Uses gemini-2.0-flash-preview-image-generation to enhance scaffold images.
 * Takes a compose.py scaffold (text + device frame + screenshot) and polishes it
 * into a premium App Store screenshot.
 *
 * Model choice: gemini-2.0-flash-preview-image-generation supports image editing
 * (input image + text prompt → output image). Override via GEMINI_IMAGE_MODEL env.
 *
 * API key: GEMINI_API_KEY
 */

import { readFile, writeFile } from "node:fs/promises";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;
const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-preview-image-generation";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

interface GeminiEnhanceOptions {
  scaffoldPath: string;
  outputPath: string;
  brand: string;
  verb: string;
  desc: string;
  isFirstImage?: boolean;
  styleTemplatePath?: string;
}

export async function enhanceScaffold(opts: GeminiEnhanceOptions): Promise<string> {
  const {
    scaffoldPath,
    outputPath,
    brand,
    verb,
    desc,
    isFirstImage = false,
    styleTemplatePath,
  } = opts;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set. Cannot enhance with Gemini.");
  }

  const scaffoldBuffer = await readFile(scaffoldPath);
  const scaffoldBase64 = scaffoldBuffer.toString("base64");

  const parts: GeminiPart[] = [
    {
      inlineData: {
        mimeType: "image/png",
        data: scaffoldBase64,
      },
    },
  ];

  // If style template exists (not first image), add it for style consistency
  if (!isFirstImage && styleTemplatePath) {
    try {
      const templateBuffer = await readFile(styleTemplatePath);
      const templateBase64 = templateBuffer.toString("base64");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: templateBase64,
        },
      });
      parts.push({ text: buildStyleConsistencyPrompt(brand, verb, desc) });
    } catch {
      // Template not found — use single-image prompt
      parts.push({ text: buildEnhancementPrompt(brand, verb, desc) });
    }
  } else {
    parts.push({ text: buildEnhancementPrompt(brand, verb, desc) });
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "(no body)");
    throw new Error(`Gemini API error: ${response.status} — ${errText.slice(0, 300)}`);
  }

  const data = await response.json() as GeminiResponse;
  const responseParts = data.candidates?.[0]?.content?.parts ?? [];

  for (const part of responseParts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const imgBuffer = Buffer.from(part.inlineData.data, "base64");
      await writeFile(outputPath, imgBuffer);
      return outputPath;
    }
  }

  throw new Error("Gemini returned no image in response");
}

function buildEnhancementPrompt(brand: string, verb: string, desc: string): string {
  return `This is an App Store screenshot template for "${brand}".

Enhance it into a premium, high-converting App Store screenshot with these exact requirements:

CRITICAL — preserve exactly:
- The headline text "${verb}" must remain exactly as shown — same position, same size, same white color
- The subtitle text "${desc}" must remain exactly as shown — same position, same size, same white color
- The overall layout, composition, and proportions must stay identical

Enhance only the visual quality:
- Make the device frame look photorealistic — subtle titanium/glass reflections, soft edge lighting
- Add a gentle ambient glow behind the device that picks up the background color
- Deepen the background slightly — same color, richer depth, no gradients or patterns
- The device should appear to float with a soft drop shadow beneath it
- Keep the app screenshot inside the device frame exactly as shown

Style: premium Apple marketing aesthetic. Clean, minimal, confident. No decorative elements.
Output format: portrait 1290×2796 pixels.`;
}

function buildStyleConsistencyPrompt(brand: string, verb: string, desc: string): string {
  return `The first image is an App Store screenshot template for "${brand}" to enhance.
The second image is the style reference — match its visual treatment exactly (device rendering, glow, shadows, depth).

CRITICAL — preserve exactly in the output:
- The headline text "${verb}" — same position, size, white color
- The subtitle text "${desc}" — same position, size, white color

Apply the same visual style as the reference to this new template. Consistent device frame rendering, same glow intensity, same drop shadow depth, same overall premium aesthetic.

Output: portrait 1290×2796 pixels.`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface InlineData {
  mimeType: string;
  data: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: InlineData;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: InlineData;
      }>;
    };
  }>;
}
