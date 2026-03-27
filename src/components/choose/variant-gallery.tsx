"use client";

import { useState, useCallback } from "react";
import type { Variant, VariantId } from "@/domain/types";
import { SlideCard } from "./slide-card";

interface VariantGalleryProps {
  variants: Record<VariantId, Variant>;
  brandColor: string;
  selectedVariantId: VariantId | null;
  previewCache: Record<number, string>;
  previewLoading: Record<number, boolean>;
  onSelect: (id: VariantId) => void;
  onRefine: (id: VariantId) => void;
  onSlideClick: (variantId: VariantId, slideIndex: number) => void;
}

const VARIANT_ORDER: VariantId[] = ["midnight", "clean", "vivid"];

const V: Record<VariantId, {
  label: string; headline: string; desc: string; why: string; traits: string[];
}> = {
  midnight: {
    label: "Dark", headline: "Midnight",
    desc: "Cinematic depth that makes your app feel premium.",
    why: "Dark interfaces signal quality. Used by Linear, Arc, and most top-grossing developer tools.",
    traits: ["Deep gradients with purple undertones", "High-contrast white typography", "Brand glow for cinematic depth"],
  },
  clean: {
    label: "Light", headline: "Clean",
    desc: "Apple-editorial clarity. Minimal and universally appealing.",
    why: "Light minimal designs are the standard for utility and productivity. Trusted by default.",
    traits: ["Soft off-white backgrounds", "Precise dark typography", "Frameless, content-forward devices"],
  },
  vivid: {
    label: "Bold", headline: "Vivid",
    desc: "Your brand color takes center stage. Energetic and memorable.",
    why: "Brand-forward screenshots increase recognition in search results. Ideal for consumer apps.",
    traits: ["Brand-saturated gradient backgrounds", "Dynamic device angles", "Strong glow for visual energy"],
  },
};

// CTA bar height so we can reserve space
const CTA_H = 52;
const NAV_H = 36;
const AR = 1290 / 2796;

export function VariantGallery({
  variants, brandColor, previewCache, previewLoading,
  onSelect, onRefine, onSlideClick,
}: VariantGalleryProps) {
  const [activeId, setActiveId] = useState<VariantId>("midnight");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const activeVariant = variants[activeId];
  const c = V[activeId];

  // Hero height: fill viewport minus nav + CTA + breathing
  // calc(100vh - navbar48 - navRow - ctaBar - padding)
  const heroMaxH = `calc(100vh - 48px - ${NAV_H}px - ${CTA_H}px - 40px)`;

  const dimOthers = hoveredCard !== null;

  const cardInteraction = useCallback((index: number) => ({
    onMouseEnter: () => setHoveredCard(index),
    onMouseLeave: () => setHoveredCard(null),
    onClick: () => onSlideClick(activeId, index),
  }), [activeId, onSlideClick]);

  return (
    <>
      {/* ─── Nav row ─────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: NAV_H, flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-4)" }}>✦ Your screenshots</span>
        <div style={{ display: "flex", gap: 3, background: "var(--surface)", borderRadius: 9, padding: 3, border: "1px solid var(--border-subtle)" }}>
          {VARIANT_ORDER.map((id) => (
            <button key={id} onClick={() => setActiveId(id)} style={{
              padding: "4px 16px", borderRadius: 6, fontSize: 11,
              fontWeight: id === activeId ? 700 : 500,
              background: id === activeId ? "var(--surface-3)" : "transparent",
              color: id === activeId ? "var(--text)" : "var(--text-4)",
              transition: "all 0.15s var(--ease)",
            }}>{V[id].label}</button>
          ))}
        </div>
        <button onClick={() => onRefine(activeId)} style={{
          height: 26, padding: "0 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)",
        }}>✎ Customize</button>
      </div>

      {/* ─── Main composition ────────────────────────── */}
      <div
        key={activeId}
        style={{
          flex: 1, display: "flex", gap: 28,
          padding: "8px 48px 0",
          overflow: "hidden",
          animation: "fade-up 0.3s var(--ease) both",
        }}
      >
        {/* ─── LEFT: Hero (isolated, fits fully) ─────── */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <div
            style={{
              height: heroMaxH,
              maxHeight: 520,
              aspectRatio: `${1290} / ${2796}`,
              borderRadius: 20, overflow: "hidden",
              boxShadow: hoveredCard === 0
                ? `0 28px 80px rgba(0,0,0,0.6), 0 0 40px ${brandColor}15`
                : "0 20px 60px rgba(0,0,0,0.45)",
              cursor: "pointer",
              transition: "all 0.35s var(--ease-out)",
              transform: hoveredCard === 0 ? "scale(1.02)" : dimOthers && hoveredCard !== 0 ? "scale(0.98)" : "",
              opacity: dimOthers && hoveredCard !== 0 ? 0.55 : 1,
              filter: dimOthers && hoveredCard !== 0 ? "brightness(0.85)" : "",
            }}
            {...cardInteraction(0)}
          >
            <SlideCard previewSrc={previewCache[0] ?? null} isLoading={previewLoading[0] ?? false} />
          </div>
        </div>

        {/* ─── RIGHT column ──────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", justifyContent: "center", gap: 14 }}>

          {/* Editorial: 2-col (main + why) */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.8, marginBottom: 4, lineHeight: 1.1 }}>{c.headline}</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8 }}>{c.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {c.traits.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "var(--indigo)", fontSize: 6, marginTop: 5, flexShrink: 0 }}>●</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.35 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, width: 180, padding: "8px 0 8px 14px", borderLeft: "1.5px solid var(--surface-3)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Why this works</p>
              <p style={{ fontSize: 10, color: "var(--text-4)", lineHeight: 1.5 }}>{c.why}</p>
            </div>
          </div>

          {/* Feature strip — larger cards, fills remaining */}
          {activeVariant.slides.length > 1 && (
            <div style={{ position: "relative", overflow: "hidden", flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: 48, zIndex: 5,
                background: "linear-gradient(to left, var(--bg), transparent)", pointerEvents: "none",
              }} />

              <div style={{
                display: "flex", gap: 10, height: "100%",
                overflowX: "auto", overflowY: "hidden",
                paddingRight: 48,
                scrollSnapType: "x proximity",
                alignItems: "center",
              }}>
                {activeVariant.slides.slice(1).map((_, si) => {
                  const idx = si + 1;
                  const isHovered = hoveredCard === idx;
                  const isDimmed = dimOthers && !isHovered;
                  return (
                    <div key={si} style={{
                      flexShrink: 0,
                      height: "min(100%, 300px)",
                      aspectRatio: `${1290} / ${2796}`,
                      scrollSnapAlign: "start",
                      borderRadius: 12, overflow: "hidden",
                      boxShadow: isHovered
                        ? `0 14px 44px rgba(0,0,0,0.45), 0 0 24px ${brandColor}10`
                        : "0 8px 24px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s var(--ease-out)",
                      transform: isHovered ? "translateY(-4px) scale(1.03)" : isDimmed ? "scale(0.97)" : "",
                      opacity: isDimmed ? 0.5 : isHovered ? 1 : 0.88,
                      filter: isDimmed ? "brightness(0.8)" : "",
                    }}
                      {...cardInteraction(idx)}
                    >
                      <SlideCard previewSrc={previewCache[idx] ?? null} isLoading={previewLoading[idx] ?? false} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CTA bar (reserved space, never clips hero) ── */}
      <div style={{
        flexShrink: 0, height: CTA_H,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, padding: "0 48px",
        borderTop: "1px solid var(--border-subtle)", background: "var(--bg)",
      }}>
        <span style={{ fontSize: 12, color: "var(--text-4)" }}>
          {activeVariant.slides.length} slides · 4 sizes
        </span>
        <button onClick={() => onSelect(activeId)} style={{
          height: 38, padding: "0 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: "linear-gradient(135deg, var(--indigo), var(--purple))", color: "#fff",
          boxShadow: "0 6px 24px rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s var(--ease)",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.3)"; }}
        >Use {c.headline} →</button>
      </div>
    </>
  );
}
