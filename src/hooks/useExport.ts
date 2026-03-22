import { useCallback, useRef } from "react";
import { useShotforgeStore } from "@/lib/store";

export function useExport() {
  const { project, isExporting, setIsExporting } = useShotforgeStore();
  const abortRef = useRef<AbortController | null>(null);

  const exportZip = useCallback(async () => {
    if (!project || isExporting) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsExporting(true);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: project.id,
          projectState: {
            brand: project.brand,
            description: project.description,
            brandColor: project.brandColor,
            style: project.style,
            slides: project.slides,
            uploadedFiles: project.uploadedFiles,
          },
          sizes: ["6.7", "6.1"],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[export] failed:", err);
        alert("Export failed. Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shotforge-${project.brand.toLowerCase().replace(/\s+/g, "-")}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        alert("Export failed. Please try again.");
      }
    } finally {
      setIsExporting(false);
    }
  }, [project, isExporting, setIsExporting]);

  return { exportZip, isExporting };
}
