import { useGraphStore } from "../../store/useGraphStore";
import { getEdgeColor, RELATIONSHIP_LABELS } from "../../utils/colors";

export default function RelationshipFilter() {
  const allRelationships = useGraphStore(s => s.allRelationships);
  const relationshipFilter = useGraphStore(s => s.relationshipFilter);
  const toggleRelationship = useGraphStore(s => s.toggleRelationship);

  if (allRelationships.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {allRelationships.map(rel => {
        const active = relationshipFilter.has(rel);
        const color = getEdgeColor(rel);
        const label = RELATIONSHIP_LABELS[rel] ?? rel.replace(/_/g, " ");
        return (
          <button
            key={rel}
            onClick={() => toggleRelationship(rel)}
            className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: active ? color + "30" : "rgba(255,255,255,0.05)",
              color: active ? color : "#94a3b8",
              border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
