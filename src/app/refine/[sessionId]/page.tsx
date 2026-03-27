"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { NavBar } from "@/components/shared/nav-bar";
import { SlideCardsRow } from "@/components/refine/slide-cards-row";
import { Inspector } from "@/components/refine/inspector";
import { useExport } from "@/hooks/use-export";
import { usePreviewCache } from "@/hooks/use-preview-cache";
import type { ProjectState, VariantId } from "@/domain/types";

export default function RefinePage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("shotforge-v2");
      if (!raw) { router.replace("/"); return; }
      const parsed = JSON.parse(raw);
      const p = parsed?.state?.project as ProjectState | undefined;
      if (!p || p.sessionId !== sessionId || !p.selectedVariantId) { router.replace("/"); return; }
      setProject(p);
    } catch {
      router.replace("/");
    }
  }, [sessionId, router]);

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

  // Persist helper
  const persist = useCallback((updated: ProjectState) => {
    setProject(updated);
    localStorage.setItem("shotforge-v2", JSON.stringify({ state: { project: updated }, version: 1 }));
  }, []);

  // RULE-R09: Title changes apply ONLY to selected slide (INV-003)
  const handleSlideChange = useCallback((patch: Partial<SlideConfig>) => {
    if (!project || !project.selectedVariantId || !selectedVariant) return;
    const newSlides = [...selectedVariant.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], ...patch } as SlideConfig;
    const updated: ProjectState = {
      ...project,
      variants: {
        ...project.variants,
        [project.selectedVariantId]: { ...selectedVariant, slides: newSlides },
      },
      updatedAt: new Date().toISOString(),
    };
    persist(updated);
  }, [project, selectedVariant, activeSlideIndex, persist]);

  // RULE-R08: Background changes apply to all slides in variant
  const handleBackgroundChange = useCallback((_bgIndex: number) => {
    // Background visual change — in real implementation would update variant backgroundColor
    // For now, this is wired but the visual change requires extending the variant model
  }, []);

  // RULE-R10: Brand color changes apply to ALL variants (project-level)
  const handleColorChange = useCallback((color: string) => {
    if (!project) return;
    const updated: ProjectState = {
      ...project,
      brandColor: color,
      updatedAt: new Date().toISOString(),
    };
    persist(updated);
  }, [project, persist]);

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
      if (e.key === "ArrowLeft") setActiveSlideIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setActiveSlideIndex((i) => Math.min(selectedVariant.slides.length - 1, i + 1));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVariant]);

  if (!project || !selectedVariant) {
    return (
      <>
        <NavBar currentStep="refine" />
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar
        currentStep="refine"
        rightContent={
          <>
            <button
              onClick={() => router.push(`/choose/${sessionId}`)}
              style={{ height: 28, padding: "0 10px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 11, fontWeight: 600 }}
            >
              ← Variants
            </button>
            <button
              onClick={() => setPreviewMode((p) => !p)}
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
          onSelect={setActiveSlideIndex}
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
