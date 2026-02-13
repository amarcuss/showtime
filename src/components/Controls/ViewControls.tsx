import { useGraphStore } from "../../store/useGraphStore";

interface Props {
  graphRef: React.MutableRefObject<{ zoom: (z: number, ms?: number) => void; centerAt: (x?: number, y?: number, ms?: number) => void; zoomToFit?: (ms?: number, padding?: number) => void } | undefined>;
}

export default function ViewControls({ graphRef }: Props) {
  const resetView = useGraphStore(s => s.resetView);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.5, 400);
    }
  };

  const handleReset = () => {
    resetView();
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 800);
      graphRef.current.zoom(0.6, 800);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={handleReset}
        className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
        title="Reset view"
      >
        Reset
      </button>
    </div>
  );
}
