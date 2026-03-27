import type { SlideTemplate } from "../types";

/**
 * Feature Dual — Headline + 2 devices side-by-side.
 * For comparison, before/after, or showcasing multiple screens.
 * Only used when 2+ screenshots benefit from dual composition.
 */
export const featureDual: SlideTemplate = {
  id: "feature-dual",
  version: 1,
  name: "Dual Feature",
  category: "feature",
  tags: ["feature", "dual", "comparison", "multi-screen"],
  description: "Headline on top, two devices side-by-side at opposing angles",

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
      type: "glow", id: "glow-left", zIndex: 1, visible: true,
      position: { x: 35, y: 65, anchor: "center" },
      size: { width: 45, height: 45 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.18, blurPx: 55 },
    },
    {
      type: "glow", id: "glow-right", zIndex: 1, visible: true,
      position: { x: 65, y: 65, anchor: "center" },
      size: { width: 45, height: 45 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.18, blurPx: 55 },
    },
    {
      type: "text", id: "headline", zIndex: 3, visible: true,
      position: { x: 50, y: 5, anchor: "top-center" },
      size: { width: 80, height: "auto" },
      content: { binding: "headline", fallback: ["**Two** is better\nthan one"] },
      style: { fontToken: "heading-xl", colorToken: "text-primary", alignment: "center", maxLines: 2, boldStyle: "brand-color" },
    },
    {
      type: "image", id: "device-left", zIndex: 2, visible: true,
      position: { x: 32, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 62 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "iphone-full", angle: 12, scale: 1, shadowToken: "elevation-3", cropRule: "top" },
    },
    {
      type: "image", id: "device-right", zIndex: 2, visible: true,
      position: { x: 68, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 62 },
      content: { binding: "screenshot:1", fallback: [] },
      style: { frameToken: "iphone-full", angle: -8, scale: 1, shadowToken: "elevation-3", cropRule: "top" },
    },
  ],
};
