import { useGraphStore } from "../../store/useGraphStore";
import { getGenreColor } from "../../utils/colors";
import ConnectionList from "./ConnectionList";

interface Props {
  onNavigate: (id: string) => void;
}

export default function DetailPanel({ onNavigate }: Props) {
  const selectedNodeId = useGraphStore(s => s.selectedNodeId);
  const nodeMap = useGraphStore(s => s.nodeMap);
  const selectNode = useGraphStore(s => s.selectNode);
  const goBack = useGraphStore(s => s.goBack);
  const history = useGraphStore(s => s.history);

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 max-w-[85vw] panel-glass slide-in-right overflow-y-auto z-50">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 text-slate-400 uppercase">
                {node.type === "tv" ? "TV Show" : "Movie"}
              </span>
              <span className="text-xs text-slate-500">
                {node.year}{node.endYear ? `–${node.endYear}` : ""}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{node.title}</h2>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="text-slate-500 hover:text-white text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm text-slate-300">{node.rating.toFixed(1)}</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {node.genres.map(g => (
            <span
              key={g}
              className="genre-pill"
              style={{
                backgroundColor: getGenreColor(g) + "20",
                color: getGenreColor(g),
                border: `1px solid ${getGenreColor(g)}40`,
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-400 leading-relaxed">{node.summary}</p>

        {/* Credits */}
        <div className="space-y-2 text-sm">
          {node.director && (
            <div>
              <span className="text-slate-500">Director: </span>
              <span className="text-slate-300">{node.director}</span>
            </div>
          )}
          {node.creators && node.creators.length > 0 && (
            <div>
              <span className="text-slate-500">Created by: </span>
              <span className="text-slate-300">{node.creators.join(", ")}</span>
            </div>
          )}
          {node.cast.length > 0 && (
            <div>
              <span className="text-slate-500">Cast: </span>
              <span className="text-slate-300">{node.cast.join(", ")}</span>
            </div>
          )}
        </div>

        <hr className="border-white/10" />

        {/* Back button */}
        {history.length > 0 && (
          <button
            onClick={goBack}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
        )}

        {/* Connections */}
        <ConnectionList nodeId={selectedNodeId} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
