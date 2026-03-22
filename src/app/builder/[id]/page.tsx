"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShotforgeStore } from "@/lib/store";
import { TopBar } from "@/components/builder/TopBar";
import { SlidesPanel } from "@/components/builder/SlidesPanel";
import { Canvas } from "@/components/builder/Canvas";
import { Inspector } from "@/components/builder/Inspector";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/lib/style-colors";

export default function BuilderPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const {
    project, activeSlideIndex,
    updateSlide, updateProject, setActiveSlide, addSlide,
  } = useShotforgeStore();

  // Wait for Zustand persist to rehydrate from localStorage before redirecting.
  // Without this guard, the redirect fires before rehydration completes on page refresh.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useShotforgeStore.persist.onFinishHydration(() => setHydrated(true));
    if (useShotforgeStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!project || project.id !== id) {
      router.replace("/new");
    }
  }, [hydrated, project, id, router]);

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#98989d", fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  const activeSlide = project.slides[activeSlideIndex] ?? null;

  function handleSlideChange(patch: Record<string, unknown>) {
    if (!activeSlide) return;
    updateSlide(activeSlideIndex, { ...activeSlide, ...patch } as SlideConfig);
  }

  function handleStyleChange(newStyle: AppStyle) {
    updateProject({ style: newStyle });
  }

  function handleColorChange(color: string) {
    updateProject({ brandColor: color });
  }

  function handleAddSlide() {
    if (!project) return;
    const newSlide: SlideConfig = {
      type: "feature-single",
      headline: ["**New** feature"],
      screenshot: project.uploadedFiles[0] ?? "",
      angle: 0,
    };
    addSlide(newSlide);
    setActiveSlide(project.slides.length);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar brand={project.brand} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SlidesPanel
          slides={project.slides}
          activeIndex={activeSlideIndex}
          onSelect={setActiveSlide}
          onAdd={handleAddSlide}
        />

        <Canvas
          sessionId={project.id}
          slide={activeSlide}
          brand={project.brand}
          brandColor={project.brandColor}
          style={project.style}
          slideIndex={activeSlideIndex}
          totalSlides={project.slides.length}
          onNavigate={setActiveSlide}
        />

        {activeSlide && (
          <Inspector
            slide={activeSlide}
            brand={project.brand}
            description={project.description}
            style={project.style}
            brandColor={project.brandColor}
            uploadedFiles={project.uploadedFiles}
            onSlideChange={handleSlideChange}
            onStyleChange={handleStyleChange}
            onColorChange={handleColorChange}
          />
        )}
      </div>
    </div>
  );
}
