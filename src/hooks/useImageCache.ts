import { useEffect, useRef, useState, useCallback } from "react";
import { useGraphStore } from "../store/useGraphStore";

export function useImageCache() {
  const allNodes = useGraphStore(s => s.allNodes);
  const cache = useRef(new Map<string, HTMLImageElement>());
  const [loadedCount, setLoadedCount] = useState(0);
  const pendingRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (pendingRef.current > 0) {
      setLoadedCount(c => c + pendingRef.current);
      pendingRef.current = 0;
    }
    flushTimerRef.current = null;
  }, []);

  useEffect(() => {
    for (const node of allNodes) {
      if (node.posterUrl && !cache.current.has(node.id)) {
        const img = new Image();
        img.onload = () => {
          pendingRef.current++;
          // Batch updates: flush every 10 images or after a short delay
          if (pendingRef.current >= 10) {
            flush();
          } else if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(flush, 100);
          }
        };
        img.src = node.posterUrl;
        cache.current.set(node.id, img);
      }
    }
  }, [allNodes, flush]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

  return { cache: cache.current, loadedCount };
}
