import type { SlideConfig } from "@appforge/screenshot-gen";
import type { SlidePlan } from "@/ai/schemas";
import type { Variant, VariantId } from "@/domain/types";

const MIN_ZOOM: Record<string, number> = {
  hero: 1.1,
  "feature-single": 1.3,
  detail: 1.5,
  result: 1.4,
};

const AI_LAYOUT_MAP: Record<string, string> = {
  "text-only": "text-only",
  "device-focus": "device-dominant",
  split: "device-left",
  immersive: "zoom-detail",
};

const LAYOUT_SEQUENCE = [
  "device-center",
  "device-left",
  "zoom-detail",
  "device-right",
  "device-dominant",
  "text-only",
];

export interface AppliedAiPlansResult {
  readonly variants: Record<VariantId, Variant>;
  readonly layoutsUsed: string[];
  readonly appliedCount: number;
}

function normalizeLayoutType(
  slide: SlideConfig,
  plan: SlidePlan,
  previousLayout: string | undefined,
): string {
  let layoutType = AI_LAYOUT_MAP[plan.composition.layoutType] ?? "device-center";

  if (layoutType === "device-center") {
    const alignment = plan.composition.device.alignment;
    if (alignment === "left") layoutType = "device-left";
    if (alignment === "right") layoutType = "device-right";
  }

  if (!plan.composition.device.visible) {
    layoutType = "text-only";
  }

  if (slide.type === "hero") {
    layoutType = "device-center";
  }

  if (previousLayout === layoutType && layoutType !== "device-center") {
    const altIndex = LAYOUT_SEQUENCE.indexOf(layoutType);
    return LAYOUT_SEQUENCE[(altIndex + 1) % LAYOUT_SEQUENCE.length] ?? layoutType;
  }

  return layoutType;
}

function applyPlanToSlide(slide: SlideConfig, plan: SlidePlan, previousLayout?: string): SlideConfig {
  if (
    slide.type !== "hero" &&
    slide.type !== "feature-single" &&
    slide.type !== "detail" &&
    slide.type !== "result"
  ) {
    return slide;
  }

  const crop = plan.composition.crop;
  const device = plan.composition.device;
  const minZoom = MIN_ZOOM[slide.type] ?? 1.1;
  const zoom = Math.max(minZoom, crop.zoom ?? minZoom);
  const layoutType = normalizeLayoutType(slide, plan, previousLayout);

  let deviceOffsetX = 0;
  if (Math.abs(crop.offsetX ?? 0) > 2) {
    deviceOffsetX = crop.offsetX;
  } else {
    const alignmentMap: Record<string, number> = { left: -18, right: 18, center: 0 };
    deviceOffsetX = alignmentMap[device.alignment] ?? 0;
  }

  if (slide.type === "hero") {
    deviceOffsetX = Math.max(-10, Math.min(deviceOffsetX, 10));
  }

  const deviceScale =
    device.scale && device.scale !== 1
      ? Math.max(0.85, Math.min(device.scale * 0.65, 1.3))
      : 1;

  return {
    ...slide,
    zoom,
    offsetX: crop.offsetX ?? 0,
    offsetY: crop.offsetY ?? 0,
    deviceOffsetX,
    deviceScale,
    layoutType,
  } as SlideConfig;
}

function enforceLayoutVariation(variants: Record<VariantId, Variant>, layoutsUsed: string[]) {
  const uniqueLayouts = new Set(layoutsUsed);

  if (uniqueLayouts.size < 2 && layoutsUsed.length >= 3) {
    const forcedLayouts = ["device-left", "zoom-detail", "device-right"];
    for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
      const slides = [...variants[variantId].slides];
      let forceIndex = 0;
      for (let i = 0; i < slides.length && forceIndex < forcedLayouts.length; i++) {
        if (slides[i].type === "feature-single" || slides[i].type === "detail") {
          slides[i] = { ...slides[i], layoutType: forcedLayouts[forceIndex] } as SlideConfig;
          forceIndex++;
        }
      }
      variants[variantId] = { ...variants[variantId], slides };
    }
  }

  const hasNonDevice = layoutsUsed.some((layout) => layout === "text-only" || layout === "zoom-detail");
  if (!hasNonDevice && layoutsUsed.length >= 4) {
    for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
      const slides = [...variants[variantId].slides];
      const lastDetail = slides.findLastIndex((slide) => slide.type === "detail");
      if (lastDetail >= 0) {
        slides[lastDetail] = { ...slides[lastDetail], layoutType: "zoom-detail" } as SlideConfig;
        variants[variantId] = { ...variants[variantId], slides };
      }
    }
  }
}

export function applyAiSlidePlans(
  variants: Record<VariantId, Variant>,
  slidePlans: SlidePlan[],
): AppliedAiPlansResult {
  const nextVariants = { ...variants };
  const layoutsUsed: string[] = [];
  let appliedCount = 0;

  for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
    const slides = nextVariants[variantId].slides.map((slide, index) => {
      const plan = slidePlans[index];
      if (!plan) {
        return slide;
      }

      const previousLayout = variantId === "midnight" ? layoutsUsed[layoutsUsed.length - 1] : undefined;
      const updated = applyPlanToSlide(slide, plan, previousLayout);
      const updatedLayout =
        "layoutType" in updated && typeof updated.layoutType === "string"
          ? updated.layoutType
          : undefined;

      if (variantId === "midnight" && updatedLayout) {
        layoutsUsed.push(updatedLayout);
      }

      if (updated !== slide) {
        appliedCount++;
      }

      return updated;
    });

    nextVariants[variantId] = {
      ...nextVariants[variantId],
      slides,
    };
  }

  enforceLayoutVariation(nextVariants, layoutsUsed);

  return {
    variants: nextVariants,
    layoutsUsed,
    appliedCount,
  };
}
