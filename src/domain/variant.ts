/**
 * Variant Definitions & Factory — Conversion Engine
 *
 * NOT a screenshot generator. A conversion narrative builder.
 * Narrative: hook → problem → solution → mechanism → progress → identity
 */

import type { SlideConfig, HeroSlide, FeatureSingleSlide, DetailSlide, ResultSlide, StatementSlide, SlideRole } from "@appforge/screenshot-gen";
import type { Variant, VariantId, VariantDefinition } from "./types";

// Conversion narrative: hook → tension → solution → quality → reward → close
const NARRATIVE: SlideRole[] = ["hero", "statement", "feature", "detail", "result", "feature"];

export const VARIANT_DEFINITIONS: readonly VariantDefinition[] = [
  { id: "midnight", name: "Midnight", style: "dark", backgroundColor: "linear-gradient(160deg, #0D0D18, #1a1033)", textColor: "#FFFFFF" },
  { id: "clean", name: "Clean", style: "light", backgroundColor: "linear-gradient(160deg, #F5F5F7, #E8E8ED)", textColor: "#1D1D1F" },
  { id: "vivid", name: "Vivid", style: "bold", backgroundColor: "", textColor: "#FFFFFF" },
] as const;

// ─── Role-Specific Slide Builders ───────────────

function buildHero(filename: string, brand: string): HeroSlide {
  return { type: "hero", appName: brand, tagline: ["You don't need", "**motivation.**"], bullets: [], showStars: true, screenshot: filename };
}

function buildStatement(): StatementSlide {
  return { type: "statement", headline: ["You keep **starting.**"], subline: "Not finishing." };
}

function buildFeature(filename: string, angle: number): FeatureSingleSlide {
  return { type: "feature-single", headline: ["Structure beats", "**willpower**"], screenshot: filename, angle };
}

function buildDetail(filename: string): DetailSlide {
  return { type: "detail", headline: ["No friction."], screenshot: filename, cropRule: "focus" };
}

function buildResult(filename: string): ResultSlide {
  return { type: "result", headline: ["Day 30.", "**Still here.**"], screenshot: filename };
}

let featureNum = 0;

function buildForRole(role: SlideRole, filename: string | undefined, brand: string, angle: number): SlideConfig {
  switch (role) {
    case "hero": return buildHero(filename ?? "", brand);
    case "statement": return buildStatement();
    case "feature": {
      featureNum++;
      const a = featureNum % 2 === 0 ? angle : -angle;
      return buildFeature(filename ?? "", a);
    }
    case "detail": return buildDetail(filename ?? "");
    case "result": return buildResult(filename ?? "");
    case "contrast": return buildStatement(); // fallback
    default: return buildFeature(filename ?? "", 0);
  }
}

// ─── Per-Variant Angles ─────────────────────────

const ANGLES: Record<VariantId, number> = {
  midnight: 3,
  clean: 0,
  vivid: 10,
};

// ─── Factory ────────────────────────────────────

export function createVariants(
  filenames: string[],
  brand: string,
  brandColor: string,
): Record<VariantId, Variant> {
  const result = {} as Record<VariantId, Variant>;

  for (const def of VARIANT_DEFINITIONS) {
    const bg = def.id === "vivid"
      ? `linear-gradient(160deg, ${brandColor}33, ${brandColor}66, #0D0D18)`
      : def.backgroundColor;

    featureNum = 0;

    // Map narrative roles to available screenshots
    // Statement slides don't need a screenshot
    const slides: SlideConfig[] = [];
    let fileIdx = 0;

    for (let i = 0; i < Math.max(filenames.length, 6); i++) {
      if (i >= 6) break; // max 6 slides
      const role = NARRATIVE[i % NARRATIVE.length];
      const needsFile = role !== "statement" && role !== "contrast";
      const file = needsFile && fileIdx < filenames.length ? filenames[fileIdx++] : undefined;
      slides.push(buildForRole(role, file, brand, ANGLES[def.id]));
    }

    result[def.id] = { id: def.id, name: def.name, style: def.style, backgroundColor: bg, textColor: def.textColor, slides };
  }

  return result;
}
