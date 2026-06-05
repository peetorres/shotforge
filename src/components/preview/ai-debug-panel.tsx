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
  /** AI-applied visual overrides per slide */
  aiOverrides?: Array<{
    index: number;
    zoom: number;
    deviceOffsetX: number;
    deviceScale: number;
  }>;
}

interface AIDebugPanelProps {
  result: AIRunResult | null;
}

export function AIDebugPanel({ result }: AIDebugPanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  const status = result?.status ?? "off";
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
      {/* Toggle button — always shows AI as active */}
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
        AI Director {status === "off" ? "READY" : status.toUpperCase()}
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

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
            <span style={{ fontWeight: 600 }}>{status === "off" ? "ALWAYS ON" : status.toUpperCase()}</span>
            {result?.fallbackUsed && <span style={{ color: "#f59e0b", fontSize: 9 }}>(fallback)</span>}
          </div>

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

          {/* AI Visual Overrides — lightweight indicator per slide */}
          {result?.aiOverrides && result.aiOverrides.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                AI Overrides ({result.aiOverrides.length} slides)
              </div>
              {result.aiOverrides.map((o) => (
                <div key={o.index} style={{
                  padding: "6px 10px", marginBottom: 3,
                  background: "rgba(99,102,241,0.06)", borderRadius: 6,
                  display: "flex", gap: 12, fontSize: 10,
                  borderLeft: `2px solid ${Math.abs(o.deviceOffsetX) > 5 || o.zoom > 1.3 ? "#6366f1" : "#3f3f46"}`,
                }}>
                  <span style={{ color: "#52525b", minWidth: 48 }}>Slide {o.index + 1}</span>
                  <span>zoom: <b style={{ color: o.zoom > 1.3 ? "#22c55e" : "#a1a1aa" }}>{o.zoom.toFixed(1)}</b></span>
                  <span>offset: <b style={{ color: Math.abs(o.deviceOffsetX) > 5 ? "#6366f1" : "#a1a1aa" }}>{o.deviceOffsetX}</b></span>
                  <span>scale: <b style={{ color: Math.abs(o.deviceScale - 1) > 0.05 ? "#f59e0b" : "#a1a1aa" }}>{o.deviceScale.toFixed(2)}</b></span>
                </div>
              ))}
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
