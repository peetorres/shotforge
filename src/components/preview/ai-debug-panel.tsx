"use client";

import { useState } from "react";

export interface AIRunResult {
  status: "off" | "running" | "success" | "failed" | "fallback";
  timings: {
    total?: number;
    productAnalysis?: number;
    screenshotAnalysis?: number;
    slidePlanGeneration?: number;
  };
  slideCount: number;
  fallbackUsed: boolean;
  comparisons: Array<{
    index: number;
    deterministic: string;
    ai: string | null;
    role: string | null;
    crop: string | null;
  }>;
  error?: string;
}

interface AIDebugPanelProps {
  result: AIRunResult | null;
  aiEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRunExperiment?: () => void;
}

export function AIDebugPanel({ result, aiEnabled, onToggle, onRunExperiment }: AIDebugPanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  const status = result?.status ?? (aiEnabled ? "off" : "off");
  const statusColor = {
    off: "#52525b",
    running: "#f59e0b",
    success: "#22c55e",
    failed: "#ef4444",
    fallback: "#f59e0b",
  }[status];

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      fontFamily: "'SF Mono', monospace", fontSize: 11,
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(17,17,19,0.95)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#a1a1aa", fontSize: 10, fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
        AI Director {aiEnabled ? "ON" : "OFF"}
        <span style={{ color: "#3f3f46" }}>{expanded ? "▼" : "▲"}</span>
      </button>

      {/* Panel */}
      {expanded && (
        <div style={{
          position: "absolute", bottom: 36, right: 0,
          width: 420, maxHeight: 500, overflowY: "auto",
          background: "rgba(17,17,19,0.97)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
          padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          color: "#a1a1aa",
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#fafafa", marginBottom: 12 }}>
            AI Visual Director
          </h3>

          {/* Status + Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
              <span style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>
              {result?.fallbackUsed && <span style={{ color: "#f59e0b", fontSize: 9 }}>(fallback)</span>}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={aiEnabled} onChange={(e) => onToggle(e.target.checked)}
                style={{ accentColor: "#6366f1" }} />
              <span style={{ fontSize: 10 }}>Enable AI</span>
            </label>
          </div>

          {!aiEnabled && (
            <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 12, fontSize: 10, lineHeight: 1.5 }}>
              {process.env.NEXT_PUBLIC_OPENAI_AVAILABLE === "true"
                ? "AI Visual Director available. Toggle to enable."
                : "No OPENAI_API_KEY detected. Add to .env.local and restart."}
            </div>
          )}

          {/* Timings */}
          {result?.timings?.total && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Timings</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {result.timings.productAnalysis != null && <Stat label="Product" value={`${result.timings.productAnalysis}ms`} />}
                {result.timings.screenshotAnalysis != null && <Stat label="Screenshots" value={`${result.timings.screenshotAnalysis}ms`} />}
                {result.timings.slidePlanGeneration != null && <Stat label="Slide plan" value={`${result.timings.slidePlanGeneration}ms`} />}
                <Stat label="Total" value={`${result.timings.total}ms`} highlight />
              </div>
            </div>
          )}

          {/* Side-by-side comparison */}
          {result?.comparisons && result.comparisons.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                Headline Comparison ({result.comparisons.length} slides)
              </div>
              {result.comparisons.map((c) => (
                <div key={c.index} style={{
                  padding: "8px 10px", marginBottom: 4,
                  background: "rgba(255,255,255,0.02)", borderRadius: 6,
                  borderLeft: c.ai ? "2px solid #6366f1" : "2px solid #3f3f46",
                }}>
                  <div style={{ fontSize: 9, color: "#52525b", marginBottom: 3 }}>
                    Slide {c.index + 1} {c.role && `· ${c.role}`} {c.crop && `· crop: ${c.crop}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#71717a", marginBottom: 2 }}>
                    DET: <span style={{ color: "#a1a1aa" }}>{c.deterministic}</span>
                  </div>
                  {c.ai && (
                    <div style={{ fontSize: 10, color: "#6366f1" }}>
                      AI: <span style={{ fontWeight: 600 }}>{c.ai}</span>
                    </div>
                  )}
                  {!c.ai && (
                    <div style={{ fontSize: 10, color: "#3f3f46" }}>AI: (no data)</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {result?.error && (
            <div style={{ padding: "8px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 6, marginBottom: 12, fontSize: 10, color: "#ef4444" }}>
              {result.error}
            </div>
          )}

          {/* Run experiment button */}
          {onRunExperiment && (
            <button
              onClick={onRunExperiment}
              style={{
                width: "100%", height: 32, borderRadius: 7,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              Run AI Experiment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: "4px 8px", borderRadius: 5,
      background: highlight ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
    }}>
      <div style={{ fontSize: 9, color: "#3f3f46" }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: highlight ? "#6366f1" : "#a1a1aa" }}>{value}</div>
    </div>
  );
}
