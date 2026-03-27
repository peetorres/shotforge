import type { SlideTemplate } from "../types";

/**
 * Feature Centered — Headline + centered device below.
 * The workhorse feature template. Clean, focused, reliable.
 */
export const featureCentered: SlideTemplate = {
  id: "feature-centered",
  version: 1,
  name: "Centered Feature",
  category: "feature",
  tags: ["feature", "single", "centered", "clean"],
  description: "Headline text on top, device centered below with glow",

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
      position: { x: 50, y: 65, anchor: "center" },
      size: { width: 60, height: 50 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.2, blurPx: 60 },
    },
    {
      type: "text", id: "headline", zIndex: 3, visible: true,
      position: { x: 50, y: 5, anchor: "top-center" },
      size: { width: 80, height: "auto" },
      content: { binding: "headline", fallback: ["**Smart** learning\nmade simple"] },
      style: { fontToken: "heading-xl", colorToken: "text-primary", alignment: "center", maxLines: 2, boldStyle: "brand-color" },
    },
    {
      type: "image", id: "device", zIndex: 2, visible: true,
      position: { x: 50, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 70 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "iphone-full", angle: 0, scale: 1, shadowToken: "device-shadow", cropRule: "top" },
    },
  ],
};
