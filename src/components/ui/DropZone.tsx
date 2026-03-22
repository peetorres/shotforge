"use client";
import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

export function DropZone({ onFiles, accept = "image/png,image/jpeg", maxFiles = 8, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, maxFiles);
    onFiles(arr);
  }, [onFiles, maxFiles]);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      style={{
        border: `2px dashed ${isDragging ? "#0A84FF" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16,
        padding: 40,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isDragging ? "rgba(10,132,255,0.06)" : "transparent",
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = ""; // reset so same file can be selected again
          }
        }}
      />
      <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
      <p style={{ fontSize: 15, color: "#f5f5f7", fontWeight: 600, marginBottom: 6 }}>
        Drop screenshots here
      </p>
      <p style={{ fontSize: 13, color: "#98989d" }}>
        or <span style={{ color: "#0A84FF" }}>browse files</span>
      </p>
      <p style={{ fontSize: 11, color: "#48484a", marginTop: 8 }}>
        PNG or JPG · min 390×844px · max 8 files · 40MB total
      </p>
    </div>
  );
}
