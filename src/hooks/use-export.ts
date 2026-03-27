/**
 * useExport — ZIP export with download trigger
 *
 * Canonical: RULE-E01..E05, API_CONTRACTS.md
 * RG-006: Errors must be surfaced, never silent
 */

import { useCallback } from "react";
import type { Variant, AppStyle } from "@/domain/types";

interface UseExportOptions {
  sessionId: string | null;
  brand: string;
  brandColor: string;
  variant: Variant | null;
  uploadedFiles: string[];
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;
}

export function useExport(opts: UseExportOptions) {
  const { sessionId, brand, brandColor, variant, uploadedFiles, isExporting, setIsExporting } = opts;

  const exportZip = useCallback(async () => {
    if (!sessionId || !variant || isExporting) return;

    setIsExporting(true);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          projectState: {
            brand,
            brandColor,
            style: variant.style as AppStyle,
            slides: variant.slides,
            uploadedFiles,
          },
          sizes: ["6.7", "6.1"],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[export] failed:", err);
        // RG-006: Surface error to user
        throw new Error(err.error || "EXPORT_FAILED");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shotforge-${brand.toLowerCase().replace(/\s+/g, "-")}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      // RG-006: Never fail silently
      const message = e instanceof Error ? e.message : "Export failed";
      console.error("[export]", message);
      alert(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
    }
  }, [sessionId, brand, brandColor, variant, uploadedFiles, isExporting, setIsExporting]);

  return { exportZip };
}
