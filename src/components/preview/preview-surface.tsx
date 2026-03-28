"use client";

import { useState, useCallback } from "react";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { Variant, VariantId } from "@/domain/types";
import { SlideCard } from "@/components/choose/slide-card";
import { InlineEditor } from "./inline-editor";


interface PreviewSurfaceProps {
  variants: Record<VariantId, Variant>;
  brandColor: string;
  activeVariantId: VariantId;
  activeVariant: Variant;
  previewCache: Record<number, string>;
  previewLoading: Record<number, boolean>;
  isExporting: boolean;
  onVariantChange: (id: VariantId) => void;
  onSlideChange: (slideIndex: number, patch: Partial<SlideConfig>) => void;
  onColorChange: (color: string) => void;
  onExport: () => void;
  onSelect: (id: VariantId) => void;
}

const VARIANT_ORDER: VariantId[] = ["midnight", "clean", "vivid"];
const V: Record<VariantId, { label: string; headline: string; desc: string; why: string; traits: string[] }> = {
  midnight: { label: "Dark", headline: "Midnight", desc: "Cinematic depth that makes your app feel premium.", why: "Dark interfaces signal quality. Used by Linear, Arc, and top developer tools.", traits: ["Deep gradients with purple undertones", "High-contrast white typography", "Brand glow for cinematic depth"] },
  clean: { label: "Light", headline: "Clean", desc: "Apple-editorial clarity. Minimal and universally appealing.", why: "Light minimal designs are the standard for utility and productivity apps.", traits: ["Soft off-white backgrounds", "Precise dark typography", "Frameless, content-forward devices"] },
  vivid: { label: "Bold", headline: "Vivid", desc: "Your brand color takes center stage. Energetic and memorable.", why: "Brand-forward screenshots increase recognition in search results.", traits: ["Brand-saturated gradient backgrounds", "Dynamic device angles", "Strong glow for visual energy"] },
};

const CTA_H = 52;
const NAV_H = 36;
const EDITOR_W = 264;

export function PreviewSurface({
  variants, brandColor, activeVariantId, activeVariant,
  previewCache, previewLoading, isExporting,
  onVariantChange, onSlideChange, onColorChange, onExport, onSelect,
}: PreviewSurfaceProps) {
  const [editing, setEditing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [btnPressed, setBtnPressed] = useState(false);

  const c = V[activeVariantId];
  const slide = activeVariant.slides[activeSlide] ?? null;
  const heroIdx = editing ? activeSlide : 0;
  const dimming = hovered !== null && !editing;

  const clickCard = useCallback((idx: number) => {
    setActiveSlide(idx);
    if (!editing) setEditing(true);
  }, [editing]);

  return (
    <>
      {/* ═══ NAV ROW ═══════════════════════════════════ */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: NAV_H, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", letterSpacing: 0.3 }}>
            ✦ Your screenshots
          </span>
        </div>

        {/* Tabs — sliding pill indicator */}
        <div style={{
          display: "flex", gap: 2,
          background: "var(--surface)", borderRadius: 10,
          padding: 3,
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)",
        }}>
          {VARIANT_ORDER.map((id) => {
            const isActive = id === activeVariantId;
            return (
              <button
                key={id}
                onClick={() => { onVariantChange(id); setActiveSlide(0); }}
                style={{
                  padding: "5px 18px", borderRadius: 7, fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? "var(--surface-3)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-4)",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.28s var(--ease-out)",
                  letterSpacing: isActive ? -0.1 : 0,
                }}
              >{V[id].label}</button>
            );
          })}
        </div>

        {/* Action button with hover+pressed states */}
        <button
          onClick={() => editing ? setEditing(false) : setEditing(true)}
          style={{
            height: 28, padding: "0 14px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            background: "var(--surface-2)", color: "var(--text-3)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s var(--ease)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-3)"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
        >{editing ? "Done" : "✎ Customize"}</button>
      </div>

      {/* ═══ MAIN ══════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Content area */}
        <div style={{
          flex: 1, display: "flex", gap: editing ? 22 : 28,
          padding: "8px 48px 0", overflow: "hidden",
          transition: "gap 0.35s var(--ease-out)",
        }}>

          {/* ─── HERO ──────────────────────────────────── */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <div
              style={{
                height: `calc(100vh - 48px - ${NAV_H}px - ${CTA_H}px - 40px)`,
                maxHeight: 520,
                aspectRatio: "1290 / 2796",
                borderRadius: 22, overflow: "hidden",
                cursor: editing ? "default" : "pointer",
                transition: "all 0.4s var(--ease-out)",
                // Layered shadow system
                boxShadow: (() => {
                  if (editing) return `0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.2), 0 20px 48px rgba(0,0,0,0.3), 0 0 0 2px var(--indigo)`;
                  if (hovered === heroIdx) return `0 2px 4px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.3), 0 28px 70px rgba(0,0,0,0.4), 0 0 48px ${brandColor}12`;
                  if (dimming && hovered !== heroIdx) return `0 2px 4px rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.15)`;
                  return `0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.15), 0 20px 56px rgba(0,0,0,0.35)`;
                })(),
                transform: (() => {
                  if (hovered === heroIdx && !editing) return "scale(1.015)";
                  if (dimming && hovered !== heroIdx) return "scale(0.985)";
                  return "";
                })(),
                opacity: dimming && hovered !== heroIdx ? 0.5 : 1,
                filter: dimming && hovered !== heroIdx ? "brightness(0.9)" : "",
              }}
              onClick={() => !editing && clickCard(0)}
              onMouseEnter={() => !editing && setHovered(0)}
              onMouseLeave={() => setHovered(null)}
            >
              <SlideCard previewSrc={previewCache[heroIdx] ?? null} isLoading={previewLoading[heroIdx] ?? false} />
            </div>
          </div>

          {/* ─── RIGHT COLUMN ──────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", justifyContent: "center", gap: 14 }}>

            {/* Editorial — smooth collapse */}
            <div style={{
              flexShrink: 0, overflow: "hidden",
              display: "grid",
              gridTemplateRows: editing ? "0fr" : "1fr",
              transition: "grid-template-rows 0.4s var(--ease-out), opacity 0.3s var(--ease)",
              opacity: editing ? 0 : 1,
            }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: editing ? 0 : 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.8, marginBottom: 4, lineHeight: 1.1 }}>{c.headline}</h2>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8 }}>{c.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {c.traits.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <span style={{ color: "var(--indigo)", fontSize: 5, marginTop: 6, flexShrink: 0, opacity: 0.7 }}>●</span>
                          <span style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: 180, padding: "8px 0 8px 14px", borderLeft: "1.5px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, opacity: 0.7 }}>Why this works</p>
                    <p style={{ fontSize: 10, color: "var(--text-4)", lineHeight: 1.5 }}>{c.why}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit mode label — appears when editorial collapses */}
            {editing && (
              <div style={{
                flexShrink: 0,
                display: "flex", alignItems: "baseline", gap: 8,
                opacity: 0.5,
                animation: "fade-up 0.3s var(--ease) both",
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.3 }}>{c.headline}</span>
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>{c.desc}</span>
              </div>
            )}

            {/* ─── SCREENSHOT STRIP ────────────────────── */}
            {activeVariant.slides.length > 1 && (
              <div style={{ position: "relative", overflow: "hidden", flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
                <div style={{
                  position: "absolute", right: 0, top: 0, bottom: 0, width: 56, zIndex: 5,
                  background: "linear-gradient(to left, var(--bg) 20%, transparent)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  display: "flex", gap: 10, height: "100%",
                  overflowX: "auto", overflowY: "hidden", paddingRight: 56,
                  scrollSnapType: "x proximity", alignItems: "center",
                  scrollBehavior: "smooth",
                }}>
                  {activeVariant.slides.map((_, si) => {
                    if (si === heroIdx) return null;
                    const isHov = hovered === si;
                    const isDim = dimming && !isHov;

                    return (
                      <div key={si} style={{
                        flexShrink: 0,
                        height: "min(100%, 300px)",
                        aspectRatio: "1290 / 2796",
                        scrollSnapAlign: "start",
                        borderRadius: 14, overflow: "hidden", cursor: "pointer",
                        // Layered shadow
                        boxShadow: isHov
                          ? `0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.2), 0 16px 44px rgba(0,0,0,0.35), 0 0 28px ${brandColor}08`
                          : isDim
                            ? "0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.1)"
                            : "0 2px 4px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.2)",
                        transition: "all 0.32s var(--ease-out)",
                        transform: isHov ? "translateY(-4px) scale(1.025)" : isDim ? "scale(0.975)" : "",
                        opacity: isDim ? 0.45 : isHov ? 1 : 0.85,
                        filter: isDim ? "brightness(0.85)" : "",
                      }}
                        onClick={() => clickCard(si)}
                        onMouseEnter={() => !editing && setHovered(si)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <SlideCard previewSrc={previewCache[si] ?? null} isLoading={previewLoading[si] ?? false} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR ─────────────────────────────────── */}
        <div style={{
          width: editing ? EDITOR_W : 0,
          flexShrink: 0,
          borderLeft: editing ? "1px solid rgba(255,255,255,0.04)" : "none",
          background: editing ? "var(--surface)" : "transparent",
          boxShadow: editing ? "-4px 0 20px rgba(0,0,0,0.15)" : "none",
          overflow: editing ? "auto" : "hidden",
          opacity: editing ? 1 : 0,
          transition: "width 0.38s var(--ease-out), opacity 0.28s var(--ease), box-shadow 0.3s var(--ease)",
          padding: editing ? "14px 16px" : "0",
        }}>
          {editing && slide && (
            <InlineEditor
              slideIndex={activeSlide}
              slide={slide}
              brandColor={brandColor}
              onSlideChange={(patch) => onSlideChange(activeSlide, patch)}
              onColorChange={onColorChange}
            />
          )}
        </div>
      </div>

      {/* ═══ CTA BAR ═══════════════════════════════════ */}
      <div style={{
        flexShrink: 0, height: CTA_H,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, padding: "0 48px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(9,9,11,0.85)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
      }}>
        <span style={{ fontSize: 11, color: "var(--text-4)", letterSpacing: 0.2 }}>
          {activeVariant.slides.length} slides · 4 sizes
        </span>
        {editing ? (
          <button
            onClick={onExport}
            disabled={isExporting}
            style={{
              height: 38, padding: "0 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: isExporting ? "var(--surface-2)" : "var(--green)",
              color: isExporting ? "var(--text-3)" : "#000",
              boxShadow: isExporting ? "none" : "0 2px 6px rgba(34,197,94,0.15), 0 6px 20px rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.22s var(--ease)",
            }}
            onMouseEnter={(e) => { if (!isExporting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(34,197,94,0.2), 0 8px 28px rgba(34,197,94,0.3)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = isExporting ? "none" : "0 2px 6px rgba(34,197,94,0.15), 0 6px 20px rgba(34,197,94,0.2)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
          >{isExporting ? "Exporting..." : "⬇ Export ZIP"}</button>
        ) : (
          <button
            onClick={() => onSelect(activeVariantId)}
            style={{
              height: 38, padding: "0 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg, var(--indigo), var(--purple))",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.22s var(--ease)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          >Use {c.headline} →</button>
        )}
      </div>
    </>
  );
}
