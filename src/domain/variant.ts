/**
 * Variant Definitions & Factory
 *
 * Canonical: SHOTFORGE_CANON.md §4
 * Narrative sequence: hero → feature → detail → feature → result → detail
 * Each variant is a distinct creative direction, not just a color swap.
 */

import type { SlideConfig, HeroSlide, FeatureSingleSlide, DetailSlide, ResultSlide, SlideRole } from "@appforge/screenshot-gen";
import type { Variant, VariantId, VariantDefinition } from "./types";

// Narrative sequence (mirrors NARRATIVE_SEQUENCE in screenshot-gen, inlined to avoid client bundle bloat)
const NARRATIVE: SlideRole[] = ["hero", "feature", "detail", "feature", "result", "detail"];

// ─── Variant Definitions ────────────────────────

export const VARIANT_DEFINITIONS: readonly VariantDefinition[] = [
  { id: "midnight", name: "Midnight", style: "dark", backgroundColor: "linear-gradient(160deg, #0D0D18, #1a1033)", textColor: "#FFFFFF" },
  { id: "clean", name: "Clean", style: "light", backgroundColor: "linear-gradient(160deg, #F5F5F7, #E8E8ED)", textColor: "#1D1D1F" },
  { id: "vivid", name: "Vivid", style: "bold", backgroundColor: "", textColor: "#FFFFFF" },
] as const;

// ─── Role-Aware Slide Builders ──────────────────

function buildHeroSlide(filename: string, brand: string): HeroSlide {
  return {
    type: "hero",
    appName: brand,
    tagline: ["Stop settling.", "**Start shipping.**"],
    bullets: [],
    showStars: true,
    screenshot: filename,
  };
}

function buildFeatureSlide(filename: string, angle: number = 5): FeatureSingleSlide {
  return {
    type: "feature-single",
    headline: ["Fix what's", "**holding you back**"],
    screenshot: filename,
    angle,
  };
}

function buildDetailSlide(filename: string): DetailSlide {
  return {
    type: "detail",
    headline: ["Made with **intent**"],
    screenshot: filename,
    cropRule: "focus",
  };
}

function buildResultSlide(filename: string): ResultSlide {
  return {
    type: "result",
    headline: ["Finally,", "**it sticks**"],
    screenshot: filename,
  };
}

let featureCounter = 0;

function buildSlideForRole(role: SlideRole, filename: string, brand: string, variantAngle: number): SlideConfig {
  switch (role) {
    case "hero": return buildHeroSlide(filename, brand);
    case "feature": {
      // Alternate angle direction for visual variety
      featureCounter++;
      const angle = featureCounter % 2 === 0 ? variantAngle : -variantAngle;
      return buildFeatureSlide(filename, angle);
    }
    case "detail": return buildDetailSlide(filename);
    case "result": return buildResultSlide(filename);
  }
}

// ─── Narrative Slide Sequence ───────────────────

function buildNarrativeSlides(filenames: string[], brand: string, variantAngle: number): SlideConfig[] {
  featureCounter = 0;
  return filenames.map((filename, index) => {
    const role = NARRATIVE[index % NARRATIVE.length];
    return buildSlideForRole(role, filename, brand, variantAngle);
  });
}

// ─── Per-Variant Feature Angles ─────────────────
// Each variant has distinct composition feel

const VARIANT_ANGLES: Record<VariantId, number> = {
  midnight: 3,    // Cinematic precision — very subtle tilt
  clean: 0,       // Apple editorial — perfectly straight
  vivid: 10,      // Brand energy — dynamic angle
};

// ─── Variant Factory ────────────────────────────

export function createVariants(
  filenames: string[],
  brand: string,
  brandColor: string,
): Record<VariantId, Variant> {
  const result = {} as Record<VariantId, Variant>;

  for (const def of VARIANT_DEFINITIONS) {
    const backgroundColor = def.id === "vivid"
      ? `linear-gradient(160deg, ${brandColor}33, ${brandColor}66, #0D0D18)`
      : def.backgroundColor;

    result[def.id] = {
      id: def.id,
      name: def.name,
      style: def.style,
      backgroundColor,
      textColor: def.textColor,
      slides: buildNarrativeSlides(filenames, brand, VARIANT_ANGLES[def.id]),
    };
  }

  return result;
}
