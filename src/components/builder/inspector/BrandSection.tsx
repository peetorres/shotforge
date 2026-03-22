"use client";
import type { AppStyle } from "@/lib/style-colors";

interface BrandSectionProps {
  style: AppStyle;
  brandColor: string;
  onStyleChange: (s: AppStyle) => void;
  onColorChange: (c: string) => void;
}

const STYLES: { key: AppStyle; label: string; bg: string }[] = [
  { key: "dark", label: "Dark", bg: "#0D0D18" },
  { key: "light", label: "Light", bg: "#F5F5F7" },
  { key: "bold", label: "Bold", bg: "#000000" },
];

const PRESET_COLORS = ["#6366F1", "#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"];

export function BrandSection({ style, brandColor, onStyleChange, onColorChange }: BrandSectionProps) {
  return (
    <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Brand</p>
        <span style={{ fontSize: 10, color: "#48484a" }}>Applies to all slides</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
        {STYLES.map(({ key, label, bg }) => (
          <div
            key={key}
            onClick={() => onStyleChange(key)}
            style={{ borderRadius: 8, overflow: "hidden", border: `1.5px solid ${style === key ? "#0A84FF" : "transparent"}`, cursor: "pointer" }}
          >
            <div style={{ height: 40, background: bg, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6 }}>
              <div style={{ width: 14, height: 24, background: "rgba(255,255,255,0.12)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div style={{ textAlign: "center", fontSize: 10, padding: "5px 0", fontWeight: 600, color: style === key ? "#0A84FF" : "#98989d", background: "#1c1c1e" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#48484a", marginBottom: 8, fontWeight: 500 }}>Brand Color</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => onColorChange(c)}
            style={{ width: 28, height: 28, borderRadius: 7, background: c, cursor: "pointer", border: brandColor === c ? "2px solid #fff" : "2px solid transparent", transition: "all 0.1s" }}
          />
        ))}
        <input
          type="color"
          value={brandColor}
          onChange={(e) => onColorChange(e.target.value)}
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", padding: 0, cursor: "pointer", background: "none" }}
          title="Custom color"
        />
      </div>
    </div>
  );
}
