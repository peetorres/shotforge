"use client";

/**
 * SlideCard — Displays a server-rendered preview image.
 *
 * No CSS fake rendering. Single source of truth: /api/preview.
 * Same output in Choose, Refine, and Export.
 */

interface SlideCardProps {
  /** Base64 data URI from /api/preview, or null if not yet loaded */
  previewSrc: string | null;
  isLoading: boolean;
  onClick?: () => void;
}

export function SlideCard({ previewSrc, isLoading, onClick }: SlideCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        width: "100%",
        aspectRatio: "1290 / 2796",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        background: "var(--surface)",
      }}
    >
      {/* Real preview image */}
      {previewSrc && (
        <img
          src={previewSrc}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !previewSrc && (
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: "2px solid var(--surface-4)",
            borderTopColor: "var(--indigo)",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}

      {/* Empty state (no preview yet, not loading) */}
      {!previewSrc && !isLoading && (
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "30%", aspectRatio: "9/19.5", borderRadius: 6,
            background: "var(--surface-3)", border: "1px solid var(--border-subtle)",
          }} />
        </div>
      )}
    </div>
  );
}
