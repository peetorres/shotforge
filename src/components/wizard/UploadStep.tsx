"use client";
import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_TYPE: "Only PNG and JPG files are allowed.",
  TOO_SMALL: "Screenshot is too small. Minimum 390×844px required.",
  TOO_LARGE: "File exceeds 10MB limit.",
  INVALID_IMAGE: "File appears to be corrupted or invalid.",
  SESSION_TOO_LARGE: "Total upload exceeds 40MB. Remove some files and try again.",
  NO_FILES: "No files selected.",
};

interface UploadStepProps {
  sessionId: string;
  onComplete: (filenames: string[]) => void;
  onBack: () => void;
}

export function UploadStep({ sessionId, onComplete, onBack }: UploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [queued, setQueued] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!queued.length) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    queued.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(ERROR_MESSAGES[data.error] ?? `Upload failed: ${data.error} (${data.filename ?? ""})`);
        return;
      }

      onComplete(data.filenames as string[]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, width: "100%", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f5f5f7", letterSpacing: "-0.5px", marginBottom: 8 }}>
        Upload your screenshots
      </h2>
      <p style={{ color: "#98989d", fontSize: 15, marginBottom: 32 }}>
        Up to 8 screens. We'll auto-assign them to slides.
      </p>

      <DropZone onFiles={setQueued} disabled={uploading} />

      {queued.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {queued.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#161618", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#98989d" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#30D158", flexShrink: 0 }} />
              {f.name}
              <span style={{ marginLeft: "auto", color: "#48484a" }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: "#FF453A", fontSize: 13, marginTop: 12 }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button onClick={onBack} style={{ height: 52, padding: "0 24px", background: "#161618", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, fontSize: 15, fontWeight: 600, color: "#98989d", cursor: "pointer" }}>
          ← Back
        </button>
        <button
          onClick={handleUpload}
          disabled={!queued.length || uploading}
          style={{
            flex: 1, height: 52,
            background: queued.length && !uploading ? "#0A84FF" : "#1c1c1e",
            color: queued.length && !uploading ? "#fff" : "#48484a",
            borderRadius: 14, fontSize: 15, fontWeight: 700,
            border: "none", cursor: queued.length && !uploading ? "pointer" : "not-allowed",
          }}
        >
          {uploading ? "Uploading…" : `Upload ${queued.length ? `${queued.length} file${queued.length > 1 ? "s" : ""}` : "files"} →`}
        </button>
      </div>
    </div>
  );
}
