import type { BoundingBox, ProjectBrief, ProjectScreenshot, ScreenshotAnalysis } from "@/domain/types";

function buildSafeRegion(screenshot: ProjectScreenshot): BoundingBox {
  return {
    x: 48,
    y: 48,
    width: Math.max(260, Math.round(screenshot.width * 0.5)),
    height: Math.round(screenshot.height * 0.18),
  };
}

function buildUnsafeRegion(screenshot: ProjectScreenshot): BoundingBox {
  return {
    x: Math.round(screenshot.width * 0.18),
    y: Math.round(screenshot.height * 0.2),
    width: Math.round(screenshot.width * 0.64),
    height: Math.round(screenshot.height * 0.54),
  };
}

export function deriveScreenshotAnalyses(brief: ProjectBrief): ScreenshotAnalysis[] {
  return brief.screenshots.map((screenshot) => ({
    screenshotId: screenshot.filename,
    focalElements: screenshot.altText ? [screenshot.altText] : ["product-ui"],
    safeTextRegions: [buildSafeRegion(screenshot)],
    unsafeTextRegions: [buildUnsafeRegion(screenshot)],
    compositionDensity: 0.58,
    hierarchySignal: 0.76,
    colorSignals: [brief.brandColor ?? "#6366F1"],
    proofSignals: [],
    emotionSignals: [],
    cropOpportunities: ["balanced-frame", "detail-closeup", "contextual-wide"],
  }));
}
