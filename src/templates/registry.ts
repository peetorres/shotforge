/**
 * Template Registry — All available templates
 *
 * Adding a new template = import + register. No other code changes needed.
 */

import type { SlideTemplate } from "./types";
import { heroClassic } from "./hero/classic";
import { heroBold } from "./hero/bold";
import { heroMinimal } from "./hero/minimal";
import { featureCentered } from "./feature/centered";
import { featureAngled } from "./feature/angled";
import { featureDual } from "./feature/dual";

const ALL_TEMPLATES: SlideTemplate[] = [
  heroClassic,
  heroBold,
  heroMinimal,
  featureCentered,
  featureAngled,
  featureDual,
];

const TEMPLATE_MAP = new Map(ALL_TEMPLATES.map((t) => [t.id, t]));

export function getAllTemplates(): SlideTemplate[] {
  return ALL_TEMPLATES;
}

export function getTemplateById(id: string): SlideTemplate | null {
  return TEMPLATE_MAP.get(id) ?? null;
}

export function getTemplatesByCategory(category: string): SlideTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Assign templates to slides based on slide role and count.
 *
 * Rules:
 * - Slide 0: always a hero template (rotates between classic/bold/minimal per variant)
 * - Slides 1-4: feature templates (rotates centered/angled)
 * - Slide 5+: feature-dual ONLY if >= 6 screenshots AND last slide benefits from pair
 * - feature-dual never used for < 4 total screenshots
 */
export function assignTemplates(
  slideCount: number,
  variantIndex: number,
): string[] {
  const heroTemplates = ["hero-classic", "hero-bold", "hero-minimal"];
  const featureTemplates = ["feature-centered", "feature-angled"];

  const templateIds: string[] = [];

  // Hero: rotate based on variant index so each variant gets a different hero
  templateIds.push(heroTemplates[variantIndex % heroTemplates.length]);

  // Features: alternate between centered and angled
  for (let i = 1; i < slideCount; i++) {
    // Only use dual for the last slide if we have 6+ screenshots
    if (i === slideCount - 1 && slideCount >= 6 && i >= 4) {
      templateIds.push("feature-dual");
    } else {
      templateIds.push(featureTemplates[(i - 1) % featureTemplates.length]);
    }
  }

  return templateIds;
}
