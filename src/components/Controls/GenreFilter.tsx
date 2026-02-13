import { useGraphStore } from "../../store/useGraphStore";
import { getGenreColor } from "../../utils/colors";

export default function GenreFilter() {
  const allGenres = useGraphStore(s => s.allGenres);
  const genreFilter = useGraphStore(s => s.genreFilter);
  const toggleGenre = useGraphStore(s => s.toggleGenre);

  if (allGenres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {allGenres.map(genre => {
        const active = genreFilter.has(genre);
        const color = getGenreColor(genre);
        return (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: active ? color + "30" : "rgba(255,255,255,0.05)",
              color: active ? color : "#94a3b8",
              border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
