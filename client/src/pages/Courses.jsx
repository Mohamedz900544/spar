import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { ChevronDown, ChevronUp, Sparkles, Lock } from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const level1Sessions = [];

const tracks = [
  {
    id: "electronics",
    name: "Electronics",
    image: "https://i.ibb.co/tgt5sxw/Gemini-Generated-Image-2h1f5p2h1f5p2h1f.webp",
  },
  {
    id: "frontend",
    name: "Web Development",
    image: "https://i.ibb.co/Tx3S43Xw/9602bc4b-cfc4-410e-b291-611d478c9d6a.webp",
  },
];

const grades = ["Years 7-8", "Years 9-10", "Years 11-12"];

const levels = [
  {
    name: "Beginner",
    duration: "1 Month – 8 On-Site Classes",
    age: "7-8 Years Old",
    locked: false,
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
    highlights: [
      "Explore basic game modding",
      "Automate in-game actions",
      "Work with coordinates and logic",
      "Apply loops and variables in code",
    ],
  },
];

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] via-[#e8efff] to-white">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <Navbar />
      </div>

      <main className="flex-1 px-4 pt-20 pb-16">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#102a5a] mb-3 font-display">
              Your Learning Path
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
              Choose your track, select the right grade, and explore the path
              that best fits your child's learning journey.
            </p>
          </Motion.div>

          {/* TRACKS */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {tracks.map((track) => (
              <Motion.div
                key={track.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  setSelectedTrack(track.id);
                  setSelectedGrade(null);
                  setOpenLevel(null);
                }}
                className={`cursor-pointer w-72 bg-white rounded-2xl overflow-hidden shadow-md border-2 transition-all ${selectedTrack === track.id
                  ? "border-navy-600 shadow-lg"
                  : "border-transparent hover:border-slate-200"
                  }`}
              >
                <img
                  src={track.image}
                  className="h-40 w-full object-cover"
                  alt={track.name}
                />
                <div className="p-4 text-center font-semibold text-[#102a5a]">
                  {track.name}
                </div>
              </Motion.div>
            ))}
          </div>

          {/* GRADES */}
          <AnimatePresence>
            {selectedTrack && (
              <Motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap justify-center gap-3 mb-10"
              >
                {grades.map((g, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedGrade(g);
                      setOpenLevel(null);
                    }}
                    className={`px-6 py-2.5 rounded-full font-semibold border-2 transition-all ${selectedGrade === g
                      ? "bg-[#102a5a] text-white border-[#102a5a]"
                      : "bg-white border-[#102a5a] text-[#102a5a] hover:bg-[#e8edf5]"
                      }`}
                  >
                    {g}
                  </button>
                ))}
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
                    whileHover={{ y: -4 }}
                    className="relative bg-white rounded-2xl p-6 shadow-md border border-slate-100 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => toggleLevel(idx, lvl.locked)}
                  >
                    {/* OVERLAY FOR LOCKED LEVEL */}
                    {lvl.locked && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20">
                        <Lock className="w-7 h-7 mb-2 text-slate-400" />
                        <span className="text-slate-500 font-semibold text-sm tracking-wide">
                          COMING SOON
                        </span>
                      </div>
                    )}

                    <div className={`${lvl.locked ? "opacity-0" : "opacity-100"} transition`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#102a5a]">{lvl.name}</h3>
                        <span className="text-[#D97706] font-bold">{lvl.price}</span>
                      </div>

                      <p className="text-xs text-slate-500">{lvl.duration}</p>
                      <p className="text-xs text-slate-500 mb-3">{lvl.age}</p>

                      <ul className="text-xs text-slate-600 space-y-1.5">
                        {lvl.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="text-teal shrink-0 mt-0.5">✔</span> {h}
                          </li>
                        ))}
                      </ul>

                      {!lvl.locked && (
                        <div className="flex justify-end mt-3">
                          {openLevel === idx ? (
                            <ChevronUp className="w-5 h-5 text-[#102a5a]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#102a5a]" />
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
            {openLevel === 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                className="mt-10"
              >
                <div className="flex items-center gap-2 mb-4">
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
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#102a5a]/10 flex items-center justify-center text-xs font-semibold text-[#102a5a]">
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

      <footer className="py-5 text-center text-xs bg-[#040b18]">
        <p className="text-slate-500">© {new Date().getFullYear()} Sparvi Lab. All rights reserved.</p>
      </footer>
    </div>
  );
}
