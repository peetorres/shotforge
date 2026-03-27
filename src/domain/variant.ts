/**
 * Variant Definitions & Factory
 *
 * Canonical source: SHOTFORGE_CANON.md §4
 * Creates the 3 fixed variants with initial slide sets.
 */

import type { SlideConfig, HeroSlide, FeatureSingleSlide } from "@appforge/screenshot-gen";
import type { Variant, VariantId, VariantDefinition } from "./types";

// ─── Variant Definitions (SHOTFORGE_CANON §4) ───

export const VARIANT_DEFINITIONS: readonly VariantDefinition[] = [
  {
    id: "midnight",
    name: "Midnight",
    style: "dark",
    backgroundColor: "linear-gradient(160deg, #0D0D18, #1a1033)",
    textColor: "#FFFFFF",
  },
  {
    id: "clean",
    name: "Clean",
    style: "light",
    backgroundColor: "linear-gradient(160deg, #F5F5F7, #E8E8ED)",
    textColor: "#1D1D1F",
  },
  {
    id: "vivid",
    name: "Vivid",
    style: "bold",
    backgroundColor: "", // set dynamically from brandColor
    textColor: "#FFFFFF",
  },
] as const;

// ─── Slide Builders ─────────────────────────────

function buildHeroSlide(filename: string, brand: string): HeroSlide {
  return {
    type: "hero",
    appName: brand,
    tagline: ["Your app, **elevated**"],
    bullets: ["Feature one", "Feature two", "Feature three", "Feature four"],
    showStars: true,
    screenshot: filename,
  };
}

function buildFeatureSingleSlide(filename: string): FeatureSingleSlide {
  return {
    type: "feature-single",
    headline: ["**Feature** headline"],
    screenshot: filename,
    angle: 0,
  };
}

function buildSlides(filenames: string[], brand: string): SlideConfig[] {
  return filenames.map((filename, index) =>
    index === 0
      ? buildHeroSlide(filename, brand)
      : buildFeatureSingleSlide(filename),
  );
}

// ─── Variant Factory (INV-001, INV-002, INV-008) ─

export function createVariants(
  filenames: string[],
  brand: string,
  brandColor: string,
): Record<VariantId, Variant> {
  const result = {} as Record<VariantId, Variant>;

  for (const def of VARIANT_DEFINITIONS) {
    const backgroundColor =
      def.id === "vivid"
        ? `linear-gradient(160deg, ${brandColor}33, ${brandColor}66, #0D0D18)`
        : def.backgroundColor;

    result[def.id] = {
      id: def.id,
      name: def.name,
      style: def.style,
      backgroundColor,
      textColor: def.textColor,
      slides: buildSlides(filenames, brand),
    };
  }

  return result;
}
