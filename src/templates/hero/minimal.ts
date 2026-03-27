import type { SlideTemplate } from "../types";

/**
 * Hero Minimal — App name + full-screen device.
 * Content-forward. The app IS the hero.
 * Carefully designed to avoid looking empty (per DEC feedback).
 */
export const heroMinimal: SlideTemplate = {
  id: "hero-minimal",
  version: 1,
  name: "Minimal Hero",
  category: "hero",
  tags: ["hero", "minimal", "content-forward", "frameless"],
  description: "Subtle app name, frameless device fills the canvas. App content is the star.",

  elements: [
    {
      type: "background", id: "bg", zIndex: 0, visible: true,
      position: { x: 0, y: 0, anchor: "top-left" }, size: { width: 100, height: 100 },
      style: {
        colorToken: "bg-primary",
        gradient: { type: "linear", angle: 180, stops: [
          { offset: 0, colorToken: "bg-gradient-start" },
          { offset: 100, colorToken: "bg-gradient-end" },
        ]},
      },
    },
    {
      type: "text", id: "app-name", zIndex: 3, visible: true,
      position: { x: 50, y: 3, anchor: "top-center" },
      size: { width: 60, height: "auto" },
      content: { binding: "app-name", fallback: ["App"] },
      style: { fontToken: "heading-lg", colorToken: "text-primary", alignment: "center", maxLines: 1, boldStyle: "brand-color" },
    },
    {
      type: "text", id: "tagline", zIndex: 3, visible: true,
      position: { x: 50, y: 9, anchor: "top-center" },
      size: { width: 70, height: "auto" },
      content: { binding: "tagline", fallback: ["Designed for **you**"] },
      style: { fontToken: "body-sm", colorToken: "text-secondary", alignment: "center", maxLines: 1, boldStyle: "brand-color" },
    },
    {
      type: "glow", id: "subtle-glow", zIndex: 1, visible: true,
      position: { x: 50, y: 60, anchor: "center" },
      size: { width: 80, height: 50 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.12, blurPx: 80 },
    },
    {
      type: "image", id: "device", zIndex: 2, visible: true,
      position: { x: 50, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 82 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "frameless", angle: 0, scale: 1, shadowToken: "elevation-2", cropRule: "top" },
    },
  ],

  constraints: { minDeviceHeightPercent: 75, maxHeadlineLines: 1 },
};
