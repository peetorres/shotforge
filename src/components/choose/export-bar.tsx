"use client";

interface ExportBarProps {
  variantName: string;
  slideCount: number;
  visible: boolean;
  onExport: () => void;
  isExporting: boolean;
}

export function ExportBar({ variantName, slideCount, visible, onExport, isExporting }: ExportBarProps) {
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 68,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        zIndex: 200,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s var(--ease)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>
        Selected: <strong style={{ color: "var(--text)" }}>{variantName} — {slideCount} slides</strong>
      </span>

      <div style={{ display: "flex", gap: 4 }}>
        {["6.9\"", "6.7\"", "6.5\"", "6.1\""].map((s) => (
          <span key={s} style={{ fontSize: 10, padding: "3px 7px", background: "var(--surface)", borderRadius: "var(--r-xs)", color: "var(--text-3)" }}>
            {s}
          </span>
        ))}
      </div>

      <button
        onClick={onExport}
        disabled={isExporting}
        style={{
          height: 40, padding: "0 24px", borderRadius: "var(--r-md)",
          fontSize: 14, fontWeight: 700,
          background: isExporting ? "var(--surface-2)" : "var(--green)",
          color: isExporting ? "var(--text-3)" : "#000",
          display: "flex", alignItems: "center", gap: 6,
          cursor: isExporting ? "wait" : "pointer",
          boxShadow: isExporting ? "none" : "0 4px 20px rgba(34,197,94,0.25)",
          transition: "all 0.15s var(--ease)",
        }}
      >
        {isExporting ? "Exporting..." : "⬇ Download ZIP"}
      </button>
    </div>
  );
}
