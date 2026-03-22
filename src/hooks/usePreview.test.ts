import { describe, it, expect, vi, beforeEach } from "vitest";

// buildInitialSlides is extracted to a pure util — test it directly
import { buildInitialSlides } from "@/lib/build-initial-slides";

describe("buildInitialSlides", () => {
  it("returns empty array for no filenames", () => {
    expect(buildInitialSlides([], "TestApp")).toHaveLength(0);
  });

  it("first file becomes a hero slide with correct appName", () => {
    const slides = buildInitialSlides(["home.png"], "Sensei");
    expect(slides[0].type).toBe("hero");
    expect((slides[0] as any).appName).toBe("Sensei");
    expect((slides[0] as any).screenshot).toBe("home.png");
  });

  it("second file becomes feature-single", () => {
    const slides = buildInitialSlides(["home.png", "lesson.png"], "Sensei");
    expect(slides[1].type).toBe("feature-single");
    expect((slides[1] as any).screenshot).toBe("lesson.png");
  });

  it("4 files → 1 hero + 3 feature-single", () => {
    const slides = buildInitialSlides(["a.png", "b.png", "c.png", "d.png"], "App");
    expect(slides).toHaveLength(4);
    expect(slides[0].type).toBe("hero");
    expect(slides.slice(1).every((s) => s.type === "feature-single")).toBe(true);
  });
});
