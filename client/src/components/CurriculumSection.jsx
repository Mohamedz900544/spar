import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  Code,
  Gamepad,
  Target,
  Blocks,
  Activity,
  Sparkles,
  Rocket,
  GraduationCap,
  Lightbulb,
  MonitorSmartphone,
} from "lucide-react";

/* -------------------------------------------------------
   DATA STRUCTURE
--------------------------------------------------------*/

const ageGroupsRaw = [
  { id: "6-8", key: "0", icon: Sparkles, color: "#2dd4bf", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/toddler.svg?v=1764947251" },
  { id: "9-11", key: "1", icon: Rocket, color: "#FBBF24", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/kid.svg?v=1764947250" },
  { id: "12-14", key: "2", icon: Lightbulb, color: "#a78bfa", image: "https://cdn.shopify.com/s/files/1/0636/7084/5509/files/pre-teen_1bfb9f3d-9abc-4329-8733-8eb4d67addc5.svg?v=1764947328" },
  { id: "15-17", key: "3", icon: GraduationCap, color: "#f472b6", image: "https://i.ibb.co/9mKPdGGF/Gemini-Generated-Image-sgpceusgpceusgpc.webp" },
];

const courses6to8Raw = [
  { icon: MonitorSmartphone, image: "https://i.ibb.co/8Lwh85JC/image-2.jpg" },
  { icon: Blocks, image: "https://i.ibb.co/xSg1Jtq5/Chat-GPT-Image-May-8-2026-06-44-09-PM.webp", href: "/courses/scratch" },
  { icon: Gamepad, image: "https://i.ibb.co/M41wcFG/25645686.webp" },
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
  ],
};

/* -------------------------------------------------------
   CONTENT PANEL (shared between mobile inline + desktop)
--------------------------------------------------------*/
function ContentPanel({ selectedAge, tracksForSelectedAge, t, i18n }) {
  return (
    <div className="px-1 mt-8">
      {/* FOUNDATION STAGE (AGES 6-8) */}
      {selectedAge === "6-8" && (
        <>
          <div className="text-center mb-10">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {t("courses.available_tracks_title")}
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {courses6to8Raw.map((course, idx) => (
                <div
                  key={idx}
                  className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:border-blue-200 transition-all duration-300 group flex flex-col hover:-translate-y-2"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={course.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt={t(`courses.c6to8.${idx}.name`)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    <div className={`absolute bottom-5 ${i18n.language === "ar" ? "right-5" : "left-5"} flex items-center gap-3.5`}>
                      <div className="w-10 h-10 rounded-xl bg-amber-400 backdrop-blur-md flex items-center justify-center shadow-lg border border-amber-300 group-hover:bg-amber-300 transition-colors">
                        <course.icon className="w-5 h-5 text-amber-900" />
                      </div>
                      <span className="text-white font-extrabold text-base tracking-wide drop-shadow-md text-start leading-tight">
                        {t(`courses.c6to8.${idx}.name`)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 text-start bg-gradient-to-b from-white to-slate-50 flex-1">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                      {t(`courses.c6to8.${idx}.desc`)}
                    </p>
                    {course.href ? (
                      <Link
                        to={course.href}
                        className="mt-5 block w-full rounded-xl bg-[#FBBF24] px-4 py-3 text-center text-sm font-extrabold text-slate-950 transition-all duration-300 hover:bg-amber-300 hover:-translate-y-0.5"
                      >
                        {t("courses.explore_curriculum")}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-400 cursor-not-allowed"
                      >
                        {t("courses.explore_curriculum")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                    <button
                      type="button"
                      disabled
                      className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-400 cursor-not-allowed"
                    >
                      {t("courses.explore_curriculum")}
                    </button>
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

        </>
      )}
    </div>
  );
}

export default function CurriculumSection() {
  const { t, i18n } = useTranslation();
  const [selectedAge, setSelectedAge] = useState(null);
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
