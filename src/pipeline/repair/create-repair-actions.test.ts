import { describe, expect, it } from "vitest";

import { computeSequenceScore } from "@/core/scoring";
import type { SequenceCandidate } from "@/domain/types";

import { createRepairActions } from "./create-repair-actions";

const candidate: SequenceCandidate = {
  id: "seed-problem",
  briefId: "sess_repair",
  campaignBoardId: "board_problem",
  directionId: "dir_problem",
  directionThesis: "campaign-first",
  style: "bold",
  orderedScreenshotIds: ["screen-1"],
  slides: [{ type: "hero", appName: "Sensei", tagline: ["Build better habits"], screenshot: "screen-1.png" }],
  framePlans: [
    { index: 0, role: "hook", sequenceRole: "hero", screenshotId: "screen-1", energy: "elevated", visualWeight: "device-led", continuityCue: "open", preferredSide: "left", objective: "open" },
  ],
  layoutFamily: "stacked-story",
  typographyFamily: "editorial-serif",
  backgroundTreatment: "soft-glow",
  focalCropProfile: "detail-closeup",
  overlayBehavior: "none",
  slideRoles: [{ screenshotId: "screen-1", role: "hero" }],
};

describe("createRepairActions", () => {
  it("targets the right subsystems based on evaluator reasons", () => {
    const repairs = createRepairActions([
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
        reasons: [
          "missing a proof or outcome slide",
          "sequence lacks a decisive crop or zoom moment",
          "campaign-first direction lacks enough visual tension",
        ],
      }),
    ]);

    expect(repairs).toHaveLength(1);
    expect(repairs[0]?.targets).toEqual(
      expect.arrayContaining(["screenshot", "crop", "background", "overlay", "layout"]),
    );
    expect(repairs[0]?.priority).toBe("medium");
  });
});
