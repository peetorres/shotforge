"use client";
import type { SlideConfig, FeatureSingleSlide, FeatureDualSlide } from "@appforge/screenshot-gen";

interface ScreenshotSectionProps {
  slide: SlideConfig;
  uploadedFiles: string[];
  onChange: (patch: Partial<SlideConfig>) => void;
}

export function ScreenshotSection({ slide, uploadedFiles, onChange }: ScreenshotSectionProps) {
  // Rotation only applies to feature-single (single angle) — feature-dual uses angles[] which is V2
  const showRotation = slide.type === "feature-single";
  const currentFile = slide.type === "hero" ? slide.screenshot :
    slide.type === "feature-single" ? (slide as FeatureSingleSlide).screenshot :
    (slide as FeatureDualSlide).screenshots?.[0] ?? "";
  const currentAngle = slide.type === "feature-single" ? ((slide as FeatureSingleSlide).angle ?? 0) : 0;

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Screenshot</p>

      <select
        value={currentFile ?? ""}
        onChange={(e) => {
          if (slide.type === "hero") onChange({ screenshot: e.target.value } as Partial<SlideConfig>);
          else if (slide.type === "feature-single") onChange({ screenshot: e.target.value } as Partial<SlideConfig>);
          else onChange({ screenshots: [e.target.value, (slide as FeatureDualSlide).screenshots?.[1] ?? ""] } as Partial<SlideConfig>);
        }}
        style={{ width: "100%", background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#f5f5f7", marginBottom: 12, fontFamily: "inherit" }}
      >
        {uploadedFiles.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {showRotation && (
        <>
          <p style={{ fontSize: 11, color: "#48484a", marginBottom: 6, fontWeight: 500 }}>Rotation</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={-20} max={20} value={currentAngle}
              onChange={(e) => onChange({ angle: Number(e.target.value) } as Partial<SlideConfig>)}
              style={{ flex: 1, accentColor: "#0A84FF" }}
            />
            <span style={{ fontSize: 11, color: "#98989d", minWidth: 30, textAlign: "right", fontFamily: "monospace" }}>{currentAngle}°</span>
          </div>
        </>
      )}
    </div>
  );
}
