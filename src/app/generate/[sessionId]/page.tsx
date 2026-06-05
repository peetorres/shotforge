"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getShotforgeStore } from "@/app-state/store";
import { NavBar } from "@/components/shared/nav-bar";
import { ProgressScreen } from "@/components/generate/progress-screen";
import { generateAllVariants } from "@/hooks/use-generate";
import { createVariants } from "@/domain/variant";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { SlidePlan } from "@/ai/schemas";
import type { ProjectState, ScreenshotAnalysis, VariantId, GeneratedCopy } from "@/domain/types";
import { buildSeedFinalistSet } from "@/pipeline/curation/seed-finalists";
import { applyAiSlidePlans } from "@/pipeline/ai/apply-slide-plans";

interface PendingSession {
  sessionId: string;
  brand: string;
  description: string;
  brandColor: string;
  filenames: string[];
  engine?: "standard" | "gemini";
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

    // ── Gemini engine branch ─────────────────────────────────────────────────
    if (pending.engine === "gemini") {
      runGeminiGeneration();
      return;
    }

    async function runGeminiGeneration() {
      try {
        setProgress(10);
        const res = await fetch("/api/generate-gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: pending.sessionId,
            filenames: pending.filenames,
            brand: pending.brand,
            description: pending.description,
            brandColor: pending.brandColor,
          }),
        });
        setProgress(90);
        if (!res.ok) {
          const err = await res.json() as { error?: string; detail?: string };
          throw new Error(err.detail ?? err.error ?? "Generation failed");
        }
        const data = await res.json() as { images: unknown[]; brand: string; sessionId: string };
        setProgress(100);
        localStorage.setItem("shotforge-gemini-result", JSON.stringify({
          sessionId: data.sessionId,
          brand: data.brand,
          images: data.images,
        }));
        localStorage.removeItem("shotforge-pending");
        router.push(`/preview-gemini/${pending.sessionId}`);
      } catch (e) {
        console.error("[generate] gemini failed:", e);
        setError("Generation failed. Please try again.");
      }
    }

    async function runGeneration() {
      const t0 = Date.now();
      const log = (msg: string) => console.log(`[gen ${Date.now() - t0}ms] ${msg}`);
      log("START — session: " + pending.sessionId + ", files: " + pending.filenames.length);
      try {
        log("1. Creating variants (sync)");
        const variants = createVariants(pending.filenames, pending.brand, pending.brandColor);
        log("2. Variants created — " + Object.keys(variants).length + " variants, " + variants.midnight.slides.length + " slides each");

        // ─── AI VISUAL DIRECTOR (feature flag) ──────
        // Only runs if AI_VISUAL_DIRECTOR flag detected
        // Scope: slide roles, crop strategy, headlines
        let aiPlan: { slides: SlidePlan[] } | null = null;
        let aiScreenshotAnalyses: ScreenshotAnalysis[] | null = null;

        try {
          log("2.5. Checking AI Visual Director...");
          const aiRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: pending.sessionId,
              brand: pending.brand,
              description: pending.description,
              filenames: pending.filenames,
              variantStyle: "dark",
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData.aiUsed && aiData.slidePlans) {
              aiPlan = { slides: aiData.slidePlans };
              aiScreenshotAnalyses = Array.isArray(aiData.screenshotAnalyses) ? aiData.screenshotAnalyses : null;
              log("2.6. AI Visual Director active — " + aiData.slidePlans.length + " slide plans received");
              log("2.7. AI timings: " + JSON.stringify(aiData.timings));

              // Side-by-side comparison
              log("─── COMPARISON: Deterministic vs AI ───");
              for (let i = 0; i < Math.min(variants.midnight.slides.length, aiData.slidePlans.length); i++) {
                const detSlide = variants.midnight.slides[i];
                const aiSlide = aiData.slidePlans[i];
                const detHeadline = "headline" in detSlide ? (detSlide as { headline: string[] }).headline?.join(" ") : (detSlide as { tagline?: string[] }).tagline?.join(" ") ?? detSlide.type;
                const aiHeadline = (aiSlide as { headline?: string }).headline ?? "?";
              const aiRole = (aiSlide as { role?: string }).role ?? "?";
              const aiCrop = ((aiSlide as { composition?: { crop?: { strategy?: string; zoom?: number } } }).composition?.crop);
              log(`  Slide ${i + 1}: DET="${detHeadline}" | AI="${aiHeadline}" (role: ${aiRole}, crop: ${aiCrop?.strategy ?? "?"}, zoom: ${aiCrop?.zoom ?? 1})`);
              }
              log("─── END COMPARISON ───");
            } else {
              log("2.6. AI Visual Director: no AI data (key not set or analysis failed)");
            }
          } else {
            log("2.6. AI Visual Director: API returned " + aiRes.status);
          }
        } catch (aiErr) {
          log("2.6. AI Visual Director: failed (" + (aiErr instanceof Error ? aiErr.message : aiErr) + ") — using deterministic");
        }

        // ─── Apply AI VISUAL DIRECTION (layout, crop, zoom, position, scale) ────
        if (aiPlan?.slides) {
          log("2.8. Applying AI visual direction + layout types to all variants");
          const applied = applyAiSlidePlans(variants, aiPlan.slides);
          for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
            variants[variantId] = applied.variants[variantId];
          }
          log(`2.9. AI slide plans applied — ${applied.appliedCount} updates across ${applied.layoutsUsed.length} tracked layouts`);
        }

        log("3. Starting fallback copy generation (async, 3 variants × " + pending.filenames.length + " slides)");
        const copyResults = await generateAllVariants({
          filenames: pending.filenames,
          brand: pending.brand,
          description: pending.description,
          brandColor: pending.brandColor,
          onProgress: setProgress,
        });
        log("4. Fallback copy complete — midnight:" + copyResults.midnight.length + " clean:" + copyResults.clean.length + " vivid:" + copyResults.vivid.length);

        log("5. Merging copy into variant slides (AI headlines take priority if present)");
        for (const variantId of ["midnight", "clean", "vivid"] as VariantId[]) {
          const copies = copyResults[variantId];
          const slides = variants[variantId].slides.map((slide, i) => {
            const copy: GeneratedCopy | undefined = copies[i];
            if (!copy) return slide;

            // If AI already set the headline, don't overwrite with fallback
            if (aiPlan?.slides?.[i]) return slide;

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
          log("6. Merged " + variantId + " — " + slides.length + " slides");
        }

        log("7. Creating project state");
        const finalists = buildSeedFinalistSet({
          sessionId: pending.sessionId,
          brand: pending.brand,
          description: pending.description,
          brandColor: pending.brandColor,
          variants,
          analysesOverride: aiScreenshotAnalyses ?? undefined,
        });
        const initialVariantId = (finalists.top3[0]?.id?.replace(/^seed-/, "") ?? "midnight") as VariantId;
        const project: ProjectState = {
          sessionId: pending.sessionId,
          brand: pending.brand,
          description: pending.description,
          brandColor: pending.brandColor,
          uploadedFiles: pending.filenames,
          variants,
          selectedVariantId: initialVariantId,
          finalists,
          selectedFinalistId: finalists.top3[0]?.id ?? null,
          step: "preview",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        log("8. Persisting to centralized store");
        getShotforgeStore().getState().setProject(project);
        localStorage.removeItem("shotforge-pending");

        log("9. Navigating to /choose/" + pending.sessionId);
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
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <p style={{ color: "#ef4444", fontSize: 15, fontWeight: 600 }}>Something went wrong</p>
          <p style={{ color: "#71717a", fontSize: 13, maxWidth: 360, textAlign: "center" }}>{error}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => { setError(null); setProgress(0); hasStarted.current = false; }}
              style={{ padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              Retry
            </button>
            <button
              onClick={() => router.replace("/")}
              style={{ padding: "8px 20px", background: "#1c1c1e", color: "#a1a1aa", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              ← Back
            </button>
          </div>
        </div>
      ) : (
        <ProgressScreen progress={progress} />
      )}
    </>
  );
}
