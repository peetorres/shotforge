/**
 * useGenerate Hook — Tests
 *
 * Maps to: RULE-G01..G07, RG-010
 * Orchestrates AI copy generation for 3 variants × N slides
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAllVariants } from "./use-generate";
import type { VariantId } from "@/domain/types";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function aiResponse(copy: Record<string, unknown>) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ...copy, contentOrigin: "generated_by_ai" }),
  });
}

function aiFailure() {
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: "AI_UNAVAILABLE" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateAllVariants", () => {
  const filenames = ["s1.png", "s2.png", "s3.png"];
  const brand = "Sensei";
  const description = "Learning app";
  const brandColor = "#6366F1";

  it("RULE-G01: generates for all 3 variants", async () => {
    mockFetch.mockImplementation(() =>
      aiResponse({ headline: ["**Test**"] }),
    );

    const onProgress = vi.fn();
    await generateAllVariants({ filenames, brand, description, brandColor, onProgress });

    // 3 variants × 3 slides = 9 calls
    expect(mockFetch).toHaveBeenCalledTimes(9);
  });

  it("calls include correct variant names", async () => {
    mockFetch.mockImplementation(() =>
      aiResponse({ headline: ["Test"] }),
    );

    await generateAllVariants({ filenames, brand, description, brandColor, onProgress: vi.fn() });

    const bodies = mockFetch.mock.calls.map(
      (call) => JSON.parse((call[1] as RequestInit).body as string),
    );
    const variantNames = Array.from(new Set(bodies.map((b: { variantName: string }) => b.variantName)));
    expect(variantNames).toContain("Midnight");
    expect(variantNames).toContain("Clean");
    expect(variantNames).toContain("Vivid");
  });

  it("RULE-G05: reports progress for each variant", async () => {
    mockFetch.mockImplementation(() =>
      aiResponse({ headline: ["Test"] }),
    );

    const onProgress = vi.fn();
    await generateAllVariants({ filenames, brand, description, brandColor, onProgress });

    // Should report: analyzing, writing copy, midnight, clean, vivid
    expect(onProgress).toHaveBeenCalledWith(0); // analyzing
    expect(onProgress).toHaveBeenCalledWith(1); // writing copy
    expect(onProgress).toHaveBeenCalledWith(2); // midnight
    expect(onProgress).toHaveBeenCalledWith(3); // clean
    expect(onProgress).toHaveBeenCalledWith(4); // vivid
  });

  it("returns copy organized by variant", async () => {
    mockFetch.mockImplementation(() =>
      aiResponse({ headline: ["**Feature**"] }),
    );

    const result = await generateAllVariants({
      filenames, brand, description, brandColor, onProgress: vi.fn(),
    });

    expect(result.midnight).toHaveLength(3);
    expect(result.clean).toHaveLength(3);
    expect(result.vivid).toHaveLength(3);
  });

  it("RULE-G06: handles AI failure gracefully (returns fallback)", async () => {
    mockFetch.mockImplementation(() => aiFailure());

    const result = await generateAllVariants({
      filenames, brand, description, brandColor, onProgress: vi.fn(),
    });

    // Should still return copy for all variants (from API fallback)
    expect(result.midnight).toHaveLength(3);
    expect(result.clean).toHaveLength(3);
    expect(result.vivid).toHaveLength(3);
  });
});
