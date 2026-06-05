import type {
  CampaignBoard,
  CampaignFramePlan,
  NarrativeDirection,
  ProjectBrief,
  ScreenshotAnalysis,
  SequenceCandidate,
  SequenceRoleAssignment,
  Variant,
  VariantId,
} from "@/domain/types";
import type {
  DetailSlide,
  FeatureSingleSlide,
  HeroSlide,
  ResultSlide,
  SlideConfig,
  StatementSlide,
} from "@appforge/screenshot-gen";

const LAYOUT_BY_VARIANT: Record<VariantId, SequenceCandidate["layoutFamily"]> = {
  clean: "editorial-single",
  midnight: "device-led",
  vivid: "stacked-story",
};

const TYPOGRAPHY_BY_VARIANT: Record<VariantId, SequenceCandidate["typographyFamily"]> = {
  clean: "display-sans",
  midnight: "compact-sans",
  vivid: "editorial-serif",
};

const BACKGROUND_BY_VARIANT: Record<VariantId, SequenceCandidate["backgroundTreatment"]> = {
  clean: "derived-gradient",
  midnight: "blurred-extraction",
  vivid: "soft-glow",
};

const CROP_BY_VARIANT: Record<VariantId, SequenceCandidate["focalCropProfile"]> = {
  clean: "balanced-frame",
  midnight: "tight-hero",
  vivid: "detail-closeup",
};

const OVERLAY_BY_VARIANT: Record<VariantId, SequenceCandidate["overlayBehavior"]> = {
  clean: "none",
  midnight: "strong-panel",
  vivid: "edge-label",
};

interface SeedSlides {
  readonly hero?: HeroSlide;
  readonly statement?: StatementSlide;
  readonly feature?: FeatureSingleSlide;
  readonly detail?: DetailSlide;
  readonly result?: ResultSlide;
}

function collectSeedSlides(slides: SlideConfig[]): SeedSlides {
  return slides.reduce<SeedSlides>((acc, slide) => {
    if (slide.type === "hero" && !acc.hero) return { ...acc, hero: slide };
    if (slide.type === "statement" && !acc.statement) return { ...acc, statement: slide };
    if (slide.type === "feature-single" && !acc.feature) return { ...acc, feature: slide };
    if (slide.type === "detail" && !acc.detail) return { ...acc, detail: slide };
    if (slide.type === "result" && !acc.result) return { ...acc, result: slide };
    return acc;
  }, {});
}

function fallbackScreenshot(frame: CampaignFramePlan, seedSlides: SeedSlides): string {
  return frame.screenshotId
    ?? seedSlides.hero?.screenshot
    ?? seedSlides.feature?.screenshot
    ?? seedSlides.detail?.screenshot
    ?? seedSlides.result?.screenshot
    ?? "";
}

function buildSlideFromFrame(
  frame: CampaignFramePlan,
  seedSlides: SeedSlides,
  brief: ProjectBrief,
): SlideConfig {
  const screenshot = fallbackScreenshot(frame, seedSlides);

  if (frame.sequenceRole === "hero") {
    return {
      type: "hero",
      appName: seedSlides.hero?.appName ?? brief.brand,
      tagline: seedSlides.hero?.tagline ?? ["Learn like a", "**pro.**"],
      bullets: seedSlides.hero?.bullets ?? [],
      showStars: seedSlides.hero?.showStars ?? true,
      badgeText: seedSlides.hero?.badgeText,
      screenshot,
    };
  }

  if (frame.sequenceRole === "statement") {
    return {
      type: "statement",
      headline: seedSlides.statement?.headline ?? ["Consistency beats", "**motivation.**"],
      subline: seedSlides.statement?.subline ?? brief.description,
    };
  }

  if (frame.sequenceRole === "feature") {
    return {
      type: "feature-single",
      headline: seedSlides.feature?.headline ?? ["Build daily", "**momentum**"],
      screenshot,
      angle: seedSlides.feature?.angle ?? 0,
    };
  }

  if (frame.sequenceRole === "detail") {
    return {
      type: "detail",
      headline: seedSlides.detail?.headline ?? ["Built to make", "**progress stick.**"],
      screenshot,
      cropRule: seedSlides.detail?.cropRule ?? "focus",
    };
  }

  if (frame.sequenceRole === "proof") {
    return {
      type: "result",
      headline: seedSlides.result?.headline ?? ["Daily wins,", "**made visible.**"],
      metric: seedSlides.result?.metric,
      screenshot,
    };
  }

  return {
    type: "result",
    headline: ["Keep learning.", "**Stay sharp.**"],
    metric: seedSlides.result?.metric,
    screenshot,
  };
}

function safeRegionSide(
  analysis: ScreenshotAnalysis | undefined,
  preferredSide: CampaignFramePlan["preferredSide"],
): "left" | "right" | "top" {
  if (preferredSide !== "center") {
    return preferredSide;
  }

  const region = analysis?.safeTextRegions[0];
  if (!region) return "top";

  const centerX = region.x + region.width / 2;
  const centerY = region.y + region.height / 2;

  if (centerY < 320) return "top";
  return centerX < 500 ? "left" : "right";
}

function enhanceHeroSlide(
  slide: HeroSlide,
  frame: CampaignFramePlan,
  thesis: SequenceCandidate["directionThesis"],
  analysis?: ScreenshotAnalysis,
): HeroSlide {
  const region = safeRegionSide(analysis, frame.preferredSide);

  const layoutType =
    frame.visualWeight === "device-led"
      ? region === "left"
        ? "device-left"
        : "device-right"
      : thesis === "brand-signature-first"
        ? "device-dominant"
        : "device-center";

  const energyScale =
    frame.energy === "peak" ? 1.16
    : frame.energy === "elevated" ? 1.08
    : frame.energy === "balanced" ? 1.02
    : 0.96;

  return {
    ...slide,
    layoutType,
    deviceScale:
      layoutType === "device-dominant"
        ? Math.max(slide.deviceScale ?? 1, energyScale + 0.08)
        : Math.max(slide.deviceScale ?? 1, energyScale),
    deviceOffsetX:
      region === "left" ? 12 : region === "right" ? -12 : thesis === "campaign-first" ? -4 : 0,
  };
}

function enhanceStatementSlide(
  slide: StatementSlide,
  frame: CampaignFramePlan,
  brief: ProjectBrief,
): StatementSlide {
  return {
    ...slide,
    subline:
      frame.role === "tension"
        ? brief.description
        : slide.subline,
  };
}

function enhanceFeatureLikeSlide(
  slide: FeatureSingleSlide | DetailSlide | ResultSlide,
  frame: CampaignFramePlan,
  thesis: SequenceCandidate["directionThesis"],
  analysis?: ScreenshotAnalysis,
): FeatureSingleSlide | DetailSlide | ResultSlide {
  const region = safeRegionSide(analysis, frame.preferredSide);
  const density = analysis?.compositionDensity ?? 0.58;
  const hierarchy = analysis?.hierarchySignal ?? 0.76;
  const cropOps = analysis?.cropOpportunities ?? [];
  const hasDetailOpportunity = cropOps.includes("detail-closeup");
  const prefersWide = cropOps.includes("contextual-wide");
  const isDetail = slide.type === "detail";
  const isResult = slide.type === "result";

  const layoutType =
    frame.visualWeight === "immersive"
      ? "zoom-detail"
      : frame.visualWeight === "device-led"
        ? thesis === "brand-signature-first" && hierarchy >= 0.84
          ? "device-dominant"
          : region === "left"
            ? "device-left"
            : "device-right"
        : frame.visualWeight === "text-led"
          ? "device-center"
          : isDetail && hasDetailOpportunity
            ? "zoom-detail"
            : region === "top"
              ? "device-center"
              : region === "left"
                ? "device-left"
                : "device-right";

  const baseZoom =
    layoutType === "zoom-detail"
      ? Math.max(isDetail ? 1.34 : 1.22, frame.energy === "peak" ? 1.44 : 1.34)
      : frame.role === "proof"
        ? 1.16
        : isResult && density >= 0.66
          ? 1.14
          : isDetail
            ? 1.18
            : 1.08;

  const offsetX =
    region === "left"
      ? 14
      : region === "right"
        ? -14
        : prefersWide
          ? 0
          : thesis === "campaign-first"
            ? -8
            : 0;

  const deviceScale =
    layoutType === "device-dominant"
      ? 1.18
      : frame.energy === "peak"
        ? 1.1
        : frame.energy === "elevated"
          ? 1.05
          : thesis === "clarity-first"
            ? 0.98
            : 1.02;

  return {
    ...slide,
    layoutType,
    zoom: Math.max(slide.zoom ?? 1, baseZoom),
    offsetX,
    offsetY: isDetail ? -2 : frame.role === "proof" ? -1 : 0,
    deviceOffsetX: layoutType === "device-center" ? 0 : region === "left" ? 12 : -12,
    deviceScale,
  };
}

function buildSlideRoles(board: CampaignBoard): SequenceRoleAssignment[] {
  return board.framePlans.flatMap((frame) =>
    frame.screenshotId
      ? [{ screenshotId: frame.screenshotId, role: frame.sequenceRole }]
      : [],
  );
}

function isFeatureLikeSlide(
  slide: SlideConfig,
): slide is FeatureSingleSlide | DetailSlide | ResultSlide {
  return slide.type === "feature-single" || slide.type === "detail" || slide.type === "result";
}

function materializeSlides(
  brief: ProjectBrief,
  variant: Variant,
  thesis: SequenceCandidate["directionThesis"],
  analysesByScreenshotId: Map<string, ScreenshotAnalysis>,
  board: CampaignBoard,
): SlideConfig[] {
  const seedSlides = collectSeedSlides(variant.slides);

  return board.framePlans.map((frame) => {
    const base = buildSlideFromFrame(frame, seedSlides, brief);

    if (base.type === "hero") {
      return enhanceHeroSlide(
        base,
        frame,
        thesis,
        base.screenshot ? analysesByScreenshotId.get(base.screenshot) : undefined,
      );
    }

    if (base.type === "statement") {
      return enhanceStatementSlide(base, frame, brief);
    }

    if (isFeatureLikeSlide(base)) {
      return enhanceFeatureLikeSlide(
        base,
        frame,
        thesis,
        analysesByScreenshotId.get(base.screenshot),
      );
    }

    return base;
  });
}

export function buildSequenceCandidate(input: {
  readonly brief: ProjectBrief;
  readonly variantId: VariantId;
  readonly variant: Variant;
  readonly direction: NarrativeDirection;
  readonly analyses: ScreenshotAnalysis[];
  readonly board: CampaignBoard;
}): SequenceCandidate {
  const { brief, variantId, variant, direction, analyses, board } = input;
  const analysesByScreenshotId = new Map(analyses.map((analysis) => [analysis.screenshotId, analysis]));
  const slides = materializeSlides(brief, variant, direction.thesis, analysesByScreenshotId, board);

  return {
    id: `seed-${variantId}`,
    briefId: brief.sessionId,
    campaignBoardId: board.id,
    directionId: direction.id,
    directionThesis: direction.thesis,
    style: variant.style,
    orderedScreenshotIds: board.framePlans.flatMap((frame) => (frame.screenshotId ? [frame.screenshotId] : [])),
    slides,
    framePlans: board.framePlans,
    layoutFamily: LAYOUT_BY_VARIANT[variantId],
    typographyFamily: TYPOGRAPHY_BY_VARIANT[variantId],
    backgroundTreatment: BACKGROUND_BY_VARIANT[variantId],
    focalCropProfile: CROP_BY_VARIANT[variantId],
    overlayBehavior: OVERLAY_BY_VARIANT[variantId],
    slideRoles: buildSlideRoles(board),
  };
}
