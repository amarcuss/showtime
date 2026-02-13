import { readFileSync, writeFileSync } from 'fs';
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceCenter, forceX, forceY } from 'd3-force';

const nodes = JSON.parse(readFileSync('public/data/nodes.json'));
const edges = JSON.parse(readFileSync('public/data/edges.json'));

// === 1. Build adjacency and detect communities via label propagation ===

const adj = new Map();
for (const n of nodes) adj.set(n.id, []);
for (const e of edges) {
  adj.get(e.source)?.push({ target: e.target, strength: e.strength });
  adj.get(e.target)?.push({ target: e.source, strength: e.strength });
}

// Label propagation community detection
const labels = new Map();
nodes.forEach((n, i) => labels.set(n.id, i)); // each node starts as its own community

for (let iter = 0; iter < 50; iter++) {
  let changed = false;
  // Process in random order each iteration
  const shuffled = [...nodes].sort(() => Math.random() - 0.5);

  for (const node of shuffled) {
    const neighbors = adj.get(node.id) || [];
    if (neighbors.length === 0) continue;

    // Count weighted votes for each label from neighbors
    const votes = new Map();
    for (const { target, strength } of neighbors) {
      const lbl = labels.get(target);
      votes.set(lbl, (votes.get(lbl) || 0) + strength);
    }

    // Pick the label with the most weighted votes
    let bestLabel = labels.get(node.id);
    let bestCount = 0;
    for (const [lbl, count] of votes) {
      if (count > bestCount) {
        bestCount = count;
        bestLabel = lbl;
      }
    }

    if (bestLabel !== labels.get(node.id)) {
      labels.set(node.id, bestLabel);
      changed = true;
    }
  }

  if (!changed) break;
}

// Collect communities
const communities = new Map(); // label -> [nodeId]
for (const [id, lbl] of labels) {
  if (!communities.has(lbl)) communities.set(lbl, []);
  communities.get(lbl).push(id);
}

// Merge tiny communities (< 3 nodes) into nearest larger community
const MIN_COMMUNITY_SIZE = 3;
const largeCommunities = new Map();
const tinyCommunities = [];

for (const [lbl, members] of communities) {
  if (members.length >= MIN_COMMUNITY_SIZE) {
    largeCommunities.set(lbl, members);
  } else {
    tinyCommunities.push(...members);
  }
}

// For each tiny node, find which large community it's most connected to
for (const nodeId of tinyCommunities) {
  const neighbors = adj.get(nodeId) || [];
  const communityScores = new Map();

  for (const { target, strength } of neighbors) {
    for (const [lbl, members] of largeCommunities) {
      if (members.includes(target)) {
        communityScores.set(lbl, (communityScores.get(lbl) || 0) + strength);
      }
    }
  }

  let bestLbl = largeCommunities.keys().next().value; // fallback
  let bestScore = 0;
  for (const [lbl, score] of communityScores) {
    if (score > bestScore) {
      bestScore = score;
      bestLbl = lbl;
    }
  }

  largeCommunities.get(bestLbl).push(nodeId);
  labels.set(nodeId, bestLbl);
}

// === 2. Position communities in a ring layout ===

const communityList = Array.from(largeCommunities.entries())
  .sort((a, b) => b[1].length - a[1].length); // largest first

const numCommunities = communityList.length;
// Radius of the ring scales with number of communities
const ringRadius = Math.max(400, numCommunities * 80);

const communityCenters = new Map();
communityList.forEach(([lbl], i) => {
  const angle = (2 * Math.PI * i) / numCommunities - Math.PI / 2;
  communityCenters.set(lbl, {
    x: ringRadius * Math.cos(angle),
    y: ringRadius * Math.sin(angle),
  });
});

// === 3. Run d3 force simulation with community gravity ===

const simNodes = nodes.map(n => ({
  id: n.id,
  community: labels.get(n.id),
  x: communityCenters.get(labels.get(n.id))?.x + (Math.random() - 0.5) * 200 || 0,
  y: communityCenters.get(labels.get(n.id))?.y + (Math.random() - 0.5) * 200 || 0,
}));

const simLinks = edges.map(e => ({
  source: e.source,
  target: e.target,
  strength: e.strength,
}));

const nodeById = new Map(simNodes.map(n => [n.id, n]));

const sim = forceSimulation(simNodes)
  .force('link', forceLink(simLinks)
    .id(d => d.id)
    .distance(d => 100 / (d.strength || 1)) // stronger connections = shorter distance
    .strength(d => 0.3 * (d.strength || 1) / 5)
  )
  .force('charge', forceManyBody()
    .strength(-80)
    .distanceMax(400)
  )
  .force('collide', forceCollide(210).strength(0.8))
  // Pull nodes toward their community center
  .force('communityX', forceX(d => communityCenters.get(d.community)?.x || 0).strength(0.15))
  .force('communityY', forceY(d => communityCenters.get(d.community)?.y || 0).strength(0.15))
  .force('center', forceCenter(0, 0).strength(0.02))
  .stop();

// Run simulation to completion
const totalTicks = 500;
for (let i = 0; i < totalTicks; i++) {
  sim.alpha(Math.max(0.001, 1 - i / totalTicks));
  sim.tick();
}

// === 4. Output positions ===

const positions = {};
for (const n of simNodes) {
  positions[n.id] = {
    x: Math.round(n.x * 10) / 10,
    y: Math.round(n.y * 10) / 10,
    community: n.community,
  };
}

writeFileSync('public/data/layout.json', JSON.stringify(positions, null, 2));

// Stats
console.log(`Communities: ${numCommunities}`);
for (const [lbl, members] of communityList) {
  const center = communityCenters.get(lbl);
  // Find a representative title for the community
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const titles = members.slice(0, 3).map(id => nodeMap.get(id)?.title).join(', ');
  console.log(`  [${members.length} nodes] ${titles}...`);
}
console.log(`\nWritten layout.json with ${Object.keys(positions).length} positions`);
