"use client";

/**
 * CREATE PAGE — Canonical entry experience (FROZEN after this pass)
 *
 * Centered landing-style. Ghost progressive disclosure.
 * All fields visible from start, muted until activated.
 * Micro-preview glow responds to brand color.
 * No page scroll on standard laptop height.
 *
 * CTA: "Generate screenshots →"
 * Rationale: clearest outcome, avoids jargon ("variations"), matches product promise.
 */

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { NavBar } from "@/components/shared/nav-bar";
import { useLumo } from "@/themes/theme-context";
import { brandGlow } from "@/themes/theme-system";

const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

// Standardized motion
const EASE = "var(--ease)";
const EASE_OUT = "var(--ease-out)";
const T_FAST = "0.15s";
const T_NORMAL = "0.25s";
const T_SLOW = "0.5s";

export default function CreatePage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const t = useLumo();

  // Derived state
  const hasBrand = brand.trim().length > 0;
  const hasDesc = description.trim().length > 0;
  const hasFiles = files.length > 0;
  const canSubmit = hasBrand && hasFiles && !isSubmitting;

  // Progressive activation gates
  const descActive = hasBrand;
  const uploadActive = hasBrand;
  const colorActive = hasFiles || hasDesc;

  // Completion states (for micro-feedback)
  const nameComplete = hasBrand;
  const descComplete = hasDesc;
  const filesComplete = hasFiles;
  const colorComplete = true; // always has a default

  const fileUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nf = Array.from(e.target.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
    e.target.value = "";
  }, [files.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!uploadActive) return;
    const nf = Array.from(e.dataTransfer.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
  }, [files.length, uploadActive]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    const sessionId = nanoid();
    const fd = new FormData();
    fd.append("sessionId", sessionId);
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok) { setError(result.filename ? `${result.error}: ${result.filename}` : (result.detail ?? result.error ?? "Upload failed")); setIsSubmitting(false); return; }
      localStorage.setItem("shotforge-pending", JSON.stringify({ sessionId, brand: brand.trim(), description: description.trim(), brandColor, filenames: result.filenames as string[] }));
      router.push(`/generate/${sessionId}`);
    } catch { setError("Upload failed. Please try again."); setIsSubmitting(false); }
  }

  // Shared ghost section style
  function ghostStyle(active: boolean): React.CSSProperties {
    return {
      opacity: active ? 1 : 0.25,
      pointerEvents: active ? "auto" : "none",
      transition: `opacity ${T_NORMAL} ${EASE}`,
    };
  }

  return (
    <>
      <NavBar currentStep="create" />

      <main style={{
        height: "100vh", paddingTop: 48,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
      }}>
        {/* Ambient glow — responds to brand color + theme */}
        <div style={{
          position: "absolute",
          width: 500, height: 500,
          borderRadius: "50%",
          background: brandColor, filter: `blur(${t.glowBlur}px)`,
          opacity: hasFiles ? t.glowOpacity * 1.5 : hasBrand ? t.glowOpacity * 0.6 : t.glowOpacity * 0.2,
          transition: `all 1s ${EASE}`, pointerEvents: "none",
          top: "25%", left: "50%", transform: "translateX(-50%)",
        }} />


        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 12px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: "var(--r-pill)",
          fontSize: 11, fontWeight: 600, color: "var(--indigo)",
          marginBottom: 14,
          animation: `fade-up ${T_SLOW} ${EASE} both`,
        }}>
          <span style={{ animation: "breathe 2s ease infinite" }}>✦</span> AI-Powered
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 900,
          textAlign: "center", letterSpacing: -1.5, lineHeight: 1.05,
          marginBottom: 8,
          animation: `fade-up ${T_SLOW} ${EASE} 0.06s both`,
        }}>
          App Store screenshots
          <br />
          <span style={{
            background: "linear-gradient(135deg, var(--indigo), var(--purple), var(--pink))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>in one click</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, color: "var(--text-2)",
          textAlign: "center", maxWidth: 400, lineHeight: 1.5,
          marginBottom: 24,
          animation: `fade-up ${T_SLOW} ${EASE} 0.12s both`,
        }}>
          Drop your screens, pick a style. AI does the rest.
        </p>

        {/* Card — themed surface */}
        <div style={{
          maxWidth: 480, width: "100%",
          background: t.surface,
          backdropFilter: t.surfaceBlur > 0 ? `blur(${t.surfaceBlur}px)` : "none",
          WebkitBackdropFilter: t.surfaceBlur > 0 ? `blur(${t.surfaceBlur}px)` : "none",
          border: `1px solid ${canSubmit ? "rgba(99,102,241,0.12)" : t.surfaceBorder}`,
          borderRadius: t.cardRadius, padding: "20px 24px",
          boxShadow: `${t.shadowRest}, ${brandGlow(brandColor)}`,
          animation: `fade-up ${T_SLOW} ${EASE} 0.18s both`,
          transition: `border-color ${T_SLOW} ${EASE}, box-shadow 0.8s ${EASE}`,
        }}>

          {/* 1. App Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...lbl, color: nameComplete ? "var(--indigo)" : "var(--text-3)", transition: `color ${T_NORMAL} ${EASE}` }}>
              App Name {nameComplete && <span style={{ opacity: 0.5 }}>✓</span>}
            </label>
            <input
              value={brand} onChange={(e) => setBrand(e.target.value)}
              placeholder="Sensei" autoComplete="off"
              style={inp} onFocus={fIn} onBlur={fOut}
            />
          </div>

          {/* 2. Description */}
          <div style={{ marginBottom: 12, ...ghostStyle(descActive) }}>
            <label style={{ ...lbl, color: descComplete ? "var(--indigo)" : "var(--text-3)", transition: `color ${T_NORMAL} ${EASE}` }}>
              Description {descComplete && <span style={{ opacity: 0.5 }}>✓</span>}
              {!descComplete && <span style={{ fontWeight: 400, color: "var(--text-4)", textTransform: "none" as const, letterSpacing: 0 }}> · improves AI copy</span>}
            </label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Gamified learning for founders with daily challenges"
              rows={2} style={{ ...inp, resize: "none" as const, lineHeight: 1.5 }}
              onFocus={fIn} onBlur={fOut}
              tabIndex={descActive ? 0 : -1}
            />
          </div>

          {/* 3. Screenshots */}
          <div style={{ marginBottom: 12, ...ghostStyle(uploadActive) }}>
            <label style={{ ...lbl, color: filesComplete ? "var(--indigo)" : "var(--text-3)", transition: `color ${T_NORMAL} ${EASE}` }}>
              Screenshots {filesComplete && <span style={{ opacity: 0.5 }}>✓ {files.length}</span>}
            </label>
            {/* Uploaded thumbnails */}
            {files.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {files.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, aspectRatio: "9/19.5", borderRadius: 6, overflow: "hidden",
                    position: "relative", background: "var(--surface-2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    animation: `fade-up 0.3s ${EASE_OUT} both`,
                    animationDelay: `${i * 0.05}s`,
                  }}>
                    <img src={fileUrls[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute", top: 2, right: 2,
                        width: 14, height: 14, borderRadius: "50%",
                        background: "rgba(0,0,0,0.65)", color: "var(--red)",
                        fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: `opacity ${T_FAST}`,
                        backdropFilter: "blur(4px)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {/* Drop zone */}
            {files.length < 6 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => uploadActive && document.getElementById("sf-f")?.click()}
                style={{
                  border: `1.5px dashed ${dragOver ? "var(--indigo)" : "var(--border-input)"}`,
                  borderRadius: 10,
                  padding: files.length > 0 ? "8px 12px" : "14px 12px",
                  textAlign: "center",
                  cursor: uploadActive ? "pointer" : "default",
                  background: dragOver ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.01)",
                  transition: `all ${T_FAST} ${EASE}`,
                }}
                onMouseEnter={(e) => { if (uploadActive && !dragOver) { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.background = "rgba(99,102,241,0.02)"; } }}
                onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; } }}
              >
                <input id="sf-f" type="file" multiple accept="image/png,image/jpeg" style={{ display: "none" }} onChange={handleFileInput} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: files.length === 0 ? 1 : 0 }}>
                  {files.length === 0 ? "Drop screenshots here" : `Add more (${6 - files.length} left)`}
                </p>
                {files.length === 0 && <p style={{ fontSize: 10, color: "var(--text-3)" }}>PNG/JPG · up to 6</p>}
              </div>
            )}
          </div>

          {/* 4. Brand Color */}
          <div style={{ marginBottom: 14, ...ghostStyle(colorActive) }}>
            <label style={lbl}>Brand Color</label>
            <div style={{ display: "flex", gap: 6 }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => colorActive && setBrandColor(c)}
                  style={{
                    width: 26, height: 26, borderRadius: 7, background: c,
                    cursor: colorActive ? "pointer" : "default",
                    border: c === brandColor ? "2.5px solid #fff" : "2.5px solid transparent",
                    boxShadow: c === brandColor
                      ? `0 0 0 1px rgba(255,255,255,0.1), 0 0 12px ${c}30`
                      : "0 1px 4px rgba(0,0,0,0.2)",
                    transition: `all ${T_FAST} ${EASE}`,
                    transform: c === brandColor ? "scale(1.08)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => { if (colorActive && c !== brandColor) e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = c === brandColor ? "scale(1.08)" : "scale(1)"; }}
                />
              ))}
            </div>
          </div>

          {/* 5. CTA */}
          {error && <p style={{ color: "var(--red)", fontSize: 11, marginBottom: 6 }}>{error}</p>}
          <button
            onClick={handleSubmit} disabled={!canSubmit}
            style={{
              width: "100%", height: 44, borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: canSubmit ? "linear-gradient(135deg, var(--indigo), var(--purple))" : "var(--surface-2)",
              color: canSubmit ? "#fff" : "var(--text-4)",
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit
                ? "0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)"
                : "none",
              transition: `all ${T_NORMAL} ${EASE}`,
            }}
            onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.transform = `translateY(-${t.hoverLift}px)`; e.currentTarget.style.boxShadow = "0 2px 6px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.35)"; e.currentTarget.style.transition = `all ${t.durationNormal} ${t.easeSpring}`; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = canSubmit ? "0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)" : "none"; }}
            onMouseDown={(e) => { if (canSubmit) { e.currentTarget.style.transform = `scale(${t.pressScale})`; e.currentTarget.style.transition = `all 0.1s ${EASE}`; } }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.transition = `all ${t.durationNormal} ${t.easeSpring}`; }}
          >
            {isSubmitting ? "Uploading..." : "Generate screenshots →"}
          </button>
          {/* Dynamic microcopy — context-aware */}
          <p style={{ fontSize: 10, color: canSubmit ? "var(--indigo)" : "var(--text-4)", textAlign: "center", marginTop: 6, transition: `all ${T_NORMAL} ${EASE}`, opacity: 0.8 }}>
            {canSubmit
              ? "Ready to generate"
              : !hasBrand
                ? "Type your app name to start"
                : !hasFiles
                  ? "Add screenshots to continue"
                  : ""}
          </p>
        </div>
      </main>
    </>
  );
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)",
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", color: "var(--text)",
  border: "1px solid var(--border-input)", borderRadius: 9,
  padding: "9px 13px", fontSize: 13, fontFamily: "inherit",
  transition: "border-color 0.15s var(--ease), box-shadow 0.15s var(--ease)",
};
function fIn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.08)";
}
function fOut(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "";
  e.currentTarget.style.boxShadow = "none";
}
