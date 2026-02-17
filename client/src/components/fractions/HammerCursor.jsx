// src/components/fractions/HammerCursor.jsx
import { Hammer } from "lucide-react";

export default function HammerCursor({ x, y, isDown }) {
  const angle = isDown ? 25 : -10;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        transition: "transform 0.08s ease-out",
      }}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-950/85 border border-amber-400/70 shadow-lg shadow-black/70 flex items-center justify-center">
        <Hammer className="w-6 h-6 text-amber-300" />
      </div>
    </div>
  );
}
