/**
 * useGenerate — Generation Orchestration
 *
 * Canonical: RULE-G01..G07, STATE_MACHINE.md
 * RG-010: AI failure uses server-side fallback (API returns 200 with template)
 *
 * Calls POST /api/generate-copy for each slide × each variant.
 * The API itself handles fallback — this hook just orchestrates.
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

/**
 * Generate AI copy for all variants and slides.
 * Pure function (no React hooks) — testable without component context.
 */
export async function generateAllVariants(
  opts: GenerateOptions,
): Promise<GenerateResult> {
  const { filenames, brand, description, onProgress } = opts;

  const result: GenerateResult = {
    midnight: [],
    clean: [],
    vivid: [],
  };

  // Step 0: Analyzing
  onProgress(0);

  // Step 1: Writing copy
  onProgress(1);

  // Steps 2-4: Generate per variant
  for (let vi = 0; vi < VARIANT_DEFINITIONS.length; vi++) {
    const variant = VARIANT_DEFINITIONS[vi];
    onProgress(vi + 2);

    const copySets: GeneratedCopy[] = [];

    for (let si = 0; si < filenames.length; si++) {
      const slideType = si === 0 ? "hero" : "feature-single";

      try {
        const res = await fetch("/api/generate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand,
            description,
            slideType,
            screenshotFilename: filenames[si],
            style: variant.style as AppStyle,
            variantName: variant.name,
          }),
        });

        if (res.ok) {
          const copy: GeneratedCopy = await res.json();
          copySets.push(copy);
        } else {
          // API handles fallback internally, but if something truly fails
          copySets.push({
            headline: ["**Feature** highlight"],
            contentOrigin: "template_fallback",
          });
        }
      } catch {
        copySets.push({
          headline: ["**Feature** highlight"],
          contentOrigin: "template_fallback",
        });
      }
    }

    result[variant.id] = copySets;
  }

  return result;
}
