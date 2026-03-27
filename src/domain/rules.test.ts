/**
 * Domain Rules — Tests (RED first)
 *
 * Each test maps to a RULE-* in SHOTFORGE_CANON.md.
 * These verify that INVALID input is REJECTED.
 */

import { describe, it, expect } from "vitest";
import {
  validateAppName,
  validateDescription,
  validateBrandColor,
  validateFileMime,
  validateFileSize,
  validateFileDimensions,
  validateTotalUploadSize,
  validateFileCount,
} from "./rules";

describe("RULE-C01: App Name", () => {
  it("rejects empty string", () => {
    expect(validateAppName("")).toEqual({ valid: false, error: "APP_NAME_REQUIRED" });
  });

  it("rejects whitespace-only string", () => {
    expect(validateAppName("   ")).toEqual({ valid: false, error: "APP_NAME_REQUIRED" });
  });

  it("rejects string longer than 60 chars", () => {
    expect(validateAppName("a".repeat(61))).toEqual({ valid: false, error: "APP_NAME_TOO_LONG" });
  });
});

describe("RULE-C02: Description", () => {
  it("rejects string shorter than 10 chars", () => {
    expect(validateDescription("short")).toEqual({ valid: false, error: "DESCRIPTION_TOO_SHORT" });
  });

  it("rejects string longer than 500 chars", () => {
    expect(validateDescription("a".repeat(501))).toEqual({ valid: false, error: "DESCRIPTION_TOO_LONG" });
  });
});

describe("RULE-V01: File MIME Type", () => {
  it("rejects text/plain", () => {
    expect(validateFileMime("text/plain")).toEqual({ valid: false, error: "INVALID_TYPE" });
  });

  it("rejects image/gif", () => {
    expect(validateFileMime("image/gif")).toEqual({ valid: false, error: "INVALID_TYPE" });
  });

  it("rejects image/webp", () => {
    expect(validateFileMime("image/webp")).toEqual({ valid: false, error: "INVALID_TYPE" });
  });
});

describe("RULE-V03: File Size", () => {
  it("rejects file larger than 10MB", () => {
    const overLimit = 10 * 1024 * 1024 + 1;
    expect(validateFileSize(overLimit)).toEqual({ valid: false, error: "TOO_LARGE" });
  });
});

describe("RULE-V02: File Dimensions", () => {
  it("rejects width below 390", () => {
    expect(validateFileDimensions(389, 844)).toEqual({ valid: false, error: "TOO_SMALL" });
  });

  it("rejects height below 844", () => {
    expect(validateFileDimensions(390, 843)).toEqual({ valid: false, error: "TOO_SMALL" });
  });

  it("rejects both below minimum", () => {
    expect(validateFileDimensions(100, 100)).toEqual({ valid: false, error: "TOO_SMALL" });
  });
});

describe("RULE-V04: Total Upload Size", () => {
  it("rejects total exceeding 40MB", () => {
    const overLimit = 40 * 1024 * 1024 + 1;
    expect(validateTotalUploadSize(overLimit)).toEqual({ valid: false, error: "SESSION_TOO_LARGE" });
  });
});

describe("RULE-V05: Brand Color", () => {
  it("rejects non-hex string", () => {
    expect(validateBrandColor("red")).toEqual({ valid: false, error: "INVALID_COLOR" });
  });

  it("rejects 3-char hex", () => {
    expect(validateBrandColor("#fff")).toEqual({ valid: false, error: "INVALID_COLOR" });
  });

  it("rejects missing hash", () => {
    expect(validateBrandColor("6366F1")).toEqual({ valid: false, error: "INVALID_COLOR" });
  });

  it("rejects 8-char hex (with alpha)", () => {
    expect(validateBrandColor("#6366F1FF")).toEqual({ valid: false, error: "INVALID_COLOR" });
  });
});

describe("RULE-C03: File Count", () => {
  it("rejects 0 files", () => {
    expect(validateFileCount(0)).toEqual({ valid: false, error: "NO_FILES" });
  });

  it("rejects more than 6 files", () => {
    expect(validateFileCount(7)).toEqual({ valid: false, error: "TOO_MANY_FILES" });
  });
});
