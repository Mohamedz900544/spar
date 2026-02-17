// src/components/fractions/FractionAnswerPanel.jsx
export default function FractionAnswerPanel({
  numerator,
  denominator,
  checking,
  onNumeratorChange,
  onDenominatorChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 flex flex-col items-center gap-3"
    >
      <p className="text-xs md:text-sm text-slate-600">
        Type the fraction of the purple part:
      </p>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <input
            type="number"
            min="0"
            value={numerator}
            onChange={(e) => onNumeratorChange(e.target.value)}
            className="w-16 rounded-xl border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="1"
          />
          <div className="h-[2px] w-16 bg-slate-400 my-[2px]" />
          <input
            type="number"
            min="1"
            value={denominator}
            onChange={(e) => onDenominatorChange(e.target.value)}
            className="w-16 rounded-xl border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="4"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={checking}
        className="mt-1 inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-amber-500 disabled:opacity-60 transition"
      >
        {checking ? "Checking..." : "Check answer"}
      </button>
    </form>
  );
}
