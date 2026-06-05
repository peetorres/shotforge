"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { useShotforgeStore } from "@/app-state/store";
import { NavBar } from "@/components/shared/nav-bar";
import { SlideCardsRow } from "@/components/refine/slide-cards-row";
import { Inspector } from "@/components/refine/inspector";
import { useExport } from "@/hooks/use-export";
import { usePreviewCache } from "@/hooks/use-preview-cache";

export default function RefinePage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const project = useShotforgeStore((state) => state.project);
  const activeSlideIndex = useShotforgeStore((state) => state.activeSlideIndex);
  const previewMode = useShotforgeStore((state) => state.previewMode);
  const isExporting = useShotforgeStore((state) => state.isExporting);
  const setActiveSlideIndex = useShotforgeStore((state) => state.setActiveSlide);
  const setPreviewMode = useShotforgeStore((state) => state.setPreviewMode);
  const setIsExporting = useShotforgeStore((state) => state.setIsExporting);
  const updateProject = useShotforgeStore((state) => state.updateProject);
  const updateSlide = useShotforgeStore((state) => state.updateSlide);

  useEffect(() => {
    if (!project || project.sessionId !== sessionId || !project.selectedVariantId) {
      router.replace("/");
      return;
    }
  }, [project, sessionId, router]);

  const selectedVariant = project?.selectedVariantId
    ? project.variants[project.selectedVariantId]
    : null;

  const activeSlide = selectedVariant?.slides[activeSlideIndex] ?? null;

  // Real server-rendered previews
  const { cache: previewCache, loading: previewLoading } = usePreviewCache({
    sessionId: project?.sessionId ?? null,
    slides: selectedVariant?.slides ?? [],
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    style: selectedVariant?.style ?? "dark",
  });

  const handleSlideChange = useCallback((patch: Partial<SlideConfig>) => {
    if (!project || !project.selectedVariantId || !selectedVariant) return;
    updateSlide(project.selectedVariantId, activeSlideIndex, patch);
  }, [project, selectedVariant, activeSlideIndex, updateSlide]);

  // RULE-R08: Background changes apply to all slides in variant
  const handleBackgroundChange = useCallback((_bgIndex: number) => {
    // Background visual change — in real implementation would update variant backgroundColor
    // For now, this is wired but the visual change requires extending the variant model
  }, []);

  const handleColorChange = useCallback((color: string) => {
    if (!project) return;
    updateProject({ brandColor: color });
  }, [project, updateProject]);

  const { exportZip } = useExport({
    sessionId: project?.sessionId ?? null,
    brand: project?.brand ?? "",
    brandColor: project?.brandColor ?? "",
    variant: selectedVariant,
    uploadedFiles: project?.uploadedFiles ?? [],
    isExporting,
    setIsExporting,
  });

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (!selectedVariant) return;
      if (e.key === "ArrowLeft") setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
      if (e.key === "ArrowRight") {
        setActiveSlideIndex(Math.min(selectedVariant.slides.length - 1, activeSlideIndex + 1));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVariant, activeSlideIndex, setActiveSlideIndex]);

  if (!project || !selectedVariant) {
    return (
      <>
        <NavBar currentStep="preview" />
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar
        currentStep="preview"
        rightContent={
          <>
            <button
              onClick={() => router.push(`/choose/${sessionId}`)}
              style={{ height: 28, padding: "0 10px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 11, fontWeight: 600 }}
            >
              ← Variants
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={{
                height: 28, padding: "0 12px", borderRadius: "var(--r-sm)",
                fontSize: 11, fontWeight: 600,
                background: previewMode ? "var(--indigo)" : "var(--surface-2)",
                color: previewMode ? "#fff" : "var(--text-2)",
                border: previewMode ? "1px solid var(--indigo)" : "1px solid var(--border)",
              }}
            >
              {previewMode ? "✎ Edit" : "👁 Preview"}
            </button>
            <button
              onClick={exportZip}
              disabled={isExporting}
              style={{
                height: 28, padding: "0 12px", borderRadius: "var(--r-sm)",
                fontSize: 11, fontWeight: 700,
                background: "var(--green)", color: "#000",
              }}
            >
              {isExporting ? "..." : "⬇ Export"}
            </button>
          </>
        }
      />

      <div
        style={{
          height: "100vh", paddingTop: 48,
          display: "grid",
          gridTemplateColumns: previewMode ? "1fr" : "1fr 272px",
          transition: "grid-template-columns 0.3s var(--ease-out)",
          overflow: "hidden",
        }}
      >
        {/* Slides */}
        <SlideCardsRow
          slideCount={selectedVariant.slides.length}
          previewCache={previewCache}
          previewLoading={previewLoading}
          activeIndex={activeSlideIndex}
          onSelect={(index) => setActiveSlideIndex(index)}
        />

        {/* Inspector */}
        {!previewMode && activeSlide && (
          <Inspector
            slideIndex={activeSlideIndex}
            slideCount={selectedVariant.slides.length}
            slide={activeSlide}
            style={selectedVariant.style}
            brandColor={project.brandColor}
            onSlideChange={handleSlideChange}
            onBackgroundChange={handleBackgroundChange}
            onColorChange={handleColorChange}
          />
        )}
      </div>
    </>
  );
}
