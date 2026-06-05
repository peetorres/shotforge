import { beforeEach, describe, expect, it } from "vitest";

import { createFinalistSetFromRanked, buildFinalist, computeSequenceScore } from "@/core/scoring";
import { createVariants } from "@/domain/variant";
import type { ProjectState } from "@/domain/types";

import {
  isLegacyShotforgePersistedEnvelope,
  isPersistedShotforgeEnvelope,
  normalizePersistedState,
} from "./persistence";
import { createShotforgeStore } from "./store";

function makeProject(): ProjectState {
  const variants = createVariants(
    ["screen1.png", "screen2.png", "screen3.png"],
    "Sensei",
    "#6366F1",
  );

  return {
    sessionId: "test-session-123",
    brand: "Sensei",
    description: "Gamified learning for founders",
    brandColor: "#6366F1",
    uploadedFiles: ["screen1.png", "screen2.png", "screen3.png"],
    variants,
    selectedVariantId: null,
    finalists: null,
    selectedFinalistId: null,
    step: "create",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeFinalistSet() {
  const baseCandidate = {
    id: "seq_1",
    briefId: "test-session-123",
    directionId: "dir_1",
    directionThesis: "clarity-first" as const,
    style: "dark" as const,
    orderedScreenshotIds: ["shot_1"],
    slides: [],
    layoutFamily: "editorial-single" as const,
    typographyFamily: "display-sans" as const,
    backgroundTreatment: "derived-gradient" as const,
    focalCropProfile: "tight-hero" as const,
    overlayBehavior: "subtle-glass" as const,
    slideRoles: [{ screenshotId: "shot_1", role: "hero" as const }],
  };

  const scoredOne = computeSequenceScore({
    candidate: baseCandidate,
    scores: {
      premiumFeel: 0.91,
      hierarchyClarity: 0.9,
      screenshotFit: 0.88,
      distinctiveness: 0.8,
      narrativeCoherence: 0.84,
      textReadability: 0.89,
      brandFit: 0.83,
      conversionStrength: 0.77,
    },
  });

  const scoredTwo = computeSequenceScore({
    candidate: { ...baseCandidate, id: "seq_2", directionThesis: "campaign-first" },
    scores: {
      premiumFeel: 0.89,
      hierarchyClarity: 0.86,
      screenshotFit: 0.85,
      distinctiveness: 0.79,
      narrativeCoherence: 0.82,
      textReadability: 0.87,
      brandFit: 0.8,
      conversionStrength: 0.74,
    },
  });

  const finalistOne = buildFinalist({
    scored: scoredOne,
    rank: 1,
  });

  const finalistTwo = buildFinalist({
    scored: scoredTwo,
    rank: 2,
  });

  return createFinalistSetFromRanked([finalistOne, finalistTwo], []);
}

describe("persistence validation", () => {
  it("accepts a preview-first persisted envelope", () => {
    const project = makeProject();
    const snapshot = {
      state: {
        project,
        activeSlideIndex: 2,
        isExporting: false,
        isGenerating: true,
        generationProgress: 64,
        previewMode: true,
      },
      version: 2,
    };

    expect(isPersistedShotforgeEnvelope(snapshot)).toBe(true);
  });

  it("accepts legacy project-only persisted envelopes", () => {
    const snapshot = {
      state: {
        project: makeProject(),
      },
      version: 1,
    };

    expect(isLegacyShotforgePersistedEnvelope(snapshot)).toBe(true);
  });

  it("normalizes legacy project-only state into the preview-first snapshot", () => {
    const normalized = normalizePersistedState({
      project: makeProject(),
    });

    expect(normalized.activeSlideIndex).toBe(0);
    expect(normalized.isExporting).toBe(false);
    expect(normalized.isGenerating).toBe(false);
    expect(normalized.project?.brand).toBe("Sensei");
    expect(normalized.project?.selectedFinalistId).toBeNull();
  });
});

describe("preview-first store actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists finalists and auto-selects the top finalist", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    const finalists = makeFinalistSet();

    store.getState().setFinalists(finalists);

    expect(store.getState().project?.finalists?.top3).toHaveLength(2);
    expect(store.getState().project?.selectedFinalistId).toBe(finalists.top3[0]?.id ?? null);
    expect(store.getState().project?.selectedVariantId).toBeNull();
  });

  it("allows explicit finalist selection without mutating variants", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    const finalists = makeFinalistSet();
    store.getState().setFinalists(finalists);

    store.getState().selectVariant("midnight");
    store.getState().selectFinalist(finalists.top3[1]?.id ?? null);

    expect(store.getState().project?.selectedVariantId).toBe("midnight");
    expect(store.getState().project?.selectedFinalistId).toBe(finalists.top3[1]?.id ?? null);
  });

  it("rejects unknown finalist ids once finalists exist", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    store.getState().setFinalists(makeFinalistSet());

    store.getState().selectFinalist("does-not-exist");

    expect(store.getState().project?.selectedFinalistId).toBe("seq_1");
  });

  it("supports preview-step transitions", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());

    store.getState().setStep("generate");
    store.getState().setStep("preview");
    store.getState().setPreviewMode(true);

    expect(store.getState().project?.step).toBe("preview");
    expect(store.getState().previewMode).toBe(true);
  });
});
