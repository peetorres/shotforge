import { describe, expect, it } from "vitest";

import { createProjectBrief } from "@/core/session";
import { createVariants } from "@/domain/variant";

import { buildCampaignBoard } from "../board/build-campaign-board";
import { buildNarrativeDirections } from "../direction/build-directions";
import { deriveScreenshotAnalyses } from "../perception/derive-analyses";
import { buildSequenceCandidate } from "./build-sequence-candidates";

describe("buildSequenceCandidate", () => {
  it("uses screenshot analysis to inject layout and crop decisions into slides", () => {
    const brief = createProjectBrief({
      sessionId: "sess_comp",
      brand: "Sensei",
      description: "Premium analytics",
      screenshots: [
        { filename: "analytics-home.png", width: 1290, height: 2796 },
        { filename: "task-list.png", width: 1290, height: 2796 },
        { filename: "progress-chart.png", width: 1290, height: 2796 },
      ],
      goals: ["conversion"],
      audience: "app store visitors",
      brandColor: "#6366F1",
    });
    const analyses = deriveScreenshotAnalyses(brief);
    const board = buildCampaignBoard(brief, analyses);
    const directions = buildNarrativeDirections(brief, board);
    const variants = createVariants(
      ["analytics-home.png", "task-list.png", "progress-chart.png"],
      "Sensei",
      "#6366F1",
    );

    const candidate = buildSequenceCandidate({
      brief,
      variantId: "vivid",
      variant: variants.vivid,
      direction: directions.vivid,
      analyses,
      board,
    });

    expect(candidate.slides[0] && "layoutType" in candidate.slides[0] ? candidate.slides[0].layoutType : undefined).toMatch(/device-(left|right)/);
    expect(candidate.slides[1]?.type).toBe("statement");
    expect(candidate.slides.some((slide) => "layoutType" in slide && slide.layoutType === "zoom-detail")).toBe(true);
    expect(candidate.slides.some((slide) => "zoom" in slide && (slide.zoom ?? 1) > 1.2)).toBe(true);
    expect(candidate.framePlans[4]?.role).toBe("proof");
    expect(candidate.slides[5]?.type).toBe("result");
  });
});
