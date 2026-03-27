"use client";

import { SlideCard } from "@/components/choose/slide-card";

interface SlideCardsRowProps {
  slideCount: number;
  previewCache: Record<number, string>;
  previewLoading: Record<number, boolean>;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function SlideCardsRow({ slideCount, previewCache, previewLoading, activeIndex, onSelect }: SlideCardsRowProps) {
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      gap: 14, padding: "16px 20px", overflow: "hidden",
    }}>
      {Array.from({ length: slideCount }).map((_, i) => {
        const isSelected = i === activeIndex;
        return (
          <div
            key={i}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              width: `calc((100% - ${(slideCount - 1) * 14}px) / ${slideCount})`,
              minWidth: 80, maxWidth: 200,
              position: "relative", cursor: "pointer",
              border: isSelected ? "3px solid var(--indigo)" : "3px solid transparent",
              borderRadius: 17,
              boxShadow: isSelected
                ? "0 0 0 4px rgba(99,102,241,0.12), 0 16px 48px rgba(99,102,241,0.1)"
                : "0 8px 28px rgba(0,0,0,0.3)",
              transform: isSelected ? "translateY(-4px)" : "none",
              transition: "all 0.25s var(--ease-out)",
              overflow: "hidden",
            }}
          >
            {/* Number badge */}
            <div style={{
              position: "absolute", top: 8, left: 8, zIndex: 15,
              width: 22, height: 22, borderRadius: 6,
              background: isSelected ? "var(--indigo)" : "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)", fontSize: 10, fontWeight: 800,
              color: isSelected ? "#fff" : "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i + 1}
            </div>

            <SlideCard
              previewSrc={previewCache[i] ?? null}
              isLoading={previewLoading[i] ?? false}
            />
          </div>
        );
      })}
    </div>
  );
}
