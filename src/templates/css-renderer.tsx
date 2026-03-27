"use client";

/**
 * CSS Renderer — Renders template element trees as React/CSS
 *
 * This is the fast client-side renderer for Choose/Refine cards.
 * It interprets the same element tree that screenshot-gen uses,
 * ensuring layout parity (via shared positioning logic).
 *
 * VQ-011: No emoji placeholders. Real text, real device frames, real screenshots.
 */

import type { CompositionElement, TextElement, ImageElement, ShapeElement, ListElement, RatingElement, GlowElement, BackgroundElement } from "./types";
import type { DesignTokens } from "./tokens";
import { resolveColorToken, resolveTypographyToken, resolveShadowToken } from "./tokens";

interface CSSRendererProps {
  elements: CompositionElement[];
  tokens: DesignTokens;
  brandColor: string;
  /** Map of binding key → value. e.g. { "screenshot:0": "objectURL", "headline": ["text"] } */
  bindings: Record<string, string | string[]>;
  /** Canvas size in pixels (for absolute positioning) */
  canvasWidth: number;
  canvasHeight: number;
}

function highlightBold(text: string, brandColor: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, `<span style="color:${brandColor}">$1</span>`);
}

export function CSSSlideRenderer({ elements, tokens, brandColor, bindings, canvasWidth, canvasHeight }: CSSRendererProps) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {sorted.map((el) => {
        if (!el.visible) return null;
        switch (el.type) {
          case "background": return <BgRenderer key={el.id} el={el as BackgroundElement} tokens={tokens} />;
          case "glow": return <GlowRenderer key={el.id} el={el as GlowElement} tokens={tokens} />;
          case "text": return <TextRenderer key={el.id} el={el as TextElement} tokens={tokens} brandColor={brandColor} bindings={bindings} />;
          case "image": return <ImageRenderer key={el.id} el={el as ImageElement} tokens={tokens} bindings={bindings} canvasHeight={canvasHeight} />;
          case "shape": return <ShapeRenderer key={el.id} el={el as ShapeElement} tokens={tokens} bindings={bindings} />;
          case "list": return <ListRenderer key={el.id} el={el as ListElement} tokens={tokens} brandColor={brandColor} bindings={bindings} />;
          case "rating": return <RatingRenderer key={el.id} el={el as RatingElement} tokens={tokens} />;
          default: return null;
        }
      })}
    </div>
  );
}

// ─── Background ─────────────────────────────────

function BgRenderer({ el, tokens }: { el: BackgroundElement; tokens: DesignTokens }) {
  let background: string;
  if (el.style.gradient) {
    const stops = el.style.gradient.stops.map((s) => {
      const color = resolveColorToken(tokens, s.colorToken);
      return `${color} ${s.offset}%`;
    }).join(", ");
    background = el.style.gradient.type === "linear"
      ? `linear-gradient(${el.style.gradient.angle ?? 180}deg, ${stops})`
      : `radial-gradient(${stops})`;
  } else {
    background = resolveColorToken(tokens, el.style.colorToken);
  }

  return <div style={{ position: "absolute", inset: 0, background, zIndex: el.zIndex }} />;
}

// ─── Glow ───────────────────────────────────────

function GlowRenderer({ el, tokens }: { el: GlowElement; tokens: DesignTokens }) {
  const color = resolveColorToken(tokens, el.style.colorToken);
  const w = typeof el.size.width === "number" ? el.size.width : 60;
  const h = typeof el.size.height === "number" ? el.size.height : 50;
  // Scale blur relative to card size (template uses large px values)
  const scaledBlur = Math.max(15, el.style.blurPx * 0.4);
  return (
    <div style={{
      position: "absolute",
      left: `${el.position.x - w / 2}%`,
      top: `${el.position.y - h / 2}%`,
      width: `${w}%`,
      height: `${h}%`,
      borderRadius: "50%",
      background: color,
      filter: `blur(${scaledBlur}px)`,
      opacity: el.style.opacity,
      zIndex: el.zIndex,
      pointerEvents: "none",
    }} />
  );
}

// ─── Text ───────────────────────────────────────

function TextRenderer({ el, tokens, brandColor, bindings }: { el: TextElement; tokens: DesignTokens; brandColor: string; bindings: Record<string, string | string[]> }) {
  const typo = resolveTypographyToken(tokens, el.style.fontToken);
  const color = resolveColorToken(tokens, el.style.colorToken);
  const bound = bindings[el.content.binding];
  const lines: string[] = Array.isArray(bound) ? bound : (typeof bound === "string" && bound ? [bound] : el.content.fallback);
  const displayLines = lines.filter(Boolean).slice(0, el.style.maxLines);

  if (displayLines.length === 0) return null;

  // Font size uses clamp for responsive scaling within the card
  // Template canvas is 1290px. At ~200px card width, scale = ~0.155
  // But we use percentage-based sizing for fluid rendering
  const fontSizeVw = typo.size / 1290 * 100; // as percentage of card width
  const fontSizePx = Math.max(6, Math.min(typo.size * 0.13, 20)); // clamp for readability

  const widthPercent = typeof el.size.width === "number" ? el.size.width : 80;

  return (
    <div style={{
      position: "absolute",
      left: `${el.position.x - widthPercent / 2}%`,
      top: `${el.position.y}%`,
      width: `${widthPercent}%`,
      textAlign: el.style.alignment,
      zIndex: el.zIndex,
      padding: "0 2%",
    }}>
      {displayLines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: fontSizePx,
            fontWeight: typo.weight,
            lineHeight: typo.lineHeight,
            letterSpacing: Math.max(-0.5, typo.tracking * 0.08),
            color,
          }}
          dangerouslySetInnerHTML={{
            __html: el.style.boldStyle === "brand-color"
              ? highlightBold(line, brandColor)
              : line.replace(/\*\*/g, ""),
          }}
        />
      ))}
    </div>
  );
}

// ─── Image (Device + Screenshot) ────────────────

function ImageRenderer({ el, tokens, bindings }: { el: ImageElement; tokens: DesignTokens; bindings: Record<string, string | string[]>; canvasHeight: number }) {
  const shadow = resolveShadowToken(tokens, el.style.shadowToken);
  const screenshotSrc = bindings[el.content.binding] as string | undefined;
  const heightPercent = typeof el.size.height === "number" ? el.size.height : 60;
  const isFrameless = el.style.frameToken === "frameless";

  // Device aspect ratio: iPhone is roughly 9:19.5
  const deviceAspect = 9 / 19.5;
  // Width = height * aspect ratio (in percentage terms)
  const widthPercent = heightPercent * deviceAspect;

  // Position from anchor
  const posStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: el.zIndex,
  };

  if (el.position.anchor === "bottom-center") {
    posStyle.bottom = "0%";
    posStyle.left = `${el.position.x}%`;
    posStyle.transform = `translateX(-50%) rotate(${el.style.angle}deg)`;
  } else {
    posStyle.top = `${el.position.y}%`;
    posStyle.left = `${el.position.x}%`;
    posStyle.transform = `translateX(-50%) rotate(${el.style.angle}deg)`;
  }

  return (
    <div style={{
      ...posStyle,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
    }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: isFrameless ? "6%" : "8%",
        overflow: "hidden",
        boxShadow: shadow,
        border: isFrameless ? "none" : "1.5px solid rgba(255,255,255,0.1)",
        background: "#111",
      }}>
        {screenshotSrc ? (
          <img
            src={screenshotSrc}
            alt=""
            loading="lazy"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: el.style.cropRule === "top" ? "top" : "center",
              display: "block",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: "35%", aspectRatio: "1", borderRadius: "12%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.04)",
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shape (Badge) ──────────────────────────────

function ShapeRenderer({ el, tokens, bindings }: { el: ShapeElement; tokens: DesignTokens; bindings: Record<string, string | string[]> }) {
  const fill = resolveColorToken(tokens, el.style.fillToken);
  const stroke = el.style.strokeToken ? resolveColorToken(tokens, el.style.strokeToken) : undefined;
  const textColor = el.style.textColorToken ? resolveColorToken(tokens, el.style.textColorToken) : "#fff";
  const text = el.content ? (bindings[el.content.binding] as string || el.content.fallback[0]) : "";
  const typo = el.style.fontToken ? resolveTypographyToken(tokens, el.style.fontToken) : null;

  return (
    <div style={{
      position: "absolute",
      left: `${el.position.x}%`, top: `${el.position.y}%`,
      transform: "translateX(-50%)",
      padding: "2px 8px",
      borderRadius: el.style.variant === "pill" ? 100 : el.style.variant === "rounded" ? 6 : 2,
      background: fill,
      border: stroke ? `${el.style.strokeWidth ?? 1}px solid ${stroke}` : "none",
      fontSize: typo ? typo.size * 0.18 : 4,
      fontWeight: typo?.weight ?? 700,
      letterSpacing: typo ? typo.tracking * 0.18 : 0.5,
      color: textColor,
      zIndex: el.zIndex,
      whiteSpace: "nowrap",
    }}>
      {text}
    </div>
  );
}

// ─── List (Bullets) ─────────────────────────────

function ListRenderer({ el, tokens, brandColor, bindings }: { el: ListElement; tokens: DesignTokens; brandColor: string; bindings: Record<string, string | string[]> }) {
  const items = (bindings[el.content.binding] as string[] || el.content.fallback).slice(0, el.style.maxItems);
  const iconColor = resolveColorToken(tokens, el.style.iconColorToken);
  const textColor = resolveColorToken(tokens, el.style.textColorToken);
  const typo = resolveTypographyToken(tokens, el.style.fontToken);

  return (
    <div style={{
      position: "absolute",
      left: `${el.position.x - (typeof el.size.width === "number" ? el.size.width / 2 : 37)}%`,
      top: `${el.position.y}%`,
      width: `${typeof el.size.width === "number" ? el.size.width : 75}%`,
      zIndex: el.zIndex,
      display: "flex", flexDirection: "column", gap: el.style.gap * 0.15,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: iconColor, fontSize: typo.size * 0.18, fontWeight: 700 }}>
            {el.style.iconType === "check" ? "✓" : el.style.iconType === "number" ? `${i + 1}.` : "•"}
          </span>
          <span style={{ color: textColor, fontSize: typo.size * 0.18, fontWeight: typo.weight }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Rating (Stars) ─────────────────────────────

function RatingRenderer({ el, tokens }: { el: RatingElement; tokens: DesignTokens }) {
  const color = resolveColorToken(tokens, el.style.colorToken);
  return (
    <div style={{
      position: "absolute",
      left: `${el.position.x}%`, top: `${el.position.y}%`,
      transform: "translateX(-50%)",
      display: "flex", gap: 1,
      zIndex: el.zIndex,
    }}>
      {Array.from({ length: el.style.starCount }).map((_, i) => (
        <span key={i} style={{ color, fontSize: 7 }}>★</span>
      ))}
    </div>
  );
}
