"use client";

interface ScreenshotGridProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function ScreenshotGrid({ files, onRemove }: ScreenshotGridProps) {
  const slots = Array.from({ length: 6 }, (_, i) => files[i] ?? null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
      {slots.map((file, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "9/19.5",
            background: "var(--surface-2)",
            borderRadius: 8, overflow: "hidden",
            position: "relative",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {file ? (
            <>
              <img
                src={URL.createObjectURL(file)}
                alt={`Screenshot ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute", top: 3, left: 3,
                  fontSize: 8, fontWeight: 800,
                  background: "rgba(0,0,0,0.65)", padding: "1px 4px",
                  borderRadius: 3, color: "var(--text-2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {i + 1}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                aria-label={`Remove screenshot ${i + 1}`}
                style={{
                  position: "absolute", top: 3, right: 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)", color: "var(--red)",
                  fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.1s",
                  backdropFilter: "blur(4px)",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "0"; }}
              >
                ✕
              </button>
            </>
          ) : (
            <span
              style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "var(--text-3)", fontWeight: 600,
              }}
            >
              {i + 1}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
