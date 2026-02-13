import { useCallback } from "react";
import type ForceGraph2D from "react-force-graph-2d";
import type { ContentNode } from "../../types";
import { useGraphStore } from "../../store/useGraphStore";

type GraphInstance = React.ComponentRef<typeof ForceGraph2D>;

// Shared module-level ref so all callers access the same graph instance
const graphRef = { current: undefined as GraphInstance | undefined };

export function useGraphInteraction() {
  const selectNode = useGraphStore(s => s.selectNode);
  const navigateToNode = useGraphStore(s => s.navigateToNode);
  const setHoveredNode = useGraphStore(s => s.setHoveredNode);

  const handleNodeClick = useCallback(
    (node: ContentNode & { x?: number; y?: number }) => {
      const currentSelected = useGraphStore.getState().selectedNodeId;
      if (currentSelected === node.id) return;

      navigateToNode(node.id);

      if (graphRef.current) {
        const targetZoom = 1.5;
        const panelOffset = 192 / targetZoom;
        graphRef.current.centerAt((node.x ?? 0) + panelOffset, node.y, 600);
        graphRef.current.zoom(targetZoom, 600);
      }
    },
    [navigateToNode]
  );

  const handleNodeHover = useCallback(
    (node: (ContentNode & { x?: number; y?: number }) | null) => {
      setHoveredNode(node?.id ?? null);
    },
    [setHoveredNode]
  );

  const handleBackgroundClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const zoomToNode = useCallback((nodeId: string) => {
    const { layout } = useGraphStore.getState();
    const pos = layout[nodeId];
    if (pos && graphRef.current) {
      navigateToNode(nodeId);
      const targetZoom = 1.5;
      const panelOffset = 192 / targetZoom;
      graphRef.current.centerAt(pos.x + panelOffset, pos.y, 600);
      graphRef.current.zoom(targetZoom, 600);
    }
  }, [navigateToNode]);

  return {
    graphRef,
    handleNodeClick,
    handleNodeHover,
    handleBackgroundClick,
    zoomToNode,
  };
}
