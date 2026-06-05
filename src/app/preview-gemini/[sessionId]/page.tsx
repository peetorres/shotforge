"use client";

/**
 * Preview Gemini — Results page for Gemini-generated App Store screenshots
 *
 * Shows generated screenshots in a grid with individual download and
 * a master "Download All Sizes" ZIP button.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/shared/nav-bar";
import { useLumo } from "@/themes/theme-context";
import type { GeneratedImage } from "@/app/api/generate-gemini/route";

interface GeminiSession {
  sessionId: string;
  brand: string;
  images: GeneratedImage[];
}

export default function PreviewGeminiPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const t = useLumo();

  const [session, setSession] = useState<GeminiSession | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("shotforge-gemini-result");
    if (!raw) { router.replace("/"); return; }
    try {
      const data = JSON.parse(raw) as GeminiSession;
      if (data.sessionId !== sessionId) { router.replace("/"); return; }
      setSession(data);
    } catch {
      router.replace("/");
    }
  }, [sessionId, router]);

  const handleDownload = useCallback(async () => {
    if (!session) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/export-gemini?sessionId=${encodeURIComponent(session.sessionId)}`);
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${session.brand.toLowerCase().replace(/\s+/g, "-")}-screenshots.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <>
        <NavBar currentStep="generate" />
        <div style={{ minHeight: "100vh", paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar currentStep="generate" />

      <main style={{
        minHeight: "100vh",
        paddingTop: 64,
        paddingBottom: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 560, padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.12)",
            borderRadius: 100, fontSize: 11, fontWeight: 600, color: "#818cf8",
            marginBottom: 12,
          }}>
            <span>✦</span> {session.images.length} screenshot{session.images.length !== 1 ? "s" : ""} ready
          </div>

          <h1 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            marginBottom: 8,
          }}>
            {session.brand}
          </h1>
          <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.5 }}>
            AI-generated App Store screenshots · 3 sizes included in ZIP
          </p>
        </div>

        {/* Screenshot grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
          gap: 16,
          maxWidth: 900,
          width: "100%",
          padding: "0 24px",
          marginBottom: 32,
        }}>
          {session.images.map((img) => (
            <div
              key={img.index}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Screenshot preview — fixed aspect ratio 1290:2796 */}
              <div style={{ aspectRatio: "1290/2796", background: "#111", position: "relative", overflow: "hidden" }}>
                <img
                  src={`/api/screenshot?sessionId=${encodeURIComponent(session.sessionId)}&filename=${encodeURIComponent(img.filename)}`}
                  alt={`${img.benefit.verb} — ${img.benefit.desc}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Benefit label */}
              <div style={{ padding: "8px 10px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#e4e4e7", lineHeight: 1.3 }}>
                  {img.benefit.verb}
                </p>
                <p style={{ fontSize: 10, color: "#71717a", lineHeight: 1.3 }}>
                  {img.benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Download section */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          maxWidth: 380,
          width: "100%",
          padding: "0 24px",
        }}>
          {error && (
            <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center" }}>{error}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: downloading
                ? "rgba(99,102,241,0.08)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: downloading ? "#52525b" : "#fff",
              border: downloading
                ? "1px solid rgba(99,102,241,0.1)"
                : "1px solid rgba(99,102,241,0.3)",
              cursor: downloading ? "not-allowed" : "pointer",
              boxShadow: downloading
                ? "none"
                : "0 2px 8px rgba(99,102,241,0.2), 0 6px 24px rgba(99,102,241,0.25)",
              transition: `all ${t.durationNormal} ${t.easeDefault}`,
            }}
            onMouseEnter={(e) => {
              if (!downloading) {
                e.currentTarget.style.transform = `translateY(-${t.hoverLift}px)`;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = downloading
                ? "none"
                : "0 2px 8px rgba(99,102,241,0.2), 0 6px 24px rgba(99,102,241,0.25)";
            }}
          >
            {downloading ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Packaging...
              </>
            ) : (
              "Download all sizes →"
            )}
          </button>

          <p style={{ fontSize: 10, color: "#52525b", textAlign: "center" }}>
            Includes 6.7″ · 6.9″ · 6.5″ formats · ready for App Store Connect
          </p>

          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: 4,
              background: "none",
              border: "none",
              color: "#52525b",
              fontSize: 12,
              cursor: "pointer",
              padding: "6px 0",
            }}
          >
            ← New project
          </button>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
