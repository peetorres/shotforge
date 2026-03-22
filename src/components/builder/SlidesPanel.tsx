"use client";
import type { SlideConfig } from "@appforge/screenshot-gen";

interface SlidesPanelProps {
  slides: SlideConfig[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  hero: "#0A84FF",
  "feature-single": "#30D158",
  "feature-dual": "#BF5AF2",
};

const TYPE_LABELS: Record<string, string> = {
  hero: "HERO",
  "feature-single": "FEAT",
  "feature-dual": "DUAL",
};

export function SlidesPanel({ slides, activeIndex, onSelect, onAdd }: SlidesPanelProps) {
  return (
    <div style={{ width: 200, background: "#161618", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Slides</span>
        <span style={{ fontSize: 11, color: "#48484a" }}>{slides.length}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            onClick={() => onSelect(i)}
            style={{
              background: activeIndex === i ? "rgba(10,132,255,0.06)" : "#1c1c1e",
              border: `1.5px solid ${activeIndex === i ? "#0A84FF" : "transparent"}`,
              borderRadius: 10, padding: 10, cursor: "pointer", transition: "all 0.12s", position: "relative",
            }}
          >
            <div style={{ width: "100%", aspectRatio: "9/19.5", background: "#0d0d0d", borderRadius: 6, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, opacity: 0.4 }}>📱</span>
            </div>

            <div style={{ fontSize: 11, color: "#98989d", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {slide.type === "hero"
                ? (slide.tagline?.[0]?.replace(/\*\*/g, "") ?? "Hero")
                : (slide.type === "feature-single"
                  ? (slide.headline?.[0]?.replace(/\*\*/g, "") ?? "Feature")
                  : (slide.headline?.[0]?.replace(/\*\*/g, "") ?? "Dual"))}
            </div>

            <div style={{
              position: "absolute", top: 16, right: 10,
              fontSize: 9, fontWeight: 700, letterSpacing: "0.5px",
              padding: "2px 5px", borderRadius: 4,
              background: `${TYPE_COLORS[slide.type]}1a`,
              color: TYPE_COLORS[slide.type],
            }}>
              {TYPE_LABELS[slide.type]}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        style={{ margin: "0 8px 10px", height: 34, border: "1.5px dashed rgba(255,255,255,0.08)", borderRadius: 10, background: "none", color: "#48484a", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s" }}
      >
        + Add Slide
      </button>
    </div>
  );
}
