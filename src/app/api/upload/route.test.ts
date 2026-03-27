/**
 * POST /api/upload — Validation Tests
 *
 * Maps to: RULE-V01..V04, RULE-C03, API_CONTRACTS.md
 * RG-007: Invalid upload must never be accepted
 *
 * We test the validation function directly with sharp mocked.
 */

import { describe, it, expect, vi } from "vitest";

// Mock sharp globally — all tests get mock dimensions
const mockMetadata = vi.fn().mockResolvedValue({ width: 1290, height: 2796 });
vi.mock("sharp", () => ({
  default: vi.fn(() => ({ metadata: mockMetadata })),
}));

import { validateUploadedFile } from "./validation";

describe("Upload Validation — rejection (RULE-V01..V04)", () => {
  it("RULE-V01: rejects text/plain MIME type", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "test.txt", "text/plain", 1000);
    expect(result).toEqual({ valid: false, error: "INVALID_TYPE" });
  });

  it("RULE-V01: rejects image/gif MIME type", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "test.gif", "image/gif", 1000);
    expect(result).toEqual({ valid: false, error: "INVALID_TYPE" });
  });

  it("RULE-V03: rejects file larger than 10MB", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "big.png", "image/png", 10 * 1024 * 1024 + 1);
    expect(result).toEqual({ valid: false, error: "TOO_LARGE" });
  });

  it("RULE-V02: rejects image with small dimensions", async () => {
    mockMetadata.mockResolvedValueOnce({ width: 100, height: 100 });
    const result = await validateUploadedFile(Buffer.from("x"), "small.png", "image/png", 1000);
    expect(result).toEqual({ valid: false, error: "TOO_SMALL" });
  });

  it("RULE-V02: rejects when width below 390", async () => {
    mockMetadata.mockResolvedValueOnce({ width: 389, height: 2796 });
    const result = await validateUploadedFile(Buffer.from("x"), "narrow.png", "image/png", 1000);
    expect(result).toEqual({ valid: false, error: "TOO_SMALL" });
  });

  it("handles corrupt image (sharp throws)", async () => {
    mockMetadata.mockRejectedValueOnce(new Error("corrupt"));
    const result = await validateUploadedFile(Buffer.from("x"), "corrupt.png", "image/png", 1000);
    expect(result).toEqual({ valid: false, error: "INVALID_IMAGE" });
  });
});

describe("Upload Validation — acceptance (anti-tests)", () => {
  it("RULE-V01 anti: accepts image/png", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "ok.png", "image/png", 1000);
    expect(result).toEqual({ valid: true });
  });

  it("RULE-V01 anti: accepts image/jpeg", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "ok.jpg", "image/jpeg", 1000);
    expect(result).toEqual({ valid: true });
  });

  it("RULE-V03 anti: accepts exactly 10MB", async () => {
    const result = await validateUploadedFile(Buffer.from("x"), "ok.png", "image/png", 10 * 1024 * 1024);
    expect(result).toEqual({ valid: true });
  });

  it("RULE-V02 anti: accepts exact minimum dimensions (390x844)", async () => {
    mockMetadata.mockResolvedValueOnce({ width: 390, height: 844 });
    const result = await validateUploadedFile(Buffer.from("x"), "min.png", "image/png", 1000);
    expect(result).toEqual({ valid: true });
  });
});
