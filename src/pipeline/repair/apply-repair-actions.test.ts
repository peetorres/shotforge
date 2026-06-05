import { describe, expect, it } from "vitest";

import { computeSequenceScore } from "@/core/scoring";
import type { SequenceCandidate } from "@/domain/types";

import { applyRepairActions } from "./apply-repair-actions";

const candidate: SequenceCandidate = {
  id: "seed-vivid",
  briefId: "sess_repair",
  campaignBoardId: "board_repair",
  directionId: "dir_vivid",
  directionThesis: "campaign-first",
  style: "bold",
  orderedScreenshotIds: ["screen-1", "screen-2"],
  slides: [
    { type: "hero", appName: "Sensei", tagline: ["Build better habits"], screenshot: "screen-1.png" },
    { type: "feature-single", headline: ["Plan your next action"], screenshot: "screen-2.png" },
    { type: "detail", headline: ["Stay focused"], screenshot: "screen-2.png" },
    { type: "feature-single", headline: ["Keep momentum"], screenshot: "screen-2.png" },
  ],
  framePlans: [
    { index: 0, role: "hook", sequenceRole: "hero", screenshotId: "screen-1", energy: "elevated", visualWeight: "device-led", continuityCue: "open", preferredSide: "left", objective: "open" },
    { index: 1, role: "mechanism", sequenceRole: "feature", screenshotId: "screen-2", energy: "balanced", visualWeight: "balanced", continuityCue: "build", preferredSide: "right", objective: "explain" },
    { index: 2, role: "detail", sequenceRole: "detail", screenshotId: "screen-2", energy: "elevated", visualWeight: "immersive", continuityCue: "intensify", preferredSide: "left", objective: "zoom" },
    { index: 3, role: "payoff", sequenceRole: "close", screenshotId: "screen-2", energy: "elevated", visualWeight: "balanced", continuityCue: "resolve", preferredSide: "right", objective: "close" },
  ],
  layoutFamily: "editorial-single",
  typographyFamily: "display-sans",
  backgroundTreatment: "derived-gradient",
  focalCropProfile: "balanced-frame",
  overlayBehavior: "none",
  slideRoles: [
    { screenshotId: "screen-1", role: "hero" },
    { screenshotId: "screen-2", role: "feature" },
    { screenshotId: "screen-2", role: "close" },
  ],
};

describe("applyRepairActions", () => {
  it("moves rejected candidates closer to thesis-aligned composition defaults", () => {
    const [repaired] = applyRepairActions(
      [
        computeSequenceScore({
          candidate,
          scores: {
            premiumFeel: 0.6,
            hierarchyClarity: 0.64,
            screenshotFit: 0.61,
            distinctiveness: 0.68,
            narrativeCoherence: 0.58,
            textReadability: 0.7,
            brandFit: 0.62,
            conversionStrength: 0.55,
          },
          reasons: ["campaign-first direction lacks enough visual tension"],
        }),
      ],
      [
        {
          sequenceId: "seed-vivid",
          targets: ["layout", "crop", "background", "overlay", "typography"],
          instructions: "repair",
          priority: "high",
        },
      ],
    );

    expect(repaired?.layoutFamily).toBe("stacked-story");
    expect(repaired?.typographyFamily).toBe("editorial-serif");
    expect(repaired?.backgroundTreatment).toBe("soft-glow");
    expect(repaired?.overlayBehavior).toBe("edge-label");
    expect(repaired?.slides.some((slide) => "zoom" in slide && (slide.zoom ?? 1) > 1)).toBe(true);
  });
});
