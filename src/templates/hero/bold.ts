import type { SlideTemplate } from "../types";

/**
 * Hero Bold — Large title + prominent device, no clutter.
 * Clean, confident. Lets the app speak.
 */
export const heroBold: SlideTemplate = {
  id: "hero-bold",
  version: 1,
  name: "Bold Hero",
  category: "hero",
  tags: ["hero", "bold", "minimal-text", "device-prominent"],
  description: "Large title with subtitle, prominent device. No badges, stars, or bullets.",

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
      size: { width: 70, height: 60 },
      style: { colorToken: "glow-color", radiusPercent: 50, opacity: 0.3, blurPx: 70 },
    },
    {
      type: "text", id: "tagline", zIndex: 3, visible: true,
      position: { x: 50, y: 6, anchor: "top-center" },
      size: { width: 85, height: "auto" },
      content: { binding: "tagline", fallback: ["Your app, **elevated**"] },
      style: { fontToken: "heading-2xl", colorToken: "text-primary", alignment: "center", maxLines: 2, boldStyle: "brand-color" },
    },
    {
      type: "text", id: "subtitle", zIndex: 3, visible: true,
      position: { x: 50, y: 17, anchor: "top-center" },
      size: { width: 70, height: "auto" },
      content: { binding: "subtitle", fallback: ["The smarter way to get things done"] },
      style: { fontToken: "body-md", colorToken: "text-secondary", alignment: "center", maxLines: 1, boldStyle: "none" },
    },
    {
      type: "image", id: "device", zIndex: 2, visible: true,
      position: { x: 50, y: 100, anchor: "bottom-center" },
      size: { width: "auto", height: 72 },
      content: { binding: "screenshot:0", fallback: [] },
      style: { frameToken: "iphone-full", angle: 0, scale: 1, shadowToken: "elevation-3", cropRule: "top" },
    },
  ],

  constraints: { minDeviceHeightPercent: 65 },
};
