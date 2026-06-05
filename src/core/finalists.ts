import type { SlideConfig } from "@appforge/screenshot-gen";
import {
  type FinalistSet,
  type ScoredSequence,
} from "./contracts";
import {
  AAA_THRESHOLD,
  MIN_TOP3_DISTANCE,
  PREMIUM_ACCEPTABLE_THRESHOLD,
  buildFinalist,
  createFinalistSetFromRanked,
  rankFinalists,
  sequenceDistance,
} from "./scoring";

function buildTopThree(sequences: ScoredSequence[]): ScoredSequence[] {
  const aaaCandidates = sequences.filter((sequence) => sequence.overallScore >= AAA_THRESHOLD);
  const shouldEnforceDistance = aaaCandidates.length >= 3;
  const pool = shouldEnforceDistance ? aaaCandidates : sequences;
  const selected: ScoredSequence[] = [];

  for (const sequence of pool) {
    if (selected.length >= 3) {
      break;
    }

    const isDistinctEnough = selected.every((current) => {
      return sequenceDistance(current.candidate, sequence.candidate) >= MIN_TOP3_DISTANCE;
    });

    if (!shouldEnforceDistance || isDistinctEnough) {
      selected.push(sequence);
    }
  }

  if (!shouldEnforceDistance && selected.length < 3) {
    for (const sequence of sequences) {
      if (selected.length >= 3) {
        break;
      }

      if (!selected.includes(sequence)) {
        selected.push(sequence);
      }
    }
  }

  return selected;
}

export interface CurateFinalistSetOptions {
  readonly slidesBySequenceId?: Record<string, SlideConfig[]>;
  readonly generatedAt?: string;
}

function buildAdditionalFinalists(
  rankedFinalists: ScoredSequence[],
  top3: ScoredSequence[],
): ScoredSequence[] {
  return rankedFinalists
    .filter((sequence) => sequence.overallScore >= PREMIUM_ACCEPTABLE_THRESHOLD)
    .filter((sequence) => !top3.includes(sequence));
}

export function curateFinalistSet(
  sequences: ScoredSequence[],
  options: CurateFinalistSetOptions = {},
): FinalistSet {
  const ranked = rankFinalists(sequences);
  const selected = buildTopThree(ranked.finalists);
  const additional = buildAdditionalFinalists(ranked.finalists, selected);
  const finalists = [...selected, ...additional].map((sequence, index) =>
    buildFinalist({
      scored: sequence,
      rank: index + 1,
    }),
  );

  return createFinalistSetFromRanked(
    finalists,
    ranked.rejected,
    options.generatedAt,
  );
}
