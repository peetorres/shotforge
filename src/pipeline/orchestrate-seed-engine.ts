import { createProjectBrief, normalizeProjectScreenshots } from "@/core/session";
import type {
  FinalistSet,
  NarrativeDirection,
  ProjectBrief,
  RepairAction,
  ScreenshotAnalysis,
  ScoredSequence,
  SequenceCandidate,
  Variant,
  VariantId,
} from "@/domain/types";
import { curateFinalistSet } from "@/core/finalists";
import { buildCampaignBoard } from "@/pipeline/board/build-campaign-board";
import { buildSequenceCandidate } from "@/pipeline/composition/build-sequence-candidates";
import { buildNarrativeDirections } from "@/pipeline/direction/build-directions";
import { evaluateSeedSequence } from "@/pipeline/evaluation/evaluate-sequences";
import { deriveScreenshotAnalyses } from "@/pipeline/perception/derive-analyses";
import { applyRepairActions } from "@/pipeline/repair/apply-repair-actions";
import { createRepairActions } from "@/pipeline/repair/create-repair-actions";

export interface SeedEngineResult {
  readonly brief: ProjectBrief;
  readonly analyses: ScreenshotAnalysis[];
  readonly board: import("@/domain/types").CampaignBoard;
  readonly directions: Record<VariantId, NarrativeDirection>;
  readonly candidates: SequenceCandidate[];
  readonly scored: ScoredSequence[];
  readonly repairActions: RepairAction[];
  readonly finalists: FinalistSet;
}

function collectScreenshotNames(variants: Record<VariantId, Variant>): string[] {
  return Array.from(
    new Set(
      (Object.values(variants) as Variant[]).flatMap((variant) =>
        variant.slides.flatMap((slide) => {
          const screenshot = "screenshot" in slide ? slide.screenshot : undefined;
          return typeof screenshot === "string" && screenshot.length > 0 ? [screenshot] : [];
        }),
      ),
    ),
  );
}

export function orchestrateSeedEngine(input: {
  readonly sessionId: string;
  readonly brand?: string;
  readonly description?: string;
  readonly brandColor?: string;
  readonly variants: Record<VariantId, Variant>;
  readonly analysesOverride?: ScreenshotAnalysis[];
}): SeedEngineResult {
  const screenshots = normalizeProjectScreenshots(
    collectScreenshotNames(input.variants).map((filename) => ({
      filename,
      width: 1290,
      height: 2796,
    })),
  );

  const brief = createProjectBrief({
    sessionId: input.sessionId,
    brand: input.brand ?? "Shotforge Project",
    description: input.description ?? "Premium App Store creative direction.",
    brandColor: input.brandColor,
    screenshots,
    goals: ["conversion"],
    audience: "app store visitors",
  });

  const analyses = input.analysesOverride && input.analysesOverride.length > 0
    ? input.analysesOverride
    : deriveScreenshotAnalyses(brief);
  const board = buildCampaignBoard(brief, analyses);
  const directions = buildNarrativeDirections(brief, board);
  const candidates = (Object.entries(input.variants) as Array<[VariantId, Variant]>).map(
    ([variantId, variant]) =>
      buildSequenceCandidate({
        brief,
        variantId,
        variant,
        direction: directions[variantId],
        analyses,
        board,
      }),
  );
  const scored = candidates.map((candidate) =>
    evaluateSeedSequence(
      candidate,
      candidate.id.replace(/^seed-/, "") as VariantId,
    ),
  );
  const repairActions = createRepairActions(scored);
  const repairedCandidates = applyRepairActions(scored, repairActions);
  const rescored = repairedCandidates.map((candidate) =>
    evaluateSeedSequence(
      candidate,
      candidate.id.replace(/^seed-/, "") as VariantId,
    ),
  );
  const bestByCandidateId = new Map<string, ScoredSequence>();

  for (const sequence of [...scored, ...rescored]) {
    const current = bestByCandidateId.get(sequence.candidate.id);
    if (!current || sequence.overallScore > current.overallScore) {
      bestByCandidateId.set(sequence.candidate.id, sequence);
    }
  }

  const finalists = curateFinalistSet(Array.from(bestByCandidateId.values()));

  return {
    brief,
    analyses,
    board,
    directions,
    candidates,
    scored: Array.from(bestByCandidateId.values()),
    repairActions,
    finalists,
  };
}
