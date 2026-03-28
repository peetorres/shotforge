/**
 * Copy Templates — High-Conversion Psychological Copy
 *
 * Target: founders with inconsistent execution
 * Tone: honest, slightly confrontational, empowering
 * NOT motivational fluff. NOT generic SaaS.
 *
 * Narrative: ego disruption → pain → insight → system → progress → identity
 */

import type { GeneratedCopy, AppStyle } from "@/domain/types";

type SlideType = "hero" | "feature-single" | "feature-dual" | "detail" | "result" | "statement" | "contrast";

// ─── 1. EGO DISRUPTION (challenge belief) ───────

const HERO_COPY: Record<AppStyle, Omit<GeneratedCopy, "contentOrigin">> = {
  dark: { tagline: ["You don't need", "**motivation.**"], badgeText: "NEW", bullets: [] },
  light: { tagline: ["You already know", "**what to do.**"], badgeText: "FEATURED", bullets: [] },
  bold: { tagline: ["Your problem isn't", "**the idea.**"], badgeText: "NEW", bullets: [] },
};

// ─── 2. PAIN RECOGNITION (specific behavior) ────

const STATEMENT_COPY: Record<AppStyle, { headline: string[]; subline: string }> = {
  dark: { headline: ["You keep **starting.**"], subline: "Not finishing." },
  light: { headline: ["Another Monday.", "Another **plan.**"], subline: "Same result." },
  bold: { headline: ["You've read the books.", "**Nothing changed.**"], subline: "" },
};

// ─── 3+4. INSIGHT + SYSTEM (reframe + introduce) ─

const FEATURE_COPY: Record<AppStyle, string[][]> = {
  dark: [
    ["Structure beats", "**willpower**"],
    ["One habit.", "**Every day.**"],
  ],
  light: [
    ["Less deciding.", "**More doing.**"],
    ["The system", "**remembers.**"],
  ],
  bold: [
    ["Built for people", "who **start too much**"],
    ["Not a planner.", "**A system.**"],
  ],
};

// ─── MECHANISM (device-dominant, show the tool) ──

const DETAIL_COPY: Record<AppStyle, string[][]> = {
  dark: [["No friction."]],
  light: [["Just open it."]],
  bold: [["It **works.**"]],
};

// ─── 5. TANGIBLE PROGRESS (earned, specific) ─────

const RESULT_COPY: Record<AppStyle, string[][]> = {
  dark: [["Day 30.", "**Still here.**"]],
  light: [["12 week streak.", "**Your best.**"]],
  bold: [["+20 XP.", "**You showed up.**"]],
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
