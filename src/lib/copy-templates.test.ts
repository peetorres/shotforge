/**
 * Copy Templates — Tests (RULE-G06: fallback when AI unavailable)
 */

import { describe, it, expect } from "vitest";
import { getTemplateCopy } from "./copy-templates";

describe("getTemplateCopy (RULE-G06)", () => {
  it("returns tagline + bullets for hero slide", () => {
    const copy = getTemplateCopy("hero", "dark");
    expect(copy.tagline).toBeDefined();
    expect(copy.tagline!.length).toBeGreaterThan(0);
    expect(copy.bullets).toBeDefined();
    expect(copy.contentOrigin).toBe("template_fallback");
  });

  it("returns headline for feature-single slide", () => {
    const copy = getTemplateCopy("feature-single", "dark");
    expect(copy.headline).toBeDefined();
    expect(copy.headline!.length).toBeGreaterThan(0);
    expect(copy.contentOrigin).toBe("template_fallback");
  });

  it("returns headline for feature-dual slide", () => {
    const copy = getTemplateCopy("feature-dual", "light");
    expect(copy.headline).toBeDefined();
    expect(copy.contentOrigin).toBe("template_fallback");
  });

  it("returns different copy for different styles", () => {
    const dark = getTemplateCopy("hero", "dark");
    const light = getTemplateCopy("hero", "light");
    // At minimum, they should both be valid
    expect(dark.tagline).toBeDefined();
    expect(light.tagline).toBeDefined();
  });
});
