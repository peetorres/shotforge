/**
 * Zustand Store — Tests
 *
 * Maps to: INV-003 (isolation), INV-005 (edits tracked), INV-010 (step transitions)
 * Canonical: ARCHITECTURE.md §3, STATE_MACHINE.md
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createShotforgeStore } from "./store";
import { createVariants } from "@/domain/variant";
import type { ProjectState, VariantId } from "@/domain/types";

beforeEach(() => {
  localStorage.clear();
});

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

describe("Store: initialization", () => {
  it("starts with null project", () => {
    const store = createShotforgeStore();
    expect(store.getState().project).toBeNull();
  });

  it("setProject stores the project", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    expect(store.getState().project).not.toBeNull();
    expect(store.getState().project!.brand).toBe("Sensei");
  });
});

describe("Store: variant selection", () => {
  let store: ReturnType<typeof createShotforgeStore>;

  beforeEach(() => {
    store = createShotforgeStore();
    store.getState().setProject(makeProject());
  });

  it("selectVariant sets selectedVariantId", () => {
    store.getState().selectVariant("midnight");
    expect(store.getState().project!.selectedVariantId).toBe("midnight");
  });

  it("selectVariant rejects invalid id", () => {
    store.getState().selectVariant("invalid" as VariantId);
    expect(store.getState().project!.selectedVariantId).toBeNull();
  });

  it("selectVariant switches between variants", () => {
    store.getState().selectVariant("midnight");
    store.getState().selectVariant("clean");
    expect(store.getState().project!.selectedVariantId).toBe("clean");
  });
});

describe("Store: slide updates (INV-003 isolation)", () => {
  let store: ReturnType<typeof createShotforgeStore>;

  beforeEach(() => {
    store = createShotforgeStore();
    store.getState().setProject(makeProject());
  });

  it("updateSlide modifies the correct slide in the correct variant", () => {
    store.getState().updateSlide("midnight", 2, { headline: ["**New** headline"] });
    const slide = store.getState().project!.variants.midnight.slides[2];
    // Slide 2 is feature-single in narrative sequence
    expect("headline" in slide && (slide as { headline: string[] }).headline).toEqual(["**New** headline"]);
  });

  it("INV-003: updateSlide on midnight does NOT mutate clean", () => {
    const cleanBefore = JSON.stringify(store.getState().project!.variants.clean);
    store.getState().updateSlide("midnight", 1, { headline: ["**Changed**"] });
    const cleanAfter = JSON.stringify(store.getState().project!.variants.clean);
    expect(cleanAfter).toBe(cleanBefore);
  });

  it("INV-003: updateSlide on midnight does NOT mutate vivid", () => {
    const vividBefore = JSON.stringify(store.getState().project!.variants.vivid);
    store.getState().updateSlide("midnight", 1, { headline: ["**Changed**"] });
    const vividAfter = JSON.stringify(store.getState().project!.variants.vivid);
    expect(vividAfter).toBe(vividBefore);
  });

  it("updateSlide with invalid variant is no-op", () => {
    const before = JSON.stringify(store.getState().project);
    store.getState().updateSlide("invalid" as VariantId, 0, { headline: ["nope"] });
    const after = JSON.stringify(store.getState().project);
    expect(after).toBe(before);
  });

  it("updateSlide with out-of-bounds index is no-op", () => {
    const before = JSON.stringify(store.getState().project);
    store.getState().updateSlide("midnight", 99, { headline: ["nope"] });
    const after = JSON.stringify(store.getState().project);
    expect(after).toBe(before);
  });
});

describe("Store: step transitions (INV-010)", () => {
  let store: ReturnType<typeof createShotforgeStore>;

  beforeEach(() => {
    store = createShotforgeStore();
    store.getState().setProject(makeProject());
  });

  it("allows create → generate", () => {
    store.getState().setStep("generate");
    expect(store.getState().project!.step).toBe("generate");
  });

  it("allows generate → preview", () => {
    store.getState().setStep("generate");
    store.getState().setStep("preview");
    expect(store.getState().project!.step).toBe("preview");
  });

  it("allows backward navigation: preview → generate", () => {
    store.getState().setStep("generate");
    store.getState().setStep("preview");
    store.getState().setStep("generate");
    expect(store.getState().project!.step).toBe("generate");
  });
});

describe("Store: updateProject", () => {
  it("updates brand color at project level", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    store.getState().updateProject({ brandColor: "#FF0000" });
    expect(store.getState().project!.brandColor).toBe("#FF0000");
  });

  it("updates updatedAt on mutation", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    const before = store.getState().project!.updatedAt;
    store.getState().updateProject({ brand: "NewName" });
    expect(store.getState().project!.updatedAt).not.toBe(before);
  });
});

describe("Store: reset", () => {
  it("clears project to null", () => {
    const store = createShotforgeStore();
    store.getState().setProject(makeProject());
    store.getState().reset();
    expect(store.getState().project).toBeNull();
    expect(store.getState().activeSlideIndex).toBe(0);
  });
});

describe("Store: UI state", () => {
  it("setActiveSlide updates index", () => {
    const store = createShotforgeStore();
    store.getState().setActiveSlide(3);
    expect(store.getState().activeSlideIndex).toBe(3);
  });

  it("togglePreviewMode toggles boolean", () => {
    const store = createShotforgeStore();
    expect(store.getState().previewMode).toBe(false);
    store.getState().togglePreviewMode();
    expect(store.getState().previewMode).toBe(true);
    store.getState().togglePreviewMode();
    expect(store.getState().previewMode).toBe(false);
  });
});
