import { useMemo } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { getEdgesForNode } from "../../utils/graph";
import { getEdgeColor } from "../../utils/colors";
import type { ContentEdge } from "../../types";

interface Props {
  nodeId: string;
  onNavigate: (id: string) => void;
}

export default function ConnectionList({ nodeId, onNavigate }: Props) {
  const allEdges = useGraphStore(s => s.allEdges);
  const nodeMap = useGraphStore(s => s.nodeMap);

  const connections = useMemo(() => {
    const edges = getEdgesForNode(nodeId, allEdges);
    return edges.map(edge => {
      const src = typeof edge.source === "string" ? edge.source : (edge.source as { id?: string }).id ?? "";
      const tgt = typeof edge.target === "string" ? edge.target : (edge.target as { id?: string }).id ?? "";
      const otherId = src === nodeId ? tgt : src;
      const otherNode = nodeMap.get(otherId);
      return { edge, otherId, otherTitle: otherNode?.title ?? otherId };
    });
  }, [nodeId, allEdges, nodeMap]);

  // Group by relationship type
  const grouped = useMemo(() => {
    const map = new Map<string, { edge: ContentEdge; otherId: string; otherTitle: string }[]>();
    for (const c of connections) {
      const key = c.edge.relationship;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries());
  }, [connections]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Connections ({connections.length})
      </h3>
      {grouped.map(([relType, items]) => (
        <div key={relType}>
          <div
            className="text-xs font-medium mb-1 flex items-center gap-1.5"
            style={{ color: getEdgeColor(relType) }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: getEdgeColor(relType) }}
            />
            {relType.replace(/_/g, " ")}
          </div>
          <div className="space-y-1">
            {items.map(({ edge, otherId, otherTitle }) => (
              <button
                key={otherId}
                onClick={() => onNavigate(otherId)}
                className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/5 transition-colors group"
              >
                <div className="text-slate-200 group-hover:text-white">
                  {otherTitle}
                </div>
                <div className="text-xs text-slate-500 group-hover:text-slate-400">
                  {edge.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
