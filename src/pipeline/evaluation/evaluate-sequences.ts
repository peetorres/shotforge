import { computeSequenceScore } from "@/core/scoring";
import type { ScoreBreakdown, ScoredSequence, SequenceCandidate, VariantId } from "@/domain/types";

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(3));
}

function pushReason(reasons: string[], reason: string): void {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function hasCanonicalRole(
  candidate: SequenceCandidate,
  role: "hero" | "statement" | "feature" | "detail" | "proof" | "close",
): boolean {
  if (candidate.slideRoles.some((assignment) => assignment.role === role)) {
    return true;
  }

  return candidate.slides.some((slide, index) => {
    if (role === "hero") return slide.type === "hero";
    if (role === "statement") return slide.type === "statement";
    if (role === "feature") return slide.type === "feature-single" || slide.type === "feature-dual";
    if (role === "detail") return slide.type === "detail";
    if (role === "proof") return slide.type === "result" || slide.type === "contrast";
    return index === candidate.slides.length - 1;
  });
}

function buildScore(candidate: SequenceCandidate, variantId: VariantId): {
  readonly scores: ScoreBreakdown;
  readonly reasons: string[];
} {
  const baseScores: Record<VariantId, ScoreBreakdown> = {
    clean: {
      premiumFeel: 0.9,
      hierarchyClarity: 0.92,
      screenshotFit: 0.86,
      distinctiveness: 0.82,
      narrativeCoherence: 0.88,
      textReadability: 0.93,
      brandFit: 0.82,
      conversionStrength: 0.8,
    },
    midnight: {
      premiumFeel: 0.89,
      hierarchyClarity: 0.84,
      screenshotFit: 0.87,
      distinctiveness: 0.88,
      narrativeCoherence: 0.86,
      textReadability: 0.89,
      brandFit: 0.9,
      conversionStrength: 0.81,
    },
    vivid: {
      premiumFeel: 0.87,
      hierarchyClarity: 0.8,
      screenshotFit: 0.84,
      distinctiveness: 0.92,
      narrativeCoherence: 0.85,
      textReadability: 0.84,
      brandFit: 0.91,
      conversionStrength: 0.83,
    },
  };

  const score = { ...baseScores[variantId] };
  const reasons: string[] = [];
  const slideCount = candidate.slides.length;
  const uniqueSlideTypes = new Set(candidate.slides.map((slide) => slide.type));
  const layoutTypes = candidate.slides
    .map((slide) => ("layoutType" in slide ? slide.layoutType : undefined))
    .flatMap((layout) => (typeof layout === "string" ? [layout] : []));
  const uniqueLayoutTypes = new Set(layoutTypes);
  const zoomLevels = candidate.slides.map((slide) => ("zoom" in slide ? slide.zoom ?? 1 : 1));
  const hasHighImpactZoom = zoomLevels.some((zoom) => zoom >= 1.35);
  const hasTextOnlyBeat =
    candidate.slides.some((slide) => slide.type === "statement") || layoutTypes.includes("text-only");
  const finalSlide = candidate.slides.at(-1);
  const framePlans = candidate.framePlans;
  const nonStatementLayouts = candidate.slides
    .filter((slide) => slide.type !== "statement")
    .map((slide) => ("layoutType" in slide ? slide.layoutType : undefined))
    .flatMap((layout) => (typeof layout === "string" ? [layout] : []));
  const boardFollowsPacing =
    framePlans[0]?.role === "hook" &&
    framePlans[1]?.role === "tension" &&
    framePlans[4]?.role === "proof" &&
    framePlans[5]?.role === "payoff";
  const quietPauseExists =
    framePlans[1]?.energy === "quiet" &&
    candidate.slides[1]?.type === "statement";
  const proofSlide = candidate.slides[4];
  const peakBeatFeelsPeak =
    framePlans[4]?.energy === "peak" &&
    !!proofSlide &&
    ((("layoutType" in proofSlide ? proofSlide.layoutType : undefined) === "device-dominant") ||
      (("layoutType" in proofSlide ? proofSlide.layoutType : undefined) === "zoom-detail") ||
      (("zoom" in proofSlide ? proofSlide.zoom ?? 1 : 1) >= 1.2));
  const alternatingSides = nonStatementLayouts.filter(
    (layout) => layout === "device-left" || layout === "device-right",
  );
  const hasSideRhythm =
    alternatingSides.length < 2 ||
    alternatingSides.some((layout, index) => index > 0 && layout !== alternatingSides[index - 1]);
  const closingScreenshot = framePlans[5]?.screenshotId;
  const proofScreenshot = framePlans[4]?.screenshotId;
  const distinctClose =
    !proofScreenshot || !closingScreenshot || proofScreenshot !== closingScreenshot;
  const thesisMatch =
    (candidate.directionThesis === "clarity-first" &&
      candidate.layoutFamily === "editorial-single" &&
      candidate.typographyFamily === "display-sans" &&
      candidate.backgroundTreatment === "derived-gradient") ||
    (candidate.directionThesis === "brand-signature-first" &&
      candidate.layoutFamily === "device-led" &&
      candidate.typographyFamily === "compact-sans" &&
      candidate.backgroundTreatment === "blurred-extraction") ||
    (candidate.directionThesis === "campaign-first" &&
      candidate.layoutFamily === "stacked-story" &&
      candidate.typographyFamily === "editorial-serif" &&
      (candidate.backgroundTreatment === "soft-glow" || candidate.backgroundTreatment === "brand-fill"));

  if (thesisMatch) {
    score.premiumFeel += 0.02;
    score.distinctiveness += 0.02;
    pushReason(reasons, "direction thesis and visual system are aligned");
  } else {
    score.premiumFeel -= 0.05;
    score.brandFit -= 0.04;
    pushReason(reasons, "direction thesis and visual system feel misaligned");
  }

  if (slideCount < 5) {
    score.narrativeCoherence -= 0.08;
    score.conversionStrength -= 0.05;
    pushReason(reasons, "sequence is too short to feel premium and persuasive");
  } else if (slideCount > 6) {
    score.hierarchyClarity -= 0.04;
    score.narrativeCoherence -= 0.04;
    pushReason(reasons, "sequence feels overlong for App Store pacing");
  } else {
    score.narrativeCoherence += 0.02;
  }

  if (boardFollowsPacing) {
    score.narrativeCoherence += 0.03;
    pushReason(reasons, "campaign board keeps a clear hook-to-payoff rhythm");
  } else {
    score.narrativeCoherence -= 0.06;
    pushReason(reasons, "campaign board loses the intended hook-to-payoff pacing");
  }

  if (uniqueSlideTypes.size < 4) {
    score.distinctiveness -= 0.08;
    score.narrativeCoherence -= 0.04;
    pushReason(reasons, "slide rhythm feels repetitive across the sequence");
  } else {
    score.distinctiveness += 0.02;
  }

  if (!hasCanonicalRole(candidate, "hero")) {
    score.hierarchyClarity -= 0.1;
    pushReason(reasons, "missing a strong hero beat");
  }

  if (!hasCanonicalRole(candidate, "statement")) {
    score.narrativeCoherence -= 0.08;
    score.distinctiveness -= 0.03;
    pushReason(reasons, "missing a text-led tension or truth moment");
  }

  if (!hasCanonicalRole(candidate, "feature")) {
    score.screenshotFit -= 0.08;
    score.narrativeCoherence -= 0.06;
    pushReason(reasons, "missing a feature-led product explanation");
  }

  if (!hasCanonicalRole(candidate, "detail")) {
    score.screenshotFit -= 0.06;
    score.premiumFeel -= 0.04;
    pushReason(reasons, "missing a focused detail moment");
  }

  if (!hasCanonicalRole(candidate, "proof")) {
    score.conversionStrength -= 0.09;
    score.narrativeCoherence -= 0.04;
    pushReason(reasons, "missing a proof or outcome slide");
  }

  if (!hasCanonicalRole(candidate, "close") || !finalSlide) {
    score.conversionStrength -= 0.05;
    pushReason(reasons, "sequence does not land with a clear close");
  }

  if (finalSlide && finalSlide.type !== "feature-single" && finalSlide.type !== "result") {
    score.conversionStrength -= 0.03;
    pushReason(reasons, "final slide is weak as a closing beat");
  }

  if (!hasTextOnlyBeat) {
    score.hierarchyClarity -= 0.05;
    score.narrativeCoherence -= 0.04;
    pushReason(reasons, "sequence never creates a clean text-only pause");
  } else {
    score.hierarchyClarity += 0.02;
  }

  if (!quietPauseExists) {
    score.hierarchyClarity -= 0.05;
    score.narrativeCoherence -= 0.04;
    pushReason(reasons, "sequence misses a clean quiet pause after the hook");
  }

  if (layoutTypes.length >= 3 && uniqueLayoutTypes.size < 2) {
    score.distinctiveness -= 0.06;
    score.hierarchyClarity -= 0.03;
    pushReason(reasons, "composition mode repeats too uniformly");
  }

  if (!hasHighImpactZoom) {
    score.screenshotFit -= 0.05;
    score.premiumFeel -= 0.03;
    pushReason(reasons, "sequence lacks a decisive crop or zoom moment");
  } else {
    score.screenshotFit += 0.02;
    pushReason(reasons, "sequence includes at least one decisive crop moment");
  }

  if (!peakBeatFeelsPeak) {
    score.premiumFeel -= 0.05;
    score.conversionStrength -= 0.05;
    pushReason(reasons, "proof beat is not visually strong enough for the campaign peak");
  }

  if (!hasSideRhythm) {
    score.distinctiveness -= 0.04;
    score.hierarchyClarity -= 0.03;
    pushReason(reasons, "device staging lacks left-right rhythm across the board");
  }

  if (!distinctClose) {
    score.conversionStrength -= 0.04;
    pushReason(reasons, "closing beat reuses the proof screen instead of creating a fresh payoff");
  }

  if (candidate.directionThesis === "clarity-first" && candidate.overlayBehavior !== "none") {
    score.textReadability -= 0.04;
    pushReason(reasons, "clarity-first direction is carrying unnecessary overlay treatment");
  }

  if (candidate.directionThesis === "brand-signature-first" && candidate.overlayBehavior === "none") {
    score.premiumFeel -= 0.04;
    score.brandFit -= 0.03;
    pushReason(reasons, "brand-signature direction needs stronger surface treatment");
  }

  if (candidate.directionThesis === "campaign-first" && candidate.overlayBehavior === "none") {
    score.distinctiveness -= 0.05;
    pushReason(reasons, "campaign-first direction lacks enough visual tension");
  }

  return {
    scores: {
      premiumFeel: clamp(score.premiumFeel),
      hierarchyClarity: clamp(score.hierarchyClarity),
      screenshotFit: clamp(score.screenshotFit),
      distinctiveness: clamp(score.distinctiveness),
      narrativeCoherence: clamp(score.narrativeCoherence),
      textReadability: clamp(score.textReadability),
      brandFit: clamp(score.brandFit),
      conversionStrength: clamp(score.conversionStrength),
    },
    reasons,
  };
}

export function evaluateSeedSequence(
  candidate: SequenceCandidate,
  variantId: VariantId,
): ScoredSequence {
  const evaluation = buildScore(candidate, variantId);

  return computeSequenceScore({
    candidate,
    scores: evaluation.scores,
    reasons: evaluation.reasons,
  });
}
