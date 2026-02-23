import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  BookOpen,
  Cpu,
  Code,
  Zap,
  CheckCircle2,
} from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const level1Sessions = [];

const tracks = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Build real circuits, power LEDs, and learn how chips work",
    icon: Cpu,
    image:
      "https://i.ibb.co/tgt5sxw/Gemini-Generated-Image-2h1f5p2h1f5p2h1f.webp",
  },
  {
    id: "frontend",
    name: "Web Development",
    description: "Create websites, animations, and interactive apps",
    icon: Code,
    image:
      "https://i.ibb.co/Tx3S43Xw/9602bc4b-cfc4-410e-b291-611d478c9d6a.webp",
  },
];

const grades = ["Years 7-8", "Years 9-10", "Years 11-12"];

const levels = [
  {
    name: "Beginner",
    duration: "1 Month – 8 On-Site Classes",
    age: "7-8 Years Old",
    locked: false,
    color: "#2dd4bf",
    highlights: [
      "Identify tech types in daily life",
      "Explain daily tech benefits and uses",
      "Spot computer parts and components",
      "Demonstrate programming skills",
    ],
  },
  {
    name: "Intermediate",
    price: "EGP 6200",
    perClass: "EGP 515",
    duration: "3 months – 12 Live Classes",
    age: "7–8 Years Old",
    locked: true,
    color: "#FBBF24",
    highlights: [
      "Use Scratch to build animations",
      "Apply basic logic and loops",
      "Practice problem-solving through code",
      "Create simple games",
    ],
  },
  {
    name: "Advanced",
    price: "EGP 6500",
    perClass: "EGP 540",
    duration: "3 months – 12 Live Classes",
    age: "7–8 Years Old",
    locked: true,
    color: "#a78bfa",
    highlights: [
      "Explore basic game modding",
      "Automate in-game actions",
      "Work with coordinates and logic",
      "Apply loops and variables in code",
    ],
  },
];

/* -------------------------------------------------------
   FLOATING SHAPE
--------------------------------------------------------*/
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <Motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* -------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------*/
export default function Courses() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [openLevel, setOpenLevel] = useState(null);

  const toggleLevel = (index, locked) => {
    if (locked) return;
    setOpenLevel((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white">
      <Navbar />

      {/* ===== Hero Banner ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        {/* Floating shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingShape className="absolute top-[18%] left-[12%] w-3 h-3 rounded-full bg-[#FBBF24]/30" delay={0} />
          <FloatingShape className="absolute top-[45%] right-[18%] w-2 h-2 rounded-full bg-[#2dd4bf]/40" delay={1.2} />
          <FloatingShape className="absolute bottom-[25%] left-[55%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20" delay={2} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-28 pb-16 md:pt-32 md:pb-20 text-center">
          <Motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                Explore Our Programs
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 font-display">
              Your Learning <span className="text-[#FBBF24]">Path</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base">
              Choose your track, select the right grade, and discover the
              journey that best fits your child.
            </p>
          </Motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
            <path
              d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-4 pb-16 -mt-2">
        <div className="max-w-6xl mx-auto">
          {/* TRACKS */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-lg font-bold text-[#102a5a] mb-6 text-center">
              Choose a Track
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {tracks.map((track) => (
                <Motion.div
                  key={track.id}
                  whileHover={{ y: -6 }}
                  onClick={() => {
                    setSelectedTrack(track.id);
                    setSelectedGrade(null);
                    setOpenLevel(null);
                  }}
                  className={`cursor-pointer w-80 bg-white rounded-3xl overflow-hidden shadow-sm border-2 transition-all duration-300 group ${selectedTrack === track.id
                      ? "border-[#FBBF24] shadow-[0_8px_30px_rgba(251,191,36,0.15)]"
                      : "border-transparent hover:border-slate-200 hover:shadow-md"
                    }`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={track.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={track.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FBBF24] flex items-center justify-center">
                        <track.icon className="w-4 h-4 text-[#102a5a]" />
                      </div>
                      <span className="text-white font-bold text-sm drop-shadow">
                        {track.name}
                      </span>
                    </div>
                    {selectedTrack === track.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#FBBF24] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#102a5a]" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500">{track.description}</p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </Motion.div>

          {/* GRADES */}
          <AnimatePresence>
            {selectedTrack && (
              <Motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <h2 className="text-lg font-bold text-[#102a5a] mb-4">
                  Select Age Group
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {grades.map((g, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGrade(g);
                        setOpenLevel(null);
                      }}
                      className={`px-6 py-2.5 rounded-full font-semibold border-2 transition-all duration-200 ${selectedGrade === g
                          ? "bg-[#FBBF24] text-[#102a5a] border-[#FBBF24] shadow-[0_4px_15px_rgba(251,191,36,0.3)]"
                          : "bg-white border-slate-200 text-[#102a5a] hover:border-[#FBBF24]/50 hover:bg-[#FBBF24]/5"
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL CARDS */}
          <AnimatePresence>
            {selectedGrade && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {levels.map((lvl, idx) => (
                  <Motion.div
                    key={lvl.name}
                    whileHover={lvl.locked ? {} : { y: -6 }}
                    className={`relative bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 ${lvl.locked
                        ? "border-slate-100"
                        : openLevel === idx
                          ? "border-[#FBBF24] shadow-[0_8px_30px_rgba(251,191,36,0.1)]"
                          : "border-slate-100 hover:shadow-md cursor-pointer"
                      }`}
                    onClick={() => toggleLevel(idx, lvl.locked)}
                  >
                    {/* LOCKED OVERLAY */}
                    {lvl.locked && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-20">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                          <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-slate-500 font-semibold text-sm tracking-widest uppercase">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    <div className={`${lvl.locked ? "opacity-0" : "opacity-100"} transition`}>
                      {/* Color accent bar */}
                      <div
                        className="w-10 h-1.5 rounded-full mb-4"
                        style={{ backgroundColor: lvl.color }}
                      />

                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#102a5a]">
                          {lvl.name}
                        </h3>
                        {lvl.price && (
                          <span className="text-[#D97706] font-bold text-sm">
                            {lvl.price}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">{lvl.duration}</p>
                      <p className="text-xs text-slate-500 mb-4">{lvl.age}</p>

                      <ul className="text-xs text-slate-600 space-y-2">
                        {lvl.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0 mt-0.5"
                              style={{ color: lvl.color }}
                            />
                            {h}
                          </li>
                        ))}
                      </ul>

                      {!lvl.locked && (
                        <div className="flex justify-end mt-4">
                          {openLevel === idx ? (
                            <ChevronUp className="w-5 h-5 text-[#FBBF24]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </Motion.div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL 1 SESSIONS */}
          <AnimatePresence>
            {openLevel === 0 && level1Sessions.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                className="mt-12"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-[#FBBF24]" />
                  <h2 className="text-xl font-bold text-[#102a5a] font-display">
                    Level 1 Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {level1Sessions.map((s, i) => (
                    <Motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center text-xs font-bold text-[#102a5a]">
                          {i + 1}
                        </div>
                        <h3 className="font-semibold text-[#102a5a] text-sm">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600">{s.text}</p>
                    </Motion.div>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs bg-[#071228]">
        <p className="text-slate-500">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
