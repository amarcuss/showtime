# Showtime

Interactive graph explorer for movies and TV shows. Browse 290 titles connected by shared actors, directors, franchises, genres, and thematic similarities — all rendered as poster-image tiles on a force-directed canvas.

**Live:** Deployed on Vercel

## Features

- **Poster tiles** — each node displays its TMDB poster image (120x190 cards) with title, genre, and year
- **Relationship graph** — 10 relationship types: shared actor, shared director, same franchise, genre/thematic, cinematography, composer, influence, shared producer, same creator, spiritual successor
- **Community clustering** — label propagation groups related titles into visual clusters arranged in a ring layout
- **Animated selection** — clicking a tile zooms in, arranges neighbors in a circle, and pushes unrelated tiles outward
- **Auto-drift camera** — the view slowly pans across the graph when idle, stopping on any interaction
- **Search** — fuzzy title search with dropdown results
- **Filters** — toggle genres and relationship types to focus the graph
- **Detail panel** — slide-in panel with full metadata, cast, summary, and clickable connections
- **Keyboard navigation** — arrow keys move between neighbors, Escape deselects
- **Breadcrumb trail** — navigate back through your exploration history

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 7** — build tool and dev server
- **react-force-graph-2d** — canvas-based graph rendering
- **Zustand** — state management
- **D3-force** — layout generation (offline, via script)
- **Tailwind CSS 4** — styling
- **TMDB API** — poster image source

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
showtime/
├── public/
│   ├── data/
│   │   ├── nodes.json          # 290 movies/TV shows with metadata
│   │   ├── edges.json          # ~800 relationships between titles
│   │   └── layout.json         # Precomputed x/y positions + community IDs
│   └── posters/                # 290 TMDB poster thumbnails (w154)
├── scripts/
│   ├── fetch-posters.mjs       # Download posters from TMDB
│   ├── gen-edges.mjs           # Generate curated relationships
│   ├── gen-edges-extra.mjs     # Auto-generate additional connections
│   ├── gen-layout.mjs          # D3 force simulation → layout.json
│   └── validate-data.ts        # Data integrity checks
└── src/
    ├── App.tsx                 # Root layout: graph + controls + panel
    ├── types/index.ts          # ContentNode, ContentEdge, RelationshipType
    ├── store/useGraphStore.ts  # Zustand store: all state + actions
    ├── data/
    │   ├── loader.ts           # Fetch JSON data files
    │   └── seed.ts             # Seed data definitions
    ├── utils/
    │   ├── colors.ts           # Genre/edge color maps
    │   └── graph.ts            # Graph traversal + fuzzy search
    ├── hooks/
    │   ├── useImageCache.ts    # Preload poster images with batched load tracking
    │   ├── useKeyboardNav.ts   # Arrow key navigation between neighbors
    │   └── useLayoutAnimation.ts # Animated position overrides on selection
    └── components/
        ├── Graph/
        │   ├── GraphCanvas.tsx       # Main canvas: ForceGraph2D + drift + wiring
        │   ├── nodeRenderer.ts       # Custom tile painting (poster + text)
        │   ├── linkRenderer.ts       # Custom edge painting (color + labels)
        │   └── useGraphInteraction.ts # Click/hover handlers + camera control
        ├── Controls/
        │   ├── SearchBar.tsx         # Fuzzy search input
        │   ├── GenreFilter.tsx       # Genre toggle pills
        │   ├── RelationshipFilter.tsx # Relationship type toggle pills
        │   ├── ViewControls.tsx      # Zoom +/- and Reset
        │   └── Breadcrumbs.tsx       # Navigation history trail
        └── DetailPanel/
            ├── DetailPanel.tsx       # Slide-in metadata panel
            └── ConnectionList.tsx    # Grouped connection list
```

## Scripts

All scripts run from the project root.

### Fetch posters

Downloads poster thumbnails from TMDB and updates `nodes.json` with `posterUrl` fields. Idempotent — skips existing files.

```bash
mkdir -p public/posters
TMDB_API_KEY=<your-key> node scripts/fetch-posters.mjs
```

The API key is a TMDB v3 key (passed as a query parameter, not a Bearer token).

### Generate edges

Curated relationships are defined in `gen-edges.mjs`. Additional auto-generated connections (shared actors, directors, genre overlap) are added by `gen-edges-extra.mjs`.

```bash
node scripts/gen-edges.mjs
node scripts/gen-edges-extra.mjs
```

### Generate layout

Runs community detection (label propagation) and D3 force simulation to produce `layout.json`.

```bash
node scripts/gen-layout.mjs
```

Key tuning parameter: `forceCollide(210)` controls minimum tile spacing.

### Validate data

Checks for duplicate IDs, dangling edges, orphan nodes, invalid fields, etc.

```bash
npm run validate
```

## Data Model

### ContentNode

| Field       | Type                | Description                        |
|-------------|---------------------|------------------------------------|
| `id`        | `string`            | Kebab-case unique identifier       |
| `title`     | `string`            | Display title                      |
| `year`      | `number`            | Release / premiere year            |
| `endYear`   | `number?`           | End year (TV shows)                |
| `type`      | `"movie" \| "tv"`   | Content type                       |
| `genres`    | `string[]`          | Genre list                         |
| `director`  | `string?`           | Director (movies)                  |
| `creators`  | `string[]?`         | Creators (TV shows)                |
| `cast`      | `string[]`          | Main cast                          |
| `rating`    | `number`            | Rating (1–10)                      |
| `summary`   | `string`            | Description                        |
| `posterUrl` | `string?`           | Path to poster image               |

### ContentEdge

| Field          | Type     | Description                    |
|----------------|----------|--------------------------------|
| `source`       | `string` | Source node ID                 |
| `target`       | `string` | Target node ID                 |
| `relationship` | `string` | Relationship type              |
| `label`        | `string` | Human-readable description     |
| `strength`     | `number` | Connection strength (1–5)      |

## Deployment

Deployed on Vercel with these settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

No environment variables needed — posters are committed as static files.

## License

MIT
