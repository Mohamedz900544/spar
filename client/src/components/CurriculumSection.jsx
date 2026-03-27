import React, { useState, useRef } from "react";
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
  { id: "6-8", key: "0", icon: Sparkles, color: "#2dd4bf", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/toddler.svg?v=1764947251" },
  { id: "9-11", key: "1", icon: Rocket, color: "#FBBF24", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/kid.svg?v=1764947250" },
  { id: "12-14", key: "2", icon: Lightbulb, color: "#a78bfa", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/pre-teen_1bfb9f3d-9abc-4329-8733-8eb4d67addc5.svg?v=1764947328" },
  { id: "15-17", key: "3", icon: GraduationCap, color: "#f472b6", image: "https://i.ibb.co/TB9j3RDg/creatvity.png" },
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
    { id: "gamedev", icon: Gamepad, image: "https://i.ibb.co/M41wcFG/25645686.webp" },
    { id: "genai", icon: Cpu, image: "https://i.ibb.co/2YYjyHp0/Gemini-Generated-Image-u6v74du6v74du6v7.webp" },
    { id: "uiux", icon: Blocks, image: "https://i.ibb.co/8Lwh85JC/image-2.jpg" },
  ],
  "12-14": [
    { id: "mobileapp", icon: Code, image: "https://i.ibb.co/gMkpy95d/image-3.jpg" },
    { id: "electronics-robotics", icon: Cpu, image: "https://i.ibb.co/27z9vNB0/Gemini-Generated-Image-jvudr8jvudr8jvud.webp" },
    { id: "webdev", icon: Code, image: "https://i.ibb.co/WpyQyJ6f/Gemini-Generated-Image-7xuf9f7xuf9f7xuf.webp" },
  ],
  "15-17": [
    { id: "data-ai", icon: Activity, image: "https://i.ibb.co/H6zN2Wb/846545.webp" },
    { id: "automation", icon: Target, image: "https://i.ibb.co/xVTp1PK/2962489.webp" },
    { id: "cyber", icon: ShieldCheck, image: "https://i.ibb.co/FL6Y97dQ/3818937.webp" },
  ],
};

const standardPhasesRaw = [
  { id: "exploration", color: "#FBBF24", icon: Compass },
  { id: "indepth", color: "#a78bfa", icon: Target },
];

/* -------------------------------------------------------
   CONTENT PANEL (shared between mobile inline + desktop)
--------------------------------------------------------*/
function ContentPanel({ selectedAge, tracksForSelectedAge, openFoundation, setOpenFoundation, openPhase, setOpenPhase, t, i18n }) {
  return (
    <div className="px-1 mt-8">
      {/* FOUNDATION STAGE (AGES 6-8) */}
      {selectedAge === "6-8" && (
        <>
          <div className="text-center mb-10">
            
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
                <div
                  key={course.icon.displayName || idx}
                  className={`relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 cursor-pointer border-2 hover:-translate-y-1
                    ${isOpen
                      ? "shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-transparent"
                      : "border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200"
                    }`}
                  style={{
                    borderColor: isOpen ? course.color : undefined,
                  }}
                  onClick={() => setOpenFoundation(isOpen ? null : idx)}
                >
                  <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${course.color}, ${course.color}90)` }}
                  />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-5 mb-2">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
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
                      <div
                        className="shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-400 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
                      }`}
                    >
                      <div className="pt-4 border-t border-slate-100">
                        <ul className="space-y-3.5">
                          {[0, 1, 2, 3].map((i) => (
                            <li key={i} className="flex gap-3 items-start text-sm md:text-base text-slate-600 font-medium text-start">
                              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: course.color }} />
                              {t(`courses.fc.${idx}.highlights.${i}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-0 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100">
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
        </>
      )}

      {/* STANDARD PATH (AGES 9-17) */}
      {selectedAge && selectedAge !== "6-8" && (
        <>
          {/* TRACKS FOR SPECIALIZATION */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {t("courses.available_tracks_title")}
              </h3>
           
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {tracksForSelectedAge.map((track, i) => (
                <div
                  key={track.id}
                  className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:border-blue-200 transition-all duration-300 group flex flex-col hover:-translate-y-2"
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
                </div>
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

          {/* LEARNING PATH HEADER */}
          <div className="text-center mb-10 pt-12 border-t border-slate-200">
           
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {t("courses.standard_title")}
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-base leading-relaxed">
              {t("courses.standard_desc")}
            </p>
          </div>

          {/* THE PHASES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {standardPhasesRaw.map((phase, idx) => {
              const isOpen = openPhase === idx;
              return (
                <div
                  key={phase.id}
                  className={`relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 cursor-pointer border-2 hover:-translate-y-1
                    ${isOpen
                      ? "shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-transparent"
                      : "border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200"
                    }`}
                  style={{
                    borderColor: isOpen ? phase.color : undefined,
                  }}
                  onClick={() => setOpenPhase(isOpen ? null : idx)}
                >
                  <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${phase.color}, ${phase.color}90)` }}
                  />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4 md:hidden">
                      <span
                        className="text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider"
                        style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                      >
                        {t(`courses.phases.${phase.id}.duration`)}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-2">
                      <div className="flex items-start gap-4 md:gap-5 flex-1">
                        <div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0"
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
                      <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
                        <span
                          className="text-xs font-extrabold px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wider"
                          style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                        >
                          {t(`courses.phases.${phase.id}.duration`)}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 transition-transform duration-300"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-2 md:hidden">
                      <div
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
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
                            <li key={i} className="flex gap-3 items-start text-sm md:text-base font-medium text-slate-700 text-start">
                              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: phase.color }} />
                              {t(`courses.phases.${phase.id}.highlights.${i}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function CurriculumSection() {
  const { t, i18n } = useTranslation();
  const [selectedAge, setSelectedAge] = useState(null);
  const [openPhase, setOpenPhase] = useState(null);
  const [openFoundation, setOpenFoundation] = useState(null);
  const contentRef = useRef(null);

  const tracksForSelectedAge =
    selectedAge && selectedAge !== "6-8" ? ageTracksRaw[selectedAge] || [] : [];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* AGE SELECTION */}
      <div className="mb-14">
        <h2 className="text-xl md:text-2xl font-extrabold mb-8 text-center text-slate-800">
          {t("courses.select_age_title")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1 max-w-4xl mx-auto">
          {ageGroupsRaw.map((age) => {
            const isActive = selectedAge === age.id;
            return (
              <React.Fragment key={age.id}>
                <button
                  onClick={() => {
                    setSelectedAge(isActive ? null : age.id);
                    setOpenPhase(null);
                    setOpenFoundation(null);
                    if (!isActive) {
                      setTimeout(() => {
                        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                  }}
                  className={`relative group flex items-center justify-center gap-3 px-4 py-3.5 md:py-4 rounded-2xl font-bold transition-all duration-300 text-sm md:text-base overflow-hidden border-2
                    ${isActive
                      ? "bg-white border-[#FBBF24] text-[#FBBF24] shadow-[0_12px_30px_rgba(251,191,36,0.25)] scale-105"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg hover:-translate-y-1"
                    }`}
                >
                  <img
                    src={age.image}
                    alt=""
                    className="w-20 h-20 object-contain relative z-10 rounded-xl"
                  />
                  <span className="relative z-10 tracking-wide whitespace-nowrap">
                    {t(`courses.ages.a${age.key}`)}
                  </span>
                </button>

                {/* Content panel — on mobile only, appears right after the active button */}
                {isActive && (
                  <div className="col-span-full hidden max-md:block" ref={contentRef}>
                    <ContentPanel
                      selectedAge={selectedAge}
                      tracksForSelectedAge={tracksForSelectedAge}
                      openFoundation={openFoundation}
                      setOpenFoundation={setOpenFoundation}
                      openPhase={openPhase}
                      setOpenPhase={setOpenPhase}
                      t={t}
                      i18n={i18n}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Desktop content — below all buttons */}
      <div className="hidden md:block">
        {selectedAge && (
          <ContentPanel
            selectedAge={selectedAge}
            tracksForSelectedAge={tracksForSelectedAge}
            openFoundation={openFoundation}
            setOpenFoundation={setOpenFoundation}
            openPhase={openPhase}
            setOpenPhase={setOpenPhase}
            t={t}
            i18n={i18n}
          />
        )}
      </div>

      {/* Empty state — no age selected */}
      {!selectedAge && (
        <div className="text-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6 text-slate-300 shadow-inner">
            <GraduationCap size={40} />
          </div>
          <p className="text-lg font-medium text-slate-400 max-w-md mx-auto">
            {t("courses.empty_state")}
          </p>
        </div>
      )}
    </div>
  );
}