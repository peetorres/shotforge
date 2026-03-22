"use client";
import { useState } from "react";
import type { SlideConfig, HeroSlide, FeatureSingleSlide } from "@appforge/screenshot-gen";
import type { GenerateCopyRequest } from "@/lib/types";
import type { AppStyle } from "@/lib/style-colors";

interface CopySectionProps {
  slide: SlideConfig;
  brand: string;
  description: string;
  style: AppStyle;
  // Use Record<string, unknown> to avoid discriminated-union partial issues in strict mode.
  // The builder page casts back to SlideConfig via spread before storing.
  onChange: (patch: Record<string, unknown>) => void;
}

export function CopySection({ slide, brand, description, style, onChange }: CopySectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    const screenshotFilename =
      slide.type === "hero" ? slide.screenshot :
      slide.type === "feature-single" ? slide.screenshot :
      slide.type === "feature-dual" ? slide.screenshots?.[0] : undefined;

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand, description,
          slideType: slide.type,
          screenshotFilename,
          style,
        } satisfies GenerateCopyRequest),
      });

      if (!res.ok) return;
      const copy = await res.json();

      if (slide.type === "hero") {
        onChange({ tagline: copy.tagline, badgeText: copy.badgeText, bullets: copy.bullets });
      } else {
        onChange({ headline: copy.headline });
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const inputStyle = { width: "100%", background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#f5f5f7", outline: "none", fontFamily: "inherit", resize: "none" as const };
  const labelStyle = { fontSize: 11, color: "#48484a", marginBottom: 5, display: "block", fontWeight: 500 };

  return (
    <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Copy</p>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{ width: "100%", height: 36, background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#818cf8", fontSize: 12, fontWeight: 600, cursor: isGenerating ? "wait" : "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        {isGenerating ? "Generating…" : "✦ Generate with Claude AI"}
      </button>

      {slide.type === "hero" && (
        <>
          <label style={labelStyle}>
            Tagline <span style={{ color: "#48484a", fontSize: 10 }}>(**bold** = brand color)</span>
          </label>
          <textarea
            rows={2}
            value={(slide as HeroSlide).tagline?.join("\n") ?? ""}
            onChange={(e) => onChange({ tagline: e.target.value.split("\n") })}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <label style={labelStyle}>Badge Text</label>
          <input
            value={(slide as HeroSlide).badgeText ?? ""}
            onChange={(e) => onChange({ badgeText: e.target.value })}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <label style={labelStyle}>Bullets (one per line)</label>
          <textarea
            rows={4}
            value={(slide as HeroSlide).bullets?.join("\n") ?? ""}
            onChange={(e) => onChange({ bullets: e.target.value.split("\n") })}
            style={{ ...inputStyle, fontSize: 11 }}
          />
        </>
      )}

      {(slide.type === "feature-single" || slide.type === "feature-dual") && (
        <>
          <label style={labelStyle}>Headline (**bold** = brand color)</label>
          <textarea
            rows={2}
            value={(slide as FeatureSingleSlide).headline?.join("\n") ?? ""}
            onChange={(e) => onChange({ headline: e.target.value.split("\n") })}
            style={inputStyle}
          />
        </>
      )}
    </div>
  );
}
