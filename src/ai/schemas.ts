/**
 * AI Structured Output Schemas — Visual Intelligence System
 *
 * Used with OpenAI Responses API + Structured Outputs.
 * AI is a visual director, NOT the renderer.
 * All outputs feed into the deterministic Sharp+Satori engine.
 */

// ─── Screenshot Intent (per screenshot) ─────────

export interface ScreenshotIntent {
  screenshot_type: "dashboard" | "list" | "detail" | "progress" | "reward" | "onboarding" | "settings" | "unknown";
  focal_area: "top" | "upper-center" | "center" | "lower-center" | "bottom";
  key_element: "chart" | "progress-ring" | "card" | "avatar" | "mascot" | "button" | "number" | "text" | "illustration" | "mixed";
  crop_strategy: "top" | "center" | "focus-tight" | "focus-wide" | "full-bleed" | "statement-no-device";
  prominence: "hero" | "support" | "detail";
  emotion: "calm" | "intense" | "playful" | "disciplined" | "rewarding" | "technical" | "premium" | "cluttered";
  suggested_role: "hook" | "problem" | "solution" | "mechanism" | "progress" | "reward" | "identity";
  confidence: number;
  visual_notes: string[];
}

// ─── Product Understanding (per project) ────────

export interface ProductUnderstanding {
  category: string;
  target_user: string;
  core_problem: string;
  desired_outcome: string;
  tone: string;
  narrative_arc: string[];
}

// ─── Slide Plan (per slide) ─────────────────────

export interface SlidePlan {
  slide_role: "hook" | "problem" | "solution" | "mechanism" | "progress" | "reward" | "identity";
  headline: string;
  subheadline: string | null;
  layout_mode: "statement" | "hero" | "focus" | "feature" | "detail" | "reward";
  device_visibility: "none" | "small" | "medium" | "large" | "dominant";
  device_alignment: "left" | "center" | "right" | "offset-left" | "offset-right";
  device_rotation_deg: number;
  crop_strategy: "top" | "center" | "focus-tight" | "focus-wide" | "full-bleed";
  background_style: "dark-glow" | "soft-light" | "brand-halo" | "minimal-flat" | "reward-burst";
  accent_color_source: "brand" | "screenshot-dominant" | "reward-warm" | "cool-ui";
  visual_priority: "text-first" | "balanced" | "ui-first";
}

// ─── Full Variant Plan ──────────────────────────

export interface VariantPlan {
  variant_name: string;
  slides: SlidePlan[];
}

// ─── JSON Schema definitions for Structured Outputs ─

export const SCREENSHOT_INTENT_SCHEMA = {
  type: "object" as const,
  properties: {
    screenshot_type: { type: "string" as const, enum: ["dashboard", "list", "detail", "progress", "reward", "onboarding", "settings", "unknown"] },
    focal_area: { type: "string" as const, enum: ["top", "upper-center", "center", "lower-center", "bottom"] },
    key_element: { type: "string" as const, enum: ["chart", "progress-ring", "card", "avatar", "mascot", "button", "number", "text", "illustration", "mixed"] },
    crop_strategy: { type: "string" as const, enum: ["top", "center", "focus-tight", "focus-wide", "full-bleed", "statement-no-device"] },
    prominence: { type: "string" as const, enum: ["hero", "support", "detail"] },
    emotion: { type: "string" as const, enum: ["calm", "intense", "playful", "disciplined", "rewarding", "technical", "premium", "cluttered"] },
    suggested_role: { type: "string" as const, enum: ["hook", "problem", "solution", "mechanism", "progress", "reward", "identity"] },
    confidence: { type: "number" as const },
    visual_notes: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["screenshot_type", "focal_area", "key_element", "crop_strategy", "prominence", "emotion", "suggested_role", "confidence", "visual_notes"],
  additionalProperties: false,
};

export const PRODUCT_UNDERSTANDING_SCHEMA = {
  type: "object" as const,
  properties: {
    category: { type: "string" as const },
    target_user: { type: "string" as const },
    core_problem: { type: "string" as const },
    desired_outcome: { type: "string" as const },
    tone: { type: "string" as const },
    narrative_arc: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["category", "target_user", "core_problem", "desired_outcome", "tone", "narrative_arc"],
  additionalProperties: false,
};

export const SLIDE_PLAN_SCHEMA = {
  type: "object" as const,
  properties: {
    slide_role: { type: "string" as const, enum: ["hook", "problem", "solution", "mechanism", "progress", "reward", "identity"] },
    headline: { type: "string" as const },
    subheadline: { type: ["string", "null"] as const },
    layout_mode: { type: "string" as const, enum: ["statement", "hero", "focus", "feature", "detail", "reward"] },
    device_visibility: { type: "string" as const, enum: ["none", "small", "medium", "large", "dominant"] },
    device_alignment: { type: "string" as const, enum: ["left", "center", "right", "offset-left", "offset-right"] },
    device_rotation_deg: { type: "number" as const },
    crop_strategy: { type: "string" as const, enum: ["top", "center", "focus-tight", "focus-wide", "full-bleed"] },
    background_style: { type: "string" as const, enum: ["dark-glow", "soft-light", "brand-halo", "minimal-flat", "reward-burst"] },
    accent_color_source: { type: "string" as const, enum: ["brand", "screenshot-dominant", "reward-warm", "cool-ui"] },
    visual_priority: { type: "string" as const, enum: ["text-first", "balanced", "ui-first"] },
  },
  required: ["slide_role", "headline", "subheadline", "layout_mode", "device_visibility", "device_alignment", "device_rotation_deg", "crop_strategy", "background_style", "accent_color_source", "visual_priority"],
  additionalProperties: false,
};

export const VARIANT_PLAN_SCHEMA = {
  type: "object" as const,
  properties: {
    variant_name: { type: "string" as const },
    slides: { type: "array" as const, items: SLIDE_PLAN_SCHEMA },
  },
  required: ["variant_name", "slides"],
  additionalProperties: false,
};
