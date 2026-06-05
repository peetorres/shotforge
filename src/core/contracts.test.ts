import { describe, expect, it } from "vitest";

import {
  type CampaignBoard,
  CONTRACT_NAMES,
  type Finalist,
  type FinalistSet,
  type NarrativeDirection,
  type ProjectBrief,
  type RepairAction,
  type ScoredSequence,
  type ScreenshotAnalysis,
  type SequenceCandidate,
} from "./contracts";

describe("core contracts", () => {
  it("publishes the premium engine contract names", () => {
    expect(CONTRACT_NAMES).toEqual([
      "ProjectBrief",
      "ScreenshotAnalysis",
      "CampaignBoard",
      "NarrativeDirection",
      "SequenceCandidate",
      "ScoredSequence",
      "Finalist",
      "RepairAction",
      "FinalistSet",
    ]);
  });

  it("exposes the staged premium engine contract types", () => {
    const brief: ProjectBrief = {
      sessionId: "sess_123",
      brand: "Acme",
      description: "A faster way to ship launches",
      screenshots: [
        {
          id: "shot_1",
          filename: "screen-1.png",
          width: 1170,
          height: 2532,
        },
      ],
      goals: ["conversion"],
      audience: "product teams",
    };

    const analysis: ScreenshotAnalysis = {
      screenshotId: "shot_1",
      focalElements: ["headline", "cta"],
      safeTextRegions: [{ x: 12, y: 24, width: 240, height: 120 }],
      unsafeTextRegions: [{ x: 0, y: 0, width: 40, height: 40 }],
      compositionDensity: 0.42,
      hierarchySignal: 0.81,
      colorSignals: ["blue", "white"],
      proofSignals: ["social-proof"],
      emotionSignals: ["confidence"],
      cropOpportunities: ["tighten-top"],
    };

    const direction: NarrativeDirection = {
      id: "dir_1",
      thesis: "clarity-first",
      promise: "Make the product immediately legible",
      tension: "the current experience feels busy",
      roleMap: [{ screenshotId: "shot_1", role: "hero" }],
      visualHypothesis: "editorial calm with strong hierarchy",
    };

    const board: CampaignBoard = {
      id: "board_1",
      story: "Turn overwhelmed founders into consistent learners",
      continuityStyle: "light editorial flow with reward payoff",
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
          objective: "open with emotional tension",
        },
        {
          index: 1,
          role: "tension",
          sequenceRole: "statement",
          energy: "quiet",
          visualWeight: "text-led",
          continuityCue: "pause",
          preferredSide: "center",
          objective: "name the core pain",
        },
      ],
    };

    const candidate: SequenceCandidate = {
      id: "seq_1",
      briefId: brief.sessionId,
      campaignBoardId: board.id,
      directionId: direction.id,
      directionThesis: direction.thesis,
      style: "dark",
      orderedScreenshotIds: ["shot_1"],
      slides: [{ type: "hero", file: "screen-1.png" }],
      framePlans: board.framePlans,
      layoutFamily: "editorial-single",
      typographyFamily: "display-sans",
      backgroundTreatment: "derived-gradient",
      focalCropProfile: "tight-hero",
      overlayBehavior: "subtle-glass",
      slideRoles: [{ screenshotId: "shot_1", role: "hero" }],
    };

    const scored: ScoredSequence = {
      candidate,
      scores: {
        premiumFeel: 0.91,
        hierarchyClarity: 0.9,
        screenshotFit: 0.86,
        distinctiveness: 0.8,
        narrativeCoherence: 0.84,
        textReadability: 0.88,
        brandFit: 0.82,
        conversionStrength: 0.76,
      },
      overallScore: 0.86,
      accepted: true,
      tier: "aaa",
      reasons: ["meets aaa threshold"],
    };

    const repair: RepairAction = {
      sequenceId: candidate.id,
      targets: ["crop", "typography"],
      instructions: "increase headline contrast and crop tighter on the hero",
      priority: "medium",
    };

    const finalist: Finalist = {
      id: candidate.id,
      rank: 1,
      thesis: direction.thesis,
      style: "dark",
      backgroundTreatment: candidate.backgroundTreatment,
      typographySystem: candidate.typographyFamily,
      score: {
        ...scored.scores,
        overallScore: scored.overallScore,
        tier: "aaa",
        reasons: scored.reasons,
      },
      slides: candidate.slides,
    };

    const finalists: FinalistSet = {
      top3: [finalist],
      additional: [],
      scoringVersion: "v1-premium-engine",
      generatedAt: "2026-03-28T00:00:00.000Z",
    };

    expect(brief.sessionId).toBe("sess_123");
    expect(analysis.compositionDensity).toBeCloseTo(0.42);
    expect(board.framePlans[0]?.role).toBe("hook");
    expect(direction.thesis).toBe("clarity-first");
    expect(candidate.layoutFamily).toBe("editorial-single");
    expect(scored.accepted).toBe(true);
    expect(repair.targets).toContain("crop");
    expect(finalists.top3[0]?.score.overallScore).toBe(0.86);
  });
});
