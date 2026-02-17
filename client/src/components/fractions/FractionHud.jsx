// src/components/fractions/FractionHud.jsx
export default function FractionHud({ level, levelStats, canonical }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 text-xs">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium text-amber-700 mb-1">
          <span>Fraction Smash</span>
          <span className="font-semibold">{level.title}</span>
        </div>
        <p className="text-slate-700 text-xs max-w-lg">{level.question}</p>
        {canonical && (
          <p className="text-[11px] text-slate-400 mt-1">
            Teacher note – target fraction: {canonical.n}/{canonical.d}
          </p>
        )}
      </div>

      {levelStats && (
        <div className="bg-slate-900/5 rounded-2xl px-3 py-2 text-[11px] text-slate-600 border border-slate-200">
          <div className="font-semibold mb-1 text-slate-700">
            This device (local) stats
          </div>
          <div className="flex gap-3">
            <span>Attempts: {levelStats.plays}</span>
            <span>Correct: {levelStats.correct}</span>
          </div>
        </div>
      )}
    </div>
  );
}
