import sharp from "sharp";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const ALLOWED_SHARP_FORMATS = ["png", "jpeg", "jpg"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MIN_WIDTH = 390;
const MIN_HEIGHT = 844;

export type UploadErrorCode = "INVALID_TYPE" | "TOO_SMALL" | "TOO_LARGE" | "INVALID_IMAGE";
export interface ValidationResult { valid: boolean; error?: UploadErrorCode; }

export async function validateUploadedFile(
  buffer: Buffer, filename: string, mimeType: string, size: number,
): Promise<ValidationResult> {
  // RULE-V03: File size check first (cheapest)
  if (size > MAX_FILE_BYTES) return { valid: false, error: "TOO_LARGE" };

  // RULE-V01: MIME type — check browser-reported type first
  // But also accept if sharp can verify it's a valid PNG/JPEG (browsers sometimes send wrong MIME)
  const mimeOk = ALLOWED_MIME_TYPES.includes(mimeType);

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return { valid: false, error: "INVALID_IMAGE" };
  }

  // Verify actual image format via sharp (ground truth)
  const formatOk = metadata.format ? ALLOWED_SHARP_FORMATS.includes(metadata.format) : false;

  if (!mimeOk && !formatOk) return { valid: false, error: "INVALID_TYPE" };

  // RULE-V02: Dimensions
  if (!metadata.width || !metadata.height) return { valid: false, error: "INVALID_IMAGE" };
  if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) return { valid: false, error: "TOO_SMALL" };

  return { valid: true };
}
