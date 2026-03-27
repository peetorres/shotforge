"use client";

import { useState } from "react";
import type { SlideConfig } from "@appforge/screenshot-gen";

interface InlineEditorProps {
  slideIndex: number;
  slide: SlideConfig;
  brandColor: string;
  onSlideChange: (patch: Partial<SlideConfig>) => void;
  onColorChange: (color: string) => void;
}

const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

const BACKGROUNDS = [
  "linear-gradient(160deg,#0D0D18,#1a1033)",
  "linear-gradient(160deg,#F5F5F7,#E8E8ED)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(160deg,#000,#0a0a1a)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

function getHeadline(slide: SlideConfig): string {
  if (slide.type === "hero") return (slide.tagline ?? []).join("\n");
  if (slide.type === "feature-single" || slide.type === "feature-dual") return (slide.headline ?? []).join("\n");
  return "";
}

export function InlineEditor({ slideIndex, slide, brandColor, onSlideChange, onColorChange }: InlineEditorProps) {
  // Multi-open accordion
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ title: true, bg: false, color: false, device: false });

  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Slide indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 0 12px", marginBottom: 4,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: "var(--indigo)", color: "#fff",
          fontSize: 11, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{slideIndex + 1}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
          {slide.type === "hero" ? "Hero" : "Feature"} slide
        </span>
      </div>

      <Section title="Title" icon="Tt" isOpen={openSections.title} onToggle={() => toggle("title")} ai>
        <label style={labelStyle}>Headline</label>
        <textarea
          value={getHeadline(slide)}
          onChange={(e) => {
            const lines = e.target.value.split("\n");
            if (slide.type === "hero") onSlideChange({ tagline: lines } as Partial<SlideConfig>);
            else onSlideChange({ headline: lines } as Partial<SlideConfig>);
          }}
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--indigo)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
        />
        <label style={labelStyle}>Font</label>
        <select style={inputStyle}>
          <option>Inter</option>
          <option>SF Pro Display</option>
          <option>Poppins</option>
          <option>Montserrat</option>
          <option>Space Grotesk</option>
        </select>
      </Section>

      <Section title="Background" icon="🖼" isOpen={openSections.bg} onToggle={() => toggle("bg")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
          {BACKGROUNDS.map((bg, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1", borderRadius: 7, background: bg, cursor: "pointer",
                border: "2px solid transparent",
                transition: "all 0.2s var(--ease)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)"; }}
            />
          ))}
        </div>
      </Section>

      <Section title="Brand Color" icon="●" isOpen={openSections.color} onToggle={() => toggle("color")}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => onColorChange(c)}
              style={{
                width: 26, height: 26, borderRadius: 7, background: c, cursor: "pointer",
                border: c === brandColor ? "2.5px solid #fff" : "2.5px solid transparent",
                boxShadow: c === brandColor ? "0 0 10px rgba(255,255,255,0.1)" : "0 2px 6px rgba(0,0,0,0.2)",
                transition: "all 0.2s var(--ease)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            />
          ))}
        </div>
      </Section>

      <Section title="Device" icon="📱" isOpen={openSections.device} onToggle={() => toggle("device")}>
        <label style={labelStyle}>Rotation</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range" min={-20} max={20}
            value={slide.type === "feature-single" ? (slide.angle ?? 0) : 0}
            onChange={(e) => onSlideChange({ angle: Number(e.target.value) } as Partial<SlideConfig>)}
            style={{ flex: 1, accentColor: "var(--indigo)", height: 3 }}
          />
          <span style={{
            fontSize: 10, color: "var(--text-4)", minWidth: 30, textAlign: "right",
            fontFamily: "'SF Mono', monospace", fontWeight: 500,
          }}>
            {slide.type === "feature-single" ? (slide.angle ?? 0) : 0}°
          </span>
        </div>
      </Section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, color: "var(--text-4)", marginBottom: 5, display: "block", fontWeight: 600, letterSpacing: 0.2,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg)",
  border: "1px solid var(--border)", borderRadius: 7,
  padding: "8px 10px", fontSize: 12, color: "var(--text)",
  marginBottom: 10, fontFamily: "inherit",
  transition: "border-color 0.15s var(--ease), box-shadow 0.15s var(--ease)",
};

function Section({ title, icon, isOpen, onToggle, ai, children }: {
  title: string; icon: string; isOpen: boolean; onToggle: () => void; ai?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "11px 0", cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <span style={{ fontSize: 12, width: 16, textAlign: "center", opacity: 0.6 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1, letterSpacing: -0.1 }}>{title}</span>
        {ai && (
          <span style={{
            fontSize: 8, padding: "2px 6px",
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: 4, color: "#818cf8", fontWeight: 700, letterSpacing: 0.3,
          }}>
            ✦ AI
          </span>
        )}
        <span style={{
          fontSize: 9, color: "var(--text-4)",
          transition: "transform 0.25s var(--ease-out)",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}>▾</span>
      </div>
      {/* Smooth expand/collapse via grid trick */}
      <div style={{
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        transition: "grid-template-rows 0.28s var(--ease-out)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingBottom: isOpen ? 14 : 0, transition: "padding 0.2s var(--ease)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
