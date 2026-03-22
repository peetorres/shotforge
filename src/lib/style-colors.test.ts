import { describe, it, expect } from "vitest";
import { resolveStyleColors, STYLE_COLORS } from "./style-colors";

describe("STYLE_COLORS", () => {
  it("has entries for all three styles", () => {
    expect(STYLE_COLORS.dark).toBeDefined();
    expect(STYLE_COLORS.light).toBeDefined();
    expect(STYLE_COLORS.bold).toBeDefined();
  });
});

describe("resolveStyleColors", () => {
  it("returns correct colors for dark", () => {
    const result = resolveStyleColors("dark");
    expect(result.backgroundColor).toBe("#0D0D18");
    expect(result.textColor).toBe("#FFFFFF");
  });

  it("returns correct colors for light", () => {
    const result = resolveStyleColors("light");
    expect(result.backgroundColor).toBe("#F5F5F7");
    expect(result.textColor).toBe("#1D1D1F");
  });

  it("returns correct colors for bold", () => {
    const result = resolveStyleColors("bold");
    expect(result.backgroundColor).toBe("#000000");
    expect(result.textColor).toBe("#FFFFFF");
  });
});
