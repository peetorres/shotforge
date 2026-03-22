import { useCallback } from "react";
import { useShotforgeStore } from "@/lib/store";

export function useExport() {
  const { project, isExporting, setIsExporting } = useShotforgeStore();

  const exportZip = useCallback(async () => {
    if (!project || isExporting) return;
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
      // Delay revoke — some browsers download asynchronously after click
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      setIsExporting(false);
    }
  }, [project, isExporting, setIsExporting]);

  return { exportZip, isExporting };
}
