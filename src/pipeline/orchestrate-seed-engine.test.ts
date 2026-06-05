import { describe, expect, it } from "vitest";

import { createVariants } from "@/domain/variant";

import { orchestrateSeedEngine } from "./orchestrate-seed-engine";

describe("orchestrateSeedEngine", () => {
  it("returns staged outputs plus curated finalists", () => {
    const variants = createVariants(
      ["screen1.png", "screen2.png", "screen3.png"],
      "Sensei",
      "#6366F1",
    );

    const result = orchestrateSeedEngine({
      sessionId: "sess_123",
      brand: "Sensei",
      description: "Gamified learning for founders",
      brandColor: "#6366F1",
      variants,
    });

    expect(result.brief.brand).toBe("Sensei");
    expect(result.analyses.length).toBeGreaterThan(0);
    expect(result.candidates).toHaveLength(3);
    expect(result.scored).toHaveLength(3);
    expect(result.finalists.top3).toHaveLength(3);
  });

  it("surfaces evaluator reasons on seeded finalists", () => {
    const variants = createVariants(
      ["screen1.png", "screen2.png", "screen3.png"],
      "Sensei",
      "#6366F1",
    );

    const result = orchestrateSeedEngine({
      sessionId: "sess_456",
      brand: "Sensei",
      description: "Gamified learning for founders",
      brandColor: "#6366F1",
      variants,
    });

    expect(result.finalists.top3.every((finalist) => finalist.score.reasons.length > 0)).toBe(true);
  });

  it("keeps one best scored sequence per candidate after the repair pass", () => {
    const variants = createVariants(
      ["screen1.png", "screen2.png", "screen3.png"],
      "Sensei",
      "#6366F1",
    );

    const result = orchestrateSeedEngine({
      sessionId: "sess_789",
      brand: "Sensei",
      description: "Gamified learning for founders",
      brandColor: "#6366F1",
      variants,
    });

    expect(new Set(result.scored.map((sequence) => sequence.candidate.id)).size).toBe(result.scored.length);
  });

  it("prefers externally supplied screenshot analyses over neutral fallback heuristics", () => {
    const variants = createVariants(
      ["1.PNG", "2.PNG", "3.PNG"],
      "Sensei",
      "#6366F1",
    );

    const result = orchestrateSeedEngine({
      sessionId: "sess_override",
      brand: "Sensei",
      description: "Gamified learning for founders",
      brandColor: "#6366F1",
      variants,
      analysesOverride: [
        {
          screenshotId: "1.PNG",
          focalElements: ["emotional-hook"],
          safeTextRegions: [{ x: 48, y: 48, width: 320, height: 300 }],
          unsafeTextRegions: [{ x: 120, y: 320, width: 900, height: 1400 }],
          compositionDensity: 0.54,
          hierarchySignal: 0.91,
          colorSignals: ["#6366F1"],
          proofSignals: [],
          emotionSignals: ["aspiration"],
          cropOpportunities: ["balanced-frame"],
        },
        {
          screenshotId: "2.PNG",
          focalElements: ["proof-ui"],
          safeTextRegions: [{ x: 720, y: 160, width: 300, height: 260 }],
          unsafeTextRegions: [{ x: 120, y: 320, width: 900, height: 1400 }],
          compositionDensity: 0.67,
          hierarchySignal: 0.84,
          colorSignals: ["#6366F1"],
          proofSignals: ["outcome-proof"],
          emotionSignals: ["confidence"],
          cropOpportunities: ["detail-closeup"],
        },
        {
          screenshotId: "3.PNG",
          focalElements: ["payoff-ui"],
          safeTextRegions: [{ x: 720, y: 160, width: 300, height: 260 }],
          unsafeTextRegions: [{ x: 120, y: 320, width: 900, height: 1400 }],
          compositionDensity: 0.62,
          hierarchySignal: 0.8,
          colorSignals: ["#6366F1"],
          proofSignals: [],
          emotionSignals: ["progress"],
          cropOpportunities: ["balanced-frame"],
        },
      ],
    });

    expect(result.board.framePlans[4]?.screenshotId).toBe("2.PNG");
    expect(result.board.framePlans[5]?.screenshotId).toBe("3.PNG");
  });
});
