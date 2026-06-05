/**
 * AI Creative Director — Output Schemas
 *
 * Rich composition plans: crop, overlays, visual direction, focal points.
 * Not just headlines — full art direction.
 */

export interface DeviceComposition {
  visible: boolean;
  alignment: "center" | "left" | "right";
  rotation: number;
  scale: number;
}

export interface CropPlan {
  strategy: "focus" | "zoom" | "full" | "dramatic";
  focalPoint: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface Overlay {
  type: "highlight" | "glow" | "circle" | "arrow" | "blur";
  target: string;
  style: "subtle" | "strong";
}

export interface VisualDirection {
  background: "gradient" | "solid" | "blurred";
  intensity: "low" | "medium" | "high";
  overlays: Overlay[];
  depth: "flat" | "layered" | "cinematic";
}

export interface SlidePlan {
  role: "hook" | "problem" | "solution" | "proof" | "reward" | "close";
  headline: string;
  composition: {
    layoutType: "text-only" | "device-focus" | "split" | "immersive";
    device: DeviceComposition;
    crop: CropPlan;
  };
  visual: VisualDirection;
  priority: number;
}

export interface CreativeDirectorOutput {
  slides: SlidePlan[];
}

export interface AiScreenshotAnalysis {
  screenshotIndex: number;
  screenshotType: string;
  focalElements: string[];
  proofSignals: string[];
  emotionSignals: string[];
  cropOpportunities: string[];
  safeTextRegion: "left" | "right" | "top";
  compositionDensity: number;
  hierarchySignal: number;
}

// Backward compat
export interface ProductUnderstanding {
  category: string;
  target_user: string;
  core_problem: string;
  desired_outcome: string;
  tone: string;
  narrative_arc: string[];
}

export type ScreenshotIntent = {
  screenshot_type: string;
  focal_area: string;
  crop_strategy: string;
  suggested_role: string;
  confidence: number;
  visual_notes: string[];
};

// ─── JSON Schema for OpenAI Structured Outputs ──

export const CREATIVE_DIRECTOR_SCHEMA = {
  type: "object" as const,
  properties: {
    slides: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          role: { type: "string" as const, enum: ["hook", "problem", "solution", "proof", "reward", "close"] },
          headline: { type: "string" as const },
          composition: {
            type: "object" as const,
            properties: {
              layoutType: { type: "string" as const, enum: ["text-only", "device-focus", "split", "immersive"] },
              device: {
                type: "object" as const,
                properties: {
                  visible: { type: "boolean" as const },
                  alignment: { type: "string" as const, enum: ["center", "left", "right"] },
                  rotation: { type: "number" as const },
                  scale: { type: "number" as const },
                },
                required: ["visible", "alignment", "rotation", "scale"] as const,
                additionalProperties: false,
              },
              crop: {
                type: "object" as const,
                properties: {
                  strategy: { type: "string" as const, enum: ["focus", "zoom", "full", "dramatic"] },
                  focalPoint: { type: "string" as const },
                  zoom: { type: "number" as const },
                  offsetX: { type: "number" as const },
                  offsetY: { type: "number" as const },
                },
                required: ["strategy", "focalPoint", "zoom", "offsetX", "offsetY"] as const,
                additionalProperties: false,
              },
            },
            required: ["layoutType", "device", "crop"] as const,
            additionalProperties: false,
          },
          visual: {
            type: "object" as const,
            properties: {
              background: { type: "string" as const, enum: ["gradient", "solid", "blurred"] },
              intensity: { type: "string" as const, enum: ["low", "medium", "high"] },
              overlays: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    type: { type: "string" as const, enum: ["highlight", "glow", "circle", "arrow", "blur"] },
                    target: { type: "string" as const },
                    style: { type: "string" as const, enum: ["subtle", "strong"] },
                  },
                  required: ["type", "target", "style"] as const,
                  additionalProperties: false,
                },
              },
              depth: { type: "string" as const, enum: ["flat", "layered", "cinematic"] },
            },
            required: ["background", "intensity", "overlays", "depth"] as const,
            additionalProperties: false,
          },
          priority: { type: "number" as const },
        },
        required: ["role", "headline", "composition", "visual", "priority"] as const,
        additionalProperties: false,
      },
    },
  },
  required: ["slides"] as const,
  additionalProperties: false,
};

export const SCREENSHOT_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    screenshots: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          screenshotIndex: { type: "number" as const },
          screenshotType: { type: "string" as const },
          focalElements: { type: "array" as const, items: { type: "string" as const } },
          proofSignals: { type: "array" as const, items: { type: "string" as const } },
          emotionSignals: { type: "array" as const, items: { type: "string" as const } },
          cropOpportunities: { type: "array" as const, items: { type: "string" as const } },
          safeTextRegion: { type: "string" as const, enum: ["left", "right", "top"] },
          compositionDensity: { type: "number" as const },
          hierarchySignal: { type: "number" as const },
        },
        required: [
          "screenshotIndex",
          "screenshotType",
          "focalElements",
          "proofSignals",
          "emotionSignals",
          "cropOpportunities",
          "safeTextRegion",
          "compositionDensity",
          "hierarchySignal",
        ] as const,
        additionalProperties: false,
      },
    },
  },
  required: ["screenshots"] as const,
  additionalProperties: false,
};
