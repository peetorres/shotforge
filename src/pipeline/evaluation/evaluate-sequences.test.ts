import { describe, expect, it } from "vitest";

import type { SequenceCandidate } from "@/domain/types";

import { evaluateSeedSequence } from "./evaluate-sequences";

const baseCandidate: SequenceCandidate = {
  id: "seed-clean",
  briefId: "sess_eval",
  campaignBoardId: "board_eval",
  directionId: "dir_clean",
  directionThesis: "clarity-first",
  style: "light",
  orderedScreenshotIds: ["screen-1", "screen-2", "screen-3"],
  slides: [
    { type: "hero", appName: "Sensei", tagline: ["Build better habits"], screenshot: "screen-1.png" },
    { type: "statement", headline: ["Stop relying on motivation"] },
    { type: "feature-single", headline: ["Plan your next action"], screenshot: "screen-2.png", layoutType: "device-left" },
    { type: "detail", headline: ["Stay focused"], screenshot: "screen-3.png", layoutType: "zoom-detail", zoom: 1.45 },
    { type: "result", headline: ["See real progress"], screenshot: "screen-3.png" },
    { type: "feature-single", headline: ["Finish with clarity"], screenshot: "screen-2.png", layoutType: "device-right" },
  ],
  framePlans: [
    {
      index: 0,
      role: "hook",
      sequenceRole: "hero",
      screenshotId: "screen-1",
      energy: "elevated",
      visualWeight: "device-led",
      continuityCue: "open",
      preferredSide: "left",
      objective: "open strong",
    },
    {
      index: 1,
      role: "tension",
      sequenceRole: "statement",
      energy: "quiet",
      visualWeight: "text-led",
      continuityCue: "pause",
      preferredSide: "center",
      objective: "name the pain",
    },
    {
      index: 2,
      role: "mechanism",
      sequenceRole: "feature",
      screenshotId: "screen-2",
      energy: "balanced",
      visualWeight: "balanced",
      continuityCue: "build",
      preferredSide: "right",
      objective: "show the loop",
    },
    {
      index: 3,
      role: "detail",
      sequenceRole: "detail",
      screenshotId: "screen-3",
      energy: "elevated",
      visualWeight: "immersive",
      continuityCue: "intensify",
      preferredSide: "left",
      objective: "zoom in",
    },
    {
      index: 4,
      role: "proof",
      sequenceRole: "proof",
      screenshotId: "screen-3",
      energy: "peak",
      visualWeight: "device-led",
      continuityCue: "intensify",
      preferredSide: "right",
      objective: "show proof",
    },
    {
      index: 5,
      role: "payoff",
      sequenceRole: "close",
      screenshotId: "screen-2",
      energy: "elevated",
      visualWeight: "balanced",
      continuityCue: "resolve",
      preferredSide: "left",
      objective: "close on reward",
    },
  ],
  layoutFamily: "editorial-single",
  typographyFamily: "display-sans",
  backgroundTreatment: "derived-gradient",
  focalCropProfile: "balanced-frame",
  overlayBehavior: "none",
  slideRoles: [
    { screenshotId: "screen-1", role: "hero" },
    { screenshotId: "screen-2", role: "feature" },
    { screenshotId: "screen-3", role: "detail" },
    { screenshotId: "screen-3", role: "close" },
  ],
};

describe("evaluateSeedSequence", () => {
  it("rewards candidates with strong narrative beats and decisive crop moments", () => {
    const scored = evaluateSeedSequence(baseCandidate, "clean");

    expect(scored.accepted).toBe(true);
    expect(scored.reasons).toContain("direction thesis and visual system are aligned");
    expect(scored.reasons).toContain("sequence includes at least one decisive crop moment");
    expect(scored.reasons).toContain("campaign board keeps a clear hook-to-payoff rhythm");
  });

  it("penalizes flat candidates that miss proof and zoom moments", () => {
    const scored = evaluateSeedSequence(
      {
        ...baseCandidate,
        id: "seed-vivid",
        directionId: "dir_vivid",
        directionThesis: "campaign-first",
        layoutFamily: "stacked-story",
        typographyFamily: "editorial-serif",
        backgroundTreatment: "soft-glow",
        overlayBehavior: "none",
        slides: [
          { type: "hero", appName: "Sensei", tagline: ["Build better habits"], screenshot: "screen-1.png" },
          { type: "feature-single", headline: ["Plan your next action"], screenshot: "screen-2.png" },
          { type: "feature-single", headline: ["Stay focused"], screenshot: "screen-3.png" },
          { type: "feature-single", headline: ["Keep momentum"], screenshot: "screen-2.png" },
        ],
        framePlans: [
          { ...baseCandidate.framePlans[0], screenshotId: "screen-1" },
          { ...baseCandidate.framePlans[1] },
          { ...baseCandidate.framePlans[2], screenshotId: "screen-2", visualWeight: "balanced" },
          { ...baseCandidate.framePlans[3], screenshotId: "screen-3", visualWeight: "balanced", preferredSide: "left" },
          { ...baseCandidate.framePlans[4], screenshotId: "screen-2", visualWeight: "balanced", preferredSide: "left" },
          { ...baseCandidate.framePlans[5], screenshotId: "screen-2", preferredSide: "left" },
        ],
        slideRoles: [
          { screenshotId: "screen-1", role: "hero" },
          { screenshotId: "screen-2", role: "feature" },
          { screenshotId: "screen-3", role: "close" },
        ],
      },
      "vivid",
    );

    expect(scored.reasons).toContain("missing a text-led tension or truth moment");
    expect(scored.reasons).toContain("missing a proof or outcome slide");
    expect(scored.reasons).toContain("sequence lacks a decisive crop or zoom moment");
    expect(scored.reasons).toContain("closing beat reuses the proof screen instead of creating a fresh payoff");
  });
});
