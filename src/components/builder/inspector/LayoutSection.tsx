"use client";
import type { SlideConfig } from "@appforge/screenshot-gen";

type SlideType = SlideConfig["type"];

interface LayoutSectionProps {
  currentType: SlideType;
  onChange: (type: SlideType) => void;
}

const LAYOUTS: { type: SlideType; icon: string; label: string }[] = [
  { type: "hero", icon: "🏆", label: "Hero" },
  { type: "feature-single", icon: "📱", label: "Feature" },
  { type: "feature-dual", icon: "📱📱", label: "Dual" },
];

export function LayoutSection({ currentType, onChange }: LayoutSectionProps) {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Layout</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
        {LAYOUTS.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            style={{
              background: currentType === type ? "rgba(10,132,255,0.08)" : "#1c1c1e",
              border: `1.5px solid ${currentType === type ? "#0A84FF" : "transparent"}`,
              borderRadius: 8, padding: "10px 4px 8px",
              cursor: "pointer", textAlign: "center", transition: "all 0.12s",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 10, color: currentType === type ? "#0A84FF" : "#98989d", fontWeight: 500 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
