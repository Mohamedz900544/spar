import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Parentsreviews from "../components/Parentsreviews";
import CurriculumSection from "../components/CurriculumSection";
import {
  Monitor,
  Cpu,
  Users,
  BookOpen,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Facebook,
  Instagram,
  Send,
  Play,
} from "lucide-react";
import { FaTiktok, FaWhatsapp, FaCcApplePay, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

/* ==============================
   SPARKLES COMPONENT
   ============================== */
const Sparkles = () => (
  <div className="sparkle-container">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="sparkle" />
    ))}
  </div>
);

/* ==============================
   FAQ DATA
   ============================== */
const faqItems = [
  {
    question: "What exactly will my child learn at Sparvi Lab?",
    answer:
      "Your child will learn the skills that make technology easier to understand long-term, not just one tool for a short time. We build strong foundations in problem-solving, logical reasoning, creativity, and learning agility, then apply them through hands-on learning across computational thinking, creative coding, electronics and robotics, game development, and early AI concepts. The goal is a child who can face new challenges confidently and learn new technologies faster.",
  },
  {
    question: "What age groups do you offer, and how are levels decided?",
    answer:
      "Sparvi Lab is designed for ages 6–17. Students are placed into age bands with a progressive curriculum that grows year by year. Placement is based on age and a simple onboarding check to understand the child's current level, attention span, and comfort with problem-solving. If a child is advanced, we can place them higher. If they need stronger foundations, we start from the right step without pressure.",
  },
  {
    question: "Do students need any prior coding or robotics experience?",
    answer:
      "No. Prior experience is not required. Many students join with zero background and start from the foundations. We teach concepts in an age-appropriate way that is designed for beginners. If your child already has experience, we do not repeat basics blindly. We challenge them with deeper tasks and more advanced projects.",
  },
  {
    question: "Do parents need to attend or help during sessions?",
    answer:
      "In most cases, parents do not need to sit next to the child during the session. Sessions are guided and structured, and we teach children to think independently. For ages 6–8, we recommend light support at the beginning (mainly for setup and focus). After that, we gradually reduce dependence so the child builds confidence and ownership. We also run parent guidance sessions so you know how to support your child without doing the work for them.",
  },
  {
    question: "What happens if we miss a live class?",
    answer:
      "If you miss a session, your child will not be left behind. We provide a clear catch-up plan based on what was missed. Depending on the program, you may receive a session recording or a guided summary with tasks to complete. If needed, we also offer support time to help the student catch up and rejoin confidently.",
  },
  {
    question: "How do you track progress and measure improvement over time?",
    answer:
      "We track progress using skill-based milestones, not just completed lessons. We focus on how the child is improving in areas such as problem-solving strategy, logical reasoning, debugging ability, creativity in solutions, and confidence during challenges. Parents receive progress updates that highlight strengths and what to work on next. This makes learning measurable and shows real growth, not just finished projects.",
  },
  {
    question: "Is Sparvi Lab online, in-person, or both?",
    answer:
      "Sparvi Lab can be delivered online and in-person depending on your location and the program schedule. Online sessions are interactive and hands-on, not passive watching. In-person sessions follow the same curriculum, with more physical collaboration. When you enroll, we confirm the available format options and schedules for your area.",
  },
  {
    question: "How are lessons taught to match different learning styles?",
    answer:
      "We use proven learning models such as SAVI, 4MAT, and Meier's learning phases, so every lesson includes multiple types of engagement. Students learn by building, discussing, experimenting, moving, and applying. This supports children who learn visually, practically, socially, or through exploration. It also keeps sessions active, reduces boredom, and improves understanding and retention.",
  },
  {
    question: "How do you keep kids safe and focused with technology at home?",
    answer:
      "We promote healthy tech habits as part of the learning journey. Students learn structured screen use, not endless screen time. We guide parents with simple routines to support focus and reduce distractions. We also design projects around purposeful creation, so the child uses technology to build and think, not just consume. If parents want extra support, we provide guidance sessions to help create a safe, balanced home setup.",
  },
  {
    question: "How long is each program, and how often are sessions?",
    answer:
      "Programs are structured to create real progress, not quick exposure. Session length and frequency depend on the age group and track. You will receive a clear schedule before starting, including how many sessions per month and what outcomes to expect by the end. For younger ages, sessions are shorter and more activity-based. For older ages, sessions are deeper and project-heavy.",
  },
  {
    question: "What if my child is shy or lacks confidence?",
    answer:
      "That is common, and it is one of the main areas we support. We use guided participation and safe challenges that gradually increase in difficulty. We encourage thinking out loud and celebrate effort and improvement, not just correct answers. Over time, children build confidence because they learn how to approach problems step by step and see themselves improving.",
  },
  {
    question: "What equipment do we need at home for online learning?",
    answer:
      "In most cases, you need a laptop or desktop computer and a stable internet connection. For some tracks, the electronics kit is required. We provide a short setup guide so everything is ready before the first session. If your child joins a hardware track, we also guide you through safe setup and handling.",
  },
  {
    question: "Can my child switch tracks later?",
    answer:
      "Yes, switching tracks is possible depending on the schedule and your child's readiness. We usually recommend finishing the current phase first, then switching with a clear plan. Because the curriculum is structured, we make sure the child does not miss key foundations when moving between tracks.",
  },
  {
    question: "How do you ensure the curriculum is not just random activities?",
    answer:
      "Every activity at Sparvi Lab is tied to a learning objective and a progression path. We do not teach random \"fun projects\" without a learning journey. Each level builds on the previous one and prepares the child for more advanced thinking and real-world relevance. That is what makes Sparvi Lab a curriculum-driven system, not a tool-based academy.",
  },
];

/* ==============================
   FEATURES DATA
   ============================== */
const features = [
  { icon: BookOpen },
  { icon: Monitor },
  { icon: Users },
  { icon: BarChart3 },
  { icon: Cpu },
  { icon: ShieldCheck },
];

/* ==============================
   FAQ ACCORDION ITEM
   ============================== */
const FAQItem = ({ item, isOpen, onToggle, index }) => (
  <div
    onClick={onToggle}
    className="cursor-pointer transition-all duration-300"
    style={{
      borderRadius: 20,
      border: isOpen
        ? "1.5px solid rgba(59,130,246,0.4)" // Vibrant blue border
        : "1.5px solid rgba(226,232,240,0.8)", // Softer border when closed
      background: isOpen
        ? "linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)" // Soft blue tint
        : "#ffffff",
      boxShadow: isOpen
        ? "0 12px 32px rgba(37,99,235,0.12)" // Richer shadow
        : "0 2px 8px rgba(0,0,0,0.02)",
    }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-5 md:p-6 text-start"
    >
      {/* Number badge */}
      <div
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #2563eb, #06b6d4)" // Bright gradient
            : "rgba(241,245,249,1)",
          color: isOpen ? "#ffffff" : "#64748b",
        }}
      >
        {index + 1}
      </div>

      <span
        className="flex-1 font-bold text-sm md:text-base transition-colors duration-300 text-start"
        style={{ color: isOpen ? "#1e3a8a" : "#1e293b" }}
      >
        {item.question}
      </span>

      {/* Toggle icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #2563eb, #06b6d4)"
            : "rgba(241,245,249,1)",
          color: isOpen ? "#ffffff" : "#64748b",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <ChevronDown size={15} strokeWidth={3} />
      </div>
    </button>

    <div
      className="overflow-hidden transition-all duration-300"
      style={{ maxHeight: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0 }}
    >
      {/* Divider */}
      <div className="mx-5 md:mx-6 h-px" style={{ background: "rgba(59,130,246,0.15)" }} />
      <p className="px-5 md:px-6 py-5 text-sm text-slate-600 leading-relaxed ps-[4.5rem] text-start">
        {item.answer}
      </p>
    </div>
  </div>
);

/* ==============================
   VIDEO CONFIG
   ============================== */
const HERO_VIDEOS = [
  {
    thumbnail: "https://i.ibb.co/xRtsf8T/Screenshot-2026-01-12-043823.webp",
    ytSrc: "https://www.youtube.com/embed/52GDwQBAY?autoplay=1&playsinline=1&rel=0&modestbranding=1",
    name: "Mostafa Fouda",
    meta: "Grade 5 | Egypt",
  },
];

const gifToVideo = (gifUrl, ext) =>
  gifUrl.replace("/image/upload/", `/image/upload/f_${ext},q_auto,vc_auto/`);

const studentProjects = [
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832886/handgenerator_idc4mj.gif",
    title: "Hand Generator",
    desc: "Building a generator to power a LED and electronic components",
  },
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832885/walkingrobot_mmouu1.gif",
    title: "Walking Robot",
    desc: "Kids build a walking robot and learn new concepts like equilibrium and motor mechanics",
  },
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832875/pacman_yt9wps.gif",
    title: "Pacman",
    desc: "Pacman Escaping is an arcade style maze",
  },
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832877/Realworld_zn0ts5.gif",
    title: "Real world simulation",
    desc: "Real-world simulation of living organisms growing from food",
  },
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832872/ball_tfsqbv.gif",
    title: "Bouncing Ball",
    desc: "A ball that moves around the screen and bounces when it hits the edges",
  },
  {
    img: "https://res.cloudinary.com/dipzvlfnt/image/upload/v1772832886/planetsaver_ha0emh.gif",
    title: "Planet Saver",
    desc: "Save the earth from the aliens",
  },
];

/* ==============================
   VIDEO CARD COMPONENT
   ============================== */
const VideoCard = ({ thumbnail, ytSrc, name, meta }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="sparvi-hero-video-wrapper">
      {/* ── Thumbnail layer ── */}
      <div
        className="sparvi-hero-thumbnail"
        style={{ display: playing ? "none" : undefined }}
        onClick={() => setPlaying(true)}
      >
        <img
          src={thumbnail}
          alt={name}
          loading="lazy"
          width="247"
          height="373"
          className="sparvi-hero-thumb-img"
        />

        <div className="sparvi-hero-gradient" />

        <button
          className="sparvi-hero-play-btn"
          type="button"
          aria-label={`Play video for ${name}`}
          onClick={(e) => { e.stopPropagation(); setPlaying(true); }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style={{ minWidth: 10, minHeight: 10 }}>
            <path d="M6 3.5l14 8.5-14 8.5z" />
          </svg>
        </button>

        <div className="sparvi-hero-text-overlay">
          <h3 className="sparvi-hero-name">{name}</h3>
          {meta && <p className="sparvi-hero-meta">{meta}</p>}
        </div>
      </div>

      {/* ── iframe layer (shown when playing) ── */}
      <div className={`sparvi-hero-iframe${playing ? " active" : ""}`}>
        {playing && (
          <iframe
            src={ytSrc}
            className="sparvi-hero-iframe-el"
            allow="autoplay; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            title={name}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced vibrant accents for cards
const cardAccents = [
  { from: "#6366f1", to: "#a855f7" }, // Indigo to Purple
  { from: "#ec4899", to: "#f43f5e" }, // Pink to Rose
  { from: "#3b82f6", to: "#06b6d4" }, // Blue to Cyan
  { from: "#10b981", to: "#14b8a6" }, // Emerald to Teal
  { from: "#f59e0b", to: "#fbbf24" }, // Amber to Yellow
  { from: "#8b5cf6", to: "#d946ef" }, // Violet to Fuchsia
];

const Landing = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = "Sparvi Lab — Live STEM Education for Kids Ages 6–17";
  }, []);
  const [openFAQ, setOpenFAQ] = useState(-1);
  const [projectIndex, setProjectIndex] = useState(0);
  const projectTrackRef = useRef(null);
  const projectCount = studentProjects.length;

  useEffect(() => {
    if (projectCount <= 1) return;
    const timer = setInterval(() => {
      setProjectIndex((prev) => (prev + 1) % projectCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [projectCount]);

  useEffect(() => {
    const track = projectTrackRef.current;
    if (!track) return;
    const scrollPerCard = track.scrollWidth / projectCount;
    track.scrollTo({ left: projectIndex * scrollPerCard, behavior: "smooth" });
  }, [projectIndex, projectCount]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Navbar />

      {/* ============================
         HERO SECTION
         ============================ */}
      <section className="relative w-full overflow-hidden" style={{
        // Deeper, richer gradient for a more premium tech feel
        background: "linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e3a8a 70%, #2563eb 100%)"
      }}>
        <Sparkles />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-0 md:pt-28 md:pb-0 grid md:grid-cols-2 items-center relative z-10">
          {/* Left: Text */}
          <Motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="order-1 md:order-none text-center md:text-start"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight mb-4 md:mb-5 leading-[1.15] text-white font-display">
              <span className="block">{t("landing.hero.title1")}</span>
              <span className="block">{t("landing.hero.title2")}</span>
              <span className="inline-block mt-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 border-2 border-white/90 px-4 py-1.5 rounded-lg text-xl sm:text-2xl md:text-3xl font-bold transform -rotate-2 shadow-lg">
                {t("landing.hero.title3")}
              </span>
            </h1>
            {/* Hidden SEO-friendly h1 text for crawlers */}
            <p className="sr-only">
              {t("landing.hero.seo_text")}
            </p>

            <p className="max-w-xl mx-auto md:mx-0 text-xs sm:text-sm md:text-base text-blue-100/90 mb-6 md:mb-8 leading-relaxed font-medium">
              {t("landing.hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row flex-nowrap justify-center md:justify-start items-center gap-3 sm:gap-4">
              <Link to="/signup">
                <button className="inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-8 py-3 text-xs sm:text-base font-bold shadow-[0_8px_25px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_35px_rgba(245,158,11,0.6)] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 border border-yellow-300 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap min-w-0">
                  {t("landing.hero.cta_primary")}
                </button>
              </Link>

              <Link to="/our-story" className="inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-8 py-3 text-xs sm:text-base font-semibold border border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-200 whitespace-nowrap min-w-0">
                {t("landing.hero.cta_secondary")}
              </Link>
            </div>
          </Motion.div>

          {/* Right: Robot Image */}
          <Motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="order-2 md:order-none flex justify-center"
          >
            <img
              src="https://res.cloudinary.com/dipzvlfnt/image/upload/f_auto,q_auto,w_900/v1772832876/Robot_l1b0pg.webp"
              alt="Sparvi Lab Robot"
              fetchpriority="high"
              width="900"
              height="496"
              className="w-[130%] max-w-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative z-10"
            />
          </Motion.div>
        </div>
      </section>

      {/* ============================
         STUDENT PROJECTS
         ============================ */}
      <Motion.section
        className="py-16 md:py-24 px-6  from-slate-50 to-white"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-10">
            <h2
              className="text-2xl md:text-4xl font-display"
              style={{
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("landing.projects.title")}
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base mt-4 max-w-xl mx-auto">
              {t("landing.projects.subtitle")}
            </p>
          </div>

          {/* Project Cards — horizontal swiper */}
          <div
            ref={projectTrackRef}
            className="mt-12 flex gap-6 md:gap-8 overflow-x-auto pb-10 snap-x snap-mandatory scroll-smooth hide-scrollbar px-4"
          >
            {studentProjects.map((proj, i) => {
              const pKey = `p${i + 1}`;
              const accent = cardAccents[i % cardAccents.length];
              return (

                <Motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative rounded-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group shrink-0 basis-[110%] sm:basis-[29%] lg:basis-[20%] snap-start bg-white"
                  style={{
                    border: "1px solid rgba(226,232,240,0.8)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.08), 0 0 0 2px ${accent.from}40`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)"}
                  data-project-index={i}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 z-20"
                    style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                  />

                  {/* Thumbnail */}
                  <div className="relative overflow-hidden h-48 sm:h-52">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-label={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    >
                      <source src={gifToVideo(proj.img, "webm")} type="video/webm" />
                      <source src={gifToVideo(proj.img, "mp4")} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent z-10" />
                  </div>

                  {/* Content */}
                  <div className="p-6 relative text-start from-white to-slate-50">
                    <h3
                      className="font-extrabold text-lg mb-2.5 leading-snug"
                      style={{
                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {t(`landing.studentProjects.${pKey}.title`)}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {t(`landing.studentProjects.${pKey}.desc`)}
                    </p>
                  </div>
                </Motion.div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-center items-center gap-3">
            {[...Array(projectCount)].map((_, i) => {
              const dotAccent = cardAccents[i % cardAccents.length];
              const isActive = projectIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setProjectIndex(i)}
                  className="p-0 m-0 border-none min-h-0 min-w-0 h-2.5 rounded-full transition-all duration-500 ease-out focus:outline-none"
                  style={isActive ? {
                    width: 40,
                    background: `linear-gradient(90deg, ${dotAccent.from}, ${dotAccent.to})`,
                    boxShadow: `0 0 12px ${dotAccent.from}60`,
                  } : {
                    width: 10,
                    background: "#e2e8f0",
                  }}
                  aria-label={`Go to project ${i + 1}`}
                />
              );
            })}
          </div>

        </div>
      </Motion.section>

      {/* ============================
         WHY CHOOSE SPARVI LAB?
         ============================ */}
      <section
        className="py-16 md:py-24 px-6 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-2xl md:text-4xl font-display mb-12 text-center"
            style={{
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("landing.why_choose.title")}
          </h2>

          {/* Two-column layout: Lottie left + features right */}
          <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">

            {/* Left — Lottie animation + CTA */}
            <div className="flex flex-col items-center gap-6 lg:w-[360px] shrink-0 order-2 lg:order-none h-full">
                <img
                  src="https://res.cloudinary.com/dipzvlfnt/image/upload/f_auto,q_auto,w_640/v1772832874/its_bqxp1i.webp"
                  alt="Student holding money"
                  loading="lazy"
                  className="w-full h-full object-contain lg:object-cover rounded-2xl"
                />
            
              <Link to="/signup" className="mx-auto w-full lg:w-auto">
                <button className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 border border-yellow-300 text-slate-900 font-bold px-8 py-3.5 shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.5)] transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                  {t("landing.why_choose.cta")}
                </button>
              </Link>
            </div>

            {/* Right — 2-column grid of feature cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 order-1 lg:order-none">
              {features.map((feature, i) => {
                const faKey = `f${i + 1}`;
                const featureAccents = [
                  { icon: "linear-gradient(135deg, #2563eb, #06b6d4)", border: "#2563eb20", glow: "rgba(37,99,235,0.15)" },
                  { icon: "linear-gradient(135deg, #8b5cf6, #d946ef)", border: "#8b5cf620", glow: "rgba(139,92,246,0.15)" },
                  { icon: "linear-gradient(135deg, #0ea5e9, #10b981)", border: "#0ea5e920", glow: "rgba(14,165,233,0.15)" },
                  { icon: "linear-gradient(135deg, #f43f5e, #f59e0b)", border: "#f43f5e20", glow: "rgba(244,63,94,0.15)" },
                  { icon: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "#3b82f620", glow: "rgba(59,130,246,0.15)" },
                  { icon: "linear-gradient(135deg, #10b981, #06b6d4)", border: "#10b98120", glow: "rgba(16,185,129,0.15)" },
                ];
                const fa = featureAccents[i % featureAccents.length];
                return (
                  <div
                    key={i}
                    className="relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden cursor-default bg-white"
                    style={{
                      border: `1.5px solid ${fa.border}`,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 16px 40px ${fa.glow}, 0 4px 15px rgba(0,0,0,0.02)`;
                      e.currentTarget.style.border = `1.5px solid ${fa.border.replace("20", "40")}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.02)";
                      e.currentTarget.style.border = `1.5px solid ${fa.border}`;
                    }}
                  >
                    {/* Decorative corner glow */}
                    <div
                      className={`absolute -top-6 ${i18n.language === "ar" ? "-left-6" : "-right-6"} w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}
                      style={{ background: fa.icon }}
                    />

                    <div className="relative flex items-start gap-4 z-10">
                      {/* Gradient icon box */}
                      <div
                        className="shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6"
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 16,
                          background: fa.icon,
                          boxShadow: `0 8px 20px ${fa.glow}`,
                        }}
                      >
                        <feature.icon size={24} color="white" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <h3 className="font-extrabold text-slate-800 mb-1.5 text-sm md:text-base leading-snug group-hover:text-slate-900 transition-colors duration-300">
                          {t(`landing.features.${faKey}.title`)}
                        </h3>
                        <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                          {t(`landing.features.${faKey}.text`)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ============================
         LEARNING PATH SECTION
         ============================ */}
      <Motion.section
        className="py-16 md:py-24 px-6 bg-gradient-to-b from-white to-slate-50"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto mb-10 text-center">
          <h2
            className="text-2xl md:text-4xl font-display"
            style={{
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("landing.learning_path.title")}
          </h2>
        </div>
        <CurriculumSection />
      </Motion.section>

      <Parentsreviews />

      {/* ============================
         FAQ SECTION
         ============================ */}
      <Motion.section
        className="py-16 md:py-24 px-6 bg-slate-50"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">

            <h2
              className="text-2xl md:text-4xl font-display"
              style={{
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("landing.faq.title")}
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
              {t("landing.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                index={i}
                item={{
                  question: t(`landing.faqs.q${i}.q`),
                  answer: t(`landing.faqs.q${i}.a`)
                }}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? -1 : i)}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 text-center p-10 rounded-[2rem]"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
              boxShadow: "0 20px 50px rgba(37,99,235,0.25)",
            }}>
            <p className="text-white font-extrabold text-xl mb-2">{t("landing.faq.still_have_questions")}</p>
            <p className="text-blue-100/80 font-medium text-sm mb-6">{t("landing.faq.team_happy_to_help")}</p>
            <a href="/contact">
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 border border-yellow-300 text-slate-900 font-bold px-8 py-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(245,158,11,0.3)] text-sm">
                {t("landing.faq.contact_us")}
              </button>
            </a>
          </div>
        </div>
      </Motion.section>

      {/* ============================
         FOOTER
         ============================ */}
      <footer className="text-white" style={{
        // Deeper, more sophisticated dark mode gradient for the footer
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)"
      }}>
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {/* Column 1: Logo & Info */}
            <div>
              <img src="/logo-white.png" alt="Sparvi Lab" width="133" height="70" className="h-10 mb-5" />
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6 text-start">
                {t("landing.footer.description")}
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/sparvilab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/sparviIab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@sparvi.lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <FaTiktok size={16} />
                </a>
                <a
                  href="https://wa.me/201500077369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <FaWhatsapp size={18} />
                </a>
              </div>
            </div>

            {/* Column 2: Main Menu */}
            <div className="text-start">
              <h4 className="text-amber-400 font-bold text-sm tracking-wider uppercase mb-5">
                {t("landing.footer.main_menu")}
              </h4>
              <nav className="flex flex-col gap-3.5">
                <Link to="/" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">{t("landing.footer.menu_home")}</Link>
                <Link to="/courses" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">{t("landing.footer.menu_courses")}</Link>
                <Link to="/our-story" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">{t("landing.footer.menu_story")}</Link>
                <Link to="/contact" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">{t("landing.footer.menu_contact")}</Link>
                <Link to="/signup" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">{t("landing.footer.menu_join")}</Link>
              </nav>
            </div>

            {/* Column 3: Join the Club */}
            <div className="text-start">
              <h4 className="text-amber-400 font-bold text-sm tracking-wider uppercase mb-5">
                {t("landing.footer.join_club")}
              </h4>
              <p className="text-slate-400 font-medium text-sm mb-5 leading-relaxed">
                {t("landing.footer.club_desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={t("landing.footer.placeholder")}
                  className={`w-full sm:flex-1 rounded-xl bg-white/5 border border-white/10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-start ${i18n.language === "ar" ? "pr-4 pl-4" : "px-4"}`}
                />
                <button className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-bold px-6 py-3 text-sm flex items-center justify-center gap-2 transition-all shadow-md">
                  {t("landing.footer.subscribe")} <Send size={15} className={i18n.language === "ar" ? "rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 font-medium text-xs">
              © {new Date().getFullYear()} Sparvi Lab. {t("landing.footer.rights")}
              <span className="block md:inline md:mx-2">
                {t("landing.footer.designed_for")}
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;