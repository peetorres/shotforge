import sharp from "sharp";
import type { UploadErrorCode } from "@/lib/types";

const ALLOWED_TYPES = ["image/png", "image/jpeg"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MIN_WIDTH = 390;
const MIN_HEIGHT = 844;

export interface ValidationResult { valid: boolean; error?: UploadErrorCode; }

export async function validateUploadedFile(
  buffer: Buffer, filename: string, mimeType: string, size: number,
): Promise<ValidationResult> {
  if (!ALLOWED_TYPES.includes(mimeType)) return { valid: false, error: "INVALID_TYPE" };
  if (size > MAX_FILE_BYTES) return { valid: false, error: "TOO_LARGE" };
  let metadata: sharp.Metadata;
  try { metadata = await sharp(buffer).metadata(); } catch { return { valid: false, error: "INVALID_IMAGE" }; }
  if (!metadata.width || !metadata.height) return { valid: false, error: "INVALID_IMAGE" };
  if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) return { valid: false, error: "TOO_SMALL" };
  return { valid: true };
}
