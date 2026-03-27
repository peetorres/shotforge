"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SlideConfig } from "@appforge/screenshot-gen";
import type { AppStyle } from "@/domain/types";

interface PreviewCacheOptions {
  sessionId: string | null;
  slides: SlideConfig[];
  brand: string;
  brandColor: string;
  style: AppStyle;
}

/**
 * Fetches real server-rendered previews for all slides.
 * Returns a map of slideIndex → base64 data URI.
 * Fetches visible slides first (sequential, debounced).
 */
export function usePreviewCache(opts: PreviewCacheOptions) {
  const { sessionId, slides, brand, brandColor, style } = opts;
  const [cache, setCache] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchPreview = useCallback(async (slideIndex: number, slide: SlideConfig) => {
    if (!sessionId) return;

    const cacheKey = `${sessionId}:${slideIndex}:${brandColor}:${style}`;
    if (fetchedRef.current.has(cacheKey)) return;
    fetchedRef.current.add(cacheKey);

    setLoading((prev) => ({ ...prev, [slideIndex]: true }));

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          slide,
          brand,
          brandColor,
          style,
          outputSize: "6.7",
        }),
        signal: abortRef.current?.signal,
      });

      if (res.ok) {
        const data = await res.json();
        setCache((prev) => ({ ...prev, [slideIndex]: `data:image/png;base64,${data.image}` }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        fetchedRef.current.delete(cacheKey);
      }
    } finally {
      setLoading((prev) => ({ ...prev, [slideIndex]: false }));
    }
  }, [sessionId, brand, brandColor, style]);

  // Fetch all slides sequentially on mount or when deps change
  useEffect(() => {
    if (!sessionId || slides.length === 0) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    fetchedRef.current.clear();
    setCache({});

    async function fetchAll() {
      for (let i = 0; i < slides.length; i++) {
        await fetchPreview(i, slides[i]);
      }
    }

    fetchAll();

    return () => { abortRef.current?.abort(); };
  }, [sessionId, slides, brand, brandColor, style, fetchPreview]);

  return { cache, loading };
}
