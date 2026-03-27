import type { SlideTemplate } from "../types";

/**
 * Feature Angled — Headline + tilted device.
 * Dynamic, energetic. Adds visual interest to feature showcases.
 */
export const featureAngled: SlideTemplate = {
  id: "feature-angled",
  version: 1,
  name: "Angled Feature",
  category: "feature",
  tags: ["feature", "single", "angled", "dynamic"],
  description: "Headline on top, device tilted at an angle with strong shadow",

  elements: [
    {
      type: "background", id: "bg", zIndex: 0, visible: true,
      position: { x: 0, y: 0, anchor: "top-left" }, size: { width: 100, height: 100 },
      style: {
        colorToken: "bg-primary",
        gradient: { type: "linear", angle: 160, stops: [
          { offset: 0, colorToken: "bg-gradient-start" },
          { offset: 100, colorToken: "bg-gradient-end" },
        ]},
      },
    },
    {
      type: "glow", id: "device-glow", zIndex: 1, visible: true,
      position: { x: 55, y: 65, anchor: "center" },
      size: { width: 65, height: 55 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.25, blurPx: 65 },
    },
    {
      type: "text", id: "headline", zIndex: 3, visible: true,
      position: { x: 50, y: 5, anchor: "top-center" },
      size: { width: 80, height: "auto" },
      content: { binding: "headline", fallback: ["Track your\n**progress**"] },
      style: { fontToken: "heading-xl", colorToken: "text-primary", alignment: "center", maxLines: 2, boldStyle: "brand-color" },
    },
    {
      type: "image", id: "device", zIndex: 2, visible: true,
      position: { x: 52, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 70 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "iphone-full", angle: 8, scale: 1, shadowToken: "elevation-3", cropRule: "top" },
    },
  ],
};
