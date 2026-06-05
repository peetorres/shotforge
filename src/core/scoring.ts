import {
  type Finalist,
  type FinalistSet,
  type ScoredSequence,
  type ScoreBreakdown,
  type SequenceCandidate,
} from "./contracts";

export type { SequenceCandidate } from "./contracts";

export const AAA_THRESHOLD = 0.85;
export const PREMIUM_ACCEPTABLE_THRESHOLD = 0.72;
export const MIN_TOP3_DISTANCE = 0.18;
export const SCORING_VERSION = "v1-premium-engine";

export type ScoreDimensionKey = keyof ScoreBreakdown;

export const SCORE_DIMENSIONS = [
  { key: "premiumFeel", weight: 0.2 },
  { key: "hierarchyClarity", weight: 0.15 },
  { key: "screenshotFit", weight: 0.15 },
  { key: "distinctiveness", weight: 0.1 },
  { key: "narrativeCoherence", weight: 0.15 },
  { key: "textReadability", weight: 0.1 },
  { key: "brandFit", weight: 0.1 },
  { key: "conversionStrength", weight: 0.05 },
] as const satisfies ReadonlyArray<{ key: ScoreDimensionKey; weight: number }>;

export interface SequenceScoreInput {
  readonly candidate: SequenceCandidate;
  readonly scores: ScoreBreakdown;
  readonly reasons?: string[];
}

export interface RankedSequences {
  readonly finalists: ScoredSequence[];
  readonly rejected: ScoredSequence[];
}

export interface BuildFinalistInput {
  readonly scored: ScoredSequence;
  readonly rank: number;
}

const REJECTION_FLOORS: ReadonlyArray<{ key: ScoreDimensionKey; minimum: number; reason: string }> = [
  { key: "premiumFeel", minimum: 0.58, reason: "premium feel falls below the minimum bar" },
  { key: "hierarchyClarity", minimum: 0.62, reason: "hierarchy clarity is too weak" },
  { key: "textReadability", minimum: 0.64, reason: "text readability is too compromised" },
  { key: "screenshotFit", minimum: 0.58, reason: "screenshot integration is too weak" },
  { key: "narrativeCoherence", minimum: 0.58, reason: "narrative coherence is too weak" },
] as const;

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function tierForScore(score: number): ScoredSequence["tier"] {
  if (score >= AAA_THRESHOLD) {
    return "aaa";
  }

  if (score >= PREMIUM_ACCEPTABLE_THRESHOLD) {
    return "premium-acceptable";
  }

  return "rejected";
}

function weightedScore(scores: ScoreBreakdown): number {
  return SCORE_DIMENSIONS.reduce((total, dimension) => {
    const value = clampScore(scores[dimension.key]);
    return total + value * dimension.weight;
  }, 0);
}

function buildLowDimensionReasons(scores: ScoreBreakdown): string[] {
  return SCORE_DIMENSIONS
    .map((dimension) => ({
      key: dimension.key,
      value: clampScore(scores[dimension.key]),
    }))
    .filter((dimension) => dimension.value < PREMIUM_ACCEPTABLE_THRESHOLD)
    .sort((left, right) => left.value - right.value)
    .slice(0, 3)
    .map((dimension) => `${dimension.key} is under the premium acceptable threshold`);
}

function buildStrengthReasons(scores: ScoreBreakdown): string[] {
  return SCORE_DIMENSIONS
    .map((dimension) => ({
      key: dimension.key,
      value: clampScore(scores[dimension.key]),
    }))
    .filter((dimension) => dimension.value >= AAA_THRESHOLD)
    .sort((left, right) => right.value - left.value)
    .slice(0, 3)
    .map((dimension) => `${dimension.key} is operating at AAA level`);
}

function buildHardFailureReasons(scores: ScoreBreakdown): string[] {
  return REJECTION_FLOORS.flatMap((floor) => {
    const value = clampScore(scores[floor.key]);
    return value < floor.minimum ? [floor.reason] : [];
  });
}

export function computeSequenceScore(input: SequenceScoreInput): ScoredSequence {
  const overallScore = weightedScore(input.scores);
  const hardFailureReasons = buildHardFailureReasons(input.scores);
  const accepted =
    overallScore >= PREMIUM_ACCEPTABLE_THRESHOLD && hardFailureReasons.length === 0;
  const tier = tierForScore(overallScore);
  const thresholdReason =
    overallScore < PREMIUM_ACCEPTABLE_THRESHOLD
      ? ["below premium acceptable threshold"]
      : [];
  const evaluatorReasons = input.reasons ?? [];
  const reasons = accepted
    ? [...evaluatorReasons, `meets ${tier} threshold`, ...buildStrengthReasons(input.scores)]
    : [...evaluatorReasons, ...hardFailureReasons, ...thresholdReason, ...buildLowDimensionReasons(input.scores)];

  return {
    candidate: input.candidate,
    scores: input.scores,
    overallScore,
    accepted,
    tier,
    reasons: reasons.length > 0 ? Array.from(new Set(reasons)) : ["scoring incomplete"],
  };
}

export function sequenceDistance(
  left: SequenceCandidate,
  right: SequenceCandidate,
): number {
  const comparisons: Array<[unknown, unknown]> = [
    [left.directionThesis, right.directionThesis],
    [left.layoutFamily, right.layoutFamily],
    [left.typographyFamily, right.typographyFamily],
    [left.backgroundTreatment, right.backgroundTreatment],
    [left.focalCropProfile, right.focalCropProfile],
  ];

  const mismatches = comparisons.reduce((count, [a, b]) => {
    return count + (a === b ? 0 : 1);
  }, 0);

  return mismatches / comparisons.length;
}

function compareSequences(left: ScoredSequence, right: ScoredSequence): number {
  const scoreDelta = right.overallScore - left.overallScore;
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return left.candidate.id.localeCompare(right.candidate.id);
}

export function rankFinalists(sequences: ScoredSequence[]): RankedSequences {
  const accepted = sequences
    .filter((sequence) => sequence.accepted)
    .slice()
    .sort(compareSequences);

  const rejected = sequences
    .filter((sequence) => !sequence.accepted)
    .slice()
    .sort(compareSequences);

  return {
    finalists: accepted,
    rejected,
  };
}

export function createFinalistSetFromRanked(
  finalists: Finalist[],
  _rejected: ScoredSequence[],
  generatedAt = new Date().toISOString(),
): FinalistSet {
  return {
    top3: finalists.slice(0, 3),
    additional: finalists.slice(3),
    scoringVersion: SCORING_VERSION,
    generatedAt,
  };
}

export function buildFinalist(input: BuildFinalistInput): Finalist {
  const tier = input.scored.tier === "aaa" ? "aaa" : "premium-acceptable";

  return {
    id: input.scored.candidate.id,
    rank: input.rank,
    thesis: input.scored.candidate.directionThesis,
    style: input.scored.candidate.style,
    backgroundTreatment: input.scored.candidate.backgroundTreatment,
    typographySystem: input.scored.candidate.typographyFamily,
    score: {
      ...input.scored.scores,
      overallScore: input.scored.overallScore,
      tier,
      reasons: input.scored.reasons,
    },
    slides: input.scored.candidate.slides,
  };
}
