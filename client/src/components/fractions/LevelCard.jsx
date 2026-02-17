// src/components/fractions/LevelCard.jsx
import { Link } from "react-router-dom";

export default function LevelCard({ level, stats }) {
  const successRate =
    stats && stats.plays > 0
      ? Math.round((stats.correct / stats.plays) * 100)
      : null;

  return (
    <div className="bg-white/90 rounded-3xl border border-slate-200 shadow-md shadow-slate-900/10 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          {level.title}
        </h2>
        <p className="text-xs text-slate-600 mb-2">
          {level.question}
        </p>
        <p className="text-[11px] text-slate-500 mb-2">
          Grid: {level.rows} × {level.cols}
        </p>
        {level.tags && (
          <div className="flex flex-wrap gap-1 mb-2">
            {level.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-[2px] rounded-full bg-sky-50 text-[10px] text-sky-700 border border-sky-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {successRate != null && (
          <div className="text-[11px] text-slate-500">
            Local accuracy: {successRate}% (
            {stats.correct}/{stats.plays})
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-[11px] text-slate-500">
          Grade {level.grade}
        </span>
        <Link
          to={`/fractions/${level.id}`}
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-700 transition"
        >
          Play
        </Link>
      </div>
    </div>
  );
}
