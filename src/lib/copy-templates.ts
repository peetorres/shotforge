/**
 * Copy Templates — Conversion Narrative Engine
 *
 * NOT generic. Every line creates tension, curiosity, or identity.
 * Narrative: hook → problem → solution → mechanism → progress → identity
 *
 * Forbidden words: powerful, simple, clean, better, easy
 * Required: contrast, contradiction, specificity, transformation
 */

import type { GeneratedCopy, AppStyle } from "@/domain/types";

type SlideType = "hero" | "feature-single" | "feature-dual" | "detail" | "result" | "statement" | "contrast";

// ─── HOOK: Stop scrolling. Bold truth. ──────────

const HERO_COPY: Record<AppStyle, Omit<GeneratedCopy, "contentOrigin">> = {
  dark: { tagline: ["Stop settling.", "**Start shipping.**"], badgeText: "NEW", bullets: [] },
  light: { tagline: ["Less noise.", "**More done.**"], badgeText: "FEATURED", bullets: [] },
  bold: { tagline: ["Most people", "**quit here.**"], badgeText: "NEW", bullets: [] },
};

// ─── PROBLEM: "That's me." ──────────────────────

const STATEMENT_COPY: Record<AppStyle, { headline: string[]; subline: string }> = {
  dark: { headline: ["You're not stuck.", "You're **scattered.**"], subline: "There's a difference." },
  light: { headline: ["You know what", "**to do.**"], subline: "You just can't start." },
  bold: { headline: ["Everyone has", "a **plan.**"], subline: "Until Monday morning." },
};

// ─── SOLUTION: Introduce the system. ────────────

const FEATURE_COPY: Record<AppStyle, string[][]> = {
  dark: [["Fix what's", "**holding you back**"], ["See what", "**others miss**"]],
  light: [["Everything", "**where it should be**"], ["Works the way", "**you think**"]],
  bold: [["Built for people", "who **ship**"], ["Not another", "**dashboard**"]],
};

// ─── MECHANISM: Show quality. ───────────────────

const DETAIL_COPY: Record<AppStyle, string[][]> = {
  dark: [["Made with **intent**"]],
  light: [["Every pixel **considered**"]],
  bold: [["**Obsessively** crafted"]],
};

// ─── PROGRESS: Emotional payoff. ────────────────

const RESULT_COPY: Record<AppStyle, string[][]> = {
  dark: [["Finally,", "**it sticks**"]],
  light: [["The app they", "**come back to**"]],
  bold: [["Join the ones", "who **stayed**"]],
};

let featureIdx = 0;
let detailIdx = 0;
let resultIdx = 0;

export function getTemplateCopy(slideType: SlideType, style: AppStyle): GeneratedCopy {
  if (slideType === "hero") {
    return { ...HERO_COPY[style], contentOrigin: "template_fallback" };
  }

  if (slideType === "statement" || slideType === "contrast") {
    const s = STATEMENT_COPY[style];
    return { headline: s.headline, contentOrigin: "template_fallback" };
  }

  if (slideType === "detail") {
    const hl = DETAIL_COPY[style];
    const headline = hl[detailIdx % hl.length];
    detailIdx++;
    return { headline, contentOrigin: "template_fallback" };
  }

  if (slideType === "result") {
    const hl = RESULT_COPY[style];
    const headline = hl[resultIdx % hl.length];
    resultIdx++;
    return { headline, contentOrigin: "template_fallback" };
  }

  const hl = FEATURE_COPY[style];
  const headline = hl[featureIdx % hl.length];
  featureIdx++;
  return { headline, contentOrigin: "template_fallback" };
}

export function resetCopyIndices() {
  featureIdx = 0; detailIdx = 0; resultIdx = 0;
}
