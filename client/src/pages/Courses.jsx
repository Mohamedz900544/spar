import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Code,
  CheckCircle2,
  Gamepad,
  Compass,
  Target,
  Blocks
} from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const ageGroups = [
  { id: "6-8", label: "Ages 6-8" },
  { id: "9-11", label: "Ages 9-11" },
  { id: "12-14", label: "Ages 12-14" },
  { id: "15-17", label: "Ages 15-17" },
];

const tracks = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Build real circuits, power LEDs, and learn how chips work",
    icon: Cpu,
    image: "https://i.ibb.co/tgt5sxw/Gemini-Generated-Image-2h1f5p2h1f5p2h1f.webp",
  },
  {
    id: "frontend",
    name: "Web Development",
    description: "Create websites, animations, and interactive apps",
    icon: Code,
    image: "https://i.ibb.co/Tx3S43Xw/9602bc4b-cfc4-410e-b291-611d478c9d6a.webp",
  },
  {
    id: "gamedev",
    name: "Game Development",
    description: "Design logic, characters, and build your own playable games",
    icon: Gamepad,
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&q=80&w=800",
  },
];

const foundationCourses = [
  {
    name: "Tech Discovery",
    duration: "Foundation Curriculum",
    color: "#2dd4bf",
    icon: Compass,
    highlights: [
      "Identify tech types in daily life",
      "Explain daily tech benefits and uses",
      "Spot computer parts and components",
      "Hands-on interactive learning",
    ],
  },
  {
    name: "Creative Logic",
    duration: "Foundation Curriculum",
    color: "#FBBF24",
    icon: Blocks,
    highlights: [
      "Apply basic logic and sequences",
      "Play-based problem solving",
      "Introduction to visual block coding",
      "Build early digital confidence",
    ],
  },
];

const standardPhases = [
  {
    id: "exploration",
    name: "Phase 1: Exploration Period",
    duration: "3 Months",
    color: "#FBBF24",
    icon: Compass,
    description: "Try one different track each month to discover what you enjoy most.",
    highlights: [
      "Month 1: First Track Introduction",
      "Month 2: Second Track Introduction",
      "Month 3: Third Track Introduction",
      "Find your true tech passion naturally",
    ],
  },
  {
    id: "indepth",
    name: "Phase 2: In-Depth Track",
    duration: "3 Months",
    color: "#a78bfa",
    icon: Target,
    description: "Choose your favorite track from the exploration phase and master it.",
    highlights: [
      "Deep dive into your chosen specialty",
      "Advanced project building",
      "Focused skill development",
      "Track-specific mentorship",
    ],
  },
];

/* -------------------------------------------------------
   FLOATING SHAPE COMPONENT
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
  const [selectedAge, setSelectedAge] = useState(null);
  const [openPhase, setOpenPhase] = useState(0); 
  const [openFoundation, setOpenFoundation] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white font-sans">
      <Navbar />

      {/* ===== Hero Banner ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
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

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-32 pb-16 md:pt-40 md:pb-24 text-center">
          <Motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Discover Your <span className="text-[#FBBF24]">Path</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base">
              Select your age group below to see the personalized curriculum and journey we offer.
            </p>
          </Motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
            <path d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-4 pb-16 pt-8 md:pt-12">
        <div className="max-w-6xl mx-auto">
          
          {/* AGE SELECTION */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-[#102a5a] mb-6 text-center">
              Select Age Group
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {ageGroups.map((age) => (
                <button
                  key={age.id}
                  onClick={() => {
                    setSelectedAge(age.id);
                    setOpenPhase(0);
                    setOpenFoundation(0);
                  }}
                  className={`px-8 py-3 rounded-full font-bold border-2 transition-all duration-300 text-sm md:text-base ${
                    selectedAge === age.id
                      ? "bg-[#102a5a] text-white border-[#102a5a] shadow-[0_8px_20px_rgba(16,42,90,0.25)] scale-105"
                      : "bg-white border-slate-200 text-slate-600 hover:border-[#102a5a]/30 hover:bg-slate-50"
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </Motion.div>

          <AnimatePresence mode="wait">
            {/* NO SELECTION STATE */}
            {!selectedAge && (
              <Motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-slate-400"
              >
                Please select an age group above to view the curriculum.
              </Motion.div>
            )}

            {/* FOUNDATION STAGE (AGES 6-8) */}
            {selectedAge === "6-8" && (
              <Motion.div
                key="foundation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8">
                  <span className="inline-block py-1 px-3 rounded-full bg-[#2dd4bf]/10 text-[#2dd4bf] font-bold text-xs tracking-widest uppercase mb-3">
                    Early Learners
                  </span>
                  <h2 className="text-2xl font-bold text-[#102a5a]">Foundation Stage</h2>
                  <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm">
                    A dedicated phase for our youngest learners featuring specialized courses designed to introduce technology in a fun, engaging, and play-based way.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {foundationCourses.map((course, idx) => (
                    <Motion.div
                      key={course.name}
                      whileHover={{ y: -4 }}
                      className={`relative bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 cursor-pointer ${
                        openFoundation === idx ? "border-[#2dd4bf] shadow-md" : "border-slate-100"
                      }`}
                      onClick={() => setOpenFoundation(openFoundation === idx ? null : idx)}
                    >
                      <div className="w-12 h-1.5 rounded-full mb-5" style={{ backgroundColor: course.color }} />
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${course.color}15`, color: course.color }}>
                          <course.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#102a5a]">{course.name}</h3>
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-400 mb-5">{course.duration}</p>

                      <ul className="space-y-3 mb-4">
                        {course.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: course.color }} />
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-end mt-4">
                        {openFoundation === idx ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </Motion.div>
            )}

            {/* STANDARD PATH (AGES 9-17) */}
            {selectedAge && selectedAge !== "6-8" && (
              <Motion.div
                key="standard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-10">
                  <span className="inline-block py-1 px-3 rounded-full bg-[#FBBF24]/10 text-[#D97706] font-bold text-xs tracking-widest uppercase mb-3">
                    The Journey
                  </span>
                  <h2 className="text-2xl font-bold text-[#102a5a]">Your Learning Path</h2>
                  <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm">
                    Students go through a 3-month exploration phase to try out different tracks, followed by 3 months of deep specialization based on their passion.
                  </p>
                </div>

                {/* THE PHASES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
                  {standardPhases.map((phase, idx) => (
                    <Motion.div
                      key={phase.id}
                      whileHover={{ y: -4 }}
                      className={`relative bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 cursor-pointer ${
                        openPhase === idx ? `border-[${phase.color}] shadow-md` : "border-slate-100"
                      }`}
                      style={{ borderColor: openPhase === idx ? phase.color : "" }}
                      onClick={() => setOpenPhase(openPhase === idx ? null : idx)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: phase.color }} />
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: `${phase.color}15`, color: phase.color }}>
                          {phase.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <phase.icon className="w-5 h-5" style={{ color: phase.color }} />
                        <h3 className="text-lg font-bold text-[#102a5a]">{phase.name}</h3>
                      </div>

                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {phase.description}
                      </p>

                      <div className={`overflow-hidden transition-all duration-300 ${openPhase === idx ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                          <h4 className="text-xs font-bold text-[#102a5a] mb-3 uppercase tracking-wider">What to Expect</h4>
                          <ul className="space-y-2.5">
                            {phase.highlights.map((h, i) => (
                              <li key={i} className="flex gap-2 items-start text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: phase.color }} />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-center mt-2">
                        {openPhase === idx ? (
                          <ChevronUp className="w-5 h-5 text-slate-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </Motion.div>
                  ))}
                </div>

                {/* TRACKS FOR PHASE 2 PREVIEW */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-[#102a5a]">Available Tracks for Specialization</h3>
                    <p className="text-sm text-slate-500 mt-1">During Phase 2, you will choose one of these to master.</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-6">
                    {tracks.map((track) => (
                      <Motion.div
                        key={track.id}
                        whileHover={{ y: -6 }}
                        className="w-80 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          <img
                            src={track.image}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={track.name}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#071228]/80 via-[#071228]/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <track.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold text-sm tracking-wide">
                              {track.name}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-slate-500 leading-relaxed">{track.description}</p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
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