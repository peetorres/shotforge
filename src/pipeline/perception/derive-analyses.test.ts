import { describe, expect, it } from "vitest";

import { createProjectBrief } from "@/core/session";

import { deriveScreenshotAnalyses } from "./derive-analyses";

describe("deriveScreenshotAnalyses", () => {
  it("falls back to neutral screenshot analysis without using filename semantics", () => {
    const brief = createProjectBrief({
      sessionId: "sess_analytics",
      brand: "Sensei",
      description: "Premium analytics",
      screenshots: [
        { filename: "portfolio-analytics-dashboard.png", width: 1290, height: 2796 },
      ],
      goals: ["conversion"],
      audience: "app store visitors",
      brandColor: "#6366F1",
    });

    const [analysis] = deriveScreenshotAnalyses(brief);

    expect(analysis?.proofSignals).toHaveLength(0);
    expect(analysis?.cropOpportunities).toContain("detail-closeup");
    expect((analysis?.safeTextRegions[0]?.x ?? 0)).toBe(48);
  });
});
