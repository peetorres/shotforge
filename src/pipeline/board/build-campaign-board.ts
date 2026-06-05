import type {
  CampaignBoard,
  CampaignContinuityCue,
  CampaignFrameEnergy,
  CampaignFramePlan,
  CampaignSideBias,
  CampaignVisualWeight,
  ProjectBrief,
  ScreenshotAnalysis,
} from "@/domain/types";

function topScreenshotId(
  analyses: ScreenshotAnalysis[],
  scorer: (analysis: ScreenshotAnalysis, index: number) => number,
  used: Set<string>,
): string | undefined {
  const ranked = analyses
    .map((analysis, index) => ({
      screenshotId: analysis.screenshotId,
      score: scorer(analysis, index),
    }))
    .sort((left, right) => right.score - left.score);

  const unused = ranked.find((entry) => !used.has(entry.screenshotId));
  return unused?.screenshotId ?? ranked[0]?.screenshotId;
}

function buildFrame(
  index: number,
  role: CampaignFramePlan["role"],
  sequenceRole: CampaignFramePlan["sequenceRole"],
  energy: CampaignFrameEnergy,
  visualWeight: CampaignVisualWeight,
  continuityCue: CampaignContinuityCue,
  preferredSide: CampaignSideBias,
  objective: string,
  screenshotId?: string,
): CampaignFramePlan {
  return {
    index,
    role,
    sequenceRole,
    screenshotId,
    energy,
    visualWeight,
    continuityCue,
    preferredSide,
    objective,
  };
}

export function buildCampaignBoard(
  brief: ProjectBrief,
  analyses: ScreenshotAnalysis[],
): CampaignBoard {
  const used = new Set<string>();

  const hookShot = topScreenshotId(
    analyses,
    (analysis) => analysis.hierarchySignal * 2 + analysis.emotionSignals.length * 1.5,
    used,
  );
  if (hookShot) used.add(hookShot);

  const mechanismShot = topScreenshotId(
    analyses,
    (analysis) => (1 - Math.abs(0.58 - analysis.compositionDensity)) * 1.5 + analysis.hierarchySignal,
    used,
  );
  if (mechanismShot) used.add(mechanismShot);

  const detailShot = topScreenshotId(
    analyses,
    (analysis) => analysis.cropOpportunities.filter((crop) => crop === "detail-closeup").length * 2 + analysis.compositionDensity,
    used,
  );
  if (detailShot) used.add(detailShot);

  const proofShot = topScreenshotId(
    analyses,
    (analysis) => analysis.proofSignals.length * 2 + analysis.hierarchySignal,
    used,
  );
  if (proofShot) used.add(proofShot);

  const payoffShot = topScreenshotId(
    analyses,
    (analysis) =>
      analysis.emotionSignals.filter((signal) => signal === "progress").length * 3
      + analysis.emotionSignals.filter((signal) => signal === "confidence").length
      + analysis.proofSignals.length,
    used,
  );
  if (payoffShot) used.add(payoffShot);

  return {
    id: `${brief.sessionId}-board`,
    story: `Turn ${brief.audience} from scattered to steadily improving with ${brief.brand}`,
    continuityStyle: "single campaign board with a left-right editorial rhythm, a clean pause, and a reward-led close",
    framePlans: [
      buildFrame(
        0,
        "hook",
        "hero",
        "elevated",
        "device-led",
        "open",
        "left",
        "open with the emotional or strategic problem",
        hookShot,
      ),
      buildFrame(
        1,
        "tension",
        "statement",
        "quiet",
        "text-led",
        "pause",
        "center",
        "name the tension clearly",
      ),
      buildFrame(
        2,
        "mechanism",
        "feature",
        "balanced",
        "balanced",
        "build",
        "right",
        "show the system that creates daily progress",
        mechanismShot,
      ),
      buildFrame(
        3,
        "detail",
        "detail",
        "elevated",
        "immersive",
        "intensify",
        "left",
        "zoom into the product mechanic that feels premium",
        detailShot,
      ),
      buildFrame(
        4,
        "proof",
        "proof",
        "peak",
        "device-led",
        "intensify",
        "right",
        "prove progress or reward with concrete evidence",
        proofShot,
      ),
      buildFrame(
        5,
        "payoff",
        "close",
        "elevated",
        "balanced",
        "resolve",
        "left",
        "close on identity, reward, or momentum",
        payoffShot ?? mechanismShot,
      ),
    ],
  };
}
