import { describe, expect, it } from "vitest";

import type { SlidePlan } from "@/ai/schemas";
import { createVariants } from "@/domain/variant";

import { applyAiSlidePlans } from "./apply-slide-plans";

const plans: SlidePlan[] = [
  {
    role: "hook",
    headline: "See it clearly",
    composition: {
      layoutType: "device-focus",
      device: { visible: true, alignment: "center", rotation: 0, scale: 1 },
      crop: { strategy: "focus", focalPoint: "main chart", zoom: 1.25, offsetX: 0, offsetY: 0 },
    },
    visual: {
      background: "gradient",
      intensity: "medium",
      overlays: [],
      depth: "layered",
    },
    priority: 1,
  },
  {
    role: "problem",
    headline: "State the tension",
    composition: {
      layoutType: "text-only",
      device: { visible: false, alignment: "center", rotation: 0, scale: 1 },
      crop: { strategy: "full", focalPoint: "text block", zoom: 1, offsetX: 0, offsetY: 0 },
    },
    visual: {
      background: "solid",
      intensity: "low",
      overlays: [],
      depth: "flat",
    },
    priority: 2,
  },
  {
    role: "solution",
    headline: "Zoom into progress",
    composition: {
      layoutType: "immersive",
      device: { visible: true, alignment: "left", rotation: 6, scale: 1.1 },
      crop: { strategy: "zoom", focalPoint: "streak counter", zoom: 1.6, offsetX: -14, offsetY: 0 },
    },
    visual: {
      background: "blurred",
      intensity: "high",
      overlays: [],
      depth: "cinematic",
    },
    priority: 3,
  },
];

describe("applyAiSlidePlans", () => {
  it("applies AI composition decisions across variants", () => {
    const variants = createVariants(
      ["screen1.png", "screen2.png", "screen3.png"],
      "Sensei",
      "#6366F1",
    );

    const result = applyAiSlidePlans(variants, plans);

    expect(result.appliedCount).toBeGreaterThan(0);
    expect(result.layoutsUsed.length).toBeGreaterThan(0);
    const featureSlide = result.variants.midnight.slides.find((slide) => slide.type === "feature-single");
    expect(featureSlide && "zoom" in featureSlide ? featureSlide.zoom : 0).toBeGreaterThanOrEqual(1.3);
  });
});
