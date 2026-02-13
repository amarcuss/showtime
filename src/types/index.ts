export interface ContentNode {
  id: string;
  title: string;
  year: number;
  endYear?: number;
  type: "movie" | "tv";
  genres: string[];
  director?: string;
  creators?: string[];
  cast: string[];
  rating: number;
  summary: string;
  posterUrl?: string;
  isSeed?: boolean;
}

export interface ContentEdge {
  source: string;
  target: string;
  relationship: string;
  label: string;
  strength: number;
}

export type RelationshipType =
  | "shared_actor"
  | "shared_director"
  | "same_franchise"
  | "genre_thematic"
  | "cinematography"
  | "composer"
  | "influence"
  | "shared_producer"
  | "same_creator"
  | "spiritual_successor";
