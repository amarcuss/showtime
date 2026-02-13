import { useState } from "react";
import GraphCanvas from "./components/Graph/GraphCanvas";
import DetailPanel from "./components/DetailPanel/DetailPanel";
import SearchBar from "./components/Controls/SearchBar";
import GenreFilter from "./components/Controls/GenreFilter";
import RelationshipFilter from "./components/Controls/RelationshipFilter";
import Breadcrumbs from "./components/Controls/Breadcrumbs";
import ViewControls from "./components/Controls/ViewControls";
import { useGraphInteraction } from "./components/Graph/useGraphInteraction";
import { useKeyboardNav } from "./hooks/useKeyboardNav";

export default function App() {
  const { graphRef, zoomToNode } = useGraphInteraction();
  const [showFilters, setShowFilters] = useState(false);

  useKeyboardNav(zoomToNode);

  return (
    <div className="relative w-full h-full">
      {/* Graph fills background */}
      <GraphCanvas />

      {/* Top controls bar */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="p-4 flex items-start gap-3 flex-wrap">
          {/* Logo */}
          <div className="pointer-events-auto flex items-center gap-2 mr-2">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Showtime
            </span>
          </div>

          {/* Search */}
          <div className="pointer-events-auto">
            <SearchBar onSelect={zoomToNode} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="pointer-events-auto px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Filters {showFilters ? "▲" : "▼"}
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="px-4 pointer-events-auto">
          <Breadcrumbs onNavigate={zoomToNode} />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mx-4 mt-2 p-3 rounded-lg panel-glass pointer-events-auto fade-in space-y-3">
            <div>
              <div className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Genres</div>
              <GenreFilter />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Relationships</div>
              <RelationshipFilter />
            </div>
          </div>
        )}
      </div>

      {/* View controls — bottom left */}
      <div className="fixed bottom-4 left-4 z-40">
        <ViewControls graphRef={graphRef as never} />
      </div>

      {/* Detail panel */}
      <DetailPanel onNavigate={zoomToNode} />
    </div>
  );
}
