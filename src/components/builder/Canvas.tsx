"use client";
import { usePreview } from "@/hooks/usePreview";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/lib/style-colors";

interface CanvasProps {
  sessionId: string;
  slide: SlideConfig | null;
  brand: string;
  brandColor: string;
  style: AppStyle;
  slideIndex: number;
  totalSlides: number;
  onNavigate: (index: number) => void;
}

export function Canvas({ sessionId, slide, brand, brandColor, style, slideIndex, totalSlides, onNavigate }: CanvasProps) {
  const { previewSrc, isLoading } = usePreview({ sessionId, slide, brand, brandColor, style });

  return (
    <div style={{ flex: 1, background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
      <div style={{ width: "100%", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#48484a" }}>iPhone 15 Pro Max</span>
          <span style={{ fontSize: 12, color: "#98989d" }}>· 6.7"</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoading && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9F0A" }} />
          )}
          {!isLoading && previewSrc && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158" }} />
          )}
          <span style={{ fontSize: 12, color: "#48484a" }}>Live Preview</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{
          height: "100%", maxHeight: 560,
          aspectRatio: "1290/2796",
          borderRadius: 48,
          position: "relative",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 40px 120px rgba(0,0,0,0.8)",
          overflow: "hidden",
          background: "#161618",
        }}>
          {previewSrc ? (
            <img src={previewSrc} alt="Slide preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#48484a", fontSize: 13 }}>
              {slide ? "Rendering…" : "Select a slide"}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            onClick={() => onNavigate(i)}
            style={{
              height: 6, borderRadius: 3, cursor: "pointer",
              background: i === slideIndex ? "#0A84FF" : "#2c2c2e",
              width: i === slideIndex ? 20 : 6,
              transition: "all 0.2s",
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: "#98989d", marginLeft: 8, fontWeight: 500 }}>
          {slideIndex + 1} / {totalSlides}
        </span>
      </div>
    </div>
  );
}
