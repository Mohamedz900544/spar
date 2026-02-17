import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { ChevronDown, ChevronUp, Sparkles, Lock } from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const level1Sessions = [
  // {
  //   title: "Session 1: Electricity Basics",
  //   text: "Kids learn what electric current is, how batteries store energy, and how a switch controls the flow. We build a simple circuit together.",
  // },
  // {
  //   title: "Session 2: Electric Motor Fun",
  //   text: "We explore how an electric motor works when it receives power. Then we create a mini fan as a hands on activity.",
  // },
  // {
  //   title: "Session 3: WalkyBot Build and Sumo Challenge",
  //   text: "Students assemble the WalkyBot robot step by step, then join a friendly Sumo competition. Every child earns a prize to celebrate teamwork and effort.",
  // },
  // {
  //   title: "Session 4: Hand Generator and Energy Creation",
  //   text: "Kids discover how a generator produces electricity. We build a simple generator circuit and power it using our Hand Generator toy.",
  // },
  // {
  //   title: "Session 5: Light Sensor Challenge (LDR)",
  //   text: "We introduce sensors using an LDR light sensor. Kids learn how devices can “sense” light and react. They build a simple light responsive circuit where an LED changes based on brightness.",
  // },
  // {
  //   title: "Session 6: Smart Farm Project (Hand Generator Powered)",
  //   text: "Students build a mini smart farm model powered by the Hand Generator, bringing together circuits, motors, and sensors in one fun project.",
  // },
];

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
    // price: "EGP 5900",
    // perClass: "EGP 490",
    duration: "1 Month – 8 On-Site Classes",
    age: "7-8 Years Old",
    locked: false, // OPEN
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
    locked: true, // LOCKED
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
    locked: true, // LOCKED
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
    if (locked) return; // prevent opening locked levels
    setOpenLevel((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f9ff]">
      <div className="bg-white shadow-sm">
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0b63c7] mb-3">
              Your Learning Path
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">
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
                className={`cursor-pointer w-72 bg-white rounded-2xl overflow-hidden shadow-md border-2 transition ${
                  selectedTrack === track.id
                    ? "border-[#0b63c7]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={track.image}
                  className="h-40 w-full object-cover"
                  alt={track.name}
                />
                <div className="p-4 text-center font-semibold text-slate-700">
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
                    className={`px-6 py-2 rounded-full font-semibold border-2 transition ${
                      selectedGrade === g
                        ? " bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "bg-white border-[#0b63c7] text-[#0b63c7]"
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
    className="relative bg-white rounded-2xl p-6 shadow-lg border border-[#e5e7eb] cursor-pointer transition"
    onClick={() => toggleLevel(idx, lvl.locked)}
  >

    {/* OVERLAY FOR LOCKED LEVEL */}
    {lvl.locked && (
      <div
        className="
        absolute inset-0 
        bg-white/80 backdrop-blur-sm
        flex flex-col items-center justify-center
        rounded-2xl z-20
        "
      >
        <Lock className="w-7 h-7 mb-2 text-gray-500" />
        <span className="text-gray-600 font-semibold text-sm tracking-wide">
          COMING SOON
        </span>
      </div>
    )}

    {/* CONTENT (HIDDEN WHEN LOCKED) */}
    <div className={`${lvl.locked ? "opacity-0" : "opacity-100"} transition`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-800">{lvl.name}</h3>
        <span className="text-[#0b63c7] font-bold">{lvl.price}</span>
      </div>

      <p className="text-xs text-slate-500">{lvl.duration}</p>
      <p className="text-xs text-slate-500 mb-2">
        {/* Per Class: <strong>{lvl.perClass}</strong> */}
      </p>
      <p className="text-xs text-slate-500 mb-3">{lvl.age}</p>

      <ul className="text-xs text-slate-600 space-y-1">
        {lvl.highlights.map((h, i) => (
          <li key={i} className="flex gap-2">
            <span>✔</span> {h}
          </li>
        ))}
      </ul>

      {!lvl.locked && (
        <div className="flex justify-end mt-3">
          {openLevel === idx ? (
            <ChevronUp className="w-5 h-5 text-[#0b63c7]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#0b63c7]" />
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
                  <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                  <h2 className="text-xl font-bold text-slate-800">
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
                      className="bg-white rounded-2xl p-5 border border-[#dbeafe] shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-xs font-semibold text-[#0b63c7]">
                          {i + 1}
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm">
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

      <footer className="py-6 text-center text-xs text-slate-500 bg-white border-t">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </div>
  );
}
