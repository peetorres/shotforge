"use client";

const STEPS = [
  "Analyzing screenshots",
  "Writing conversion-optimized copy",
  "Rendering Midnight variation",
  "Rendering Clean variation",
  "Rendering Vivid variation",
];

interface ProgressScreenProps {
  progress: number; // 0-4
}

export function ProgressScreen({ progress }: ProgressScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh", paddingTop: 48,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px", textAlign: "center",
      }}
    >
      {/* Orb */}
      <div
        style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--indigo), var(--purple))",
          marginBottom: 28,
          animation: "breathe 2s ease infinite",
          boxShadow: "0 0 60px rgba(99,102,241,0.3)",
        }}
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
        Crafting your screenshots
      </h2>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 28 }}>
        AI is analyzing your app and generating 3 unique sets
      </p>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left", maxWidth: 320, width: "100%" }}>
        {STEPS.map((label, i) => {
          const isDone = i < progress;
          const isActive = i === progress;

          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: isDone ? "var(--green)" : isActive ? "var(--indigo)" : "var(--surface-2)",
                  color: isDone ? "#000" : isActive ? "#fff" : "var(--text-3)",
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: isActive ? "breathe 1.5s ease infinite" : "none",
                  transition: "all 0.3s",
                }}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: isDone ? "var(--green)" : isActive ? "var(--text)" : "var(--text-3)",
                  transition: "all 0.3s",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
