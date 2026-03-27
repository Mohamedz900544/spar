import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  Sparkles, Compass, Target, Layers, Brain,
  TrendingUp, BookOpen, CheckCircle2, Wrench,
  Rocket, ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ── Subtle fade-in helper ── */
const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Data ── */
const timelineSteps = [
  { color: "#f97316", icon: Sparkles },
  { color: "#2dd4bf", icon: Compass },
  { color: "#a78bfa", icon: Target },
];

const pillars = [
  { icon: Layers,     color: "#2dd4bf" },
  { icon: Brain,      color: "#FBBF24" },
  { icon: TrendingUp, color: "#a78bfa" },
  { icon: BookOpen,   color: "#f97316" },
];

/* ───────────────────────────────────── */
const OurStory = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.title = "Our Story — Sparvi Lab | The Origin of Innovation";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* ═══════════  HERO  ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e3a8a 70%, #2563eb 100%)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-amber-400/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-400/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 font-display">
              {t("story.hero_title1")}
              <span className="text-amber-400">{t("story.hero_title2")}</span>
            </h1>
            <p className="text-blue-100/80 max-w-xl mx-auto text-sm md:text-lg leading-relaxed font-medium">
              {t("story.hero_subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
            <path d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ═══════════  TIMELINE  ═══════════ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2
              className="text-2xl md:text-4xl font-display"
              style={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("story.timeline_title")}
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base mt-4 max-w-xl mx-auto">
              {t("story.timeline_subtitle")}
            </p>
          </Reveal>

          {/* Vertical timeline */}
          <div className="relative">
            {/* Line */}
            <div
              className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-teal-400 to-violet-400 opacity-20 ${
                isRTL ? "right-6 md:right-1/2" : "left-6 md:left-1/2"
              }`}
            />

            <div className="space-y-16">
              {timelineSteps.map((step, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <div className="relative flex items-start gap-6 md:gap-10">
                    {/* Dot */}
                    <div
                      className={`relative z-10 shrink-0 w-12 h-12 rounded-full bg-white shadow-lg border-[3px] flex items-center justify-center ${
                        isRTL ? "" : ""
                      }`}
                      style={{ borderColor: step.color }}
                    >
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-2xl bg-white p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                        style={{ color: step.color, backgroundColor: `${step.color}12` }}
                      >
                        {t(`story.timeline.${idx}.year`)}
                      </span>
                      <h3 className="text-lg md:text-xl font-extrabold text-slate-800 mb-2 text-start">
                        {t(`story.timeline.${idx}.title`)}
                      </h3>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed text-start">
                        {t(`story.timeline.${idx}.desc`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════  CURRICULUM PILLARS  ═══════════ */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Reveal className="text-center mb-14">
            <div className="w-14 h-14 rounded-2xl bg-[#071228] text-white flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="w-7 h-7 text-teal-400" />
            </div>
            <h2
              className="text-2xl md:text-4xl font-display mb-4"
              style={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("story.curriculum_title1")}
              <span>{t("story.curriculum_title2")}</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("story.curriculum_subtitle")}
            </p>
          </Reveal>

          {/* Checks row */}
          <Reveal className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-3xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-start flex-1">
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                <span className="text-slate-700 font-medium text-sm">{t(`story.checks.${i}`)}</span>
              </div>
            ))}
          </Reveal>

          {/* Pillars grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group h-full p-7 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-400 hover:-translate-y-1 text-start">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-400 group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: pillar.color, color: "white" }}
                  >
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 mb-2">{t(`story.pillars.${i}.title`)}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t(`story.pillars.${i}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════  LEARNER OUTCOMES  ═══════════ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #071228 0%, #0f172a 60%, #1e3a8a 100%)" }}>
            {/* Ambient blurs */}
            <div className="relative p-8 md:p-14">
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-400/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left copy */}
                <div className="text-start">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 leading-tight">
                    {t("story.outcomes_title")}
                  </h2>
                  <p className="text-blue-100/70 text-sm md:text-base leading-relaxed mb-6">
                    {t("story.outcomes_subtitle")}
                  </p>
                  <blockquote
                    className={`text-slate-400 italic text-sm md:text-base leading-relaxed ${
                      isRTL
                        ? "border-r-4 border-teal-400 pr-5"
                        : "border-l-4 border-teal-400 pl-5"
                    }`}
                  >
                    {t("story.quote")}
                  </blockquote>
                </div>

                {/* Right outcomes */}
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-white/[0.06] border border-white/10 rounded-xl hover:bg-white/[0.1] transition-colors text-start"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-slate-200 text-sm font-medium">{t(`story.learnerOutcomes.${i}`)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════  CTA  ═══════════ */}
      <section className="py-20 md:py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[70%] bg-gradient-to-r from-teal-400/15 via-amber-300/15 to-violet-400/15 rounded-full blur-[100px]" />
        </div>

        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-400/25 rotate-3">
              <Rocket className="w-8 h-8 text-white -rotate-3" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            {t("story.cta_title1")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              {t("story.cta_title2")}
            </span>
          </h2>

          <p className="text-slate-500 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {t("story.cta_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/courses"
              className="group relative px-7 py-4 w-full sm:w-auto rounded-full bg-[#071228] text-white font-bold text-base overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center justify-center gap-2">
                {t("story.btn_explore")}
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
              </span>
            </Link>

            <Link
              to="/contact"
              className="px-7 py-4 w-full sm:w-auto rounded-full bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-600 text-center font-bold text-base shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {t("story.btn_talk")}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default OurStory;
