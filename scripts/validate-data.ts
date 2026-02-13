import { readFileSync } from "fs";
import { join } from "path";

interface ContentNode {
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
  isSeed?: boolean;
}

interface ContentEdge {
  source: string;
  target: string;
  relationship: string;
  label: string;
  strength: number;
}

const dataDir = join(import.meta.dirname, "..", "public", "data");

const nodes: ContentNode[] = JSON.parse(readFileSync(join(dataDir, "nodes.json"), "utf-8"));
const edges: ContentEdge[] = JSON.parse(readFileSync(join(dataDir, "edges.json"), "utf-8"));

const nodeIds = new Set(nodes.map(n => n.id));
let errors = 0;

// Check for duplicate node IDs
const idCounts = new Map<string, number>();
for (const n of nodes) {
  idCounts.set(n.id, (idCounts.get(n.id) ?? 0) + 1);
}
for (const [id, count] of idCounts) {
  if (count > 1) {
    console.error(`DUPLICATE NODE ID: "${id}" appears ${count} times`);
    errors++;
  }
}

// Check node fields
for (const n of nodes) {
  if (!n.id || !n.title || !n.year || !n.type || !n.genres?.length || !n.cast?.length || !n.rating || !n.summary) {
    console.error(`INCOMPLETE NODE: "${n.id}" missing required fields`);
    errors++;
  }
  if (n.type !== "movie" && n.type !== "tv") {
    console.error(`INVALID TYPE: "${n.id}" has type "${n.type}"`);
    errors++;
  }
  if (n.rating < 1 || n.rating > 10) {
    console.error(`INVALID RATING: "${n.id}" has rating ${n.rating}`);
    errors++;
  }
}

// Check edges reference valid nodes
const edgeKeys = new Set<string>();
for (const e of edges) {
  if (!nodeIds.has(e.source)) {
    console.error(`DANGLING EDGE SOURCE: "${e.source}" not found in nodes`);
    errors++;
  }
  if (!nodeIds.has(e.target)) {
    console.error(`DANGLING EDGE TARGET: "${e.target}" not found in nodes`);
    errors++;
  }
  if (e.source === e.target) {
    console.error(`SELF-LOOP: "${e.source}" -> "${e.target}"`);
    errors++;
  }
  const key = [e.source, e.target].sort().join("--");
  if (edgeKeys.has(key)) {
    console.error(`DUPLICATE EDGE: "${e.source}" <-> "${e.target}"`);
    errors++;
  }
  edgeKeys.add(key);
  if (e.strength < 1 || e.strength > 5) {
    console.error(`INVALID STRENGTH: "${e.source}" -> "${e.target}" has strength ${e.strength}`);
    errors++;
  }
}

// Check for orphan nodes (no edges)
const connectedNodes = new Set<string>();
for (const e of edges) {
  connectedNodes.add(e.source);
  connectedNodes.add(e.target);
}
const orphans = nodes.filter(n => !connectedNodes.has(n.id));

// Stats
const seedNodes = nodes.filter(n => n.isSeed);
const movies = nodes.filter(n => n.type === "movie");
const tvShows = nodes.filter(n => n.type === "tv");
const genres = new Set(nodes.flatMap(n => n.genres));
const relationships = new Set(edges.map(e => e.relationship));

// Connection stats
const connectionCounts = new Map<string, number>();
for (const e of edges) {
  connectionCounts.set(e.source, (connectionCounts.get(e.source) ?? 0) + 1);
  connectionCounts.set(e.target, (connectionCounts.get(e.target) ?? 0) + 1);
}
const counts = Array.from(connectionCounts.values());
const avgConnections = counts.reduce((a, b) => a + b, 0) / counts.length;
const maxConnections = Math.max(...counts);
const hubNode = Array.from(connectionCounts.entries()).sort((a, b) => b[1] - a[1])[0];

console.log("\n=== Dataset Statistics ===");
console.log(`Nodes: ${nodes.length} (${movies.length} movies, ${tvShows.length} TV shows)`);
console.log(`Edges: ${edges.length}`);
console.log(`Seed nodes: ${seedNodes.length}`);
console.log(`Genres: ${genres.size} (${Array.from(genres).join(", ")})`);
console.log(`Relationship types: ${relationships.size} (${Array.from(relationships).join(", ")})`);
console.log(`Avg connections per node: ${avgConnections.toFixed(1)}`);
console.log(`Max connections: ${maxConnections} (${hubNode?.[0]})`);
console.log(`Orphan nodes: ${orphans.length}${orphans.length > 0 ? ` (${orphans.map(n => n.id).join(", ")})` : ""}`);
console.log(`Errors: ${errors}`);

if (errors > 0) {
  console.error(`\n❌ Validation FAILED with ${errors} errors`);
  process.exit(1);
} else {
  console.log(`\n✅ Validation PASSED`);
}
