"use client";

import type { FlowStep } from "@/domain/types";

interface NavBarProps {
  currentStep: FlowStep;
  rightContent?: React.ReactNode;
}

const STEPS: { key: FlowStep; label: string }[] = [
  { key: "create", label: "Create" },
  { key: "generate", label: "Generate" },
  { key: "choose", label: "Preview" },
];

const STEP_ORDER: Record<FlowStep, number> = { create: 0, generate: 1, choose: 2, refine: 3 };

export function NavBar({ currentStep, rightContent }: NavBarProps) {
  const currentIdx = STEP_ORDER[currentStep];

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 48,
        background: "rgba(9,9,11,0.88)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
        zIndex: 200,
      }}
    >
      <span
        style={{
          fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px",
          background: "linear-gradient(135deg, var(--indigo), var(--purple))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}
      >
        Shotforge
      </span>

      <div
        style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", background: "var(--surface-2)",
          borderRadius: "var(--r-sm)", overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {STEPS.map((s, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <span
              key={s.key}
              style={{
                padding: "5px 14px", fontSize: 11, fontWeight: 600,
                color: isDone ? "var(--green)" : isActive ? "var(--text)" : "var(--text-3)",
                background: isActive ? "var(--surface-3)" : "transparent",
                transition: "all 0.15s var(--ease)",
              }}
            >
              {isDone ? "✓ " : ""}{s.label}
            </span>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
        {rightContent}
      </div>
    </nav>
  );
}
