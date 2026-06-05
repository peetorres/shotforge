"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { useShotforgeStore } from "@/app-state/store";
import { NavBar } from "@/components/shared/nav-bar";
import { PreviewSurface } from "@/components/preview/preview-surface";
import { usePreviewCache } from "@/hooks/use-preview-cache";
import { useExport } from "@/hooks/use-export";
import type { Finalist, VariantId } from "@/domain/types";
import { AIDebugPanel } from "@/components/preview/ai-debug-panel";

export default function PreviewPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const project = useShotforgeStore((state) => state.project);
  const updateProject = useShotforgeStore((state) => state.updateProject);
  const selectVariant = useShotforgeStore((state) => state.selectVariant);
  const updateSlide = useShotforgeStore((state) => state.updateSlide);
  const isExporting = useShotforgeStore((state) => state.isExporting);
  const setIsExporting = useShotforgeStore((state) => state.setIsExporting);

  useEffect(() => {
    if (!project) {
      router.replace("/");
      return;
    }

    if (project.sessionId !== sessionId) {
      router.replace("/");
    }
  }, [project, sessionId, router]);

  const surfacedFinalists: Finalist[] = project?.finalists
    ? [...project.finalists.top3, ...project.finalists.additional]
    : [];
  const activeFinalist = surfacedFinalists.find(
    (finalist) => finalist.id === project?.selectedFinalistId,
  ) ?? surfacedFinalists[0] ?? null;
  const activeVariantId = (activeFinalist?.id.replace(/^seed-/, "") as VariantId | undefined)
    ?? project?.selectedVariantId
    ?? "midnight";
  const activeVariant = project?.variants[activeVariantId] ?? null;
  const activeRenderable = useMemo(() => {
    if (!activeVariant) {
      return null;
    }

    if (!activeFinalist) {
      return activeVariant;
    }

    return {
      ...activeVariant,
      slides: activeFinalist.slides,
    };
  }, [activeFinalist, activeVariant]);

  const { cache: previewCache, loading: previewLoading } = usePreviewCache({
    sessionId: project?.sessionId ?? null,
    slides: activeRenderable?.slides ?? [],
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    style: activeRenderable?.style ?? "dark",
  });

  const { exportZip } = useExport({
    sessionId: project?.sessionId ?? null,
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    variant: activeRenderable,
    uploadedFiles: project?.uploadedFiles ?? [],
    isExporting,
    setIsExporting,
  });

  const handleSlideChange = useCallback((slideIndex: number, patch: Partial<SlideConfig>) => {
    if (!project || !activeVariant) return;
    updateSlide(activeVariantId, slideIndex, patch);
  }, [project, activeVariant, activeVariantId, updateSlide]);

  const handleColorChange = useCallback((color: string) => {
    if (!project) return;
    updateProject({ brandColor: color });
  }, [project, updateProject]);

  const handleSelect = useCallback((id: VariantId) => {
    if (!project) return;
    selectVariant(id);
    const finalistId = project.finalists
      ? [...project.finalists.top3, ...project.finalists.additional].find((finalist) => finalist.id === `seed-${id}`)?.id
      : null;
    if (finalistId) {
      updateProject({ selectedFinalistId: finalistId });
    }
  }, [project, selectVariant, updateProject]);

  if (!project || !activeVariant || !activeRenderable) {
    return (
      <>
        <NavBar currentStep="preview" />
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 14 }}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <NavBar currentStep="preview" />
      <main style={{ height: "100vh", paddingTop: 48, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PreviewSurface
          finalists={surfacedFinalists}
          activeFinalist={activeFinalist}
          variants={project.variants}
          brandColor={project.brandColor}
          activeVariantId={activeVariantId}
          activeVariant={activeRenderable}
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
      <AIDebugPanel result={null} />
    </>
  );
}
