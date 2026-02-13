import { useEffect } from "react";
import { useGraphStore } from "../store/useGraphStore";
import { getNeighborIds } from "../utils/graph";

export function useKeyboardNav(
  zoomToNode: (id: string) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedNodeId, allEdges, allNodes, selectNode } =
        useGraphStore.getState();

      if (e.key === "Escape") {
        selectNode(null);
        return;
      }

      if (!selectedNodeId) return;

      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const neighbors = getNeighborIds(selectedNodeId, allEdges);
        if (neighbors.length === 0) return;

        const currentNode = allNodes.find(n => n.id === selectedNodeId) as
          | (typeof allNodes[number] & { x?: number; y?: number })
          | undefined;
        if (!currentNode) return;

        // Sort neighbors by direction
        const sorted = neighbors
          .map(id => {
            const n = allNodes.find(n2 => n2.id === id) as
              | (typeof allNodes[number] & { x?: number; y?: number })
              | undefined;
            return n ? { id, x: n.x ?? 0, y: n.y ?? 0 } : null;
          })
          .filter(Boolean) as { id: string; x: number; y: number }[];

        const cx = currentNode.x ?? 0;
        const cy = currentNode.y ?? 0;

        let best: string | null = null;
        if (e.key === "ArrowRight") {
          const right = sorted.filter(n => n.x > cx).sort((a, b) => a.x - b.x);
          best = right[0]?.id ?? sorted[0]?.id ?? null;
        } else if (e.key === "ArrowLeft") {
          const left = sorted.filter(n => n.x < cx).sort((a, b) => b.x - a.x);
          best = left[0]?.id ?? sorted[0]?.id ?? null;
        } else if (e.key === "ArrowUp") {
          const up = sorted.filter(n => n.y < cy).sort((a, b) => b.y - a.y);
          best = up[0]?.id ?? sorted[0]?.id ?? null;
        } else if (e.key === "ArrowDown") {
          const down = sorted.filter(n => n.y > cy).sort((a, b) => a.y - b.y);
          best = down[0]?.id ?? sorted[0]?.id ?? null;
        }

        if (best) zoomToNode(best);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomToNode]);
}
