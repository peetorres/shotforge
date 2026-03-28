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
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 16px", zIndex: 200,
      }}
    >
      {/* Steps — centered, minimal */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 8, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {STEPS.map((s, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <span
              key={s.key}
              style={{
                padding: "5px 16px", fontSize: 11, fontWeight: 600,
                color: isDone ? "#22c55e" : isActive ? "#fafafa" : "#52525b",
                background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {isDone ? "✓ " : ""}{s.label}
            </span>
          );
        })}
      </div>

      {/* Right content */}
      {rightContent && (
        <div style={{ position: "absolute", right: 16, display: "flex", gap: 6, alignItems: "center" }}>
          {rightContent}
        </div>
      )}
    </nav>
  );
}
