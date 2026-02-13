import type { ContentNode, ContentEdge } from "../types";

// react-force-graph-2d mutates source/target from strings to node objects at runtime
function edgeId(val: string | { id?: string }): string {
  return typeof val === "string" ? val : val.id ?? "";
}

export function getNeighborIds(nodeId: string, edges: ContentEdge[]): string[] {
  const neighbors = new Set<string>();
  for (const edge of edges) {
    const src = edgeId(edge.source as string | { id?: string });
    const tgt = edgeId(edge.target as string | { id?: string });
    if (src === nodeId) neighbors.add(tgt);
    if (tgt === nodeId) neighbors.add(src);
  }
  return Array.from(neighbors);
}

export function getEdgesForNode(nodeId: string, edges: ContentEdge[]): ContentEdge[] {
  return edges.filter(e => {
    const src = edgeId(e.source as string | { id?: string });
    const tgt = edgeId(e.target as string | { id?: string });
    return src === nodeId || tgt === nodeId;
  });
}

export function filterVisibleGraph(
  allNodes: ContentNode[],
  allEdges: ContentEdge[],
  visibleIds: Set<string>
): { nodes: ContentNode[]; edges: ContentEdge[] } {
  const nodes = allNodes.filter(n => visibleIds.has(n.id));
  const edges = allEdges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
  return { nodes, edges };
}

export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}
