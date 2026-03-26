import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Cpu,
  Code,
  CheckCircle2,
  Gamepad,
  Compass,
  Target,
  Blocks,
  Activity,
  ShieldCheck,
  Sparkles,
  Rocket,
  GraduationCap,
  Lightbulb,
  MonitorSmartphone,
  BrainCircuit,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const ageGroupsRaw = [
  { id: "6-8", key: "0", icon: Sparkles, color: "#2dd4bf" },
  { id: "9-11", key: "1", icon: Rocket, color: "#FBBF24" },
  { id: "12-14", key: "2", icon: Lightbulb, color: "#a78bfa" },
  { id: "15-17", key: "3", icon: GraduationCap, color: "#f472b6" },
];

const foundationCoursesRaw = [
  { color: "#2dd4bf", icon: Compass },
  { color: "#FBBF24", icon: Blocks },
];

// detailed list of courses for 6–8
const courses6to8Raw = [
  { icon: MonitorSmartphone, color: "#2dd4bf" },
  { icon: BrainCircuit, color: "#a78bfa" },
  { icon: Rocket, color: "#FBBF24" },
  { icon: Gamepad, color: "#f472b6" },
  { icon: Compass, color: "#60a5fa" },
  { icon: BrainCircuit, color: "#2dd4bf" },
  { icon: Blocks, color: "#a78bfa" },
  { icon: Lightbulb, color: "#FBBF24" },
  { icon: Target, color: "#f472b6" },
  { icon: Activity, color: "#60a5fa" },
  { icon: Code, color: "#2dd4bf" },
  { icon: Zap, color: "#FBBF24" },
];

// tracks per age-range for the specialization phase
const ageTracksRaw = {
  "9-11": [
    { id: "gamedev", icon: Gamepad, image: "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&q=80&w=800" },
    { id: "genai", icon: Cpu, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" },
    { id: "uiux", icon: Blocks, image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800" },
  ],
  "12-14": [
    { id: "mobileapp", icon: Code, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800" },
    { id: "electronics-robotics", icon: Cpu, image: "https://i.ibb.co/tgt5sxw/Gemini-Generated-Image-2h1f5p2h1f5p2h1f.webp" },
    { id: "webdev", icon: Code, image: "https://i.ibb.co/Tx3S43Xw/9602bc4b-cfc4-410e-b291-611d478c9d6a.webp" },
  ],
  "15-17": [
    { id: "data-ai", icon: Activity, image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800" },
    { id: "automation", icon: Target, image: "https://images.unsplash.com/photo-1581092580348-6a5a9b040fd2?auto=format&fit=crop&q=80&w=800" },
    { id: "cyber", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=800" },
  ],
};

const standardPhasesRaw = [
  { id: "exploration", color: "#FBBF24", icon: Compass },
  { id: "indepth", color: "#a78bfa", icon: Target },
];

export default function CurriculumSection() {
  const { t, i18n } = useTranslation();
  const [selectedAge, setSelectedAge] = useState(null);
  const [openPhase, setOpenPhase] = useState(null);
  const [openFoundation, setOpenFoundation] = useState(null);

  const tracksForSelectedAge =
    selectedAge && selectedAge !== "6-8" ? ageTracksRaw[selectedAge] || [] : [];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* AGE SELECTION */}
      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        className="mb-14"
      >
        <h2 className="text-xl md:text-2xl font-extrabold mb-8 text-center text-slate-800">
          {t("courses.select_age_title")}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 px-4">
          {ageGroupsRaw.map((age) => {
            const isActive = selectedAge === age.id;
            return (
              <button
                key={age.id}
                onClick={() => {
                  setSelectedAge(age.id);
                  setOpenPhase(null);
                  setOpenFoundation(null);
                }}
                className={`relative group flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold transition-all duration-300 text-sm md:text-base overflow-hidden border-2
                  ${isActive
                    ? "border-transparent text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] scale-105"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg hover:-translate-y-1"
                  }`}
              >
                {/* Active Background Gradient */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 z-0" />
                )}
                
                {/* Active Inner Glow */}
                {isActive && (
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)] z-0" />
                )}

                <age.icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-300 
                    ${isActive ? "text-amber-400" : "text-slate-400 group-hover:text-blue-500"}`}
                />
                <span className="relative z-10 tracking-wide">
                  {t(`courses.ages.a${age.key}`)}
                </span>
              </button>
            );
          })}
        </div>
      </Motion.div>

      <AnimatePresence mode="wait">
        {/* NO SELECTION STATE */}
        {!selectedAge && (
          <Motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 px-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6 text-slate-300 shadow-inner">
              <GraduationCap size={40} />
            </div>
            <p className="text-lg font-medium text-slate-400 max-w-md mx-auto">
              {t("courses.empty_state")}
            </p>
          </Motion.div>
        )}

        {/* FOUNDATION STAGE (AGES 6-8) */}
        {selectedAge === "6-8" && (
          <Motion.div
            key="foundation"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="px-4"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-teal-50 text-teal-600 font-extrabold text-xs tracking-widest uppercase mb-4 shadow-sm border border-teal-100">
                <Sparkles size={14} />
                {t("courses.foundation_badge")}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {t("courses.foundation_title")}
              </h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto text-base leading-relaxed">
                {t("courses.foundation_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14">
              {foundationCoursesRaw.map((course, idx) => {
                const isOpen = openFoundation === idx;
                return (
                  <Motion.div
                    key={course.icon.displayName || idx}
                    whileHover={{ y: -4 }}
                    className={`relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 cursor-pointer border-2
                      ${isOpen
                        ? "shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-transparent"
                        : "border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200"
                      }`}
                    style={{
                      borderColor: isOpen ? course.color : undefined,
                    }}
                    onClick={() => setOpenFoundation(isOpen ? null : idx)}
                  >
                    {/* Gradient top strip */}
                    <div
                      className="h-2 w-full"
                      style={{ background: `linear-gradient(90deg, ${course.color}, ${course.color}90)` }}
                    />

                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-5 mb-2">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: `linear-gradient(135deg, ${course.color}25, ${course.color}10)`,
                            boxShadow: `0 8px 20px ${course.color}20`,
                            border: `1px solid ${course.color}30`,
                          }}
                        >
                          <course.icon className="w-7 h-7" style={{ color: course.color }} />
                        </div>
                        <div className="text-start flex-1">
                          <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-1">
                            {t(`courses.fc.${idx}.name`)}
                          </h3>
                          <p className="text-sm font-bold opacity-80" style={{ color: course.color }}>
                            {t(`courses.fc.${idx}.duration`)}
                          </p>
                        </div>
                        
                        {/* Dropdown chevron */}
                        <Motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </Motion.div>
                      </div>

                      {/* Expandable content */}
                      <div
                        className={`overflow-hidden transition-all duration-400 ease-in-out ${
                          isOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
                        }`}
                      >
                        <div className="pt-4 border-t border-slate-100">
                          <ul className="space-y-3.5">
                            {[0, 1, 2, 3].map((i) => (
                              <li
                                key={i}
                                className="flex gap-3 items-start text-sm md:text-base text-slate-600 font-medium text-start"
                              >
                                <CheckCircle2
                                  className="w-5 h-5 shrink-0 mt-0.5"
                                  style={{ color: course.color }}
                                />
                                {t(`courses.fc.${idx}.highlights.${i}`)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                );
              })}
            </div>

            {/* Detailed list of 6–8 courses */}
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-800 mb-2 text-center">
                {t("courses.stage_courses_title")}
              </h3>
              <p className="text-sm md:text-base font-medium text-slate-500 text-center mb-8 max-w-2xl mx-auto">
                {t("courses.stage_courses_desc")}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {courses6to8Raw.map((course, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-full border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default"
                    style={{
                      borderColor: `${course.color}40`,
                      boxShadow: `0 4px 10px ${course.color}10`,
                      color: "#334155",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = `${course.color}08`}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <course.icon className="w-4 h-4" style={{ color: course.color }} />
                    {t(`courses.c6to8.${idx}`)}
                  </span>
                ))}
              </div>
            </div>
          </Motion.div>
        )}

        {/* STANDARD PATH (AGES 9-17) */}
        {selectedAge && selectedAge !== "6-8" && (
          <Motion.div
            key="standard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="px-4"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-amber-50 text-amber-600 font-extrabold text-xs tracking-widest uppercase mb-4 shadow-sm border border-amber-100">
                <Rocket size={14} />
                {t("courses.standard_badge")}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {t("courses.standard_title")}
              </h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto text-base leading-relaxed">
                {t("courses.standard_desc")}
              </p>
            </div>

            {/* THE PHASES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
              {standardPhasesRaw.map((phase, idx) => {
                const isOpen = openPhase === idx;
                return (
                  <Motion.div
                    key={phase.id}
                    whileHover={{ y: -4 }}
                    className={`relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 cursor-pointer border-2
                      ${isOpen
                        ? "shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-transparent"
                        : "border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200"
                      }`}
                    style={{
                      borderColor: isOpen ? phase.color : undefined,
                    }}
                    onClick={() => setOpenPhase(isOpen ? null : idx)}
                  >
                    {/* Gradient top strip */}
                    <div
                      className="h-2 w-full"
                      style={{ background: `linear-gradient(90deg, ${phase.color}, ${phase.color}90)` }}
                    />

                    <div className="p-6 md:p-8">
                      {/* Duration badge — top on mobile */}
                      <div className="flex items-center justify-between mb-4 md:hidden">
                        <span
                          className="text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider"
                          style={{
                            backgroundColor: `${phase.color}15`,
                            color: phase.color,
                          }}
                        >
                          {t(`courses.phases.${phase.id}.duration`)}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-2">
                        <div className="flex items-start gap-4 md:gap-5 flex-1">
                          <div
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300"
                            style={{
                              background: `linear-gradient(135deg, ${phase.color}25, ${phase.color}10)`,
                              boxShadow: `0 8px 20px ${phase.color}20`,
                              border: `1px solid ${phase.color}30`,
                            }}
                          >
                            <phase.icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: phase.color }} />
                          </div>
                          
                          <div className="min-w-0 text-start flex-1">
                            <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-1">
                              {t(`courses.phases.${phase.id}.name`)}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-none">
                              {t(`courses.phases.${phase.id}.desc`)}
                            </p>
                          </div>
                        </div>

                        {/* Duration badge & Chevron — inline on desktop */}
                        <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
                          <span
                            className="text-xs font-extrabold px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wider"
                            style={{
                              backgroundColor: `${phase.color}15`,
                              color: phase.color,
                            }}
                          >
                            {t(`courses.phases.${phase.id}.duration`)}
                          </span>
                          <Motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </Motion.div>
                        </div>
                      </div>

                      {/* Chevron on Mobile */}
                      <div className="flex justify-center mt-2 md:hidden">
                        <Motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </Motion.div>
                      </div>

                      {/* Expandable content */}
                      <div
                        className={`overflow-hidden transition-all duration-400 ease-in-out ${
                          isOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
                        }`}
                      >
                        <div className="p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 text-start">
                          <h4 className="text-xs font-extrabold text-slate-400 mb-4 uppercase tracking-widest">
                            {t("courses.what_to_expect")}
                          </h4>
                          <ul className="space-y-3.5">
                            {[0, 1, 2, 3].map((i) => (
                              <li
                                key={i}
                                className="flex gap-3 items-start text-sm md:text-base font-medium text-slate-700 text-start"
                              >
                                <CheckCircle2
                                  className="w-5 h-5 shrink-0 mt-0.5"
                                  style={{ color: phase.color }}
                                />
                                {t(`courses.phases.${phase.id}.highlights.${i}`)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                );
              })}
            </div>

            {/* TRACKS FOR PHASE 2 PREVIEW – DYNAMIC BY AGE */}
            <div className="pt-12 border-t border-slate-200">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {t("courses.available_tracks_title")}
                </h3>
                <p className="text-base font-medium text-slate-500 mt-2 max-w-lg mx-auto">
                  {t("courses.available_tracks_desc")}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                {tracksForSelectedAge.map((track, i) => (
                  <Motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -8 }}
                    className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:border-blue-200 transition-all duration-300 group flex flex-col"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img
                        src={track.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        alt={t(`courses.tracks.${track.id}.name`)}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                      
                      <div className={`absolute bottom-5 ${i18n.language === "ar" ? "right-5" : "left-5"} flex items-center gap-3.5`}>
                        <div className="w-10 h-10 rounded-xl bg-amber-400 backdrop-blur-md flex items-center justify-center shadow-lg border border-amber-300 group-hover:bg-amber-300 transition-colors">
                          <track.icon className="w-5 h-5 text-amber-900" />
                        </div>
                        <span className="text-white font-extrabold text-base tracking-wide drop-shadow-md text-start leading-tight">
                          {t(`courses.tracks.${track.id}.name`)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 text-start bg-gradient-to-b from-white to-slate-50 flex-1">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                        {t(`courses.tracks.${track.id}.desc`)}
                      </p>
                    </div>
                  </Motion.div>
                ))}

                {tracksForSelectedAge.length === 0 && (
                  <div className="py-12 px-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 w-full max-w-2xl">
                    <p className="text-base font-semibold text-slate-400 text-center">
                      {t("courses.coming_soon")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}