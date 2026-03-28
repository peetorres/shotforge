/**
 * useGenerate — Generation Orchestration
 *
 * Calls POST /api/generate-copy for each slide × variant.
 * Falls back to template copy on ANY failure.
 * NEVER hangs — timeout after 8s per call.
 */

import type { GeneratedCopy, VariantId, AppStyle } from "@/domain/types";
import { VARIANT_DEFINITIONS } from "@/domain/variant";

interface GenerateOptions {
  filenames: string[];
  brand: string;
  description: string;
  brandColor: string;
  onProgress: (step: number) => void;
}

type GenerateResult = Record<VariantId, GeneratedCopy[]>;

const CALL_TIMEOUT = 8000; // 8s max per AI call

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Narrative role sequence for copy generation
const SLIDE_ROLES = ["hero", "feature-single", "detail", "feature-single", "result", "detail"] as const;

export async function generateAllVariants(opts: GenerateOptions): Promise<GenerateResult> {
  const { filenames, brand, description, onProgress } = opts;

  console.log("[generate] Starting generation for", filenames.length, "files");

  const result: GenerateResult = { midnight: [], clean: [], vivid: [] };

  onProgress(0); // Analyzing
  onProgress(1); // Writing copy

  for (let vi = 0; vi < VARIANT_DEFINITIONS.length; vi++) {
    const variant = VARIANT_DEFINITIONS[vi];
    onProgress(vi + 2);
    console.log(`[generate] [${vi + 1}/3] Generating copy for ${variant.name}`);

    const copySets: GeneratedCopy[] = [];

    for (let si = 0; si < filenames.length; si++) {
      const slideType = SLIDE_ROLES[si % SLIDE_ROLES.length];

      try {
        console.log(`[generate]   slide ${si + 1}/${filenames.length} (${slideType})`);

        const res = await fetchWithTimeout("/api/generate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand, description, slideType,
            screenshotFilename: filenames[si],
            style: variant.style as AppStyle,
            variantName: variant.name,
          }),
        }, CALL_TIMEOUT);

        if (res.ok) {
          const copy: GeneratedCopy = await res.json();
          copySets.push(copy);
          console.log(`[generate]   ✓ slide ${si + 1} copy received (${copy.contentOrigin})`);
        } else {
          console.warn(`[generate]   ✗ slide ${si + 1} API returned ${res.status}, using fallback`);
          copySets.push({ headline: ["**Feature** highlight"], contentOrigin: "template_fallback" });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[generate]   ✗ slide ${si + 1} failed: ${msg}, using fallback`);
        copySets.push({ headline: ["**Feature** highlight"], contentOrigin: "template_fallback" });
      }
    }

    result[variant.id] = copySets;
    console.log(`[generate] ✓ ${variant.name} complete (${copySets.length} slides)`);
  }

  console.log("[generate] All variants complete");
  return result;
}
