// src/pages/fractions/FractionLevelsPage.jsx
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { FRACTION_LEVELS } from "../../data/fractionLevels";
import LevelCard from "../../components/fractions/LevelCard";

const STATS_KEY = "sparvi_fraction_stats_v1";

export default function FractionLevelsPage() {
  const [stats] = useState(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn("could not read fraction stats", e);
      return {};
    }
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-sky-50 via-white to-amber-50 pt-16 pb-10">
      <div className="mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 mb-2">
              <Sparkles className="w-4 h-4" />
              Sparvi Lab · Fraction Smash
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Visual fraction challenges
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-xl">
              Pick a level to explore halves, thirds, quarters and trickier
              grids. Perfect as a warm-up before worksheets.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FRACTION_LEVELS.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              stats={stats[level.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
