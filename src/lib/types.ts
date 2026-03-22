import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "./style-colors";

export interface ProjectState {
  id: string;
  brand: string;
  description: string;
  brandColor: string;
  style: AppStyle;
  slides: SlideConfig[];
  uploadedFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export type UploadErrorCode = "INVALID_TYPE" | "TOO_SMALL" | "TOO_LARGE" | "INVALID_IMAGE";
export interface UploadSuccessResponse { filenames: string[]; }
export interface UploadErrorResponse { error: UploadErrorCode; filename: string; }

export interface PreviewRequest {
  sessionId: string;
  slide: SlideConfig;
  brand: string;
  brandColor: string;
  style: AppStyle;
  outputSize?: "6.7" | "6.1";
}
export interface PreviewSuccessResponse { image: string; }
export type PreviewErrorCode = "SESSION_NOT_FOUND" | "RENDER_FAILED";
export interface PreviewErrorResponse { error: PreviewErrorCode; detail?: string; }

export interface ExportRequest {
  sessionId: string;
  projectState: Omit<ProjectState, "id" | "createdAt" | "updatedAt">;
  sizes?: ("6.7" | "6.1")[];
}
export type ExportErrorCode = "SESSION_NOT_FOUND" | "EXPORT_FAILED";
export interface ExportErrorResponse { error: ExportErrorCode; }

export interface GenerateCopyRequest {
  brand: string;
  description: string;
  slideType: "hero" | "feature-single" | "feature-dual";
  screenshotFilename?: string;
  style: AppStyle;
}
export interface GeneratedCopy {
  tagline?: string[];
  badgeText?: string;
  bullets?: string[];
  headline?: string[];
}
export interface GenerateCopyErrorResponse { error: "AI_UNAVAILABLE"; }
