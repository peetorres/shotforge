"use client";

import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function DropZone({ onFiles, maxFiles = 6, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList)
        .filter((f) => f.type === "image/png" || f.type === "image/jpeg")
        .slice(0, maxFiles);
      if (arr.length > 0) onFiles(arr);
    },
    [onFiles, maxFiles],
  );

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload screenshots"
      style={{
        border: `2px dashed ${isDragging ? "var(--indigo)" : "var(--border-input)"}`,
        borderRadius: 16, padding: 24, textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isDragging ? "rgba(99,102,241,0.04)" : "transparent",
        transition: "all 0.2s var(--ease)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
      <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.5 }}>📱</div>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Drop screenshots here</p>
      <p style={{ fontSize: 11, color: "var(--text-3)" }}>PNG/JPG · up to 6 files</p>
    </div>
  );
}
