"use client";

const PRESET_COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#22c55e",
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {PRESET_COLORS.map((c) => (
        <div
          key={c}
          role="button"
          tabIndex={0}
          aria-label={`Select color ${c}`}
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onChange(c); }}
          style={{
            width: 36, height: 36, borderRadius: "var(--r-md)",
            background: c, cursor: "pointer",
            border: value === c ? "2.5px solid #fff" : "2.5px solid transparent",
            boxShadow: value === c ? "0 0 12px rgba(255,255,255,0.1)" : "none",
            transition: "all 0.12s var(--ease)",
          }}
        />
      ))}
    </div>
  );
}

export { PRESET_COLORS };
