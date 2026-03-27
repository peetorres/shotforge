"use client";

/**
 * CREATE PAGE — Built from the frozen Preview surface.
 *
 * Structure: Preview shell + left sidebar for inputs.
 * Validation: removing the sidebar = exact Preview layout.
 */

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { NavBar } from "@/components/shared/nav-bar";
import { SlideCard } from "@/components/choose/slide-card";

// Same constants as PreviewSurface
const CTA_H = 52;
const NAV_H = 36;
const SIDEBAR_W = 360;
const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

export default function CreatePage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = brand.trim().length > 0 && files.length > 0 && !isSubmitting;
  const hasBrand = brand.trim().length > 0;
  const hasFiles = files.length > 0;
  const hasContent = hasBrand || hasFiles;

  const fileUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const handleFilesInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nf = Array.from(e.target.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
    e.target.value = "";
  }, [files.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nf = Array.from(e.dataTransfer.files).filter((f) => f.type === "image/png" || f.type === "image/jpeg").slice(0, 6 - files.length);
    setFiles((p) => [...p, ...nf].slice(0, 6));
  }, [files.length]);

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

  return (
    <>
      <NavBar currentStep="create" />

      <main style={{ height: "100vh", paddingTop: 48, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ═══ NAV ROW — copied from PreviewSurface ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 48px", height: NAV_H, flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", letterSpacing: 0.3 }}>
            ✦ New project
          </span>
          <span style={{ fontSize: 11, color: "var(--text-4)" }}>
            {hasFiles ? `${files.length} screenshot${files.length > 1 ? "s" : ""} ready` : ""}
          </span>
        </div>

        {/* ═══ MAIN — same flex as PreviewSurface ═══ */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ─── LEFT SIDEBAR (only addition vs Preview) ── */}
          <div style={{
            width: SIDEBAR_W, flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.04)",
            background: "var(--surface)",
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* App Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>App Name</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Sensei" autoComplete="off" style={inp}
                  onFocus={fIn} onBlur={fOut} />
              </div>
              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Description <span style={{ fontWeight: 400, color: "var(--text-4)", textTransform: "none" as const, letterSpacing: 0 }}>· optional</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Gamified learning for founders with daily challenges and AI paths" rows={2}
                  style={{ ...inp, resize: "none" as const, lineHeight: 1.5 }} onFocus={fIn} onBlur={fOut} />
              </div>
              {/* Screenshots */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Screenshots</label>
                {files.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {files.map((_, i) => (
                      <div key={i} style={{ flex: 1, aspectRatio: "9/19.5", borderRadius: 6, overflow: "hidden", position: "relative", background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <img src={fileUrls[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                          style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "var(--red)", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.1s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {files.length < 6 && (
                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => document.getElementById("sf-up")?.click()}
                    style={{ border: "1.5px dashed var(--border-input)", borderRadius: 9, padding: "14px 12px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.01)", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--indigo)"; e.currentTarget.style.background = "rgba(99,102,241,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; }}
                  >
                    <input id="sf-up" type="file" multiple accept="image/png,image/jpeg" style={{ display: "none" }} onChange={handleFilesInput} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{files.length === 0 ? "Drop screenshots here" : `Add more (${6 - files.length} left)`}</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)" }}>PNG/JPG · up to 6</p>
                  </div>
                )}
              </div>
              {/* Brand Color */}
              <div>
                <label style={lbl}>Brand Color</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {COLORS.map((c) => (
                    <div key={c} onClick={() => setBrandColor(c)} style={{
                      width: 26, height: 26, borderRadius: 7, background: c, cursor: "pointer",
                      border: c === brandColor ? "2px solid #fff" : "2px solid transparent",
                      boxShadow: c === brandColor ? "0 0 8px rgba(255,255,255,0.1)" : "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "all 0.15s var(--ease)",
                    }} />
                  ))}
                </div>
              </div>
            </div>
            {/* CTA */}
            <div style={{ flexShrink: 0, padding: "12px 24px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              {error && <p style={{ color: "var(--red)", fontSize: 11, marginBottom: 6 }}>{error}</p>}
              <button onClick={handleSubmit} disabled={!canSubmit} style={{
                width: "100%", height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: canSubmit ? "linear-gradient(135deg, var(--indigo), var(--purple))" : "var(--surface-2)",
                color: canSubmit ? "#fff" : "var(--text-4)",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 2px 8px rgba(99,102,241,0.2), 0 6px 24px rgba(99,102,241,0.25)" : "none",
                transition: "all 0.22s var(--ease)",
              }}
                onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                onMouseDown={(e) => { if (canSubmit) e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
              >{isSubmitting ? "Uploading..." : "Generate screenshots →"}</button>
            </div>
          </div>

          {/* ─── RIGHT: EXACT PREVIEW STAGE ──────────── */}
          <div style={{
            flex: 1, display: "flex", gap: 28,
            padding: "8px 48px 0", overflow: "hidden",
          }}>
            {/* HERO — exact same as PreviewSurface */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              <div style={{
                height: `calc(100vh - 48px - ${NAV_H}px - ${CTA_H}px - 40px)`,
                maxHeight: 520,
                aspectRatio: "1290 / 2796",
                borderRadius: 22, overflow: "hidden",
                transition: "all 0.4s var(--ease-out)",
                opacity: hasContent ? 1 : 0.45,
                transform: hasContent ? "scale(1)" : "scale(0.98)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.15), 0 20px 56px rgba(0,0,0,0.35)",
              }}>
                {/* CSS mockup matching Midnight variant */}
                <div style={{
                  width: "100%", height: "100%", position: "relative",
                  background: "linear-gradient(160deg, #0a0a14, #0f0e1a 35%, #151228 60%, #0a0a14)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "12% 10% 0", overflow: "hidden",
                }}>
                  {hasBrand && <div style={{ padding: "2px 8px", borderRadius: 50, border: `1px solid ${brandColor}50`, fontSize: 5, fontWeight: 700, color: brandColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: "3%" }}>NEW</div>}
                  <div style={{ textAlign: "center", marginBottom: "3%", zIndex: 2, fontSize: hasBrand ? 14 : 12, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.5, color: "var(--text)", transition: "all 0.35s var(--ease-out)" }}>
                    {hasBrand ? <>{brand},<br /><span style={{ color: brandColor }}> elevated</span></> : <span style={{ color: "var(--text-4)" }}>Your app, here</span>}
                  </div>
                  <div style={{ display: "flex", gap: 1.5, marginBottom: "3%", zIndex: 2, opacity: hasBrand ? 0.9 : 0.2, transition: "opacity 0.3s" }}>
                    {[0,1,2,3,4].map((i) => <span key={i} style={{ fontSize: 6, color: brandColor }}>★</span>)}
                  </div>
                  <div style={{ width: "55%", aspectRatio: "9/19.5", borderRadius: "8%", overflow: "hidden", zIndex: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.3)", border: "1.5px solid rgba(255,255,255,0.08)", background: "#0a0a0a", transition: "all 0.35s var(--ease-out)" }}>
                    {hasFiles ? (
                      <img src={fileUrls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#111113", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "30%", aspectRatio: "1", borderRadius: "16%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.03)" }} />
                      </div>
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: "-8%", left: "-15%", width: "130%", height: "50%", borderRadius: "50%", background: brandColor, filter: "blur(50px)", opacity: hasFiles ? 0.22 : 0.1, transition: "all 0.5s", zIndex: 1, pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — editorial + thumbnails (same as Preview) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", justifyContent: "center", gap: 14 }}>
              <div style={{ flexShrink: 0 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.8, marginBottom: 4, lineHeight: 1.1 }}>
                  {hasBrand ? brand : "Your app"}
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8 }}>
                  {hasFiles ? `${files.length} screenshot${files.length > 1 ? "s" : ""} · 3 variations will be generated` : "Add screenshots and details to preview your App Store screenshots"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {["AI-powered copy generation", "3 style variations: Dark, Light, Bold", "Export all App Store sizes"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--indigo)", fontSize: 5, marginTop: 6, flexShrink: 0, opacity: 0.7 }}>●</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thumbnail strip (same as Preview) */}
              {files.length > 1 && (
                <div style={{ position: "relative", overflow: "hidden", flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 56, zIndex: 5, background: "linear-gradient(to left, var(--bg) 20%, transparent)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", gap: 10, height: "100%", overflowX: "auto", overflowY: "hidden", paddingRight: 56, scrollSnapType: "x proximity", alignItems: "center" }}>
                    {fileUrls.slice(1).map((url, i) => (
                      <div key={i} style={{
                        flexShrink: 0, height: "min(100%, 260px)", aspectRatio: "1290/2796",
                        scrollSnapAlign: "start", borderRadius: 14, overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.2)",
                        opacity: 0.7, transition: "all 0.3s var(--ease-out)",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.transform = ""; }}
                      >
                        <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(160deg, #0a0a14, #0f0e1a 35%, #151228 60%, #0a0a14)", display: "flex", flexDirection: "column", alignItems: "center", padding: "14% 10% 0", overflow: "hidden" }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: "4%", zIndex: 2, opacity: 0.6 }}>Feature</div>
                          <div style={{ width: "55%", aspectRatio: "9/19.5", borderRadius: "8%", overflow: "hidden", zIndex: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                          </div>
                          <div style={{ position: "absolute", bottom: "-10%", left: "-15%", width: "130%", height: "50%", borderRadius: "50%", background: brandColor, filter: "blur(40px)", opacity: 0.12, zIndex: 1, pointerEvents: "none" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ CTA BAR — exact copy from PreviewSurface ═══ */}
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
            {hasFiles ? `${files.length} screenshots · 3 variations` : "Add screenshots to begin"}
          </span>
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
  border: "1px solid var(--border-input)", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
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
