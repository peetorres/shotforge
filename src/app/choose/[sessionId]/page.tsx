"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SlideConfig } from "@appforge/screenshot-gen";
import { NavBar } from "@/components/shared/nav-bar";
import { PreviewSurface } from "@/components/preview/preview-surface";
import { usePreviewCache } from "@/hooks/use-preview-cache";
import { useExport } from "@/hooks/use-export";
import type { ProjectState, VariantId } from "@/domain/types";
import { AIDebugPanel, type AIRunResult } from "@/components/preview/ai-debug-panel";

export default function PreviewPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<VariantId>("midnight");
  const [isExporting, setIsExporting] = useState(false);
  const [aiResult, setAiResult] = useState<AIRunResult | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);

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

  // AI experiment runner
  const runAIExperiment = useCallback(async () => {
    if (!project) return;
    setAiResult({ status: "running", timings: {}, slideCount: 0, fallbackUsed: false, comparisons: [] });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: project.sessionId,
          brand: project.brand,
          description: project.description,
          filenames: project.uploadedFiles,
          variantStyle: activeVariantId === "midnight" ? "dark" : activeVariantId === "clean" ? "light" : "bold",
        }),
      });
      const data = await res.json();

      // Build comparisons
      const comparisons = (activeVariant?.slides ?? []).map((slide, i) => {
        const detHeadline = "headline" in slide
          ? (slide as { headline: string[] }).headline.join(" ")
          : (slide as { tagline?: string[] }).tagline?.join(" ") ?? slide.type;
        const aiSlide = data.slidePlans?.[i];
        return {
          index: i,
          deterministic: detHeadline,
          ai: aiSlide?.headline ?? null,
          role: aiSlide?.slide_role ?? null,
          crop: aiSlide?.crop_strategy ?? null,
        };
      });

      setAiResult({
        status: data.aiUsed ? "success" : "fallback",
        timings: data.timings ?? {},
        slideCount: data.slidePlans?.length ?? 0,
        fallbackUsed: !data.aiUsed,
        comparisons,
        error: data.aiUsed ? undefined : "AI not available — using deterministic",
      });
    } catch (e) {
      setAiResult({
        status: "failed",
        timings: {},
        slideCount: 0,
        fallbackUsed: true,
        comparisons: [],
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [project, activeVariant, activeVariantId]);

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
      <AIDebugPanel
        result={aiResult}
        aiEnabled={aiEnabled}
        onToggle={setAiEnabled}
        onRunExperiment={runAIExperiment}
      />
    </>
  );
}
