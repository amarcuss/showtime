import { useGraphStore } from "../../store/useGraphStore";

interface Props {
  onNavigate: (id: string) => void;
}

export default function Breadcrumbs({ onNavigate }: Props) {
  const history = useGraphStore(s => s.history);
  const selectedNodeId = useGraphStore(s => s.selectedNodeId);
  const nodeMap = useGraphStore(s => s.nodeMap);

  const trail = [...history, ...(selectedNodeId ? [selectedNodeId] : [])];
  if (trail.length === 0) return null;

  // Show last 5 items
  const visible = trail.slice(-5);
  const truncated = trail.length > 5;

  return (
    <div className="flex items-center gap-1 text-xs text-slate-500 overflow-hidden">
      {truncated && <span className="text-slate-600">...</span>}
      {visible.map((id, i) => {
        const node = nodeMap.get(id);
        const isLast = i === visible.length - 1;
        return (
          <span key={`${id}-${i}`} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-slate-600">→</span>}
            {isLast ? (
              <span className="text-purple-400 font-medium">
                {node?.title ?? id}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(id)}
                className="hover:text-white transition-colors"
              >
                {node?.title ?? id}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
