"use client";
import { useExport } from "@/hooks/useExport";

interface TopBarProps {
  brand: string;
}

const STEPS = ["Brand", "Screens", "Builder", "Export"];

export function TopBar({ brand }: TopBarProps) {
  const { exportZip, isExporting } = useExport();

  return (
    <div style={{ height: 52, background: "rgba(22,22,24,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f7" }}>
          Shot<span style={{ color: "#0A84FF" }}>forge</span>
        </span>
        <div style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 10px", fontSize: 13, color: "#98989d" }}>
          ✦ {brand || "Untitled"}
        </div>
      </div>

      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 500, color: i === 2 ? "#f5f5f7" : i < 2 ? "#30D158" : "#48484a", background: i === 2 ? "#1c1c1e" : "transparent", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
            {i < 2 ? "✓ " : ""}{s}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={exportZip}
          disabled={isExporting}
          style={{ height: 32, padding: "0 16px", background: isExporting ? "#1c1c1e" : "#0A84FF", color: isExporting ? "#48484a" : "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: isExporting ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
        >
          {isExporting ? "Exporting…" : "⬇ Export ZIP"}
        </button>
      </div>
    </div>
  );
}
