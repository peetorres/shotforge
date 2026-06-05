import type {
  BackgroundTreatment,
  OverlayBehavior,
  RepairAction,
  ScoredSequence,
  SequenceCandidate,
  TypographyFamily,
} from "@/domain/types";

const BACKGROUND_BY_THESIS: Record<SequenceCandidate["directionThesis"], BackgroundTreatment> = {
  "clarity-first": "derived-gradient",
  "brand-signature-first": "blurred-extraction",
  "campaign-first": "soft-glow",
};

const OVERLAY_BY_THESIS: Record<SequenceCandidate["directionThesis"], OverlayBehavior> = {
  "clarity-first": "none",
  "brand-signature-first": "strong-panel",
  "campaign-first": "edge-label",
};

const TYPOGRAPHY_BY_THESIS: Record<SequenceCandidate["directionThesis"], TypographyFamily> = {
  "clarity-first": "display-sans",
  "brand-signature-first": "compact-sans",
  "campaign-first": "editorial-serif",
};

function repairCandidate(candidate: SequenceCandidate, action: RepairAction): SequenceCandidate {
  let slides = candidate.slides.map((slide) => ({ ...slide }));
  let focalCropProfile = candidate.focalCropProfile;

  if (action.targets.includes("crop")) {
    const updated = slides.map((slide) => {
      if (slide.type === "detail") {
        return {
          ...slide,
          layoutType: "zoom-detail" as const,
          zoom: Math.max(slide.zoom ?? 1, 1.45),
        };
      }

      if (slide.type === "feature-single" || slide.type === "result") {
        return {
          ...slide,
          zoom: Math.max(slide.zoom ?? 1, 1.25),
        };
      }

      return slide;
    });

    slides = updated;
    focalCropProfile = candidate.directionThesis === "clarity-first"
      ? "balanced-frame"
      : "detail-closeup";
  }

  if (action.targets.includes("layout")) {
    slides = slides.map((slide, index) => {
      if (slide.type === "feature-single") {
        return {
          ...slide,
          layoutType: index === slides.length - 1 ? "device-right" as const : "device-left" as const,
        };
      }

      return slide;
    });
  }

  return {
    ...candidate,
    slides,
    layoutFamily:
      candidate.directionThesis === "clarity-first"
        ? "editorial-single"
        : candidate.directionThesis === "brand-signature-first"
          ? "device-led"
          : "stacked-story",
    typographyFamily: action.targets.includes("typography")
      ? TYPOGRAPHY_BY_THESIS[candidate.directionThesis]
      : candidate.typographyFamily,
    backgroundTreatment: action.targets.includes("background")
      ? BACKGROUND_BY_THESIS[candidate.directionThesis]
      : candidate.backgroundTreatment,
    overlayBehavior: action.targets.includes("overlay")
      ? OVERLAY_BY_THESIS[candidate.directionThesis]
      : candidate.overlayBehavior,
    focalCropProfile,
  };
}

export function applyRepairActions(
  sequences: ScoredSequence[],
  repairActions: RepairAction[],
): SequenceCandidate[] {
  const actionsBySequenceId = new Map(repairActions.map((action) => [action.sequenceId, action]));

  return sequences.map((sequence) => {
    const action = actionsBySequenceId.get(sequence.candidate.id);
    if (!action) {
      return sequence.candidate;
    }

    return repairCandidate(sequence.candidate, action);
  });
}
