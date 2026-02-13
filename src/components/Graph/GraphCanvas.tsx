import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useGraphStore } from "../../store/useGraphStore";
import { paintNode, NODE_WIDTH, NODE_HEIGHT } from "./nodeRenderer";
import { paintLink } from "./linkRenderer";
import { useGraphInteraction } from "./useGraphInteraction";
import { useLayoutAnimation } from "../../hooks/useLayoutAnimation";
import { useImageCache } from "../../hooks/useImageCache";
import type { ContentNode, ContentEdge } from "../../types";

export default function GraphCanvas() {
  const allNodes = useGraphStore(s => s.allNodes);
  const allEdges = useGraphStore(s => s.allEdges);
  const layout = useGraphStore(s => s.layout);
  const selectedNodeId = useGraphStore(s => s.selectedNodeId);
  const hoveredNodeId = useGraphStore(s => s.hoveredNodeId);
  const genreFilter = useGraphStore(s => s.genreFilter);
  const relationshipFilter = useGraphStore(s => s.relationshipFilter);
  const loadData = useGraphStore(s => s.loadData);
  const isLoading = useGraphStore(s => s.isLoading);

  const { graphRef, handleNodeClick, handleNodeHover, handleBackgroundClick } =
    useGraphInteraction();

  const { cache: imageCache, loadedCount } = useImageCache();

  // Animated position overrides — returns a new Map on each animation frame
  const posOverrides = useLayoutAnimation(layout, allEdges, selectedNodeId);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Start at a moderate zoom so titles are readable
  useEffect(() => {
    if (!isLoading && graphRef.current && allNodes.length > 0) {
      const fg = graphRef.current as { zoom?: (k: number, ms?: number) => void; centerAt?: (x?: number, y?: number, ms?: number) => void };
      const timer = setTimeout(() => {
        fg.centerAt?.(0, 0, 800);
        fg.zoom?.(0.6, 800);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, allNodes.length, graphRef]);

  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auto-drift when no node is selected
  const driftRef = useRef({ x: 0, y: 0, vx: 0.3, vy: 0.2 });
  const driftActiveRef = useRef(false);

  // Stop drift immediately when a node is selected (before React effect cleanup)
  useEffect(() => {
    if (selectedNodeId) {
      driftActiveRef.current = false;
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (selectedNodeId || isLoading || Object.keys(layout).length === 0) {
      driftActiveRef.current = false;
      return;
    }

    const fg = graphRef.current as {
      centerAt?: (x?: number, y?: number, ms?: number) => void;
    } | undefined;
    if (!fg?.centerAt) return;

    // Compute layout bounds
    const positions = Object.values(layout);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of positions) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    // Shrink bounds so camera doesn't pan to empty space at edges
    const padX = (maxX - minX) * 0.25;
    const padY = (maxY - minY) * 0.25;
    minX += padX; maxX -= padX;
    minY += padY; maxY -= padY;

    const drift = driftRef.current;
    drift.x = 0;
    drift.y = 0;

    let frame: number;
    const step = () => {
      if (!driftActiveRef.current) return;

      drift.x += drift.vx;
      drift.y += drift.vy;

      if (drift.x < minX || drift.x > maxX) {
        drift.vx *= -1;
        drift.x = Math.max(minX, Math.min(maxX, drift.x));
      }
      if (drift.y < minY || drift.y > maxY) {
        drift.vy *= -1;
        drift.y = Math.max(minY, Math.min(maxY, drift.y));
      }

      fg.centerAt!(drift.x, drift.y);
      frame = requestAnimationFrame(step);
    };

    // Small delay so initial zoom animation finishes first
    const timer = setTimeout(() => {
      if (!driftActiveRef.current) return;
      frame = requestAnimationFrame(step);
    }, 1200);

    driftActiveRef.current = true;

    return () => {
      driftActiveRef.current = false;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [selectedNodeId, isLoading, layout, graphRef]);

  const graphData = useMemo(() => {
    let nodes = allNodes;
    let edges = allEdges;

    if (genreFilter.size > 0) {
      nodes = nodes.filter(n => n.genres.some(g => genreFilter.has(g)));
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    if (relationshipFilter.size > 0) {
      edges = edges.filter(e => relationshipFilter.has(e.relationship));
    }

    // Apply base layout positions as fixed coordinates
    const positionedNodes = nodes.map(n => {
      const pos = layout[n.id];
      return pos
        ? { ...n, fx: pos.x, fy: pos.y, x: pos.x, y: pos.y }
        : n;
    });

    return {
      nodes: positionedNodes as (ContentNode & { x?: number; y?: number; fx?: number; fy?: number })[],
      links: edges as (ContentEdge & {
        source: string | { id?: string; x?: number; y?: number };
        target: string | { id?: string; x?: number; y?: number };
      })[],
    };
  }, [allNodes, allEdges, layout, genreFilter, relationshipFilter]);

  const nodeCanvasObject = useCallback(
    (
      node: ContentNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Use animated position override if available
      const override = posOverrides.get(node.id);
      const renderNode = override
        ? { ...node, x: override.x, y: override.y }
        : node;
      paintNode(renderNode, ctx, globalScale, selectedNodeId, hoveredNodeId, imageCache);
    },
    [selectedNodeId, hoveredNodeId, posOverrides, imageCache, loadedCount]
  );

  const nodePointerAreaPaint = useCallback(
    (
      node: ContentNode & { x?: number; y?: number },
      color: string,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Use animated position override for hit detection too
      const override = posOverrides.get(node.id);
      const x = override ? override.x : (node.x ?? 0);
      const y = override ? override.y : (node.y ?? 0);
      ctx.fillStyle = color;
      if (globalScale < 0.6) {
        const r = 12 / globalScale;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        const w = NODE_WIDTH / globalScale;
        const h = NODE_HEIGHT / globalScale;
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
      }
    },
    [posOverrides]
  );

  const linkCanvasObject = useCallback(
    (
      link: ContentEdge & {
        source: string | { id?: string; x?: number; y?: number };
        target: string | { id?: string; x?: number; y?: number };
      },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Override link endpoint positions with animated positions
      const srcId = typeof link.source === "string" ? link.source : link.source?.id ?? "";
      const tgtId = typeof link.target === "string" ? link.target : link.target?.id ?? "";
      const srcPos = posOverrides.get(srcId);
      const tgtPos = posOverrides.get(tgtId);

      let renderLink = link;
      if (srcPos || tgtPos) {
        renderLink = { ...link };
        if (srcPos && typeof link.source === "object") {
          renderLink = { ...renderLink, source: { ...link.source, x: srcPos.x, y: srcPos.y } };
        }
        if (tgtPos && typeof link.target === "object") {
          renderLink = { ...renderLink, target: { ...link.target, x: tgtPos.x, y: tgtPos.y } };
        }
      }

      paintLink(renderLink as never, ctx, globalScale, selectedNodeId);
    },
    [selectedNodeId, posOverrides]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-lg text-slate-400 animate-pulse">Loading universe...</div>
      </div>
    );
  }


  const stopDrift = useCallback(() => {
    driftActiveRef.current = false;
  }, []);

  return (
    <div onPointerDown={stopDrift}>
      <ForceGraph2D
        ref={graphRef as never}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject as never}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={nodePointerAreaPaint as never}
        linkCanvasObject={linkCanvasObject as never}
        linkCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick as never}
        onNodeHover={handleNodeHover as never}
        onBackgroundClick={handleBackgroundClick}
        linkCurvature={0.15}
        cooldownTicks={100}
        backgroundColor="#0a0a1a"
        nodeRelSize={6}
        enableNodeDrag={false}
        minZoom={0.2}
        maxZoom={5}
      />
    </div>
  );
}
