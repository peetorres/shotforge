import { describe, expect, it } from "vitest";

import { createProjectBrief } from "@/core/session";
import type { ScreenshotAnalysis } from "@/domain/types";

import { buildCampaignBoard } from "../board/build-campaign-board";
import { buildNarrativeDirections } from "./build-directions";

describe("buildNarrativeDirections", () => {
  it("assigns proof and close beats from screenshot signals instead of only position", () => {
    const brief = createProjectBrief({
      sessionId: "sess_dir",
      brand: "Sensei",
      description: "Premium screenshot generation",
      screenshots: [
        { filename: "home.png", width: 1290, height: 2796 },
        { filename: "analytics.png", width: 1290, height: 2796 },
        { filename: "progress.png", width: 1290, height: 2796 },
      ],
    });

    const analyses: ScreenshotAnalysis[] = [
      {
        screenshotId: "home.png",
        focalElements: ["hero-ui"],
        safeTextRegions: [{ x: 48, y: 48, width: 240, height: 120 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.45,
        hierarchySignal: 0.9,
        colorSignals: ["#6366F1"],
        proofSignals: [],
        emotionSignals: ["aspiration"],
        cropOpportunities: ["balanced-frame"],
      },
      {
        screenshotId: "analytics.png",
        focalElements: ["chart"],
        safeTextRegions: [{ x: 720, y: 180, width: 260, height: 220 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.68,
        hierarchySignal: 0.82,
        colorSignals: ["#6366F1"],
        proofSignals: ["analytics-proof", "trust-signal"],
        emotionSignals: ["confidence"],
        cropOpportunities: ["detail-closeup"],
      },
      {
        screenshotId: "progress.png",
        focalElements: ["result-state"],
        safeTextRegions: [{ x: 720, y: 180, width: 260, height: 220 }],
        unsafeTextRegions: [{ x: 160, y: 400, width: 700, height: 1200 }],
        compositionDensity: 0.62,
        hierarchySignal: 0.8,
        colorSignals: ["#6366F1"],
        proofSignals: ["outcome-proof"],
        emotionSignals: ["progress"],
        cropOpportunities: ["balanced-frame"],
      },
    ];

    const board = buildCampaignBoard(brief, analyses);
    const directions = buildNarrativeDirections(brief, board);

    expect(directions.clean.roleMap[0]?.role).toBe("hero");
    expect(directions.clean.roleMap.some((assignment) => assignment.screenshotId === "analytics.png" && assignment.role === "proof")).toBe(true);
    expect(directions.clean.roleMap.some((assignment) => assignment.screenshotId === "progress.png" && assignment.role === "close")).toBe(true);
  });
});
