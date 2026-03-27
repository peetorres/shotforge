"use client";

import { useState } from "react";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/domain/types";

interface InspectorProps {
  slideIndex: number;
  slideCount: number;
  slide: SlideConfig;
  style: AppStyle;
  brandColor: string;
  onSlideChange: (patch: Partial<SlideConfig>) => void;
  onBackgroundChange: (bgIndex: number) => void;
  onColorChange: (color: string) => void;
}

const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

const BACKGROUNDS = [
  { label: "Midnight", bg: "linear-gradient(160deg,#0D0D18,#1a1033)" },
  { label: "Snow", bg: "linear-gradient(160deg,#F5F5F7,#E8E8ED)" },
  { label: "Brand", bg: "" },
  { label: "Black", bg: "linear-gradient(160deg,#000,#0a0a1a)" },
  { label: "Purple", bg: "linear-gradient(135deg,#667eea,#764ba2)" },
  { label: "Sunset", bg: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { label: "Ocean", bg: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { label: "Mint", bg: "linear-gradient(135deg,#43e97b,#38f9d7)" },
];

const SLIDE_TYPES = [
  { type: "hero", icon: "🏆", label: "HERO" },
  { type: "feature-single", icon: "📱", label: "SINGLE" },
  { type: "feature-dual", icon: "📱📱", label: "DUAL" },
];

type SectionKey = "layout" | "bg" | "title" | "device";

function getHeadline(slide: SlideConfig): string {
  if (slide.type === "hero") return (slide.tagline ?? []).join("\n");
  if (slide.type === "feature-single" || slide.type === "feature-dual") return (slide.headline ?? []).join("\n");
  return "";
}

export function Inspector({ slideIndex, slideCount, slide, brandColor, onSlideChange, onBackgroundChange, onColorChange }: InspectorProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    layout: false, bg: true, title: true, device: true,
  });

  function toggleSection(key: SectionKey) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", cursor: "pointer",
    transition: "all 0.1s",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: "var(--r-xs)",
    padding: "7px 10px", fontSize: 12, color: "var(--text)",
    marginBottom: 6,
  };

  return (
    <div style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)", overflowY: "auto", overflowX: "hidden" }}>
      {/* Selected slide indicator */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", background: "var(--indigo)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {slideIndex + 1}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{SLIDE_TYPES.find((t) => t.type === slide.type)?.label ?? slide.type}</div>
          <div style={{ fontSize: 10, color: "var(--text-4)" }}>Editing slide {slideIndex + 1} of {slideCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 3, padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
        {["✓", "↺", "❐", "🔒"].map((icon, i) => (
          <button
            key={i}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: i === 0 ? "var(--indigo)" : "var(--surface-2)",
              color: i === 0 ? "#fff" : "var(--text-3)",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Layout Section */}
      <Section title="Layout" icon="☰" isOpen={openSections.layout} onToggle={() => toggleSection("layout")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {SLIDE_TYPES.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => onSlideChange({ type: type as SlideConfig["type"] } as Partial<SlideConfig>)}
              style={{
                aspectRatio: "9/19.5", background: slide.type === type ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                border: slide.type === type ? "1.5px solid var(--indigo)" : "1.5px solid transparent",
                borderRadius: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              }}
            >
              <span style={{ fontSize: 10 }}>{icon}</span>
              <span style={{ fontSize: 7, color: "var(--text-3)", fontWeight: 700 }}>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Background Section */}
      <Section title="Background" icon="🖼" isOpen={openSections.bg} onToggle={() => toggleSection("bg")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {BACKGROUNDS.map((b, i) => (
            <div
              key={i}
              onClick={() => onBackgroundChange(i)}
              style={{
                aspectRatio: "1", borderRadius: "var(--r-xs)", cursor: "pointer",
                background: b.bg || `linear-gradient(160deg, ${brandColor}33, ${brandColor}66, #0D0D18)`,
                border: "2px solid transparent",
                transition: "all 0.1s",
              }}
            />
          ))}
        </div>
      </Section>

      {/* Title Section */}
      <Section
        title="Title"
        icon="Tt"
        isOpen={openSections.title}
        onToggle={() => toggleSection("title")}
        aiButton
      >
        <span style={{ fontSize: 10, color: "var(--text-4)", marginBottom: 4, display: "block" }}>Headline</span>
        <textarea
          value={getHeadline(slide)}
          onChange={(e) => {
            const lines = e.target.value.split("\n");
            if (slide.type === "hero") {
              onSlideChange({ tagline: lines } as Partial<SlideConfig>);
            } else {
              onSlideChange({ headline: lines } as Partial<SlideConfig>);
            }
          }}
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
        <span style={{ fontSize: 10, color: "var(--text-4)", marginBottom: 4, display: "block" }}>Font</span>
        <select style={{ ...inputStyle, appearance: "none" }}>
          <option>SF Pro Display</option>
          <option>Inter</option>
          <option>Poppins</option>
          <option>Montserrat</option>
          <option>Space Grotesk</option>
        </select>
        <span style={{ fontSize: 10, color: "var(--text-4)", marginBottom: 4, display: "block", marginTop: 4 }}>Accent Color</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => onColorChange(c)}
              style={{
                width: 20, height: 20, borderRadius: 5, background: c, cursor: "pointer",
                border: c === brandColor ? "2px solid #fff" : "2px solid transparent",
              }}
            />
          ))}
        </div>
      </Section>

      {/* Device Section */}
      <Section title="Device" icon="📱" isOpen={openSections.device} onToggle={() => toggleSection("device")}>
        <span style={{ fontSize: 10, color: "var(--text-4)", marginBottom: 4, display: "block" }}>Rotation</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <input
            type="range" min={-20} max={20}
            value={slide.type === "feature-single" ? (slide.angle ?? 0) : 0}
            onChange={(e) => onSlideChange({ angle: Number(e.target.value) } as Partial<SlideConfig>)}
            style={{ flex: 1, accentColor: "var(--indigo)" }}
          />
          <span style={{ fontSize: 9, color: "var(--text-4)", minWidth: 26, textAlign: "right", fontFamily: "monospace" }}>
            {slide.type === "feature-single" ? (slide.angle ?? 0) : 0}°
          </span>
        </div>
      </Section>
    </div>
  );
}

// ─── Reusable Accordion Section ─────────────────

function Section({ title, icon, isOpen, onToggle, aiButton, children }: {
  title: string; icon: string; isOpen: boolean; onToggle: () => void;
  aiButton?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer" }}>
        <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{title}</span>
        {aiButton && (
          <span style={{ fontSize: 9, padding: "2px 6px", background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 4, color: "#818cf8", fontWeight: 600, cursor: "pointer" }}>
            ✦ AI
          </span>
        )}
        <span style={{ fontSize: 10, color: "var(--text-4)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
      </div>
      {isOpen && <div style={{ padding: "0 14px 12px" }}>{children}</div>}
    </div>
  );
}
