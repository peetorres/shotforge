import { describe, expect, it } from "vitest";

import { createProjectBrief } from "@/core/session";
import type { ScreenshotAnalysis } from "@/domain/types";

import { buildCampaignBoard } from "./build-campaign-board";

describe("buildCampaignBoard", () => {
  it("plans the sequence as one campaign board with assigned evidence and payoff shots", () => {
    const brief = createProjectBrief({
      sessionId: "sess_board",
      brand: "Sensei",
      description: "Gamified learning for founders",
      screenshots: [
        { filename: "1.PNG", width: 1179, height: 2556 },
        { filename: "2.PNG", width: 1179, height: 2556 },
        { filename: "6.PNG", width: 1179, height: 2556 },
      ],
      audience: "founders",
    });

    const analyses: ScreenshotAnalysis[] = [
      {
        screenshotId: "1.PNG",
        focalElements: ["hero-ui"],
        safeTextRegions: [{ x: 48, y: 48, width: 240, height: 120 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.52,
        hierarchySignal: 0.91,
        colorSignals: ["#FACC15"],
        proofSignals: [],
        emotionSignals: ["aspiration"],
        cropOpportunities: ["balanced-frame"],
      },
      {
        screenshotId: "2.PNG",
        focalElements: ["system-ui"],
        safeTextRegions: [{ x: 48, y: 48, width: 240, height: 120 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.6,
        hierarchySignal: 0.84,
        colorSignals: ["#FACC15"],
        proofSignals: ["workflow-proof"],
        emotionSignals: ["clarity"],
        cropOpportunities: ["detail-closeup"],
      },
      {
        screenshotId: "6.PNG",
        focalElements: ["reward-ui"],
        safeTextRegions: [{ x: 48, y: 48, width: 240, height: 120 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.58,
        hierarchySignal: 0.82,
        colorSignals: ["#FACC15"],
        proofSignals: ["outcome-proof"],
        emotionSignals: ["progress", "confidence"],
        cropOpportunities: ["balanced-frame"],
      },
    ];

    const board = buildCampaignBoard(brief, analyses);

    expect(board.framePlans).toHaveLength(6);
    expect(board.framePlans[0]?.role).toBe("hook");
    expect(board.framePlans[1]?.visualWeight).toBe("text-led");
    expect(board.framePlans[4]?.role).toBe("proof");
    expect(board.framePlans[4]?.continuityCue).toBe("intensify");
    expect(board.framePlans[5]?.role).toBe("payoff");
    expect(board.framePlans[4]?.screenshotId).toBe("2.PNG");
    expect(board.framePlans[5]?.screenshotId).toBe("6.PNG");
  });
});
