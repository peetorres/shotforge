import type { SlideTemplate } from "../types";

/**
 * Hero Classic — Badge + Tagline + Stars + Bullets + Device
 * The flagship hero. Premium, information-rich, trust-building.
 */
export const heroClassic: SlideTemplate = {
  id: "hero-classic",
  version: 1,
  name: "Classic Hero",
  category: "hero",
  tags: ["hero", "badge", "stars", "bullets", "premium"],
  description: "Full hero with badge, tagline, star rating, feature bullets, and device showcase",

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
      position: { x: 50, y: 72, anchor: "center" },
      size: { width: 65, height: 55 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.25, blurPx: 60 },
    },
    {
      type: "shape", id: "badge", zIndex: 3, visible: true,
      position: { x: 50, y: 4, anchor: "top-center" },
      size: { width: "auto", height: "auto" },
      content: { binding: "badge-text", fallback: ["NEW RELEASE"] },
      style: { variant: "pill", fillToken: "badge-bg", strokeToken: "badge-border", strokeWidth: 2, fontToken: "badge", textColorToken: "badge-text" },
    },
    {
      type: "text", id: "tagline", zIndex: 3, visible: true,
      position: { x: 50, y: 10, anchor: "top-center" },
      size: { width: 88, height: "auto" },
      content: { binding: "tagline", fallback: ["Your app, **elevated**"] },
      style: { fontToken: "heading-2xl", colorToken: "text-primary", alignment: "center", maxLines: 2, boldStyle: "brand-color" },
    },
    {
      type: "rating", id: "stars", zIndex: 3, visible: true,
      position: { x: 50, y: 22, anchor: "top-center" },
      size: { width: "auto", height: "auto" },
      style: { starCount: 5, colorToken: "star-color", sizeToken: "body-md" },
    },
    {
      type: "image", id: "device", zIndex: 2, visible: true,
      position: { x: 50, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 68 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "iphone-full", angle: 0, scale: 1, shadowToken: "device-shadow", cropRule: "top" },
    },
  ],
};
