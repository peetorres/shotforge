"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/shared/drop-zone";
import { ColorPicker } from "@/components/shared/color-picker";
import { ScreenshotGrid } from "./screenshot-grid";

export interface CreateFormData {
  brand: string;
  description: string;
  brandColor: string;
  files: File[];
}

interface CreateFormProps {
  onSubmit: (data: CreateFormData) => void;
  isSubmitting?: boolean;
}

export function CreateForm({ onSubmit, isSubmitting }: CreateFormProps) {
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [files, setFiles] = useState<File[]>([]);

  // RULE-C05: Generate enabled when name (C01) + at least 1 file (C03)
  const canSubmit = brand.trim().length > 0 && files.length > 0 && !isSubmitting;

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 6); // RULE-C03: max 6
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ brand: brand.trim(), description: description.trim(), brandColor, files });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg)",
    border: "1px solid var(--border-input)", borderRadius: 12,
    padding: "12px 16px", fontSize: 15, color: "var(--text)",
    transition: "all 0.15s var(--ease)",
  };

  return (
    <div
      style={{
        maxWidth: 540, width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* App Name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
          App Name
        </label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Sensei"
          autoComplete="off"
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
          What does your app do?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Gamified learning platform for business with daily challenges, streaks, and AI-powered paths."
          rows={3}
          style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
        />
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5 }}>
          Be specific — this powers the AI copy for each slide.
        </p>
      </div>

      {/* Screenshots */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
          Screenshots (up to 6)
        </label>
        {files.length < 6 && (
          <div style={{ marginBottom: 10 }}>
            <DropZone
              onFiles={handleFiles}
              maxFiles={6 - files.length}
              disabled={isSubmitting}
            />
          </div>
        )}
        <ScreenshotGrid files={files} onRemove={handleRemove} />
      </div>

      {/* Brand Color */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
          Brand Color
        </label>
        <ColorPicker value={brandColor} onChange={setBrandColor} />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: "100%", height: 52, borderRadius: 14,
          fontSize: 16, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: canSubmit
            ? "linear-gradient(135deg, var(--indigo), var(--purple))"
            : "var(--surface-2)",
          color: canSubmit ? "#fff" : "var(--text-3)",
          cursor: canSubmit ? "pointer" : "not-allowed",
          boxShadow: canSubmit ? "0 8px 32px rgba(99,102,241,0.3)" : "none",
          transition: "all 0.2s var(--ease)",
        }}
      >
        {isSubmitting ? "Generating..." : "✦ Generate 3 Variations"}
      </button>
    </div>
  );
}
