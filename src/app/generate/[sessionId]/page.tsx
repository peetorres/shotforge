"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/shared/nav-bar";
import { ProgressScreen } from "@/components/generate/progress-screen";
import { generateAllVariants } from "@/hooks/use-generate";
import { createVariants } from "@/domain/variant";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { ProjectState, VariantId, GeneratedCopy } from "@/domain/types";

interface PendingSession {
  sessionId: string;
  brand: string;
  description: string;
  brandColor: string;
  filenames: string[];
}

export default function GeneratePage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const raw = localStorage.getItem("shotforge-pending");
    if (!raw) {
      router.replace("/");
      return;
    }

    let pending: PendingSession;
    try {
      pending = JSON.parse(raw);
    } catch {
      router.replace("/");
      return;
    }

    if (pending.sessionId !== sessionId) {
      router.replace("/");
      return;
    }

    async function runGeneration() {
      try {
        // Build initial variants with default copy
        const variants = createVariants(pending.filenames, pending.brand, pending.brandColor);

        // Generate AI copy for all variants
        const copyResults = await generateAllVariants({
          filenames: pending.filenames,
          brand: pending.brand,
          description: pending.description,
          brandColor: pending.brandColor,
          onProgress: setProgress,
        });

        // Merge AI copy into variant slides
        for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
          const copies = copyResults[variantId];
          const slides = variants[variantId].slides.map((slide, i) => {
            const copy: GeneratedCopy | undefined = copies[i];
            if (!copy) return slide;

            if (slide.type === "hero") {
              return {
                ...slide,
                tagline: copy.tagline ?? slide.tagline,
                badgeText: copy.badgeText,
                bullets: copy.bullets ?? slide.bullets,
              };
            }
            const existingHeadline = "headline" in slide ? (slide as { headline: string[] }).headline : ["**Feature** headline"];
            return {
              ...slide,
              headline: copy.headline ?? existingHeadline,
            } as SlideConfig;
          });
          variants[variantId] = { ...variants[variantId], slides };
        }

        // Create project state
        const project: ProjectState = {
          sessionId: pending.sessionId,
          brand: pending.brand,
          description: pending.description,
          brandColor: pending.brandColor,
          uploadedFiles: pending.filenames,
          variants,
          selectedVariantId: null,
          step: "choose",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Persist to localStorage
        localStorage.setItem("shotforge-v2", JSON.stringify({ state: { project }, version: 1 }));
        localStorage.removeItem("shotforge-pending");

        // Navigate to choose
        router.push(`/choose/${pending.sessionId}`);
      } catch (e) {
        console.error("[generate] failed:", e);
        setError("Generation failed. Please try again.");
      }
    }

    runGeneration();
  }, [sessionId, router]);

  return (
    <>
      <NavBar currentStep="generate" />
      {error ? (
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--red)", fontSize: 15, marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => router.replace("/")}
            style={{ padding: "8px 20px", background: "var(--surface-2)", color: "var(--text-2)", borderRadius: "var(--r-sm)", fontSize: 13, fontWeight: 600 }}
          >
            ← Back to Create
          </button>
        </div>
      ) : (
        <ProgressScreen progress={progress} />
      )}
    </>
  );
}
