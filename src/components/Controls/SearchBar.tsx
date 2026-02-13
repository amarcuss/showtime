import { useState, useMemo, useRef, useEffect } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { fuzzyMatch } from "../../utils/graph";

interface Props {
  onSelect: (nodeId: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const allNodes = useGraphStore(s => s.allNodes);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return allNodes
      .filter(n => fuzzyMatch(query, n.title))
      .slice(0, 10);
  }, [query, allNodes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search titles..."
        className="w-64 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-lg panel-glass overflow-hidden z-60">
          {results.map(node => (
            <button
              key={node.id}
              onClick={() => {
                onSelect(node.id);
                setQuery("");
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              <span className="text-white">{node.title}</span>
              <span className="text-slate-500 ml-2">
                ({node.year}) · {node.type === "tv" ? "TV" : "Movie"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
