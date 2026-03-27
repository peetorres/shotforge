/**
 * Domain Rules — Business Rule Validators
 *
 * Canonical source: SHOTFORGE_CANON.md §5, §5.7
 * Each function maps to a RULE-* identifier.
 * Tests: rules.test.ts (rejection) + rules.anti.test.ts (acceptance)
 */

// ─── Result Type ────────────────────────────────

interface RulePass {
  readonly valid: true;
}

interface RuleFail {
  readonly valid: false;
  readonly error: string;
}

export type RuleResult = RulePass | RuleFail;

const pass: RuleResult = { valid: true };
const fail = (error: string): RuleResult => ({ valid: false, error });

// ─── RULE-C01: App Name ─────────────────────────

export function validateAppName(value: string): RuleResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) return fail("APP_NAME_REQUIRED");
  if (trimmed.length > 60) return fail("APP_NAME_TOO_LONG");
  return pass;
}

// ─── RULE-C02: Description ──────────────────────

export function validateDescription(value: string): RuleResult {
  const trimmed = value.trim();
  if (trimmed.length < 10) return fail("DESCRIPTION_TOO_SHORT");
  if (trimmed.length > 500) return fail("DESCRIPTION_TOO_LONG");
  return pass;
}

// ─── RULE-V05: Brand Color ──────────────────────

export function validateBrandColor(value: string): RuleResult {
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return fail("INVALID_COLOR");
  return pass;
}

// ─── RULE-V01: File MIME Type ───────────────────

const ALLOWED_MIMES = ["image/png", "image/jpeg"];

export function validateFileMime(mime: string): RuleResult {
  if (!ALLOWED_MIMES.includes(mime)) return fail("INVALID_TYPE");
  return pass;
}

// ─── RULE-V03: File Size ────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateFileSize(bytes: number): RuleResult {
  if (bytes > MAX_FILE_BYTES) return fail("TOO_LARGE");
  return pass;
}

// ─── RULE-V02: File Dimensions ──────────────────

const MIN_WIDTH = 390;
const MIN_HEIGHT = 844;

export function validateFileDimensions(width: number, height: number): RuleResult {
  if (width < MIN_WIDTH || height < MIN_HEIGHT) return fail("TOO_SMALL");
  return pass;
}

// ─── RULE-V04: Total Upload Size ────────────────

const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40MB

export function validateTotalUploadSize(totalBytes: number): RuleResult {
  if (totalBytes > MAX_TOTAL_BYTES) return fail("SESSION_TOO_LARGE");
  return pass;
}

// ─── RULE-C03: File Count ───────────────────────

const MIN_FILES = 1;
const MAX_FILES = 6;

export function validateFileCount(count: number): RuleResult {
  if (count < MIN_FILES) return fail("NO_FILES");
  if (count > MAX_FILES) return fail("TOO_MANY_FILES");
  return pass;
}
