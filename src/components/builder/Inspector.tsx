"use client";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/lib/style-colors";
import { LayoutSection } from "./inspector/LayoutSection";
import { CopySection } from "./inspector/CopySection";
import { BrandSection } from "./inspector/BrandSection";
import { ScreenshotSection } from "./inspector/ScreenshotSection";

interface InspectorProps {
  slide: SlideConfig;
  brand: string;
  description: string;
  style: AppStyle;
  brandColor: string;
  uploadedFiles: string[];
  onSlideChange: (patch: Record<string, unknown>) => void;
  onStyleChange: (s: AppStyle) => void;
  onColorChange: (c: string) => void;
}

export function Inspector(props: InspectorProps) {
  const { slide, brand, description, style, brandColor, uploadedFiles, onSlideChange, onStyleChange, onColorChange } = props;

  function handleLayoutChange(newType: SlideConfig["type"]) {
    if (newType === "hero") {
      onSlideChange({ type: "hero", appName: brand, tagline: ["Your app, **elevated**"], bullets: [], showStars: true, screenshot: uploadedFiles[0] ?? "" });
    } else if (newType === "feature-single") {
      onSlideChange({ type: "feature-single", headline: ["**Feature** headline"], screenshot: uploadedFiles[0] ?? "", angle: 0 });
    } else {
      onSlideChange({ type: "feature-dual", headline: ["**Two** is better"], screenshots: [uploadedFiles[0] ?? "", uploadedFiles[1] ?? ""], angles: [10, -8] });
    }
  }

  return (
    <div style={{ width: 280, background: "#161618", borderLeft: "1px solid rgba(255,255,255,0.06)", overflowY: "auto" }}>
      <LayoutSection currentType={slide.type} onChange={handleLayoutChange} />
      <CopySection slide={slide} brand={brand} description={description} style={style} onChange={onSlideChange} />
      <BrandSection style={style} brandColor={brandColor} onStyleChange={onStyleChange} onColorChange={onColorChange} />
      <ScreenshotSection slide={slide} uploadedFiles={uploadedFiles} onChange={(patch) => onSlideChange(patch as Record<string, unknown>)} />
    </div>
  );
}
