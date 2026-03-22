import { create } from "zustand";
import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import type { ProjectState } from "./types";
import type { SlideConfig } from "@appforge/screenshot-gen";

interface ShotforgeStore {
  project: ProjectState | null;
  activeSlideIndex: number;
  isExporting: boolean;
  setProject: (project: ProjectState) => void;
  updateProject: (patch: Partial<Omit<ProjectState, "id">>) => void;
  updateSlide: (index: number, slide: SlideConfig) => void;
  addSlide: (slide: SlideConfig) => void;
  removeSlide: (index: number) => void;
  setActiveSlide: (index: number) => void;
  setIsExporting: (value: boolean) => void;
  reset: () => void;
}

export function createProjectStore() {
  return createStore<ShotforgeStore>()((set) => ({
    project: null, activeSlideIndex: 0, isExporting: false,
    setProject: (project) => set({ project, activeSlideIndex: 0 }),
    updateProject: (patch) => set((s) => ({ project: s.project ? { ...s.project, ...patch, updatedAt: new Date().toISOString() } : null })),
    updateSlide: (index, slide) => set((s) => {
      if (!s.project) return s;
      const slides = [...s.project.slides]; slides[index] = slide;
      return { project: { ...s.project, slides, updatedAt: new Date().toISOString() } };
    }),
    addSlide: (slide) => set((s) => {
      if (!s.project) return s;
      return { project: { ...s.project, slides: [...s.project.slides, slide], updatedAt: new Date().toISOString() } };
    }),
    removeSlide: (index) => set((s) => {
      if (!s.project) return s;
      const slides = s.project.slides.filter((_, i) => i !== index);
      return { project: { ...s.project, slides, updatedAt: new Date().toISOString() }, activeSlideIndex: Math.min(s.activeSlideIndex, slides.length - 1) };
    }),
    setActiveSlide: (index) => set({ activeSlideIndex: index }),
    setIsExporting: (value) => set({ isExporting: value }),
    reset: () => set({ project: null, activeSlideIndex: 0, isExporting: false }),
  }));
}

export const useShotforgeStore = create<ShotforgeStore>()(
  persist(
    (set) => ({
      project: null, activeSlideIndex: 0, isExporting: false,
      setProject: (project) => set({ project, activeSlideIndex: 0 }),
      updateProject: (patch) => set((s) => ({ project: s.project ? { ...s.project, ...patch, updatedAt: new Date().toISOString() } : null })),
      updateSlide: (index, slide) => set((s) => {
        if (!s.project) return s;
        const slides = [...s.project.slides]; slides[index] = slide;
        return { project: { ...s.project, slides, updatedAt: new Date().toISOString() } };
      }),
      addSlide: (slide) => set((s) => {
        if (!s.project) return s;
        return { project: { ...s.project, slides: [...s.project.slides, slide], updatedAt: new Date().toISOString() } };
      }),
      removeSlide: (index) => set((s) => {
        if (!s.project) return s;
        const slides = s.project.slides.filter((_, i) => i !== index);
        return { project: { ...s.project, slides, updatedAt: new Date().toISOString() }, activeSlideIndex: Math.min(s.activeSlideIndex, slides.length - 1) };
      }),
      setActiveSlide: (index) => set({ activeSlideIndex: index }),
      setIsExporting: (value) => set({ isExporting: value }),
      reset: () => set({ project: null, activeSlideIndex: 0, isExporting: false }),
    }),
    { name: "shotforge-project", partialize: (state) => ({ project: state.project }) },
  ),
);
