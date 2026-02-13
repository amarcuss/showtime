import type { ContentNode, ContentEdge } from "../types";

export interface NodeLayout {
  [nodeId: string]: { x: number; y: number; community: number };
}

export async function fetchNodes(): Promise<ContentNode[]> {
  const res = await fetch("/data/nodes.json");
  return res.json();
}

export async function fetchEdges(): Promise<ContentEdge[]> {
  const res = await fetch("/data/edges.json");
  return res.json();
}

export async function fetchLayout(): Promise<NodeLayout> {
  const res = await fetch("/data/layout.json");
  return res.json();
}
