import type { ProjectBrief, ProjectScreenshot, TechnicalQualityCheck } from "./contracts";

export interface SessionScreenshotInput {
  readonly id?: string;
  readonly filename: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType?: string;
  readonly altText?: string;
}

export interface CreateProjectBriefInput {
  readonly sessionId: string;
  readonly brand: string;
  readonly description: string;
  readonly screenshots: SessionScreenshotInput[];
  readonly goals?: string[];
  readonly audience?: string;
  readonly brandColor?: string;
  readonly qualityChecks?: TechnicalQualityCheck[];
}

function requireText(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required`);
  }

  return trimmed;
}

function normalizeStringList(values: readonly string[] | undefined): string[] {
  return (values ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function normalizeScreenshot(
  screenshot: SessionScreenshotInput,
  index: number,
): ProjectScreenshot {
  const id = screenshot.id?.trim() || `shot_${index + 1}`;
  const filename = requireText(screenshot.filename, "screenshot filename");
  const width = Math.max(1, Math.trunc(screenshot.width));
  const height = Math.max(1, Math.trunc(screenshot.height));

  return {
    id,
    filename,
    width,
    height,
    mimeType: screenshot.mimeType?.trim() || undefined,
    altText: screenshot.altText?.trim() || undefined,
  };
}

export function createProjectBrief(input: CreateProjectBriefInput): ProjectBrief {
  const sessionId = requireText(input.sessionId, "sessionId");
  const brand = requireText(input.brand, "brand");
  const description = requireText(input.description, "description");
  const screenshots = input.screenshots.map((screenshot, index) =>
    normalizeScreenshot(screenshot, index),
  );

  if (screenshots.length === 0) {
    throw new Error("at least one screenshot is required");
  }

  return {
    sessionId,
    brand,
    description,
    screenshots,
    goals: normalizeStringList(input.goals),
    audience: input.audience?.trim() || "general",
    brandColor: input.brandColor?.trim() || undefined,
    qualityChecks: input.qualityChecks?.map((check) => ({
      code: check.code.trim(),
      passed: check.passed,
      message: check.message?.trim() || undefined,
    })),
  };
}

export function normalizeProjectScreenshots(
  screenshots: SessionScreenshotInput[],
): ProjectScreenshot[] {
  return screenshots.map((screenshot, index) => normalizeScreenshot(screenshot, index));
}

