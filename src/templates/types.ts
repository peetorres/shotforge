/**
 * Template System — Core Types
 *
 * Templates are declarative composition trees rendered by both
 * CSS (fast preview) and screenshot-gen (export).
 *
 * Canonical: ARCHITECTURE.md, DESIGN_SYSTEM.md
 */

// ─── Positioning ────────────────────────────────

export type Anchor = "top-left" | "top-center" | "center" | "bottom-center" | "bottom-left" | "bottom-right";

export interface Position {
  /** Percentage of canvas (0-100) */
  x: number;
  y: number;
  anchor: Anchor;
}

export interface Size {
  /** Percentage of canvas, or "auto" */
  width: number | "auto";
  height: number | "auto";
}

// ─── Content Binding ────────────────────────────

export interface ContentBinding {
  /** What data to bind: "headline", "tagline", "screenshot:0", "badge-text", "bullets", "app-name" */
  binding: string;
  /** Always non-empty — used when real data unavailable (VQ-007) */
  fallback: string[];
}

// ─── Element Types ──────────────────────────────

export interface BaseElement {
  type: string;
  id: string;
  position: Position;
  size: Size;
  zIndex: number;
  visible: boolean;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: ContentBinding;
  style: {
    fontToken: string;
    colorToken: string;
    alignment: "left" | "center" | "right";
    maxLines: number;
    boldStyle: "brand-color" | "weight-only" | "none";
  };
}

export interface ImageElement extends BaseElement {
  type: "image";
  content: ContentBinding;
  style: {
    frameToken: string;
    angle: number;
    scale: number;
    shadowToken: string;
    cropRule: "top" | "center" | "fill";
  };
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  content?: ContentBinding;
  style: {
    variant: "pill" | "rounded" | "rect";
    fillToken: string;
    strokeToken?: string;
    strokeWidth?: number;
    fontToken?: string;
    textColorToken?: string;
  };
}

export interface ListElement extends BaseElement {
  type: "list";
  content: ContentBinding;
  style: {
    iconType: "check" | "bullet" | "number";
    iconColorToken: string;
    textColorToken: string;
    fontToken: string;
    maxItems: number;
    gap: number;
  };
}

export interface RatingElement extends BaseElement {
  type: "rating";
  style: {
    starCount: number;
    colorToken: string;
    sizeToken: string;
  };
}

export interface GlowElement extends BaseElement {
  type: "glow";
  style: {
    colorToken: string;
    radiusPercent: number;
    opacity: number;
    blurPx: number;
  };
}

export interface BackgroundElement extends BaseElement {
  type: "background";
  style: {
    colorToken: string;
    gradient?: {
      type: "linear" | "radial";
      angle?: number;
      stops: { offset: number; colorToken: string; opacityOverride?: number }[];
    };
  };
}

export type CompositionElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | ListElement
  | RatingElement
  | GlowElement
  | BackgroundElement;

// ─── Template Constraints ───────────────────────

export interface TemplateConstraints {
  minDeviceHeightPercent: number;  // VQ-001 default 40
  maxHeadlineLines: number;        // VQ-003 default 2
  minScreenshotVisible: number;    // VQ-005 default 0.6
}

const DEFAULT_CONSTRAINTS: TemplateConstraints = {
  minDeviceHeightPercent: 40,
  maxHeadlineLines: 2,
  minScreenshotVisible: 0.6,
};

export { DEFAULT_CONSTRAINTS };

// ─── Template ───────────────────────────────────

export interface SlideTemplate {
  id: string;
  version: 1;
  name: string;
  category: "hero" | "feature";
  tags: string[];
  description: string;

  /** Ordered composition elements */
  elements: CompositionElement[];

  /** Per-variant style token overrides */
  variantTokenOverrides?: Record<string, Record<string, string>>;

  /** Visual quality constraint overrides */
  constraints?: Partial<TemplateConstraints>;
}

// ─── Resolved Layout (shared by both renderers) ─

export interface ResolvedElement {
  id: string;
  type: string;
  bounds: { x: number; y: number; width: number; height: number };
  resolvedStyle: Record<string, string | number>;
  content: string[] | null;
  zIndex: number;
  visible: boolean;
}

export interface ResolvedLayout {
  canvas: { width: number; height: number };
  elements: ResolvedElement[];
}
