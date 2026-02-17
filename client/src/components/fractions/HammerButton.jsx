// src/components/fractions/HammerButton.jsx
import { Hammer } from "lucide-react";

export default function HammerButton({
  onSmash,
  disabled,
  readyForNext,
}) {
  return (
    <button
      type="button"
      onClick={onSmash}
      disabled={disabled}
      className="group relative inline-flex flex-col items-center justify-center rounded-full bg-slate-950 text-amber-300 w-20 h-20 md:w-24 md:h-24 shadow-lg shadow-slate-900/60 border border-amber-400/70 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-80" />
      <Hammer className="relative w-9 h-9 md:w-10 md:h-10 group-active:translate-y-0.5 group-active:rotate-6 transition-transform" />
      <span className="relative mt-1 text-[10px] font-semibold">
        {readyForNext ? "Next crack" : "Smash!"}
      </span>
      {readyForNext && (
        <span className="relative mt-0.5 text-[9px] text-amber-200/90">
          new example
        </span>
      )}
    </button>
  );
}
