import { create } from "zustand";
import type { ContentNode, ContentEdge } from "../types";
import { fetchNodes, fetchEdges, fetchLayout } from "../data/loader";
import type { NodeLayout } from "../data/loader";

interface GraphState {
  allNodes: ContentNode[];
  allEdges: ContentEdge[];
  nodeMap: Map<string, ContentNode>;
  layout: NodeLayout;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  history: string[];
  genreFilter: Set<string>;
  relationshipFilter: Set<string>;
  allGenres: string[];
  allRelationships: string[];
  searchQuery: string;
  isLoading: boolean;

  loadData: () => Promise<void>;
  selectNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  toggleGenre: (genre: string) => void;
  toggleRelationship: (rel: string) => void;
  setSearchQuery: (q: string) => void;
  resetView: () => void;
  navigateToNode: (id: string) => void;
  goBack: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  allNodes: [],
  allEdges: [],
  nodeMap: new Map(),
  layout: {},
  selectedNodeId: null,
  hoveredNodeId: null,
  history: [],
  genreFilter: new Set(),
  relationshipFilter: new Set(),
  allGenres: [],
  allRelationships: [],
  searchQuery: "",
  isLoading: true,

  loadData: async () => {
    const [nodes, edges, layout] = await Promise.all([fetchNodes(), fetchEdges(), fetchLayout()]);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const genres = new Set<string>();
    const relationships = new Set<string>();
    for (const n of nodes) n.genres.forEach(g => genres.add(g));
    for (const e of edges) relationships.add(e.relationship);

    set({
      allNodes: nodes,
      allEdges: edges,
      nodeMap,
      layout,
      allGenres: Array.from(genres).sort(),
      allRelationships: Array.from(relationships).sort(),
      isLoading: false,
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  toggleGenre: (genre) => {
    const { genreFilter } = get();
    const next = new Set(genreFilter);
    if (next.has(genre)) next.delete(genre);
    else next.add(genre);
    set({ genreFilter: next });
  },

  toggleRelationship: (rel) => {
    const { relationshipFilter } = get();
    const next = new Set(relationshipFilter);
    if (next.has(rel)) next.delete(rel);
    else next.add(rel);
    set({ relationshipFilter: next });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  resetView: () => {
    set({
      selectedNodeId: null,
      history: [],
      genreFilter: new Set(),
      relationshipFilter: new Set(),
      searchQuery: "",
    });
  },

  navigateToNode: (id) => {
    const { selectedNodeId, history } = get();
    const newHistory = selectedNodeId
      ? [...history, selectedNodeId]
      : [...history];

    set({
      selectedNodeId: id,
      history: newHistory,
    });
  },

  goBack: () => {
    const { history } = get();
    if (history.length === 0) {
      set({ selectedNodeId: null });
      return;
    }
    const newHistory = [...history];
    const prevId = newHistory.pop()!;
    set({
      selectedNodeId: prevId,
      history: newHistory,
    });
  },
}));
