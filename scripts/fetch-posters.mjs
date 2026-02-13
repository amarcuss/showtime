import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error("Missing TMDB_API_KEY environment variable");
  process.exit(1);
}

const POSTER_DIR = "public/posters";
const NODES_PATH = "public/data/nodes.json";
const DELAY_MS = 50;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w154";

mkdirSync(POSTER_DIR, { recursive: true });

const nodes = JSON.parse(readFileSync(NODES_PATH, "utf-8"));

let downloaded = 0;
let skipped = 0;
let failed = 0;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchTMDB(node) {
  const endpoint =
    node.type === "tv" ? "search/tv" : "search/movie";
  const params = new URLSearchParams({
    api_key: API_KEY,
    query: node.title,
    ...(node.year && node.type === "movie" ? { year: String(node.year) } : {}),
    ...(node.year && node.type === "tv"
      ? { first_air_date_year: String(node.year) }
      : {}),
  });

  const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`TMDB search failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.results?.[0]?.poster_path ?? null;
}

async function downloadImage(posterPath, destPath) {
  const url = `${IMAGE_BASE}${posterPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image download failed (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
}

for (const node of nodes) {
  const destPath = join(POSTER_DIR, `${node.id}.jpg`);

  if (existsSync(destPath)) {
    skipped++;
    continue;
  }

  try {
    const posterPath = await searchTMDB(node);
    if (!posterPath) {
      console.warn(`  No poster found for: ${node.title} (${node.year})`);
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    await downloadImage(posterPath, destPath);
    downloaded++;
    console.log(`  Downloaded: ${node.title} (${node.year})`);
  } catch (err) {
    console.error(`  Failed: ${node.title} (${node.year}) - ${err.message}`);
    failed++;
  }

  await sleep(DELAY_MS);
}

// Update nodes.json with posterUrl for every node that has a poster file
let updated = 0;
for (const node of nodes) {
  const posterFile = join(POSTER_DIR, `${node.id}.jpg`);
  if (existsSync(posterFile)) {
    node.posterUrl = `/posters/${node.id}.jpg`;
    updated++;
  }
}

writeFileSync(NODES_PATH, JSON.stringify(nodes, null, 2) + "\n");

console.log(`\nSummary:`);
console.log(`  Downloaded: ${downloaded}`);
console.log(`  Skipped (already existed): ${skipped}`);
console.log(`  Failed: ${failed}`);
console.log(`  Updated posterUrl in nodes.json: ${updated}`);
