"use client";

import { useMemo } from "react";

interface LivePreviewProps {
  brand: string;
  brandColor: string;
  files: File[];
}

/**
 * Live Preview — same visual language as the frozen Preview surface.
 * Updates in real-time. No server calls. Pure CSS + object URLs.
 */
export function LivePreview({ brand, brandColor, files }: LivePreviewProps) {
  const fileUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );

  const hasScreenshot = fileUrls.length > 0;
  const hasBrand = brand.trim().length > 0;
  const hasContent = hasScreenshot || hasBrand;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 20, width: "100%", maxWidth: 280,
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      opacity: hasContent ? 1 : 0.35,
      transform: hasContent ? "scale(1)" : "scale(0.97)",
    }}>
      {/* ─── Main mockup device ──────────────────────── */}
      <div style={{
        width: "100%",
        aspectRatio: "1290 / 2796",
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        // Same dark base as Midnight variant
        background: `linear-gradient(160deg, #0D0D18 0%, #12101f 40%, ${brandColor}18 70%, #0D0D18 100%)`,
        // Layered shadow system (matching Preview surface)
        boxShadow: `0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.2), 0 20px 56px rgba(0,0,0,0.35), 0 0 48px ${brandColor}08`,
        transition: "background 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}>
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "12% 10% 0",
          position: "relative", overflow: "hidden",
        }}>
          {/* Badge */}
          {hasBrand && (
            <div style={{
              padding: "2.5px 9px", borderRadius: 50,
              border: `1px solid ${brandColor}50`,
              fontSize: 5.5, fontWeight: 700, color: brandColor,
              letterSpacing: 1.5, textTransform: "uppercase",
              marginBottom: "3.5%",
              transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              animation: "fade-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
            }}>
              NEW
            </div>
          )}

          {/* Headline — mirrors Preview hero text */}
          <div style={{
            textAlign: "center", marginBottom: "3%", zIndex: 2,
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}>
            <div style={{
              fontSize: hasBrand ? 13 : 11,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -0.4,
              color: "#fff",
              transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}>
              {hasBrand ? (
                <>
                  {brand},<br />
                  <span style={{ color: brandColor, transition: "color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>elevated</span>
                </>
              ) : (
                <span style={{ color: "#71717a" }}>Your app, here</span>
              )}
            </div>
          </div>

          {/* Stars — matching hero-classic template */}
          <div style={{
            display: "flex", gap: 1.5, marginBottom: "3%", zIndex: 2,
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            opacity: hasBrand ? 0.9 : 0.3,
          }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{
                fontSize: 6, color: brandColor,
                transition: "color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}>★</span>
            ))}
          </div>

          {/* Device frame — same styling as SlideCard */}
          <div style={{
            width: "55%",
            aspectRatio: "9 / 19.5",
            borderRadius: "8%",
            overflow: "hidden",
            zIndex: 2,
            // Layered shadow (matching Preview surface cards)
            boxShadow: "0 2px 4px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.3)",
            border: "1.5px solid rgba(255,255,255,0.08)",
            background: "#0a0a0a",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {hasScreenshot ? (
              <img
                src={fileUrls[0]}
                alt=""
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "top",
                  display: "block",
                  animation: "fade-up 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
                }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: "35%", aspectRatio: "1", borderRadius: "14%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.03)",
                }} />
              </div>
            )}
          </div>

          {/* Glow — same as hero-classic template */}
          <div style={{
            position: "absolute",
            bottom: "-8%", left: "-15%",
            width: "130%", height: "50%",
            borderRadius: "50%",
            background: brandColor,
            filter: "blur(50px)",
            opacity: hasScreenshot ? 0.18 : 0.08,
            transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            zIndex: 1,
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* ─── Supporting thumbnails ────────────────────── */}
      {fileUrls.length > 1 && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          animation: "fade-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        }}>
          {fileUrls.slice(1, 5).map((url, i) => (
            <div key={i} style={{
              width: 28,
              aspectRatio: "9/19.5",
              borderRadius: 5,
              overflow: "hidden",
              opacity: 0.5,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.transform = ""; }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
          ))}
          {fileUrls.length > 5 && (
            <span style={{ fontSize: 10, color: "#71717a", fontWeight: 600 }}>+{fileUrls.length - 5}</span>
          )}
        </div>
      )}

      {/* ─── Status ──────────────────────────────────── */}
      <p style={{
        fontSize: 11, color: "#71717a", textAlign: "center",
        lineHeight: 1.4,
        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}>
        {!hasBrand && !hasScreenshot && "Preview updates as you add details"}
        {hasBrand && !hasScreenshot && "Drop screenshots to see them in the frame"}
        {hasScreenshot && `${files.length} screenshot${files.length > 1 ? "s" : ""} · 3 variations will be generated`}
      </p>
    </div>
  );
}
