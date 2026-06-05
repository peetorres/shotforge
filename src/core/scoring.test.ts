import { describe, expect, it } from "vitest";

import {
  AAA_THRESHOLD,
  MIN_TOP3_DISTANCE,
  PREMIUM_ACCEPTABLE_THRESHOLD,
  SCORE_DIMENSIONS,
  SCORING_VERSION,
  buildFinalist,
  computeSequenceScore,
  createFinalistSetFromRanked,
  type SequenceCandidate,
  type SequenceScoreInput,
  rankFinalists,
} from "./scoring";

const baseCandidate: SequenceCandidate = {
  id: "seq_1",
  briefId: "sess_123",
  campaignBoardId: "board_1",
  directionId: "dir_1",
  directionThesis: "clarity-first",
  style: "dark",
  orderedScreenshotIds: ["shot_1"],
  slides: [{ type: "hero", file: "screen-1.png" }],
  framePlans: [
    {
      index: 0,
      role: "hook",
      sequenceRole: "hero",
      screenshotId: "shot_1",
      energy: "elevated",
      visualWeight: "device-led",
      continuityCue: "open",
      preferredSide: "left",
      objective: "open strong",
    },
  ],
  layoutFamily: "editorial-single",
  typographyFamily: "display-sans",
  backgroundTreatment: "derived-gradient",
  focalCropProfile: "tight-hero",
  overlayBehavior: "subtle-glass",
  slideRoles: [{ screenshotId: "shot_1", role: "hero" }],
};

describe("scoring constants", () => {
  it("publishes the premium engine thresholds", () => {
    expect(AAA_THRESHOLD).toBe(0.85);
    expect(PREMIUM_ACCEPTABLE_THRESHOLD).toBe(0.72);
    expect(MIN_TOP3_DISTANCE).toBe(0.18);
    expect(SCORING_VERSION).toBe("v1-premium-engine");
  });

  it("publishes the weighted score dimensions", () => {
    expect(SCORE_DIMENSIONS).toEqual([
      { key: "premiumFeel", weight: 0.2 },
      { key: "hierarchyClarity", weight: 0.15 },
      { key: "screenshotFit", weight: 0.15 },
      { key: "distinctiveness", weight: 0.1 },
      { key: "narrativeCoherence", weight: 0.15 },
      { key: "textReadability", weight: 0.1 },
      { key: "brandFit", weight: 0.1 },
      { key: "conversionStrength", weight: 0.05 },
    ]);
  });
});

describe("computeSequenceScore", () => {
  it("computes a weighted overall score from normalized dimensions", () => {
    const input: SequenceScoreInput = {
      candidate: baseCandidate,
      scores: {
        premiumFeel: 1,
        hierarchyClarity: 0.8,
        screenshotFit: 0.6,
        distinctiveness: 0.4,
        narrativeCoherence: 0.5,
        textReadability: 0.9,
        brandFit: 0.7,
        conversionStrength: 0.3,
      },
    };

    const scored = computeSequenceScore(input);

    expect(scored.overallScore).toBeCloseTo(0.7);
    expect(scored.accepted).toBe(false);
  });

  it("preserves explicit evaluator reasons when provided", () => {
    const scored = computeSequenceScore({
      candidate: baseCandidate,
      scores: {
        premiumFeel: 0.9,
        hierarchyClarity: 0.9,
        screenshotFit: 0.9,
        distinctiveness: 0.8,
        narrativeCoherence: 0.88,
        textReadability: 0.92,
        brandFit: 0.85,
        conversionStrength: 0.8,
      },
      reasons: ["direction thesis and visual system are aligned"],
    });

    expect(scored.reasons).toContain("direction thesis and visual system are aligned");
  });
});

describe("rankFinalists", () => {
  it("orders candidates by score and keeps only acceptable finalists", () => {
    const finalists = rankFinalists([
      computeSequenceScore({
        candidate: { ...baseCandidate, id: "seq_1" },
        scores: {
          premiumFeel: 0.9,
          hierarchyClarity: 0.9,
          screenshotFit: 0.9,
          distinctiveness: 0.9,
          narrativeCoherence: 0.9,
          textReadability: 0.9,
          brandFit: 0.9,
          conversionStrength: 0.9,
        },
      }),
      computeSequenceScore({
        candidate: { ...baseCandidate, id: "seq_2" },
        scores: {
          premiumFeel: 0.7,
          hierarchyClarity: 0.7,
          screenshotFit: 0.7,
          distinctiveness: 0.7,
          narrativeCoherence: 0.7,
          textReadability: 0.7,
          brandFit: 0.7,
          conversionStrength: 0.7,
        },
      }),
    ]);

    expect(finalists.finalists).toHaveLength(1);
    expect(finalists.rejected).toHaveLength(1);
    expect(finalists.finalists[0]?.candidate.id).toBe("seq_1");
  });
});

describe("finalist mapping", () => {
  it("builds a surfaced finalist set with top3 and additional finalists", () => {
    const scored = computeSequenceScore({
      candidate: baseCandidate,
      scores: {
        premiumFeel: 0.9,
        hierarchyClarity: 0.9,
        screenshotFit: 0.9,
        distinctiveness: 0.9,
        narrativeCoherence: 0.9,
        textReadability: 0.9,
        brandFit: 0.9,
        conversionStrength: 0.9,
      },
    });

    const finalists = createFinalistSetFromRanked([
      buildFinalist({
        scored,
        rank: 1,
      }),
    ], []);

    expect(finalists.top3).toHaveLength(1);
    expect(finalists.additional).toHaveLength(0);
    expect(finalists.scoringVersion).toBe("v1-premium-engine");
    expect(finalists.top3[0]?.score.tier).toBe("aaa");
  });
});
