/**
 * Design Tokens — Resolved per variant
 *
 * Canonical: DESIGN_SYSTEM.md
 * Both CSS and screenshot-gen renderers use these resolved values.
 */

import type { VariantId } from "@/domain/types";

export interface DesignTokens {
  typography: Record<string, { family: string; weight: number; size: number; lineHeight: number; tracking: number }>;
  color: Record<string, string>;
  spacing: Record<string, number>;
  shadow: Record<string, string>;
  device: Record<string, { cornerRadius: number; bezelWidth: number }>;
}

// ─── Typography (shared across variants) ────────

const TYPOGRAPHY = {
  "heading-2xl": { family: "Inter", weight: 800, size: 72, lineHeight: 1.1, tracking: -2 },
  "heading-xl": { family: "Inter", weight: 800, size: 56, lineHeight: 1.15, tracking: -1.5 },
  "heading-lg": { family: "Inter", weight: 700, size: 44, lineHeight: 1.2, tracking: -1 },
  "body-md": { family: "Inter", weight: 400, size: 28, lineHeight: 1.4, tracking: 0 },
  "body-sm": { family: "Inter", weight: 500, size: 22, lineHeight: 1.4, tracking: 0.3 },
  "caption": { family: "Inter", weight: 600, size: 18, lineHeight: 1.3, tracking: 0.5 },
  "badge": { family: "Inter", weight: 700, size: 20, lineHeight: 1, tracking: 3 },
} as const;

const SPACING = {
  xs: 8, sm: 16, md: 24, lg: 40, xl: 60, "2xl": 80,
} as const;

const SHADOWS = {
  "none": "none",
  "elevation-1": "0 4px 16px rgba(0,0,0,0.15)",
  "elevation-2": "0 8px 32px rgba(0,0,0,0.25)",
  "elevation-3": "0 16px 48px rgba(0,0,0,0.4)",
  "device-shadow": "0 8px 40px rgba(0,0,0,0.35)",
} as const;

const DEVICE = {
  "iphone-full": { cornerRadius: 55, bezelWidth: 4 },
  "iphone-minimal": { cornerRadius: 40, bezelWidth: 0 },
  "frameless": { cornerRadius: 20, bezelWidth: 0 },
} as const;

// ─── Color Palettes (variant-specific) ──────────

function midnightColors(brandColor: string): Record<string, string> {
  return {
    "bg-primary": "#0D0D18",
    "bg-gradient-start": "#0D0D18",
    "bg-gradient-end": "#1a1033",
    "text-primary": "#FFFFFF",
    "text-secondary": "rgba(255,255,255,0.7)",
    "text-tertiary": "rgba(255,255,255,0.4)",
    "brand-accent": brandColor,
    "star-color": brandColor,
    "badge-bg": "transparent",
    "badge-border": brandColor,
    "badge-text": brandColor,
    "check-color": brandColor,
    "glow-color": brandColor,
    "device-bg": "#1c1c1e",
  };
}

function cleanColors(brandColor: string): Record<string, string> {
  return {
    "bg-primary": "#F5F5F7",
    "bg-gradient-start": "#F5F5F7",
    "bg-gradient-end": "#E8E8ED",
    "text-primary": "#1D1D1F",
    "text-secondary": "rgba(0,0,0,0.55)",
    "text-tertiary": "rgba(0,0,0,0.3)",
    "brand-accent": brandColor,
    "star-color": brandColor,
    "badge-bg": "transparent",
    "badge-border": brandColor,
    "badge-text": brandColor,
    "check-color": brandColor,
    "glow-color": brandColor,
    "device-bg": "#e5e5ea",
  };
}

function vividColors(brandColor: string): Record<string, string> {
  return {
    "bg-primary": "#0D0D18",
    "bg-gradient-start": `${brandColor}33`,
    "bg-gradient-end": "#0D0D18",
    "text-primary": "#FFFFFF",
    "text-secondary": "rgba(255,255,255,0.75)",
    "text-tertiary": "rgba(255,255,255,0.4)",
    "brand-accent": brandColor,
    "star-color": brandColor,
    "badge-bg": `${brandColor}22`,
    "badge-border": brandColor,
    "badge-text": brandColor,
    "check-color": brandColor,
    "glow-color": brandColor,
    "device-bg": "#1c1c1e",
  };
}

// ─── Token Resolution ───────────────────────────

export function resolveTokens(variant: VariantId, brandColor: string): DesignTokens {
  const colorResolvers: Record<VariantId, (bc: string) => Record<string, string>> = {
    midnight: midnightColors,
    clean: cleanColors,
    vivid: vividColors,
  };

  return {
    typography: { ...TYPOGRAPHY },
    color: colorResolvers[variant](brandColor),
    spacing: { ...SPACING },
    shadow: { ...SHADOWS },
    device: { ...DEVICE },
  };
}

// ─── Resolve a single token ─────────────────────

export function resolveColorToken(tokens: DesignTokens, tokenName: string): string {
  return tokens.color[tokenName] ?? tokenName; // fallback to raw value if not a token
}

export function resolveTypographyToken(tokens: DesignTokens, tokenName: string) {
  return tokens.typography[tokenName] ?? tokens.typography["body-md"];
}

export function resolveShadowToken(tokens: DesignTokens, tokenName: string): string {
  return tokens.shadow[tokenName] ?? "none";
}
