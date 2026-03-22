"use client";

interface BrandStepProps {
  brand: string;
  description: string;
  brandColor: string;
  onBrandChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onNext: () => void;
}

const PRESET_COLORS = ["#6366F1", "#0A84FF", "#30D158", "#FF9F0A", "#FF453A", "#BF5AF2"];

export function BrandStep({ brand, description, brandColor, onBrandChange, onDescriptionChange, onColorChange, onNext }: BrandStepProps) {
  const canProceed = brand.trim().length > 0;

  return (
    <div style={{ maxWidth: 480, width: "100%", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f5f5f7", letterSpacing: "-0.5px", marginBottom: 8 }}>
        Tell us about your app
      </h2>
      <p style={{ color: "#98989d", fontSize: 15, marginBottom: 40 }}>
        This powers the AI copy generation.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* App name */}
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px" }}>App Name *</span>
          <input
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            placeholder="Sensei"
            style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#f5f5f7", outline: "none", fontFamily: "inherit" }}
          />
        </label>

        {/* Description */}
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px" }}>One-line description</span>
          <input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Gamified business learning for indie founders"
            style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#f5f5f7", outline: "none", fontFamily: "inherit" }}
          />
        </label>

        {/* Brand color */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#98989d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Brand Color</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => onColorChange(c)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c, cursor: "pointer",
                  border: brandColor === c ? "3px solid #fff" : "2px solid transparent",
                  transition: "all 0.1s",
                }}
              />
            ))}
            <input
              type="color"
              value={brandColor}
              onChange={(e) => onColorChange(e.target.value)}
              style={{ width: 36, height: 36, borderRadius: 10, border: "none", padding: 0, cursor: "pointer", background: "none" }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        style={{
          marginTop: 40, width: "100%", height: 52,
          background: canProceed ? "#0A84FF" : "#1c1c1e",
          color: canProceed ? "#fff" : "#48484a",
          borderRadius: 14, fontSize: 15, fontWeight: 700,
          border: "none", cursor: canProceed ? "pointer" : "not-allowed",
          transition: "all 0.15s",
        }}
      >
        Next → Upload Screenshots
      </button>
    </div>
  );
}
