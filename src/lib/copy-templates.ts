/**
 * Copy Templates — Fallback when AI is unavailable
 *
 * Canonical: SHOTFORGE_CANON.md RULE-G06
 * Each variant style gets tonally distinct copy.
 * Midnight = premium/confident, Clean = simple/clear, Bold = energetic/direct
 */

import type { GeneratedCopy, AppStyle } from "@/domain/types";

type SlideType = "hero" | "feature-single" | "feature-dual";

const HERO_TEMPLATES: Record<AppStyle, Omit<GeneratedCopy, "contentOrigin">> = {
  dark: {
    tagline: ["Your app,", "**elevated**"],
    badgeText: "NEW",
    bullets: ["Powerful features", "Beautiful design", "Lightning fast", "Always reliable"],
  },
  light: {
    tagline: ["Simple.", "**Powerful.** Yours."],
    badgeText: "FEATURED",
    bullets: ["Intuitive interface", "Seamless sync", "Smart insights", "Privacy first"],
  },
  bold: {
    tagline: ["**Bold**", "by design"],
    badgeText: "INTRODUCING",
    bullets: ["Stand out", "Move faster", "Think bigger", "Ship sooner"],
  },
};

const FEATURE_HEADLINES: Record<AppStyle, string[][]> = {
  dark: [
    ["**Powerful** at", "every step"],
    ["Built for", "**speed**"],
    ["**Designed** to", "delight"],
    ["Your data,", "**secured**"],
    ["**Smart**", "notifications"],
  ],
  light: [
    ["Everything in", "**one place**"],
    ["**Effortless**", "organization"],
    ["**Clean** and", "focused"],
    ["**Track** what", "matters"],
    ["Share with", "**anyone**"],
  ],
  bold: [
    ["**Break**", "the mold"],
    ["**Zero**", "compromises"],
    ["**Max**", "performance"],
    ["**Every** detail", "matters"],
    ["The **future**", "is here"],
  ],
};

let featureIndex = 0;

export function getTemplateCopy(slideType: SlideType, style: AppStyle): GeneratedCopy {
  if (slideType === "hero") {
    return {
      ...HERO_TEMPLATES[style],
      contentOrigin: "template_fallback",
    };
  }

  const headlines = FEATURE_HEADLINES[style];
  const headline = headlines[featureIndex % headlines.length];
  featureIndex++;

  return {
    headline,
    contentOrigin: "template_fallback",
  };
}

export function resetFeatureIndex() {
  featureIndex = 0;
}
