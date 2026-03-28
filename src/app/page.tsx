"use client";

/**
 * CREATE — Lumo canonical entry experience
 *
 * Centered landing. Ghost progressive disclosure.
 * Glass Precision visual system + controlled glow.
 * No page scroll. CTA always visible.
 *
 * FROZEN after Phase 1 polish pass.
 */

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { NavBar } from "@/components/shared/nav-bar";
import { useLumo } from "@/themes/theme-context";
import { brandGlow } from "@/themes/theme-system";

const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

export default function CreatePage() {
  const router = useRouter();
  const t = useLumo();
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Derived
  const hasBrand = brand.trim().length > 0;
  const hasDesc = description.trim().length > 0;
  const hasFiles = files.length > 0;
  const canSubmit = hasBrand && hasFiles && !isSubmitting;

  // Progressive gates
  const descActive = hasBrand;
  const uploadActive = hasBrand;
  const colorActive = hasFiles || hasDesc;

  const fileUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nf = Array.from(e.target.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
    e.target.value = "";
  }, [files.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (!uploadActive) return;
    const nf = Array.from(e.dataTransfer.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
  }, [files.length, uploadActive]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true); setError(null);
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

  function ghost(active: boolean): React.CSSProperties {
    return { opacity: active ? 1 : 0.25, pointerEvents: active ? "auto" : "none", transition: `opacity ${t.durationNormal} ${t.easeDefault}` };
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
        {/* Ambient glow */}
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: brandColor, filter: `blur(${t.glowBlur}px)`,
          opacity: hasFiles ? t.glowOpacity * 1.5 : hasBrand ? t.glowOpacity * 0.6 : t.glowOpacity * 0.15,
          transition: `all 1s ${t.easeDefault}`, pointerEvents: "none",
          top: "25%", left: "50%", transform: "translateX(-50%)",
        }} />

        {/* Badge — Lumo brand mark */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px",
          background: "rgba(99,102,241,0.05)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(99,102,241,0.08)",
          borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#6366f1",
          marginBottom: 12, opacity: 0.85,
          animation: `fade-up ${t.durationSlow} ${t.easeDefault} both`,
        }}>
          <span style={{ animation: "breathe 2s ease infinite" }}>✦</span> Lumo
        </div>

        {/* Title — Lumo brand voice */}
        <h1 style={{
          fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: t.headlineWeight,
          textAlign: "center", letterSpacing: t.headlineTracking, lineHeight: 1.05,
          marginBottom: 8,
          animation: `fade-up ${t.durationSlow} ${t.easeDefault} 0.06s both`,
        }}>
          Make it look
          <br />
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>right.</span>
        </h1>

        {/* Subtitle — Lumo tone: direct, confident, minimal */}
        <p style={{
          fontSize: 14, color: "#a1a1aa",
          textAlign: "center", maxWidth: 360, lineHeight: 1.5,
          marginBottom: 24,
          animation: `fade-up ${t.durationSlow} ${t.easeDefault} 0.12s both`,
        }}>
          App Store screenshots that convert.
        </p>

        {/* Card — Glass Precision surface */}
        <div style={{
          maxWidth: 480, width: "100%",
          background: t.surface,
          backdropFilter: `blur(${t.surfaceBlur}px)`,
          WebkitBackdropFilter: `blur(${t.surfaceBlur}px)`,
          border: `1px solid ${canSubmit ? "rgba(99,102,241,0.12)" : t.surfaceBorder}`,
          borderRadius: t.cardRadius, padding: "20px 24px",
          boxShadow: `${t.shadowRest}, ${brandGlow(brandColor)}`,
          animation: `fade-up ${t.durationSlow} ${t.easeDefault} 0.18s both`,
          transition: `border-color ${t.durationSlow} ${t.easeDefault}, box-shadow 0.8s ${t.easeDefault}`,
        }}>

          {/* 1. App Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...LBL, color: hasBrand ? "#6366f1" : "#52525b", transition: `color ${t.durationNormal} ${t.easeDefault}` }}>
              App Name {hasBrand && <span style={{ opacity: 0.5 }}>✓</span>}
            </label>
            <input
              value={brand} onChange={(e) => setBrand(e.target.value)}
              placeholder="Sensei" autoComplete="off"
              style={INP} onFocus={focusIn} onBlur={focusOut}
            />
          </div>

          {/* 2. Description */}
          <div style={{ marginBottom: 12, ...ghost(descActive) }}>
            <label style={{ ...LBL, color: hasDesc ? "#6366f1" : "#52525b", transition: `color ${t.durationNormal} ${t.easeDefault}` }}>
              Description {hasDesc && <span style={{ opacity: 0.5 }}>✓</span>}
              {!hasDesc && <span style={{ fontWeight: 400, color: "#71717a", textTransform: "none" as const, letterSpacing: 0 }}> · better results</span>}
            </label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Gamified learning for founders with daily challenges"
              rows={2} style={{ ...INP, resize: "none" as const, lineHeight: 1.5 }}
              onFocus={focusIn} onBlur={focusOut}
              tabIndex={descActive ? 0 : -1}
            />
          </div>

          {/* 3. Screenshots */}
          <div style={{ marginBottom: 12, ...ghost(uploadActive) }}>
            <label style={{ ...LBL, color: hasFiles ? "#6366f1" : "#52525b", transition: `color ${t.durationNormal} ${t.easeDefault}` }}>
              Screenshots {hasFiles && <span style={{ opacity: 0.5 }}>✓ {files.length}</span>}
            </label>
            {files.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {files.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, aspectRatio: "9/19.5", borderRadius: 6, overflow: "hidden",
                    position: "relative", background: "#1c1c1e",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: t.shadowRest,
                    animation: `fade-up 0.3s ${t.easeOut} both`,
                    animationDelay: `${i * 0.05}s`,
                  }}>
                    <img src={fileUrls[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: "50%",
                        background: "rgba(0,0,0,0.65)", color: "#ef4444", fontSize: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: `opacity ${t.durationFast}`, backdropFilter: "blur(4px)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {/* Drop zone — premium interactive surface */}
            {files.length < 6 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => uploadActive && document.getElementById("sf-f")?.click()}
                style={{
                  border: `1px solid ${dragOver ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12,
                  padding: files.length > 0 ? "8px 12px" : "14px 12px",
                  textAlign: "center",
                  cursor: uploadActive ? "pointer" : "default",
                  background: dragOver ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(4px)",
                  boxShadow: dragOver ? "inset 0 0 20px rgba(99,102,241,0.04)" : t.surfaceInnerHighlight,
                  transition: `all ${t.durationNormal} ${t.easeDefault}`,
                }}
                onMouseEnter={(e) => { if (uploadActive && !dragOver) { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
                onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
              >
                <input id="sf-f" type="file" multiple accept="image/png,image/jpeg" style={{ display: "none" }} onChange={handleFileInput} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "#fafafa", marginBottom: files.length === 0 ? 1 : 0 }}>
                  {files.length === 0 ? "Drop screenshots here" : `Add more (${6 - files.length} left)`}
                </p>
                {files.length === 0 && <p style={{ fontSize: 10, color: "#52525b" }}>PNG/JPG · up to 6</p>}
              </div>
            )}
          </div>

          {/* 4. Brand Color */}
          <div style={{ marginBottom: 14, ...ghost(colorActive) }}>
            <label style={LBL}>Brand Color</label>
            <div style={{ display: "flex", gap: 6 }}>
              {COLORS.map((c) => (
                <div key={c} onClick={() => colorActive && setBrandColor(c)} style={{
                  width: 26, height: 26, borderRadius: 7, background: c,
                  cursor: colorActive ? "pointer" : "default",
                  border: c === brandColor ? "2.5px solid #fff" : "2.5px solid transparent",
                  boxShadow: c === brandColor ? `0 0 0 1px rgba(255,255,255,0.1), 0 0 12px ${c}30` : "0 1px 4px rgba(0,0,0,0.2)",
                  transition: `all ${t.durationFast} ${t.easeDefault}`,
                  transform: c === brandColor ? "scale(1.08)" : "scale(1)",
                }}
                  onMouseEnter={(e) => { if (colorActive && c !== brandColor) e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = c === brandColor ? "scale(1.08)" : "scale(1)"; }}
                />
              ))}
            </div>
          </div>

          {/* 5. CTA */}
          {error && <p style={{ color: "#ef4444", fontSize: 11, marginBottom: 6 }}>{error}</p>}
          <button
            onClick={handleSubmit} disabled={!canSubmit}
            style={{
              width: "100%", height: 44, borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: canSubmit
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
              color: canSubmit ? "#fff" : "#52525b",
              cursor: canSubmit ? "pointer" : "not-allowed",
              border: canSubmit ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.06)",
              boxShadow: canSubmit
                ? `0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)`
                : "none",
              transition: `all ${t.durationNormal} ${t.easeDefault}`,
            }}
            onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.transform = `translateY(-${t.hoverLift}px)`; e.currentTarget.style.boxShadow = "0 2px 6px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.35)"; e.currentTarget.style.transition = `all ${t.durationNormal} ${t.easeSpring}`; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = canSubmit ? "0 2px 6px rgba(99,102,241,0.15), 0 6px 24px rgba(99,102,241,0.25)" : "none"; }}
            onMouseDown={(e) => { if (canSubmit) { e.currentTarget.style.transform = `scale(${t.pressScale})`; e.currentTarget.style.transition = `all 0.1s ${t.easeDefault}`; } }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.transition = `all ${t.durationNormal} ${t.easeSpring}`; }}
          >
            {isSubmitting ? "Uploading..." : "Generate screenshots →"}
          </button>

          {/* Microcopy — Lumo voice */}
          <p style={{
            fontSize: 10, textAlign: "center", marginTop: 6,
            color: canSubmit ? "#6366f1" : "#52525b",
            transition: `all ${t.durationNormal} ${t.easeDefault}`, opacity: 0.8,
          }}>
            {canSubmit ? "Ready." : !hasBrand ? "Name your app to start" : !hasFiles ? "Add screenshots to continue" : ""}
          </p>
        </div>
      </main>
    </>
  );
}

// Shared styles — hardcoded for Tailwind cascade safety
const LBL: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "#52525b",
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
};

const INP: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)", color: "#fafafa",
  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9,
  padding: "9px 13px", fontSize: 13, fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.06), inset 0 1px 2px rgba(0,0,0,0.1)";
}

function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
  e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.1)";
}
