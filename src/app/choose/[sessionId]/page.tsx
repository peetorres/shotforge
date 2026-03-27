"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { NavBar } from "@/components/shared/nav-bar";
import { PreviewSurface } from "@/components/preview/preview-surface";
import { usePreviewCache } from "@/hooks/use-preview-cache";
import { useExport } from "@/hooks/use-export";
import type { ProjectState, VariantId } from "@/domain/types";

export default function PreviewPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<VariantId>("midnight");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shotforge-v2");
      if (!raw) { router.replace("/"); return; }
      const parsed = JSON.parse(raw);
      const p = parsed?.state?.project as ProjectState | undefined;
      if (!p || p.sessionId !== sessionId) { router.replace("/"); return; }
      setProject(p);
      if (p.selectedVariantId) setActiveVariantId(p.selectedVariantId);
    } catch { router.replace("/"); }
  }, [sessionId, router]);

  const activeVariant = project?.variants[activeVariantId] ?? null;

  const { cache: previewCache, loading: previewLoading } = usePreviewCache({
    sessionId: project?.sessionId ?? null,
    slides: activeVariant?.slides ?? [],
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    style: activeVariant?.style ?? "dark",
  });

  const { exportZip } = useExport({
    sessionId: project?.sessionId ?? null,
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    variant: activeVariant,
    uploadedFiles: project?.uploadedFiles ?? [],
    isExporting,
    setIsExporting,
  });

  const persist = useCallback((updated: ProjectState) => {
    setProject(updated);
    localStorage.setItem("shotforge-v2", JSON.stringify({ state: { project: updated }, version: 1 }));
  }, []);

  const handleSlideChange = useCallback((slideIndex: number, patch: Partial<SlideConfig>) => {
    if (!project || !activeVariant) return;
    const newSlides = [...activeVariant.slides];
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...patch } as SlideConfig;
    persist({
      ...project,
      variants: { ...project.variants, [activeVariantId]: { ...activeVariant, slides: newSlides } },
      updatedAt: new Date().toISOString(),
    });
  }, [project, activeVariant, activeVariantId, persist]);

  const handleColorChange = useCallback((color: string) => {
    if (!project) return;
    persist({ ...project, brandColor: color, updatedAt: new Date().toISOString() });
  }, [project, persist]);

  const handleSelect = useCallback((id: VariantId) => {
    if (!project) return;
    setActiveVariantId(id);
    persist({ ...project, selectedVariantId: id, updatedAt: new Date().toISOString() });
  }, [project, persist]);

  if (!project || !activeVariant) {
    return (
      <>
        <NavBar currentStep="choose" />
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 14 }}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <NavBar currentStep="choose" />
      <main style={{ height: "100vh", paddingTop: 48, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PreviewSurface
          variants={project.variants}
          brandColor={project.brandColor}
          activeVariantId={activeVariantId}
          activeVariant={activeVariant}
          previewCache={previewCache}
          previewLoading={previewLoading}
          isExporting={isExporting}
          onVariantChange={handleSelect}
          onSlideChange={handleSlideChange}
          onColorChange={handleColorChange}
          onExport={exportZip}
          onSelect={handleSelect}
        />
      </main>
    </>
  );
}
