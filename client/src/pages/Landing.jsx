import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Parentsreviews from "../components/Parentsreviews";
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
import { FaTiktok, FaWhatsapp } from "react-icons/fa6";

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
  {
    icon: Monitor,
    title: "Live, Instructor-Led Missions",
    text: "A Sparvi coach leads every session step by step and answers questions in real time, so no one gets stuck.",
  },
  {
    icon: BarChart3,
    title: "A Full Learning Journey",
    text: "A structured curriculum for ages 6–17 that grows with your child, with clear levels and long-term progress, not random short courses.",
  },
  {
    icon: Users,
    title: "Built for Ages 6–17",
    text: "Age-appropriate lessons that support beginners and still challenge advanced students.",
  },
  {
    icon: BookOpen,
    title: "Screen Time With a Purpose",
    text: "Kids watch, then build, test, and improve hands-on projects, turning screen time into real creation.",
  },
  {
    icon: Cpu,
    title: "Structured Levels, Clear Progress",
    text: "Students follow clear levels with measurable outcomes and unlock more advanced projects over time.",
  },
  {
    icon: ShieldCheck,
    title: "Parent Peace of Mind",
    text: "Small groups, clear weekly goals, and simple updates so you always know what your child is learning.",
  },
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
        ? "1.5px solid rgba(29,78,216,0.3)"
        : "1.5px solid rgba(148,163,184,0.2)",
      background: isOpen
        ? "linear-gradient(145deg, #ffffff 0%, #f0f5ff 100%)"
        : "#ffffff",
      boxShadow: isOpen
        ? "0 8px 32px rgba(29,78,216,0.1)"
        : "0 2px 8px rgba(0,0,0,0.04)",
    }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
    >
      {/* Number badge */}
      <div
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #1d4ed8, #06b6d4)"
            : "rgba(148,163,184,0.15)",
          color: isOpen ? "#ffffff" : "#94a3b8",
        }}
      >
        {index + 1}
      </div>

      <span
        className="flex-1 font-bold text-sm md:text-base transition-colors duration-300"
        style={{ color: isOpen ? "#1d4ed8" : "#1e293b" }}
      >
        {item.question}
      </span>

      {/* Toggle icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #1d4ed8, #06b6d4)"
            : "rgba(148,163,184,0.12)",
          color: isOpen ? "#ffffff" : "#94a3b8",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <ChevronDown size={15} />
      </div>
    </button>

    <div
      className="overflow-hidden transition-all duration-300"
      style={{ maxHeight: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0 }}
    >
      {/* Divider */}
      <div className="mx-5 md:mx-6 h-px" style={{ background: "rgba(29,78,216,0.1)" }} />
      <p className="px-5 md:px-6 py-5 text-sm text-slate-600 leading-relaxed pl-[4.5rem]">
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

const cardAccents = [
  { from: "#7c3aed", to: "#06b6d4" },
  { from: "#db2777", to: "#f59e0b" },
  { from: "#7c3aed", to: "#06b6d4" },
  { from: "#0891b2", to: "#10b981" },
  { from: "#1d4ed8", to: "#7c3aed" },
  { from: "#059669", to: "#06b6d4" },
  { from: "#dc2626", to: "#f59e0b" },
  { from: "#1d4ed8", to: "#06b6d4" },
];

const Landing = () => {
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col">
      <Navbar />

      {/* ============================
          HERO SECTION
         ============================ */}
      <section className="relative w-full overflow-hidden" style={{
        background: "linear-gradient(135deg, #0a1628 0%, #102a5a 40%, #1a4a8a 70%, #1565c0 100%)"
      }}>
        <Sparkles />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-0 md:pt-28 md:pb-0 grid md:grid-cols-2 items-center relative z-10">
          {/* Left: Text */}
          <Motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="order-1 md:order-none text-center md:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight mb-4 md:mb-5 leading-[1.15] text-white font-display">
              <span className="block">Building the</span>
              <span className="block">Next Generation’s</span>
              <span className="inline-block mt-2 bg-[#FBBF24] text-[#024f63] border-2 border-white px-3 py-1 rounded-md text-xl sm:text-2xl md:text-3xl font-bold transform -rotate-1">
                Minds
              </span>
            </h1>
            {/* Hidden SEO-friendly h1 text for crawlers */}
            <p className="sr-only">
              Sparvi Lab — Live STEM Education for Kids Ages 6–17. Coding, electronics, robotics, and AI through structured hands-on sessions.
            </p>

            <p className="max-w-xl mx-auto md:mx-0 text-xs sm:text-sm md:text-base text-slate-300 mb-6 md:mb-8 leading-relaxed">
              Live, instructor-led STEM sessions for ages 6–17. Kids learn electronics, coding, robotics, and AI through structured hands-on projects — online and in-person.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row flex-nowrap justify-center md:justify-start items-center gap-2 sm:gap-4">
              <Link to="/signup">
                <button className="inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-base font-semibold shadow-[0_8px_25px_rgba(251,191,36,0.4)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.5)] bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap min-w-0">
                  Secure your seat!
                </button>
              </Link>

              <Link to="/our-story" className="inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap min-w-0">
                Our Story ➤
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
              className="w-[130%] max-w-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </Motion.div>
        </div>
      </section>

      {/* ============================
          HEAR FROM OUR HEROES
         ============================ */}
      <Motion.section
        className="py-16 md:py-20 px-6 bg-slate-50/50"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Gradient heading */}
          <h2
            className="text-2xl md:text-4xl font-display mb-10 text-center"
            style={{
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Hear from Our Heroes
          </h2>

          {/* Video cards */}
          <div className="flex flex-wrap justify-center gap-6 mt-2">
            {HERO_VIDEOS.map((v) => (
              <VideoCard key={v.name} thumbnail={v.thumbnail} ytSrc={v.ytSrc} name={v.name} meta={v.meta} />
            ))}
          </div>
        </div>
      </Motion.section>

      {/* ============================
          STUDENT PROJECTS
         ============================ */}
      <Motion.section
        className="py-16 md:py-20 px-6 bg-slate-50/50"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl md:text-4xl font-display"
              style={{
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Discover Our Students' Projects
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-4 max-w-xl mx-auto">
              Explore out these incredible hands-on creations by Sparvi Lab makers.
            </p>
          </div>

          {/* Project Cards — horizontal swiper */}
          <div
            ref={projectTrackRef}
            className="mt-10 flex gap-6 md:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-4"
          >
            {studentProjects.map((proj, i) => {
              const accent = cardAccents[i % cardAccents.length];
              return (

              <Motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group shrink-0 basis-[110%] sm:basis-[29%] lg:basis-[20%] snap-start"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid rgba(148,163,184,0.15)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.1), 0 0 0 2px ${accent.from}30`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)"}
                data-project-index={i}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 z-20"
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  >
                    <source src={gifToVideo(proj.img, "webm")} type="video/webm" />
                    <source src={gifToVideo(proj.img, "mp4")} type="video/mp4" />
                  </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent z-10" />
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  <h3
                    className="font-extrabold text-lg mb-2 leading-snug"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {proj.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {proj.desc}
                  </p>
                </div>
              </Motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center items-center gap-2.5">
            {[...Array(projectCount)].map((_, i) => {
              const dotAccent = cardAccents[i % cardAccents.length];
              const isActive = projectIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setProjectIndex(i)}
                  className="p-0 m-0 border-none min-h-0 min-w-0 h-2 rounded-full transition-all duration-500 ease-out focus:outline-none"
                  style={isActive ? {
                    width: 40,
                    background: `linear-gradient(90deg, ${dotAccent.from}, ${dotAccent.to})`,
                    boxShadow: `0 0 10px ${dotAccent.from}80`,
                  } : {
                    width: 10,
                    background: "#cbd5e1",
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
      <Motion.section
        className="py-16 md:py-24 px-6 bg-slate-50/50"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-2xl md:text-4xl font-display mb-12 text-center"
            style={{
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Why Choose Sparvi Lab?
          </h2>

          {/* Two-column layout: Lottie left + features right */}
          <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">

            {/* Left — Lottie animation + CTA */}
            <div className="flex flex-col items-center gap-4 lg:w-[340px] shrink-0 order-2 lg:order-none h-full">
              <div className="w-90 h-90 sm:w-80 sm:h-80 lg:w-full lg:flex-1 lg:max-w-[340px] mx-auto">
                <img
                  src="https://res.cloudinary.com/dipzvlfnt/image/upload/f_auto,q_auto,w_640/v1772832874/its_bqxp1i.webp"
                  alt="Student holding money"
                  loading="lazy"
                  className="w-full h-full object-contain lg:object-cover rounded-3xl"
                />
              </div>
              <Link to="/signup" className="mx-auto">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold px-8 py-3.5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                  Secure your Seat!
                </button>
              </Link>
            </div>

            {/* Right — 2-column grid of feature cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 order-1 lg:order-none">
              {features.map((feature, i) => {
                const featureAccents = [
                  { icon: "linear-gradient(135deg, #1d4ed8, #06b6d4)", border: "#1d4ed820", glow: "rgba(29,78,216,0.12)" },
                  { icon: "linear-gradient(135deg, #7c3aed, #06b6d4)", border: "#7c3aed20", glow: "rgba(124,58,237,0.12)" },
                  { icon: "linear-gradient(135deg, #0891b2, #10b981)", border: "#0891b220", glow: "rgba(8,145,178,0.12)" },
                  { icon: "linear-gradient(135deg, #db2777, #f59e0b)", border: "#db277720", glow: "rgba(219,39,119,0.12)" },
                  { icon: "linear-gradient(135deg, #1d4ed8, #7c3aed)", border: "#1d4ed820", glow: "rgba(29,78,216,0.12)" },
                  { icon: "linear-gradient(135deg, #059669, #06b6d4)", border: "#05966920", glow: "rgba(5,150,105,0.12)" },
                ];
                const fa = featureAccents[i % featureAccents.length];
                return (
                <Motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden cursor-default"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
                    border: `1.5px solid ${fa.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 16px 40px ${fa.glow}, 0 2px 12px rgba(0,0,0,0.04)`;
                    e.currentTarget.style.border = `1.5px solid ${fa.border.replace("20", "50")}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                    e.currentTarget.style.border = `1.5px solid ${fa.border}`;
                  }}
                >
                  {/* Decorative corner glow */}
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 mb-1.5 text-sm md:text-base leading-snug group-hover:text-slate-900 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                </Motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </Motion.section>

      <Parentsreviews />

      {/* ============================
          FAQ SECTION
         ============================ */}
      <Motion.section
        className="py-16 md:py-24 px-6"
        style={{ background: "rgba(248,250,252,0.5)" }}
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
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
              Everything you need to know about Sparvi Lab before getting started.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                index={i}
                item={item}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? -1 : i)}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center p-8 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #0a1628, #1d4ed8)",
              boxShadow: "0 20px 50px rgba(29,78,216,0.2)",
            }}>
            <p className="text-white font-semibold text-lg mb-1">Still have questions?</p>
            <p className="text-white/60 text-sm mb-5">Our team is happy to help you out.</p>
            <a href="/contact">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold px-7 py-3 transition-all duration-200 hover:-translate-y-0.5 shadow-lg text-sm">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </Motion.section>

      {/* ============================
          FOOTER
         ============================ */}
      <footer className="text-white" style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)"
      }}>
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {/* Column 1: Logo & Info */}
            <div>
              <img src="/logo-white.png" alt="Sparvi Lab" width="133" height="70" className="h-10 mb-4" />
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Hands-on learning that sparks creativity. Build robots, learn
                circuits, and code your future.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/sparvilab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.facebook.com/sparviIab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.tiktok.com/@sparvilab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <FaTiktok size={16} />
                </a>
                <a
                  href="https://wa.me/201500077369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <FaWhatsapp size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Main Menu */}
            <div>
              <h4 className="text-[#FBBF24] font-semibold text-sm tracking-wider uppercase mb-4">
                Main Menu
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">Home</Link>
                <Link to="/signup" className="text-slate-400 hover:text-white text-sm transition-colors">Secure your seat</Link>
                <Link to="/courses" className="text-slate-400 hover:text-white text-sm transition-colors">Explore Levels</Link>
                <Link to="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact Us</Link>
              </nav>
            </div>

            {/* Column 3: Join the Club */}
            <div>
              <h4 className="text-[#FBBF24] font-semibold text-sm tracking-wider uppercase mb-4">
                Join the Club
              </h4>
              <p className="text-slate-400 text-sm mb-4">
                Get the latest robot kits news and exclusive discounts for young
                inventors.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                />
                <button className="w-full sm:w-auto rounded-lg bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold px-5 py-2.5 text-sm flex items-center justify-center gap-1.5 transition-colors">
                  Subscribe <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
              <span className="block md:inline md:ml-2">
                Designed for future innovators.
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              {/* Apple Pay */}
              <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center justify-center">
                <svg width="42" height="18" viewBox="0 0 165.52 105.97" fill="white">
                  <path d="M150.7 0H14.82A30.57 30.57 0 000 14.82v76.33A30.57 30.57 0 0014.82 106h135.88a30.57 30.57 0 0014.82-14.85V14.82A30.57 30.57 0 00150.7 0" fill="none" />
                  <path d="M37.08 34.93a8.59 8.59 0 002-6.28 8.76 8.76 0 00-5.73 2.96 8.2 8.2 0 00-2.05 5.98 7.26 7.26 0 005.78-2.66zm1.97 3.39c-3.2-.19-5.93 1.82-7.45 1.82s-3.86-1.72-6.38-1.68a9.42 9.42 0 00-8 4.86c-3.43 5.93-.9 14.72 2.43 19.55 1.63 2.39 3.6 5.05 6.17 4.95 2.43-.1 3.4-1.58 6.37-1.58s3.81 1.58 6.38 1.53c2.67-.05 4.36-2.39 5.98-4.81a21.6 21.6 0 002.68-5.5 8.72 8.72 0 01-5.25-7.93 8.88 8.88 0 014.23-7.45 9.13 9.13 0 00-7.16-3.86zM68.72 29.08a9.37 9.37 0 019.92 10.52H60.35c.15 4.58 3.29 7.6 7.55 7.6a10.44 10.44 0 007.22-2.83l3 3.77c-2.63 2.48-6.18 3.97-10.52 3.97-8.18 0-13.52-5.65-13.52-13.45 0-7.95 5.57-13.6 13.12-13.6h1.52zm-8.42 8.42h14.27c-.27-3.67-2.73-6.03-6.53-6.03a7.04 7.04 0 00-7.74 6.03zm27.57-8h5.57l.5 4.36h.2a10.76 10.76 0 018.35-4.78 7.64 7.64 0 013.67.72l-1.38 5.63a9.43 9.43 0 00-3.17-.57c-2.43 0-5.35 1.58-7.08 4.81v21.45h-6.66zm42.55 0h5.57l.5 4.65h.2c2.33-3.17 5.25-5.08 8.72-5.08 5.73 0 9.1 4.16 9.1 11.32v16.8h-6.67V41.54c0-4.36-1.68-6.46-4.95-6.46-2.53 0-4.48 1.33-6.8 4.06v22.65h-6.67V29.5h1zm-23.54 0h5.57l.5 4.65h.2c2.33-3.17 5.25-5.08 8.72-5.08 5.73 0 9.1 4.16 9.1 11.32v16.8h-6.67V41.54c0-4.36-1.68-6.46-4.95-6.46-2.53 0-4.48 1.33-6.8 4.06v22.65h-6.67V29.5h1z" fill="white" />
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center justify-center">
                <svg width="36" height="22" viewBox="0 0 131.39 86.9">
                  <rect width="131.39" height="86.9" rx="8" fill="none" />
                  <circle cx="48.27" cy="43.45" r="29.5" fill="#eb001b" />
                  <circle cx="83.12" cy="43.45" r="29.5" fill="#f79e1b" />
                  <path d="M65.7 19.3a29.42 29.42 0 0 0-10.93 22.85v1.3A29.42 29.42 0 0 0 65.7 66.3a29.42 29.42 0 0 0 10.93-22.85v-1.3A29.42 29.42 0 0 0 65.7 19.3z" fill="#ff5f00" />
                </svg>
              </div>
              {/* Visa */}
              <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center justify-center">
                <svg width="42" height="14" viewBox="0 0 1000 324" fill="white">
                  <path d="M431.58 1.58l-89.33 319.5h-72.32l89.42-319.5h72.23zm288.67 206.25l38.08-105 21.92 105h-60zm80.83 113.25h66.75L808.67 1.58h-58.75c-13.25 0-24.42 7.67-29.33 19.5L613.33 321.08h69.92l13.83-38.42h85.42l8.08 38.42zM620.75 218.5c.33-85.67-118.5-90.42-117.67-128.67.25-11.67 11.33-24 35.58-27.17a158.07 158.07 0 0182.92 14.58l14.75-68.83A226.07 226.07 0 00556.25.08c-65.83 0-112.17 35-112.58 85.08-.42 37.08 33.08 57.75 58.33 70.08 26 12.67 34.67 20.75 34.58 32.08-.17 17.33-20.67 25-39.83 25.33-33.5.5-52.92-9.08-68.42-16.25l-12.08 56.42c15.58 7.17 44.33 13.33 74.17 13.67 70 .08 115.75-34.5 115.92-88zm-276.67-217L281.25 321.08h-70.58L148.67 43.83c-3.75-14.75-7-20.17-18.42-26.42C115 9.25 89.42 1.75 66.67.08L68.25 1.5h113.33c14.42 0 27.42 9.58 30.67 26.17l28.08 149.17 69.33-175.33h70.42z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
