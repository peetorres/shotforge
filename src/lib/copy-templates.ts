/**
 * Copy Templates — Conversion-driven storytelling
 *
 * NOT generic design system output.
 * Each headline must create tension, curiosity, or desire.
 * Narrative: hook → understand → desire → reward
 *
 * RULE-G06: Fallback when AI unavailable.
 */

import type { GeneratedCopy, AppStyle } from "@/domain/types";

type SlideType = "hero" | "feature-single" | "feature-dual" | "detail" | "result";

// ─── HERO: Must hook attention. Bold statement. Stop scrolling. ──

const HERO_COPY: Record<AppStyle, Omit<GeneratedCopy, "contentOrigin">> = {
  dark: {
    tagline: ["Stop settling.", "**Start shipping.**"],
    badgeText: "NEW",
    bullets: [],
  },
  light: {
    tagline: ["Less noise.", "**More clarity.**"],
    badgeText: "FEATURED",
    bullets: [],
  },
  bold: {
    tagline: ["Most people", "**quit here.**"],
    badgeText: "NEW",
    bullets: [],
  },
};

// ─── FEATURE: Create understanding. Specific benefit. ──

const FEATURE_COPY: Record<AppStyle, string[][]> = {
  dark: [
    ["Fix what's", "**holding you back**"],
    ["See what", "**others miss**"],
    ["Skip the", "**learning curve**"],
  ],
  light: [
    ["Everything", "**where it should be**"],
    ["No more", "**searching for it**"],
    ["Works the way", "**you think**"],
  ],
  bold: [
    ["Built for people", "who **ship**"],
    ["Not another", "**dashboard**"],
    ["Do more with", "**less effort**"],
  ],
};

// ─── DETAIL: Show quality. Imply craft. Minimal. ──

const DETAIL_COPY: Record<AppStyle, string[][]> = {
  dark: [["Made with **intent**"]],
  light: [["Every pixel **considered**"]],
  bold: [["**Obsessively** crafted"]],
};

// ─── RESULT: Emotional payoff. Social proof. Reward. ──

const RESULT_COPY: Record<AppStyle, string[][]> = {
  dark: [
    ["Finally,", "**it sticks**"],
    ["People don't", "**just use it**"],
  ],
  light: [
    ["The app they", "**come back to**"],
    ["4.9★ for", "**a reason**"],
  ],
  bold: [
    ["Join the ones", "who **stayed**"],
    ["They tried", "**everything else**"],
  ],
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
