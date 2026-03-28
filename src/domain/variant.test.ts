/**
 * Variant Definitions — Tests
 *
 * Maps to: INV-001, INV-002, INV-008, SHOTFORGE_CANON §4
 */

import { describe, it, expect } from "vitest";
import { createVariants, VARIANT_DEFINITIONS } from "./variant";

describe("VARIANT_DEFINITIONS", () => {
  it("defines exactly 3 variants", () => {
    expect(VARIANT_DEFINITIONS).toHaveLength(3);
  });

  it("has midnight, clean, vivid in order", () => {
    expect(VARIANT_DEFINITIONS.map((v) => v.id)).toEqual(["midnight", "clean", "vivid"]);
  });

  it("midnight is dark style", () => {
    const midnight = VARIANT_DEFINITIONS.find((v) => v.id === "midnight")!;
    expect(midnight.style).toBe("dark");
    expect(midnight.textColor).toBe("#FFFFFF");
  });

  it("clean is light style", () => {
    const clean = VARIANT_DEFINITIONS.find((v) => v.id === "clean")!;
    expect(clean.style).toBe("light");
    expect(clean.textColor).toBe("#1D1D1F");
  });

  it("vivid is bold style", () => {
    const vivid = VARIANT_DEFINITIONS.find((v) => v.id === "vivid")!;
    expect(vivid.style).toBe("bold");
    expect(vivid.textColor).toBe("#FFFFFF");
  });
});

describe("createVariants (INV-001, INV-002, INV-008)", () => {
  const filenames = ["screen1.png", "screen2.png", "screen3.png"];
  const brand = "Sensei";
  const brandColor = "#6366F1";

  it("INV-001: returns exactly 3 variants", () => {
    const variants = createVariants(filenames, brand, brandColor);
    expect(Object.keys(variants)).toHaveLength(3);
    expect(Object.keys(variants)).toEqual(["midnight", "clean", "vivid"]);
  });

  it("INV-002: each variant has slides (up to 6, narrative sequence)", () => {
    const variants = createVariants(filenames, brand, brandColor);
    for (const id of ["midnight", "clean", "vivid"] as const) {
      expect(variants[id].slides.length).toBeGreaterThanOrEqual(1);
      expect(variants[id].slides.length).toBeLessThanOrEqual(6);
    }
  });

  it("INV-008: first slide is always hero type", () => {
    const variants = createVariants(filenames, brand, brandColor);
    for (const id of ["midnight", "clean", "vivid"] as const) {
      expect(variants[id].slides[0].type).toBe("hero");
    }
  });

  it("slides follow conversion narrative (hero → statement → feature → ...)", () => {
    const variants = createVariants(filenames, brand, brandColor);
    expect(variants.midnight.slides[0].type).toBe("hero");
    expect(variants.midnight.slides[1].type).toBe("statement"); // text-only, no device
    expect(variants.midnight.slides[2].type).toBe("feature-single");
  });

  it("hero slide has correct brand name", () => {
    const variants = createVariants(filenames, brand, brandColor);
    const heroSlide = variants.midnight.slides[0];
    if (heroSlide.type === "hero") {
      expect(heroSlide.appName).toBe("Sensei");
    }
  });

  it("each slide references correct screenshot filename", () => {
    const variants = createVariants(filenames, brand, brandColor);
    const slides = variants.midnight.slides;
    expect(slides[0].type === "hero" && slides[0].screenshot).toBe("screen1.png");
    // Slide 1 is statement (no screenshot needed)
    expect(slides[1].type).toBe("statement");
    expect(slides[2].type === "feature-single" && slides[2].screenshot).toBe("screen2.png");
  });

  it("vivid variant background includes brand color", () => {
    const variants = createVariants(filenames, brand, brandColor);
    expect(variants.vivid.backgroundColor).toContain("6366F1");
  });

  it("handles single file (hero + statement + features using same file)", () => {
    const variants = createVariants(["screen1.png"], brand, brandColor);
    for (const id of ["midnight", "clean", "vivid"] as const) {
      expect(variants[id].slides.length).toBeGreaterThanOrEqual(1);
      expect(variants[id].slides[0].type).toBe("hero");
    }
  });
});
