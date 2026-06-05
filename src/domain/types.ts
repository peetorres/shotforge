/**
 * Shotforge V2 — Core Domain Types
 *
 * Canonical source: docs/canonical/SHOTFORGE_CANON.md
 * Every type here maps to an entity or rule defined in the canon.
 */

import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "../core/contracts";
import type { FinalistSet } from "../core/contracts";

// ─── Flow ───────────────────────────────────────

export type FlowStep = "create" | "generate" | "preview";

// ─── Variants ───────────────────────────────────

export type VariantId = "midnight" | "clean" | "vivid";

export const VARIANT_IDS: readonly VariantId[] = ["midnight", "clean", "vivid"] as const;

// ─── Content Origin (SHOTFORGE_CANON §3.4) ──────

export type ContentOrigin =
  | "generated_by_ai"
  | "edited_by_user"
  | "template_fallback"
  | "inherited_from_global"
  | "regenerated"
  | "restored_from_session";

// ─── Variant ────────────────────────────────────

export interface VariantDefinition {
  readonly id: VariantId;
  readonly name: string;
  readonly style: AppStyle;
  readonly backgroundColor: string;
  readonly textColor: string;
}

export interface Variant {
  readonly id: VariantId;
  readonly name: string;
  readonly style: AppStyle;
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly slides: SlideConfig[];
}

// ─── Project ────────────────────────────────────

export interface ProjectState {
  readonly sessionId: string;
  readonly brand: string;
  readonly description: string;
  readonly brandColor: string;
  readonly uploadedFiles: string[];
  readonly variants: Record<VariantId, Variant>;
  readonly selectedVariantId: VariantId | null;
  readonly finalists?: FinalistSet | null;
  readonly selectedFinalistId?: string | null;
  readonly step: FlowStep;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ─── API Types ──────────────────────────────────

export type UploadErrorCode =
  | "INVALID_TYPE"
  | "TOO_SMALL"
  | "TOO_LARGE"
  | "INVALID_IMAGE"
  | "NO_FILES"
  | "SESSION_TOO_LARGE";

export interface UploadSuccessResponse {
  readonly filenames: string[];
}

export interface UploadErrorResponse {
  readonly error: UploadErrorCode;
  readonly filename?: string;
}

export interface GenerateCopyRequest {
  readonly brand: string;
  readonly description: string;
  readonly slideType: "hero" | "feature-single" | "feature-dual";
  readonly screenshotFilename?: string;
  readonly style: AppStyle;
  readonly variantName: string;
}

export interface GeneratedCopy {
  readonly tagline?: string[];
  readonly badgeText?: string;
  readonly bullets?: string[];
  readonly headline?: string[];
  readonly contentOrigin: ContentOrigin;
}

export interface PreviewRequest {
  readonly sessionId: string;
  readonly slide: SlideConfig;
  readonly brand: string;
  readonly brandColor: string;
  readonly style: AppStyle;
  readonly outputSize?: "6.7" | "6.1";
}

export interface ExportRequest {
  readonly sessionId: string;
  readonly projectState: {
    readonly brand: string;
    readonly brandColor: string;
    readonly style: AppStyle;
    readonly slides: SlideConfig[];
    readonly uploadedFiles: string[];
  };
  readonly sizes?: ("6.7" | "6.1")[];
}

// ─── Type Guards ────────────────────────────────

export function isVariantId(value: unknown): value is VariantId {
  return typeof value === "string" && VARIANT_IDS.includes(value as VariantId);
}

export function isFlowStep(value: unknown): value is FlowStep {
  return typeof value === "string" && ["create", "generate", "preview"].includes(value);
}

export function isValidHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export type {
  AppStyle,
  BackgroundTreatment,
  CampaignBoard,
  CampaignContinuityCue,
  CampaignFrameEnergy,
  CampaignFramePlan,
  CampaignFrameRole,
  CampaignSideBias,
  CampaignVisualWeight,
  BoundingBox,
  ContractName,
  Finalist,
  FinalistSet,
  FocalCropProfile,
  LayoutFamily,
  NarrativeDirection,
  NarrativeThesis,
  OverlayBehavior,
  ProjectBrief,
  ProjectScreenshot,
  RepairAction,
  RepairPriority,
  RepairTarget,
  ScoreBreakdown,
  ScoredSequence,
  ScreenshotAnalysis,
  SequenceCandidate,
  SequenceRole,
  SequenceRoleAssignment,
  TechnicalQualityCheck,
  TypographyFamily,
} from "../core/contracts";

export { CONTRACT_NAMES } from "../core/contracts";
