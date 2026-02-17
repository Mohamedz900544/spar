// src/components/fractions/FractionBoard.jsx
export default function FractionBoard({
  rows,
  cols,
  highlighted,
  cellColors,
  isCracking,
  mode,      // "whole" | "cracked" | "labeled"
  labels,    // optional [{ cellIndex, text }]
  boardRef,  // NEW: ref from parent to the grid element
}) {
  const showWhole = mode === "whole";
  const effectiveRows = showWhole ? 1 : rows;
  const effectiveCols = showWhole ? 1 : cols;
  const totalCells = effectiveRows * effectiveCols;

  const labelMap = {};
  if (!showWhole && labels && labels.length) {
    labels.forEach((lbl) => {
      labelMap[lbl.cellIndex] = lbl;
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative rounded-3xl bg-slate-900/20 p-1.5 md:p-2">
        <div
          ref={boardRef}
          className={
            "relative grid w-full aspect-[4/3] rounded-2xl overflow-hidden border-[6px] border-white shadow-lg shadow-slate-900/40 " +
            (!showWhole ? "bg-slate-800" : "bg-blue-600") +
            (isCracking && !showWhole ? " fraction-board-cracking" : "")
          }
          style={{
            gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${effectiveRows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => {
            const isHighlight = !showWhole && highlighted.includes(index);
            const color =
              showWhole
                ? "#2563eb"
                : cellColors && cellColors[index]
                ? cellColors[index]
                : isHighlight
                ? "#a855f7"
                : "#2563eb";

            const hasBorder = !showWhole;
            const label =
              !showWhole && labelMap[index] ? labelMap[index] : null;

            return (
              <div
                key={index}
                className={
                  "relative flex items-center justify-center " +
                  (hasBorder ? "border border-white/40" : "")
                }
                style={{ backgroundColor: color }}
              >
                {label && mode === "labeled" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 py-1 rounded-lg bg-slate-950/70 border border-emerald-400/70 text-xs md:text-sm font-bold text-white tracking-widest">
                      {label.text}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
