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
    question: "What comes in the Sparvi Lab electronics kit?",
    answer:
      "The kit includes everything your child needs for the course: a breadboard, jumper wires, LEDs, resistors, a buzzer, switches, and a battery pack. Everything is low-voltage (safe for kids) and reusable for endless projects!",
  },
  {
    question: "What age group is this suitable for?",
    answer:
      "Sparvi Lab sessions are designed for children ages 7–12. Our curriculum uses age-appropriate language, visuals, and hands-on activities that keep young learners engaged and confident.",
  },
  {
    question: "Do parents need to help during the sessions?",
    answer:
      "Not at all! Our friendly instructors guide every step. Parents are welcome to watch, but kids are encouraged to explore and build independently with mentor support.",
  },
  {
    question: "What happens if we miss a live class?",
    answer:
      "No worries — we provide session summaries and your child can catch up in the next class. Our structured curriculum makes it easy to rejoin without falling behind.",
  },
  {
    question: "Is prior coding or robotics experience required?",
    answer:
      "Absolutely not! Sparvi Lab starts from scratch. We begin with the basics of electricity and circuits, building up to more complex projects week by week.",
  },
];

/* ==============================
   FEATURES DATA
   ============================== */
const features = [
  {
    icon: Monitor,
    title: "Live Instructor-Led Missions",
    text: "Kids don't learn alone. A Sparvi coach leads each online session, explains every step, and answers questions in real time so no one gets lost.",
  },
  {
    icon: Cpu,
    title: "Real Electronics Kit at Home",
    text: "Every student receives a Sparvi Lab kit with safe low-voltage components. They connect wires, LEDs, switches, sensors, and motors to see how real circuits behave.",
  },
  {
    icon: Users,
    title: "Designed for Ages 8–14",
    text: "Lessons use clear language, big visuals, and age-appropriate challenges so both beginners and curious tinkerers can follow along and feel successful.",
  },
  {
    icon: BookOpen,
    title: "Screen Time With a Purpose",
    text: "Sessions are online, but hands are always busy building. Kids look at the screen to follow the mentor, then look down to wire, test, and tweak their own circuit.",
  },
  {
    icon: BarChart3,
    title: "Structured Levels, Clear Progress",
    text: "Level 1 is an 8-session foundation course. After finishing it, kids can unlock higher levels with more advanced projects in sensors, robotics, and coding.",
  },
  {
    icon: ShieldCheck,
    title: "Parent Peace of Mind",
    text: "Safe parts, guided sessions, and small groups. You'll know the schedule, what your child is building each week, and get simple summaries after every session.",
  },
];

/* ==============================
   FAQ ACCORDION ITEM
   ============================== */
const FAQItem = ({ item, isOpen, onToggle }) => (
  <div
    className={`rounded-3xl border-2 transition-all duration-300 cursor-pointer ${isOpen
      ? "border-[#1d4ed8] bg-white shadow-[0_4px_24px_rgba(29,78,216,0.1)]"
      : "border-dashed border-slate-300 bg-white hover:border-slate-400"
      }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4"
    >
      <span
        className={`font-bold text-sm md:text-base transition-colors ${isOpen ? "text-[#1d4ed8]" : "text-slate-800"
          }`}
      >
        {item.question}
      </span>
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
          ? "bg-[#1d4ed8] text-white"
          : "bg-slate-100 text-slate-500"
          }`}
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </div>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
    >
      <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-slate-600 leading-relaxed">
        {item.answer}
      </p>
    </div>
  </div>
);

/* ==============================
   VIDEO CONFIG
   — Edit thumbnail, ytSrc, name, meta per student
   ============================== */
const HERO_VIDEOS = [
  {
    thumbnail: "https://i.ibb.co/xRtsf8T/Screenshot-2026-01-12-043823.webp",
    ytSrc: "https://www.youtube.com/embed/52GDwQBAY?autoplay=1&playsinline=1&rel=0&modestbranding=1",
    name: "Mostafa Fouda",
    meta: "Grade 5 | Egypt",
  },
];

const studentProjects = [
  {
    img: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80",
    title: "LED Circuit Board",
    desc: "Built a working LED matrix circuit using resistor",
  },
  {
    img: "https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?w=600&q=80",
    title: "Traffic Light System",
    desc: "Programmed a traffic light sequence with timing",
  },
  {
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    title: "Sound Alarm",
    desc: "Wired a sound sensor to a buzzer — when noise",
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
          className="sparvi-hero-thumb-img"
        />

        <div className="sparvi-hero-gradient" />

        <button
          className="sparvi-hero-play-btn"
          type="button"
          aria-label={`Play video for ${name}`}
          onClick={(e) => { e.stopPropagation(); setPlaying(true); }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="sparvi-hero-play-icon">
            <path d="M8 5v14l11-7z" />
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

const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState(-1);
  const [projectIndex, setProjectIndex] = useState(0);
  const projectTrackRef = useRef(null);
  const projectCount = studentProjects.length;

  useEffect(() => {
    if (projectCount <= 1) return;
    const timer = setInterval(() => {
      setProjectIndex((prev) => (prev + 1) % projectCount);
    }, 3000);
    return () => clearInterval(timer);
  }, [projectCount]);

  useEffect(() => {
    const track = projectTrackRef.current;
    if (!track) return;
    const card = track.querySelector(`[data-project-index="${projectIndex}"]`);
    if (!card) return;
    const left = card.offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior: "smooth" });
  }, [projectIndex]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
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
              <span className="block">
                Building the
              </span>
              <span className="block">
                Next Generation’s
              </span>
              <span className="inline-block mt-2 bg-[#FBBF24] text-[#024f63] border-2 border-white px-3 py-1 rounded-md text-xl sm:text-2xl md:text-3xl font-bold transform -rotate-1">
                Minds
              </span>
            </h1>

            <p className="max-w-xl mx-auto md:mx-0 text-xs sm:text-sm md:text-base text-slate-300 mb-6 md:mb-8 leading-relaxed">
              Hands-on learning that sparks creativity. Build robots, learn
              circuits, and code your future with Sparvi Lab.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row flex-nowrap justify-center md:justify-start items-center gap-2 sm:gap-4">
              <Link to="/signup">
                <button className="inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-base font-semibold shadow-[0_8px_25px_rgba(251,191,36,0.4)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.5)] bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap min-w-0">
                  Secure your seat!
                </button>
              </Link>

              <button className="inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap min-w-0">
                Our Story ➤
              </button>
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
              src="/Robot.webp"
              alt="Sparvi Lab Robot"
              className="w-[140%] max-w-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </Motion.div>
        </div>

      </section>

      {/* ============================
          HEAR FROM OUR HEROES
         ============================ */}
      <Motion.section
        className="py-16 md:py-20 px-6 bg-white"
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
        className="py-16 md:py-20 px-6 bg-white"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-3">
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
            <p className="text-slate-500 text-sm md:text-base mt-3 max-w-xl mx-auto">
              Explore out these projects by Sparvi Lab makers
            </p>
          </div>

          {/* Project Cards — horizontal swiper */}
          <div
            ref={projectTrackRef}
            className="mt-10 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
          >
            {studentProjects.map((proj, i) => (
              <Motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden group shrink-0 basis-[100%] sm:basis-[29%] lg:basis-[20%] snap-start"
                data-project-index={i}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden h-44">
                  <img
                    src={proj.img}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: "#1d4ed8" }}
                  >
                    {proj.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {proj.desc}
                  </p>
                </div>
              </Motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center items-center gap-2.5">
            {[...Array(projectCount)].map((_, i) => (
              <button
                key={i}
                onClick={() => setProjectIndex(i)}
                className={`
                  p-0 m-0 border-none min-h-0 min-w-0
                  h-2 rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-indigo-900
                  ${projectIndex === i ? "w-10 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "w-2.5 bg-white/30 hover:bg-white/60"}
                `}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </Motion.section>


      {/* ============================
          WHY CHOOSE SPARVI LAB?
         ============================ */}
      <Motion.section
        className="py-16 md:py-24 px-6 bg-white"
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
                  src="/its.webp"
                  alt="Student holding money"
                  className="w-full h-full object-contain lg:object-cover rounded-3xl"
                />
              </div>
              <Link to="/signup" className=" mx-auto">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold px-8 py-3.5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                  Secure your Seat!
                </button>
              </Link>
            </div>

            {/* Right — 2-column grid of feature cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 order-1 lg:order-none">
              {features.map((feature, i) => (
                <Motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Gradient icon box matching the screenshot */}
                    <div
                      className="shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #1d4ed8, #06b6d4)",
                        color: "#ffffff",
                        fontSize: "1.35rem",
                      }}
                    >
                      <feature.icon size={22} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#102a5a] mb-1 text-sm md:text-base leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>

          </div>
        </div>
      </Motion.section>

      <Parentsreviews />

      {/* ============================
          FAQ SECTION
         ============================ */}
      <Motion.section
        className="py-16 md:py-20 px-6 bg-white"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-4xl font-display mb-4"
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
            {/* Gold underline */}
            <div className="w-16 h-1.5 rounded-full mx-auto" style={{ background: "#FBBF24" }} />
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </Motion.section>

      {/* ============================
          CTA BANNER
         ============================ */}
         
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
              <img src="/logo-white.png" alt="Sparvi Lab" className="h-10 mb-4" />
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Hands-on learning that sparks creativity. Build robots, learn
                circuits, and code your future.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram size={16} />
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
              <div className="bg-white/10 rounded px-2 py-1 text-xs">
                🍎 Pay
              </div>
              <div className="bg-white/10 rounded px-2 py-1 text-xs">
                💳 Mastercard
              </div>
              <div className="bg-white/10 rounded px-2 py-1 text-xs">
                💳 Visa
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
 
