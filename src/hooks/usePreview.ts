import { useCallback, useEffect, useRef, useState } from "react";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/lib/style-colors";
import type { PreviewSuccessResponse } from "@/lib/types";

interface UsePreviewOptions {
  sessionId: string | null;
  slide: SlideConfig | null;
  brand: string;
  brandColor: string;
  style: AppStyle;
  outputSize?: "6.7" | "6.1";
}

export function usePreview(opts: UsePreviewOptions) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!opts.sessionId || !opts.slide) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: opts.sessionId,
          slide: opts.slide,
          brand: opts.brand,
          brandColor: opts.brandColor,
          style: opts.style,
          outputSize: opts.outputSize ?? "6.7",
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "RENDER_FAILED");
        return;
      }

      const data: PreviewSuccessResponse = await res.json();
      setPreviewSrc(`data:image/png;base64,${data.image}`);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("RENDER_FAILED");
      }
    } finally {
      setIsLoading(false);
    }
  }, [opts.sessionId, opts.slide, opts.brand, opts.brandColor, opts.style, opts.outputSize]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchPreview, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [fetchPreview]);

  return { previewSrc, isLoading, error };
}
