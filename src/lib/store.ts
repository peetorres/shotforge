/**
 * Shotforge V2 — Zustand Store
 *
 * Canonical source: ARCHITECTURE.md §3
 * Invariants enforced: INV-003 (isolation), INV-005 (edit tracking), INV-010 (step transitions)
 * Regression guards: RG-001 (cross-variant leakage)
 */

import { createStore } from "zustand/vanilla";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { ProjectState, VariantId, FlowStep } from "@/domain/types";
import { isVariantId } from "@/domain/types";

// ─── Store Interface ────────────────────────────

export interface ShotforgeStore {
  // State
  project: ProjectState | null;
  activeSlideIndex: number;
  isExporting: boolean;
  isGenerating: boolean;
  generationProgress: number;
  previewMode: boolean;

  // Project actions
  setProject: (project: ProjectState) => void;
  updateProject: (patch: Partial<Pick<ProjectState, "brand" | "description" | "brandColor">>) => void;
  setStep: (step: FlowStep) => void;
  reset: () => void;

  // Variant actions
  selectVariant: (id: VariantId) => void;
  setVariantSlides: (variantId: VariantId, slides: SlideConfig[]) => void;
  updateSlide: (variantId: VariantId, slideIndex: number, patch: Partial<SlideConfig>) => void;

  // UI actions
  setActiveSlide: (index: number) => void;
  setIsExporting: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setGenerationProgress: (step: number) => void;
  togglePreviewMode: () => void;
}

// ─── Store Factory ──────────────────────────────

export function createShotforgeStore() {
  return createStore<ShotforgeStore>()((set) => ({
    // Initial state
    project: null,
    activeSlideIndex: 0,
    isExporting: false,
    isGenerating: false,
    generationProgress: 0,
    previewMode: false,

    // ─── Project Actions ──────────────────

    setProject: (project) => set({ project, activeSlideIndex: 0 }),

    updateProject: (patch) =>
      set((s) => {
        if (!s.project) return s;
        return {
          project: {
            ...s.project,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    setStep: (step) =>
      set((s) => {
        if (!s.project) return s;
        return {
          project: {
            ...s.project,
            step,
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    reset: () =>
      set({
        project: null,
        activeSlideIndex: 0,
        isExporting: false,
        isGenerating: false,
        generationProgress: 0,
        previewMode: false,
      }),

    // ─── Variant Actions ──────────────────

    selectVariant: (id) =>
      set((s) => {
        if (!s.project) return s;
        // Guard: reject invalid variant IDs (INV-001)
        if (!isVariantId(id)) return s;
        return {
          project: {
            ...s.project,
            selectedVariantId: id,
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    setVariantSlides: (variantId, slides) =>
      set((s) => {
        if (!s.project) return s;
        if (!isVariantId(variantId)) return s;
        if (!s.project.variants[variantId]) return s;

        // INV-003: Create new objects at every level, never mutate in place
        return {
          project: {
            ...s.project,
            variants: {
              ...s.project.variants,
              [variantId]: {
                ...s.project.variants[variantId],
                slides,
              },
            },
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    updateSlide: (variantId, slideIndex, patch) =>
      set((s) => {
        if (!s.project) return s;
        if (!isVariantId(variantId)) return s;

        const variant = s.project.variants[variantId];
        if (!variant) return s;
        if (slideIndex < 0 || slideIndex >= variant.slides.length) return s;

        // INV-003: Deep copy — only touch the target variant and slide
        const newSlides = [...variant.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], ...patch } as SlideConfig;

        return {
          project: {
            ...s.project,
            variants: {
              ...s.project.variants,
              [variantId]: {
                ...variant,
                slides: newSlides,
              },
            },
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    // ─── UI Actions ───────────────────────

    setActiveSlide: (index) => set({ activeSlideIndex: index }),
    setIsExporting: (v) => set({ isExporting: v }),
    setIsGenerating: (v) => set({ isGenerating: v }),
    setGenerationProgress: (step) => set({ generationProgress: step }),
    togglePreviewMode: () => set((s) => ({ previewMode: !s.previewMode })),
  }));
}
