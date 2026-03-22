import type { SlideConfig } from "@appforge/screenshot-gen";

export function buildInitialSlides(filenames: string[], brand: string): SlideConfig[] {
  if (filenames.length === 0) return [];

  const slides: SlideConfig[] = [];

  slides.push({
    type: "hero",
    appName: brand, // use actual brand name, not empty string
    tagline: ["Your app, **elevated**"],
    bullets: ["Feature one", "Feature two", "Feature three", "Feature four"],
    showStars: true,
    screenshot: filenames[0],
  });

  for (let i = 1; i < filenames.length; i++) {
    slides.push({
      type: "feature-single",
      headline: ["**Feature** headline"],
      screenshot: filenames[i],
      angle: 0,
    });
  }

  return slides;
}
