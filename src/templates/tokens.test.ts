import { describe, it, expect } from "vitest";
import { resolveTokens, resolveColorToken } from "./tokens";

describe("resolveTokens", () => {
  it("midnight has white text on dark background", () => {
    const tokens = resolveTokens("midnight", "#6366f1");
    expect(tokens.color["text-primary"]).toBe("#FFFFFF");
    expect(tokens.color["bg-primary"]).toBe("#0D0D18");
  });

  it("clean has dark text on light background", () => {
    const tokens = resolveTokens("clean", "#6366f1");
    expect(tokens.color["text-primary"]).toBe("#1D1D1F");
    expect(tokens.color["bg-primary"]).toBe("#F5F5F7");
  });

  it("vivid uses brand color for glow and badge", () => {
    const tokens = resolveTokens("vivid", "#FF0000");
    expect(tokens.color["glow-color"]).toBe("#FF0000");
    expect(tokens.color["badge-text"]).toBe("#FF0000");
  });

  it("all variants include brand-accent from brandColor", () => {
    for (const v of ["midnight", "clean", "vivid"] as const) {
      const tokens = resolveTokens(v, "#AABBCC");
      expect(tokens.color["brand-accent"]).toBe("#AABBCC");
    }
  });

  it("typography tokens exist for all sizes", () => {
    const tokens = resolveTokens("midnight", "#000");
    expect(tokens.typography["heading-2xl"]).toBeDefined();
    expect(tokens.typography["heading-xl"]).toBeDefined();
    expect(tokens.typography["body-md"]).toBeDefined();
    expect(tokens.typography["badge"]).toBeDefined();
  });

  it("shadow tokens exist", () => {
    const tokens = resolveTokens("midnight", "#000");
    expect(tokens.shadow["device-shadow"]).toBeDefined();
    expect(tokens.shadow["elevation-3"]).toBeDefined();
  });
});

describe("resolveColorToken", () => {
  it("resolves known token", () => {
    const tokens = resolveTokens("midnight", "#6366f1");
    expect(resolveColorToken(tokens, "text-primary")).toBe("#FFFFFF");
  });

  it("falls back to raw value for unknown token", () => {
    const tokens = resolveTokens("midnight", "#6366f1");
    expect(resolveColorToken(tokens, "#FF0000")).toBe("#FF0000");
  });
});
