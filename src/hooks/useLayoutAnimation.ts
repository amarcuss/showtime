import { useEffect, useRef, useState } from "react";
import { getNeighborIds } from "../utils/graph";
import type { ContentEdge } from "../types";
import type { NodeLayout } from "../data/loader";

interface Pos { x: number; y: number }

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const ANIM_DURATION = 500;
const NEIGHBOR_RADIUS = 200;
const PUSH_CLEARANCE = 160;

export type PosOverrides = Map<string, Pos>;

/**
 * Computes animated positions for all nodes.
 * Returns a Map of node id -> {x, y} that changes on every animation frame,
 * causing React re-renders that force ForceGraph2D to redraw.
 */
export function useLayoutAnimation(
  layout: NodeLayout,
  allEdges: ContentEdge[],
  selectedNodeId: string | null,
): PosOverrides {
  const [positions, setPositions] = useState<PosOverrides>(new Map());
  const animFrameRef = useRef(0);
  const hadSelectionRef = useRef(false);
  // Keep a mutable copy of latest positions for snapshotting at start of next animation
  const latestPosRef = useRef<PosOverrides>(new Map());

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const allNodeIds = Object.keys(layout);
    if (allNodeIds.length === 0) return;

    // Skip animation on initial load (no selection yet, nothing to animate)
    if (!selectedNodeId && !hadSelectionRef.current) return;
    if (selectedNodeId) hadSelectionRef.current = true;

    // Snapshot: current positions (from latest animation state), or fall back to base layout
    const snapshot: Record<string, Pos> = {};
    for (const id of allNodeIds) {
      const override = latestPosRef.current.get(id);
      if (override) {
        snapshot[id] = { x: override.x, y: override.y };
      } else if (layout[id]) {
        snapshot[id] = { x: layout[id].x, y: layout[id].y };
      }
    }

    // Compute targets
    const targets: Record<string, Pos> = {};

    if (selectedNodeId && layout[selectedNodeId]) {
      const center = layout[selectedNodeId];
      const neighborIds = new Set(getNeighborIds(selectedNodeId, allEdges));

      // Sort neighbors by original angle to minimize crossings
      const neighborList = [...neighborIds]
        .filter(id => layout[id])
        .map(id => {
          const orig = layout[id];
          const angle = Math.atan2(orig.y - center.y, orig.x - center.x);
          return { id, angle };
        })
        .sort((a, b) => a.angle - b.angle);

      // Place neighbors in a circle around selected node
      neighborList.forEach(({ id }, i) => {
        const angle = (2 * Math.PI * i) / neighborList.length - Math.PI / 2;
        targets[id] = {
          x: center.x + NEIGHBOR_RADIUS * Math.cos(angle),
          y: center.y + NEIGHBOR_RADIUS * Math.sin(angle),
        };
      });

      // Push non-neighbor tiles out of the zone
      const pushZone = NEIGHBOR_RADIUS + PUSH_CLEARANCE;
      for (const id of allNodeIds) {
        if (id === selectedNodeId || neighborIds.has(id)) continue;
        if (targets[id]) continue;

        const orig = layout[id];
        if (!orig) continue;

        const dx = orig.x - center.x;
        const dy = orig.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pushZone && dist > 0) {
          const angle = Math.atan2(dy, dx);
          targets[id] = {
            x: center.x + (pushZone + 20) * Math.cos(angle),
            y: center.y + (pushZone + 20) * Math.sin(angle),
          };
        }
      }
    }

    // All nodes not in targets return to their base layout position
    for (const id of allNodeIds) {
      if (!targets[id] && layout[id]) {
        targets[id] = { x: layout[id].x, y: layout[id].y };
      }
    }

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / ANIM_DURATION);
      const eased = easeInOutCubic(t);

      const newPositions = new Map<string, Pos>();
      for (const id of allNodeIds) {
        const from = snapshot[id];
        const to = targets[id];
        if (!from || !to) continue;
        newPositions.set(id, {
          x: lerp(from.x, to.x, eased),
          y: lerp(from.y, to.y, eased),
        });
      }

      latestPosRef.current = newPositions;
      setPositions(newPositions);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedNodeId, layout, allEdges]);

  return positions;
}
