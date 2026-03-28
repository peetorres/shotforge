/**
 * Lumo Visual System — CANONICAL (FROZEN)
 *
 * Base: Glass Precision
 * Integrated: Controlled glow from Depth & Glow, typographic restraint from Editorial
 *
 * DEC-018: Selected as canonical visual system.
 *
 * Material hierarchy:
 *   Base (app bg) → Surface (cards, panels) → Floating (active/hovered)
 */

export interface LumoTokens {
  base: string;
  surface: string;
  surfaceHover: string;
  floating: string;
  surfaceBorder: string;
  surfaceBlur: number;
  surfaceInnerHighlight: string;
  shadowRest: string;
  shadowHover: string;
  shadowFloating: string;
  glowOpacity: number;
  glowBlur: number;
  cardRadius: number;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easeDefault: string;
  easeOut: string;
  easeSpring: string;
  hoverScale: number;
  hoverLift: number;
  pressScale: number;
  headlineWeight: number;
  headlineTracking: number;
}

export const lumo: LumoTokens = {
  base: "#09090b",
  surface: "rgba(255,255,255,0.035)",
  surfaceHover: "rgba(255,255,255,0.055)",
  floating: "rgba(255,255,255,0.07)",
  surfaceBorder: "rgba(255,255,255,0.07)",
  surfaceBlur: 16,
  surfaceInnerHighlight: "inset 0 0.5px 0 rgba(255,255,255,0.06)",
  shadowRest: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1)",
  shadowHover: "0 1px 2px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.1), 0 20px 48px rgba(0,0,0,0.15)",
  shadowFloating: "0 2px 4px rgba(0,0,0,0.12), 0 12px 28px rgba(0,0,0,0.12), 0 28px 64px rgba(0,0,0,0.18)",
  glowOpacity: 0.07,
  glowBlur: 100,
  cardRadius: 20,
  durationFast: "0.15s",
  durationNormal: "0.25s",
  durationSlow: "0.4s",
  easeDefault: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  hoverScale: 1.01,
  hoverLift: 2,
  pressScale: 0.98,
  headlineWeight: 800,
  headlineTracking: -1.5,
};

export function brandGlow(brandColor: string, opacity?: number): string {
  const op = opacity ?? lumo.glowOpacity;
  const hex = Math.round(op * 255).toString(16).padStart(2, "0");
  return `0 0 ${lumo.glowBlur}px ${brandColor}${hex}`;
}
