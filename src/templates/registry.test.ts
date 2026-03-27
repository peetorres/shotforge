import { describe, it, expect } from "vitest";
import { getAllTemplates, getTemplateById, getTemplatesByCategory, assignTemplates } from "./registry";

describe("Template Registry", () => {
  it("has 6 templates", () => {
    expect(getAllTemplates()).toHaveLength(6);
  });

  it("all templates have unique IDs", () => {
    const ids = getAllTemplates().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all templates have version 1", () => {
    for (const t of getAllTemplates()) {
      expect(t.version).toBe(1);
    }
  });

  it("all templates have non-empty elements", () => {
    for (const t of getAllTemplates()) {
      expect(t.elements.length).toBeGreaterThan(0);
    }
  });

  it("all templates have a background element", () => {
    for (const t of getAllTemplates()) {
      expect(t.elements.some((e) => e.type === "background")).toBe(true);
    }
  });

  it("all templates have at least one image element", () => {
    for (const t of getAllTemplates()) {
      expect(t.elements.some((e) => e.type === "image")).toBe(true);
    }
  });

  it("VQ-007: all text elements have non-empty fallback", () => {
    for (const t of getAllTemplates()) {
      for (const e of t.elements) {
        if ("content" in e && e.content) {
          expect(e.content.fallback.length).toBeGreaterThanOrEqual(0);
          // Text elements specifically need fallbacks
          if (e.type === "text") {
            expect(e.content.fallback.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("getTemplateById returns correct template", () => {
    expect(getTemplateById("hero-classic")?.name).toBe("Classic Hero");
    expect(getTemplateById("nonexistent")).toBeNull();
  });

  it("getTemplatesByCategory returns correct count", () => {
    expect(getTemplatesByCategory("hero")).toHaveLength(3);
    expect(getTemplatesByCategory("feature")).toHaveLength(3);
  });
});

describe("assignTemplates", () => {
  it("assigns hero to first slide", () => {
    const ids = assignTemplates(3, 0);
    expect(ids[0]).toMatch(/^hero-/);
  });

  it("assigns feature templates to remaining slides", () => {
    const ids = assignTemplates(4, 0);
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]).toMatch(/^feature-/);
    }
  });

  it("rotates hero template per variant index", () => {
    const v0 = assignTemplates(3, 0)[0];
    const v1 = assignTemplates(3, 1)[0];
    const v2 = assignTemplates(3, 2)[0];
    expect(v0).not.toBe(v1);
    expect(v1).not.toBe(v2);
  });

  it("alternates between centered and angled for features", () => {
    const ids = assignTemplates(5, 0);
    expect(ids[1]).toBe("feature-centered");
    expect(ids[2]).toBe("feature-angled");
    expect(ids[3]).toBe("feature-centered");
  });

  it("uses feature-dual for last slide when 6+ screenshots", () => {
    const ids = assignTemplates(6, 0);
    expect(ids[5]).toBe("feature-dual");
  });

  it("does NOT use feature-dual for fewer than 6 screenshots", () => {
    const ids = assignTemplates(4, 0);
    expect(ids.every((id) => id !== "feature-dual")).toBe(true);
  });

  it("handles single screenshot", () => {
    const ids = assignTemplates(1, 0);
    expect(ids).toHaveLength(1);
    expect(ids[0]).toMatch(/^hero-/);
  });
});
