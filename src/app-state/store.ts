import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  FinalistSet,
  FlowStep,
  ProjectState,
  VariantId,
} from "@/domain/types";
import { isVariantId } from "@/domain/types";

import {
  normalizePersistedState,
  STORAGE_KEY,
} from "./persistence";

export interface ShotforgeAppStore {
  project: ProjectState | null;
  activeSlideIndex: number;
  isExporting: boolean;
  isGenerating: boolean;
  generationProgress: number;
  previewMode: boolean;

  setProject: (project: ProjectState) => void;
  updateProject: (
    patch: Partial<
      Pick<
        ProjectState,
        | "brand"
        | "description"
        | "brandColor"
        | "selectedVariantId"
        | "selectedFinalistId"
        | "finalists"
      >
    >,
  ) => void;
  setStep: (step: FlowStep) => void;
  setFinalists: (finalists: FinalistSet | null) => void;
  selectFinalist: (finalistId: string | null) => void;
  selectVariant: (id: VariantId) => void;
  setVariantSlides: (variantId: VariantId, slides: SlideConfig[]) => void;
  updateSlide: (variantId: VariantId, slideIndex: number, patch: Partial<SlideConfig>) => void;
  setActiveSlide: (index: number) => void;
  setIsExporting: (value: boolean) => void;
  setIsGenerating: (value: boolean) => void;
  setGenerationProgress: (value: number) => void;
  setPreviewMode: (value: boolean) => void;
  togglePreviewMode: () => void;
  reset: () => void;
}

let lastUpdatedAt = 0;

function nextUpdatedAt(previous?: string): string {
  const previousMs = previous ? Date.parse(previous) : 0;
  const next = Math.max(Date.now(), previousMs + 1, lastUpdatedAt + 1);
  lastUpdatedAt = next;
  return new Date(next).toISOString();
}

function withUpdatedAt(project: ProjectState, patch: Partial<ProjectState>): ProjectState {
  return {
    ...project,
    finalists: project.finalists ?? null,
    selectedFinalistId: project.selectedFinalistId ?? null,
    ...patch,
    updatedAt: nextUpdatedAt(project.updatedAt),
  };
}

export function createShotforgeAppStore() {
  return createStore<ShotforgeAppStore>()(
    persist(
      (set) => ({
        project: null,
        activeSlideIndex: 0,
        isExporting: false,
        isGenerating: false,
        generationProgress: 0,
        previewMode: false,

        setProject: (project) =>
          set({
            project: withUpdatedAt(project, {}),
            activeSlideIndex: 0,
          }),

        updateProject: (patch) =>
          set((state) => {
            if (!state.project) {
              return state;
            }

            return {
              project: withUpdatedAt(state.project, patch),
            };
          }),

        setStep: (step) =>
          set((state) => {
            if (!state.project) {
              return state;
            }

            return {
              project: withUpdatedAt(state.project, { step }),
            };
          }),

        setFinalists: (finalists) =>
          set((state) => {
            if (!state.project) {
              return state;
            }

            const fallbackSelectedId = finalists?.top3[0]?.id ?? null;
            return {
              project: withUpdatedAt(state.project, {
                finalists,
                selectedFinalistId: fallbackSelectedId,
                step: finalists ? "preview" : state.project.step,
              }),
            };
          }),

        selectFinalist: (finalistId) =>
          set((state) => {
            if (!state.project) {
              return state;
            }

            if (finalistId === null) {
              return {
                project: withUpdatedAt(state.project, { selectedFinalistId: null }),
              };
            }

            const finalists = state.project.finalists;
            const finalistExists = finalists
              ? [...finalists.top3, ...finalists.additional].some((finalist) => finalist.id === finalistId)
              : false;

            if (!finalistExists) {
              return state;
            }

            return {
              project: withUpdatedAt(state.project, {
                selectedFinalistId: finalistId,
                step: "preview",
              }),
            };
          }),

        selectVariant: (id) =>
          set((state) => {
            if (!state.project || !isVariantId(id)) {
              return state;
            }

            return {
              project: withUpdatedAt(state.project, { selectedVariantId: id }),
            };
          }),

        setVariantSlides: (variantId, slides) =>
          set((state) => {
            if (!state.project || !isVariantId(variantId) || !state.project.variants[variantId]) {
              return state;
            }

            return {
              project: withUpdatedAt(state.project, {
                variants: {
                  ...state.project.variants,
                  [variantId]: {
                    ...state.project.variants[variantId],
                    slides,
                  },
                },
              }),
            };
          }),

        updateSlide: (variantId, slideIndex, patch) =>
          set((state) => {
            if (!state.project || !isVariantId(variantId)) {
              return state;
            }

            const variant = state.project.variants[variantId];
            if (!variant || slideIndex < 0 || slideIndex >= variant.slides.length) {
              return state;
            }

            const slides = [...variant.slides];
            slides[slideIndex] = {
              ...slides[slideIndex],
              ...patch,
            } as SlideConfig;

            return {
              project: withUpdatedAt(state.project, {
                variants: {
                  ...state.project.variants,
                  [variantId]: {
                    ...variant,
                    slides,
                  },
                },
              }),
            };
          }),

        setActiveSlide: (index) => set({ activeSlideIndex: Math.max(0, index) }),
        setIsExporting: (value) => set({ isExporting: value }),
        setIsGenerating: (value) => set({ isGenerating: value }),
        setGenerationProgress: (value) => set({ generationProgress: Math.max(0, value) }),
        setPreviewMode: (value) => set({ previewMode: value }),
        togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),

        reset: () =>
          set({
            project: null,
            activeSlideIndex: 0,
            isExporting: false,
            isGenerating: false,
            generationProgress: 0,
            previewMode: false,
          }),
      }),
      {
        name: STORAGE_KEY,
        version: 2,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          project: state.project,
          activeSlideIndex: state.activeSlideIndex,
          isExporting: state.isExporting,
          isGenerating: state.isGenerating,
          generationProgress: state.generationProgress,
          previewMode: state.previewMode,
        }),
        migrate: (persistedState) => normalizePersistedState(persistedState),
      },
    ),
  );
}

export const createShotforgeStore = createShotforgeAppStore;
export const shotforgeStore = createShotforgeAppStore();

export function getShotforgeStore() {
  return shotforgeStore;
}

export function useShotforgeStore<T>(selector: (state: ShotforgeAppStore) => T): T {
  return useStore(shotforgeStore, selector);
}
