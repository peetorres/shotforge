/**
 * Copy Templates — Role-aware fallback when AI unavailable
 *
 * Canonical: SHOTFORGE_CANON.md RULE-G06
 * Each role × style gets distinct, tone-appropriate copy.
 */

import type { GeneratedCopy, AppStyle } from "@/domain/types";

type SlideType = "hero" | "feature-single" | "feature-dual" | "detail" | "result";

// ─── Role-Aware Headline Templates ──────────────

const HERO_COPY: Record<AppStyle, Omit<GeneratedCopy, "contentOrigin">> = {
  dark: { tagline: ["Your app,", "**elevated**"], badgeText: "NEW", bullets: [] },
  light: { tagline: ["Simple.", "**Powerful.**"], badgeText: "FEATURED", bullets: [] },
  bold: { tagline: ["**Bold**", "by design"], badgeText: "NEW", bullets: [] },
};

const FEATURE_COPY: Record<AppStyle, string[][]> = {
  dark: [["**Powerful** at", "every step"], ["Built for", "**speed**"], ["**Designed** to", "delight"]],
  light: [["Everything in", "**one place**"], ["**Effortless**", "organization"], ["**Clean** and", "focused"]],
  bold: [["**Break**", "the mold"], ["**Zero**", "compromises"], ["**Max**", "performance"]],
};

const DETAIL_COPY: Record<AppStyle, string[][]> = {
  dark: [["Clean **interface**"], ["**Thoughtful** design"], ["Every **pixel**"]],
  light: [["**Intuitive** layout"], ["**Clear** hierarchy"], ["Focused **view**"]],
  bold: [["Every **detail**"], ["**Refined** feel"], ["Pure **craft**"]],
};

const RESULT_COPY: Record<AppStyle, string[][]> = {
  dark: [["**Loved** by thousands"], ["**Trusted** daily"], ["Built to **last**"]],
  light: [["**Trusted** worldwide"], ["Users **love** it"], ["**5 stars**"]],
  bold: [["The **future**", "is here"], ["**Join** thousands"], ["**Made** for you"]],
};

let featureIdx = 0;
let detailIdx = 0;
let resultIdx = 0;

export function getTemplateCopy(slideType: SlideType, style: AppStyle): GeneratedCopy {
  if (slideType === "hero") {
    return { ...HERO_COPY[style], contentOrigin: "template_fallback" };
  }

  if (slideType === "detail") {
    const headlines = DETAIL_COPY[style];
    const headline = headlines[detailIdx % headlines.length];
    detailIdx++;
    return { headline, contentOrigin: "template_fallback" };
  }

  if (slideType === "result") {
    const headlines = RESULT_COPY[style];
    const headline = headlines[resultIdx % headlines.length];
    resultIdx++;
    return { headline, contentOrigin: "template_fallback" };
  }

  // feature-single, feature-dual
  const headlines = FEATURE_COPY[style];
  const headline = headlines[featureIdx % headlines.length];
  featureIdx++;
  return { headline, contentOrigin: "template_fallback" };
}

export function resetCopyIndices() {
  featureIdx = 0;
  detailIdx = 0;
  resultIdx = 0;
}
