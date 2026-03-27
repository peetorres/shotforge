/**
 * Domain Rules — Anti-Tests
 *
 * Inverse of rules.test.ts: verify VALID input is ACCEPTED.
 * Prevents regressions where validation is accidentally tightened.
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

describe("RULE-C01 anti: App Name accepts valid", () => {
  it("accepts normal name", () => {
    expect(validateAppName("Sensei")).toEqual({ valid: true });
  });

  it("accepts 1-char name", () => {
    expect(validateAppName("X")).toEqual({ valid: true });
  });

  it("accepts exactly 60 chars", () => {
    expect(validateAppName("a".repeat(60))).toEqual({ valid: true });
  });

  it("trims whitespace before validating", () => {
    expect(validateAppName("  Sensei  ")).toEqual({ valid: true });
  });
});

describe("RULE-C02 anti: Description accepts valid", () => {
  it("accepts 10-char description", () => {
    expect(validateDescription("Exactly 10")).toEqual({ valid: true });
  });

  it("accepts 500-char description", () => {
    expect(validateDescription("a".repeat(500))).toEqual({ valid: true });
  });

  it("accepts normal description", () => {
    expect(validateDescription("Gamified learning for founders")).toEqual({ valid: true });
  });
});

describe("RULE-V01 anti: MIME accepts valid", () => {
  it("accepts image/png", () => {
    expect(validateFileMime("image/png")).toEqual({ valid: true });
  });

  it("accepts image/jpeg", () => {
    expect(validateFileMime("image/jpeg")).toEqual({ valid: true });
  });
});

describe("RULE-V03 anti: File Size accepts valid", () => {
  it("accepts exactly 10MB", () => {
    expect(validateFileSize(10 * 1024 * 1024)).toEqual({ valid: true });
  });

  it("accepts 1MB", () => {
    expect(validateFileSize(1024 * 1024)).toEqual({ valid: true });
  });
});

describe("RULE-V02 anti: Dimensions accepts valid", () => {
  it("accepts exact minimum (390x844)", () => {
    expect(validateFileDimensions(390, 844)).toEqual({ valid: true });
  });

  it("accepts large dimensions", () => {
    expect(validateFileDimensions(1290, 2796)).toEqual({ valid: true });
  });
});

describe("RULE-V04 anti: Total size accepts valid", () => {
  it("accepts exactly 40MB", () => {
    expect(validateTotalUploadSize(40 * 1024 * 1024)).toEqual({ valid: true });
  });

  it("accepts small total", () => {
    expect(validateTotalUploadSize(1024)).toEqual({ valid: true });
  });
});

describe("RULE-V05 anti: Brand Color accepts valid", () => {
  it("accepts valid 6-char hex", () => {
    expect(validateBrandColor("#6366F1")).toEqual({ valid: true });
  });

  it("accepts lowercase hex", () => {
    expect(validateBrandColor("#ff0000")).toEqual({ valid: true });
  });

  it("accepts mixed case hex", () => {
    expect(validateBrandColor("#Aa1Bb2")).toEqual({ valid: true });
  });
});

describe("RULE-C03 anti: File Count accepts valid", () => {
  it("accepts 1 file", () => {
    expect(validateFileCount(1)).toEqual({ valid: true });
  });

  it("accepts 6 files", () => {
    expect(validateFileCount(6)).toEqual({ valid: true });
  });

  it("accepts 3 files", () => {
    expect(validateFileCount(3)).toEqual({ valid: true });
  });
});
