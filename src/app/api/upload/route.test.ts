import { describe, it, expect } from "vitest";
import { validateUploadedFile } from "./validation";

describe("validateUploadedFile", () => {
  it("rejects non-image MIME types", async () => {
    const fakeFile = new File(["data"], "file.txt", { type: "text/plain" });
    const buffer = Buffer.from(await fakeFile.arrayBuffer());
    const result = await validateUploadedFile(buffer, fakeFile.name, fakeFile.type, fakeFile.size);
    expect(result).toEqual({ valid: false, error: "INVALID_TYPE" });
  });

  it("rejects files over 10MB", async () => {
    const buffer = Buffer.alloc(11 * 1024 * 1024);
    const result = await validateUploadedFile(buffer, "big.png", "image/png", buffer.length);
    expect(result).toEqual({ valid: false, error: "TOO_LARGE" });
  });

  it("returns TOO_SMALL for undersized valid PNG", async () => {
    const pngBuffer = Buffer.from(
      "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c48900000" +
      "00a49444154789c6260000000000200e221bc330000000049454e44ae426082", "hex"
    );
    const result = await validateUploadedFile(pngBuffer, "test.png", "image/png", pngBuffer.length);
    expect(result.error).toBe("TOO_SMALL");
  });

  it("rejects MIME before checking total size", async () => {
    const buffer = Buffer.alloc(11 * 1024 * 1024, "a");
    const result = await validateUploadedFile(buffer, "large.txt", "text/plain", buffer.length);
    expect(result.error).toBe("INVALID_TYPE");
  });
});
