import type { FinalistSet, ScreenshotAnalysis, Variant, VariantId } from "@/domain/types";
import { orchestrateSeedEngine } from "@/pipeline/orchestrate-seed-engine";

export function buildSeedFinalistSet(input: {
  readonly sessionId: string;
  readonly brand?: string;
  readonly description?: string;
  readonly brandColor?: string;
  readonly variants: Record<VariantId, Variant>;
  readonly analysesOverride?: ScreenshotAnalysis[];
}): FinalistSet {
  return orchestrateSeedEngine(input).finalists;
}
