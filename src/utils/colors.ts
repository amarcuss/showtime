export const GENRE_COLORS: Record<string, string> = {
  Action: "#ef4444",
  Adventure: "#f97316",
  Animation: "#a855f7",
  Comedy: "#facc15",
  Crime: "#6b7280",
  Documentary: "#22d3ee",
  Drama: "#3b82f6",
  Family: "#f472b6",
  Fantasy: "#8b5cf6",
  Horror: "#991b1b",
  Mystery: "#6366f1",
  Romance: "#ec4899",
  "Sci-Fi": "#06b6d4",
  Thriller: "#dc2626",
  War: "#78716c",
  Western: "#d97706",
  Musical: "#e879f9",
  Biography: "#14b8a6",
  History: "#a16207",
  Sport: "#22c55e",
};

export function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] ?? "#8b5cf6";
}

export function getNodeBorderColor(genres: string[]): string {
  return genres.length > 0 ? getGenreColor(genres[0]) : "#8b5cf6";
}

export const EDGE_TYPE_COLORS: Record<string, string> = {
  shared_actor: "#60a5fa",
  shared_director: "#f59e0b",
  same_franchise: "#34d399",
  genre_thematic: "#a78bfa",
  cinematography: "#fb923c",
  composer: "#f472b6",
  influence: "#818cf8",
  shared_producer: "#2dd4bf",
  same_creator: "#fbbf24",
  spiritual_successor: "#c084fc",
};

export function getEdgeColor(relationship: string): string {
  return EDGE_TYPE_COLORS[relationship] ?? "#6b7280";
}

export const RELATIONSHIP_LABELS: Record<string, string> = {
  shared_actor: "Shared Actor",
  shared_director: "Shared Director",
  same_franchise: "Same Franchise",
  genre_thematic: "Thematic",
  cinematography: "Cinematography",
  composer: "Shared Composer",
  influence: "Influence",
  shared_producer: "Shared Producer",
  same_creator: "Same Creator",
  spiritual_successor: "Spiritual Successor",
};
