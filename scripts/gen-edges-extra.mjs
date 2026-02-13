import { readFileSync, writeFileSync } from 'fs';

const nodes = JSON.parse(readFileSync('public/data/nodes.json'));
const existingEdges = JSON.parse(readFileSync('public/data/edges.json'));
const nodeMap = new Map(nodes.map(n => [n.id, n]));

const edgeKeys = new Set();
const edges = [...existingEdges];

for (const e of edges) {
  edgeKeys.add([e.source, e.target].sort().join('--'));
}

function add(s, t, rel, label, str) {
  if (s === t) return false;
  if (!nodeMap.has(s) || !nodeMap.has(t)) return false;
  const key = [s, t].sort().join('--');
  if (edgeKeys.has(key)) return false;
  edgeKeys.add(key);
  edges.push({ source: s, target: t, relationship: rel, label, strength: str });
  return true;
}

let addedActors = 0;
let addedGenre = 0;

// === SHARED ACTOR EDGES ===
// Build actor -> movie map
const actorToNodes = new Map();
for (const n of nodes) {
  for (const actor of n.cast) {
    if (!actorToNodes.has(actor)) actorToNodes.set(actor, []);
    actorToNodes.get(actor).push(n.id);
  }
}

// Connect nodes sharing actors (limit to actors in 2-6 films to avoid noise)
for (const [actor, nodeIds] of actorToNodes) {
  if (nodeIds.length < 2 || nodeIds.length > 6) continue;
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      if (add(nodeIds[i], nodeIds[j], 'shared_actor', `Both feature ${actor}`, 3)) {
        addedActors++;
      }
    }
  }
}

// === GENRE OVERLAP EDGES (for under-connected nodes) ===
// Count connections per node
function getConnectionCounts() {
  const counts = new Map();
  for (const e of edges) {
    counts.set(e.source, (counts.get(e.source) || 0) + 1);
    counts.set(e.target, (counts.get(e.target) || 0) + 1);
  }
  return counts;
}

const counts = getConnectionCounts();

// Find nodes with fewer than 3 connections and try to link them by genre overlap
const underConnected = nodes.filter(n => (counts.get(n.id) || 0) < 3);
for (const node of underConnected) {
  const currentCount = counts.get(node.id) || 0;
  if (currentCount >= 4) continue; // may have been connected above

  // Find best genre matches (most genres in common, same type preferred)
  const candidates = nodes
    .filter(n => n.id !== node.id)
    .map(n => {
      const sharedGenres = node.genres.filter(g => n.genres.includes(g));
      const sameType = n.type === node.type ? 1 : 0;
      const yearProximity = Math.abs(n.year - node.year) < 15 ? 1 : 0;
      return { id: n.id, score: sharedGenres.length * 3 + sameType + yearProximity, sharedGenres };
    })
    .filter(c => c.score >= 4 && c.sharedGenres.length >= 2)
    .sort((a, b) => b.score - a.score);

  let linked = 0;
  for (const c of candidates) {
    if (linked >= 2) break;
    const genres = c.sharedGenres.slice(0, 2).join(' and ').toLowerCase();
    if (add(node.id, c.id, 'genre_thematic', `Both are ${genres} titles`, 2)) {
      addedGenre++;
      linked++;
      counts.set(node.id, (counts.get(node.id) || 0) + 1);
      counts.set(c.id, (counts.get(c.id) || 0) + 1);
    }
  }
}

// === SHARED DIRECTOR EDGES (from node data) ===
let addedDirectors = 0;
const directorToNodes = new Map();
for (const n of nodes) {
  if (n.director) {
    if (!directorToNodes.has(n.director)) directorToNodes.set(n.director, []);
    directorToNodes.get(n.director).push(n.id);
  }
}

for (const [director, nodeIds] of directorToNodes) {
  if (nodeIds.length < 2 || nodeIds.length > 10) continue;
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      if (add(nodeIds[i], nodeIds[j], 'shared_director', `Both directed by ${director}`, 4)) {
        addedDirectors++;
      }
    }
  }
}

// === SHARED CREATOR EDGES (TV shows) ===
let addedCreators = 0;
const creatorToNodes = new Map();
for (const n of nodes) {
  if (n.creators) {
    for (const creator of n.creators) {
      if (!creatorToNodes.has(creator)) creatorToNodes.set(creator, []);
      creatorToNodes.get(creator).push(n.id);
    }
  }
}

for (const [creator, nodeIds] of creatorToNodes) {
  if (nodeIds.length < 2 || nodeIds.length > 6) continue;
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      if (add(nodeIds[i], nodeIds[j], 'same_creator', `Both created by ${creator}`, 4)) {
        addedCreators++;
      }
    }
  }
}

// Stats
const finalCounts = getConnectionCounts();
const vals = [...finalCounts.values()];
const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
const orphans = nodes.filter(n => !finalCounts.has(n.id));

console.log(`\nStarting edges: ${existingEdges.length}`);
console.log(`Added shared_actor: ${addedActors}`);
console.log(`Added shared_director: ${addedDirectors}`);
console.log(`Added same_creator: ${addedCreators}`);
console.log(`Added genre_thematic: ${addedGenre}`);
console.log(`Total edges: ${edges.length}`);
console.log(`Connected nodes: ${finalCounts.size}/${nodes.length}`);
console.log(`Orphans: ${orphans.length}`);
console.log(`Avg connections: ${avg.toFixed(1)}`);
console.log(`Max connections: ${Math.max(...vals)}`);

writeFileSync('public/data/edges.json', JSON.stringify(edges, null, 2));
console.log('Written edges.json');
