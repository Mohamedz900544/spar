// src/pages/fractions/FractionPlayPage.jsx
import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { FRACTION_LEVELS } from "../../data/fractionLevels";
import useFractionGame from "./hooks/useFractionGame";
import FractionBoard from "../../components/fractions/FractionBoard";
import FractionAnswerPanel from "../../components/fractions/FractionAnswerPanel";
import HammerCursor from "../../components/fractions/HammerCursor";

export default function FractionPlayPage() {
  const {
    level,
    levelIndex,
    numerator,
    denominator,
    feedback,
    checking,
    result,
    levelStats,
    canonical,
    isCracking,
    viewMode,
    setNumerator,
    setDenominator,
    handleSubmit,
    handleHammerSmash,
    resetInputs,
  } = useFractionGame();

  const totalLevels = FRACTION_LEVELS.length;

  const boardRef = useRef(null);
  const [hammerPos, setHammerPos] = useState({ x: 0, y: 0 });
  const [hammerDown, setHammerDown] = useState(false);
  const [isInsideBoard, setIsInsideBoard] = useState(false);

  const updateHammerPos = (e) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // clamp to board bounds just in case
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const clampedY = Math.max(0, Math.min(rect.height, y));

    setHammerPos({ x: clampedX, y: clampedY });
  };

  const handleStageMouseMove = (e) => {
    if (!isInsideBoard) return;
    updateHammerPos(e);
  };

  const handleStageMouseDown = (e) => {
    if (!isInsideBoard) return;
    setHammerDown(true);
    updateHammerPos(e);
    handleHammerSmash(); // crack / next level based on mode
  };

  const handleStageMouseUp = () => {
    setHammerDown(false);
  };

  const handleStageMouseEnter = (e) => {
    setIsInsideBoard(true);
    updateHammerPos(e);
  };

  const handleStageMouseLeave = () => {
    setIsInsideBoard(false);
    setHammerDown(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16 pb-10 text-white">
      <div className="mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300 mb-2 border border-sky-500/40">
              <Sparkles className="w-4 h-4" />
              Sparvi Lab · Fraction Smash
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Smash the whole and discover fractions
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Move the hammer over the square. Inside the square the real
              cursor hides and the hammer appears. Click to crack the
              whole, then solve the fraction.
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-300">
            <div className="font-semibold">
              Level {levelIndex + 1} of {totalLevels}
            </div>
            {levelStats && (
              <div className="mt-1">
                Attempts: {levelStats.plays} · Correct:{" "}
                {levelStats.correct}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800/80 shadow-[0_24px_80px_rgba(0,0,0,0.8)] px-4 py-5 md:px-6 md:py-6">
          {/* STAGE (board + hammer cursor) */}
          <p className="text-xs md:text-sm text-slate-200 mb-3">
            {level.question}
          </p>

          <div
            className={
              "relative " + (isInsideBoard ? "cursor-none" : "")
            }
            onMouseMove={handleStageMouseMove}
            onMouseDown={handleStageMouseDown}
            onMouseUp={handleStageMouseUp}
            onMouseLeave={handleStageMouseLeave}
          >
            <div
              onMouseEnter={handleStageMouseEnter}
              // we want enter/leave events exactly on the board
            >
              <FractionBoard
                rows={level.rows}
                cols={level.cols}
                highlighted={level.highlighted}
                cellColors={level.cellColors}
                isCracking={isCracking}
                mode={viewMode}
                labels={level.labels}
                boardRef={boardRef}
              />
            </div>

            {isInsideBoard && (
              <HammerCursor
                x={hammerPos.x}
                y={hammerPos.y}
                isDown={hammerDown}
              />
            )}
          </div>

          {/* Answer panel */}
          <FractionAnswerPanel
            numerator={numerator}
            denominator={denominator}
            checking={checking}
            onNumeratorChange={setNumerator}
            onDenominatorChange={setDenominator}
            onSubmit={handleSubmit}
          />

          {feedback && (
            <p className="mt-3 text-xs text-center text-amber-200 bg-amber-500/10 border border-amber-400/40 rounded-2xl px-3 py-2">
              {feedback}
            </p>
          )}

          <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400">
            <button
              type="button"
              onClick={resetInputs}
              className="px-3 py-1.5 rounded-full border border-slate-600 bg-slate-900/60 hover:bg-slate-800/80"
            >
              Clear answer
            </button>

            {result?.expected && (
              <span>
                Target fraction (teacher view):{" "}
                <strong>
                  {result.expected.n}/{result.expected.d}
                </strong>
              </span>
            )}
            {!result && canonical && (
              <span className="opacity-40">
                hidden answer: {canonical.n}/{canonical.d}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
