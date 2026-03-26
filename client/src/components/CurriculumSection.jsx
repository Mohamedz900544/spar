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
        <div className="max-w-6xl mx-auto">
            {/* AGE SELECTION */}
            <Motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                className="mb-12"
            >
                <h2 className="text-xl font-bold text-[#102a5a] mb-6 text-center">
                    {t("courses.select_age_title")}
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {ageGroupsRaw.map((age) => (
                        <button
                            key={age.id}
                            onClick={() => {
                                setSelectedAge(age.id);
                                setOpenPhase(null);
                                setOpenFoundation(null);
                            }}
                            className={`group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold border-2 transition-all duration-300 text-sm md:text-base ${selectedAge === age.id
                                    ? "bg-[#102a5a] text-white border-[#102a5a] shadow-[0_8px_20px_rgba(16,42,90,0.25)] scale-105"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-[#102a5a]/30 hover:bg-slate-50"
                                }`}
                        >
                            <age.icon
                                className={`w-4 h-4 transition-colors ${selectedAge === age.id
                                        ? "text-[#FBBF24]"
                                        : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                            />
                            {t(`courses.ages.a${age.key}`)}
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
                        {t("courses.empty_state")}
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
                                {t("courses.foundation_badge")}
                            </span>
                            <h2 className="text-2xl font-bold text-[#102a5a]">
                                {t("courses.foundation_title")}
                            </h2>
                            <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm">
                                {t("courses.foundation_desc")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
                            {foundationCoursesRaw.map((course, idx) => (
                                <Motion.div
                                    key={course.icon.displayName || idx}
                                    whileHover={{ y: -4 }}
                                    className={`relative bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer ${openFoundation === idx
                                            ? "border-[#2dd4bf] shadow-[0_8px_30px_rgba(45,212,191,0.12)]"
                                            : "border-slate-100 hover:shadow-md"
                                        }`}
                                    onClick={() =>
                                        setOpenFoundation(openFoundation === idx ? null : idx)
                                    }
                                >
                                    {/* Gradient top strip */}
                                    <div
                                        className="h-1.5"
                                        style={{
                                            background: `linear-gradient(90deg, ${course.color}, ${course.color}88)`,
                                        }}
                                    />

                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${course.color}20, ${course.color}08)`,
                                                    border: `1px solid ${course.color}30`,
                                                }}
                                            >
                                                <course.icon className="w-6 h-6" style={{ color: course.color }} />
                                            </div>
                                            <div className="text-start">
                                                <h3 className="text-xl font-bold text-[#102a5a]">
                                                    {t(`courses.fc.${idx}.name`)}
                                                </h3>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                                    {t(`courses.fc.${idx}.duration`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expandable content */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${openFoundation === idx
                                                    ? "max-h-60 opacity-100"
                                                    : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <div className="pt-2 pb-1 border-t border-slate-100">
                                                <ul className="space-y-3 mt-3">
                                                    {[0, 1, 2, 3].map((i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2.5 items-start text-sm text-slate-600 text-start"
                                                        >
                                                            <CheckCircle2
                                                                className="w-4 h-4 shrink-0 mt-0.5"
                                                                style={{ color: course.color }}
                                                            />
                                                            {t(`courses.fc.${idx}.highlights.${i}`)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-3">
                                            <Motion.div
                                                animate={{ rotate: openFoundation === idx ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <ChevronDown className="w-5 h-5 text-slate-300" />
                                            </Motion.div>
                                        </div>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>

                        {/* Detailed list of 6–8 courses */}
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-lg font-bold text-[#102a5a] mb-3 text-center">
                                {t("courses.stage_courses_title")}
                            </h3>
                            <p className="text-sm text-slate-500 text-center mb-4">
                                {t("courses.stage_courses_desc")}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {courses6to8Raw.map((course, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 text-xs md:text-sm px-3.5 py-2 rounded-full border shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
                                        style={{
                                            backgroundColor: `${course.color}08`,
                                            borderColor: `${course.color}30`,
                                            color: "#334155",
                                        }}
                                    >
                                        <course.icon className="w-3.5 h-3.5" style={{ color: course.color }} />
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-center mb-10">
                            <span className="inline-block py-1 px-3 rounded-full bg-[#FBBF24]/10 text-[#D97706] font-bold text-xs tracking-widest uppercase mb-3">
                                {t("courses.standard_badge")}
                            </span>
                            <h2 className="text-2xl font-bold text-[#102a5a]">
                                {t("courses.standard_title")}
                            </h2>
                            <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm">
                                {t("courses.standard_desc")}
                            </p>
                        </div>

                        {/* THE PHASES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
                            {standardPhasesRaw.map((phase, idx) => (
                                <Motion.div
                                    key={phase.id}
                                    whileHover={{ y: -4 }}
                                    className={`relative bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer ${openPhase === idx
                                            ? "shadow-md"
                                            : "border-slate-100 hover:shadow-md"
                                        }`}
                                    style={{
                                        borderColor: openPhase === idx ? phase.color : "",
                                    }}
                                    onClick={() =>
                                        setOpenPhase(openPhase === idx ? null : idx)
                                    }
                                >
                                    {/* Gradient top strip */}
                                    <div
                                        className="h-1.5"
                                        style={{
                                            background: `linear-gradient(90deg, ${phase.color}, ${phase.color}88)`,
                                        }}
                                    />

                                    <div className="p-4 sm:p-6">
                                        {/* Duration badge — top on mobile */}
                                        <div className="flex items-center justify-between mb-3 sm:mb-0 sm:hidden">
                                            <span
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg"
                                                style={{
                                                    backgroundColor: `${phase.color}15`,
                                                    color: phase.color,
                                                }}
                                            >
                                                {t(`courses.phases.${phase.id}.duration`)}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${phase.color}25, ${phase.color}10)`,
                                                        border: `1px solid ${phase.color}30`,
                                                    }}
                                                >
                                                    <phase.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: phase.color }} />
                                                </div>
                                                <div className="min-w-0 text-start">
                                                    <h3 className="text-base sm:text-lg font-bold text-[#102a5a] leading-snug">
                                                        {t(`courses.phases.${phase.id}.name`)}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                                                        {t(`courses.phases.${phase.id}.desc`)}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Duration badge — inline on desktop */}
                                            <span
                                                className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0"
                                                style={{
                                                    backgroundColor: `${phase.color}15`,
                                                    color: phase.color,
                                                }}
                                            >
                                                {t(`courses.phases.${phase.id}.duration`)}
                                            </span>
                                        </div>

                                        {/* Expandable content */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${openPhase === idx
                                                    ? "max-h-64 opacity-100"
                                                    : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 mb-2 text-start">
                                                <h4 className="text-xs font-bold text-[#102a5a] mb-3 uppercase tracking-wider">
                                                    {t("courses.what_to_expect")}
                                                </h4>
                                                <ul className="space-y-2.5">
                                                    {[0, 1, 2, 3].map((i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2 items-start text-sm text-slate-600 text-start"
                                                        >
                                                            <CheckCircle2
                                                                className="w-4 h-4 shrink-0 mt-0.5"
                                                                style={{ color: phase.color }}
                                                            />
                                                            {t(`courses.phases.${phase.id}.highlights.${i}`)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-2">
                                            <Motion.div
                                                animate={{ rotate: openPhase === idx ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <ChevronDown className="w-5 h-5 text-slate-300" />
                                            </Motion.div>
                                        </div>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>

                        {/* TRACKS FOR PHASE 2 PREVIEW – DYNAMIC BY AGE */}
                        <div className="pt-8 border-t border-slate-200">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-[#102a5a]">
                                    {t("courses.available_tracks_title")}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {t("courses.available_tracks_desc")}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6">
                                {tracksForSelectedAge.map((track, i) => (
                                    <Motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        whileHover={{ y: -6 }}
                                        className="w-80 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-[0_12px_40px_rgba(16,42,90,0.1)] hover:border-[#FBBF24]/30 transition-all duration-300 group"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-slate-100">
                                            <img
                                                src={track.image}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={t(`courses.tracks.${track.id}.name`)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#071228]/90 via-[#071228]/30 to-transparent" />
                                            <div
                                                className={`absolute bottom-4 ${i18n.language === "ar" ? "right-4" : "left-4"
                                                    } flex items-center gap-3`}
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                                                    <track.icon className="w-4.5 h-4.5 text-[#102a5a]" />
                                                </div>
                                                <span className="text-white font-bold text-sm tracking-wide drop-shadow-md text-start">
                                                    {t(`courses.tracks.${track.id}.name`)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 text-start">
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {t(`courses.tracks.${track.id}.desc`)}
                                            </p>
                                        </div>
                                    </Motion.div>
                                ))}

                                {tracksForSelectedAge.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center">
                                        {t("courses.coming_soon")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
