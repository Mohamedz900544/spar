import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  Globe2, Target, Compass, BookOpen, Layers,
  TrendingUp, Brain, Code, Wrench, MessageSquare, Zap,
  HeartHandshake, Rocket, Users, Star, ArrowRight,
  Sparkles, CheckCircle2, ChevronDown
} from "lucide-react";

// ── Animation Helpers ── //
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const FadeIn = ({ children, delay = 0, className = "", direction = "up" }) => {
  const yInitial = direction === "up" ? 40 : direction === "down" ? -40 : 0;
  const xInitial = direction === "left" ? 40 : direction === "right" ? -40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yInitial, x: xInitial }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingElement = ({ children, className = "", delay = 0, yOffset = 20, duration = 6 }) => {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -yOffset, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// ── Data Configs ── //
const timelineSteps = [
  {
    year: "The Spark",
    title: "A Widening Gap",
    desc: "We noticed children were immersed in technology, but strictly as consumers. While the tools of the future (like AI) were evolving exponentially, classroom approaches remained stagnant, prioritizing test scores over resilience and creative problem-solving.",
    color: "#f97316",
    icon: Sparkles
  },
  {
    year: "The Vision",
    title: "Building the Foundation",
    desc: "We asked a simple question: 'What if we designed a learning journey that grows with the child?' We researched international standards, cognitive models, and combined them into a curriculum that prioritizes thinking first, coding second.",
    color: "#2dd4bf",
    icon: Compass
  },
  {
    year: "The Ecosystem",
    title: "Sparvi Lab Is Born",
    desc: "It wasn't just about offering classes; it was about creating a full ecosystem involving students, mentors, and parents. By building this partnership, we turned isolated workshops into a long-term developmental journey.",
    color: "#a78bfa",
    icon: Target
  }
];

const pillars = [
  { icon: Layers, color: "#2dd4bf", title: "Age-Structured Path", desc: "Designed for specific developmental stages. They begin with block-based logic, transition to real syntax, and eventually build robust applications." },
  { icon: Brain, color: "#FBBF24", title: "Skills Over Syntax", desc: "We focus on computational thinking, problem decomposition, and resilience before teaching the specific commands of any single language." },
  { icon: TrendingUp, color: "#a78bfa", title: "Progressive Mastery", desc: "Every level builds on the last. Students don't just collect certificates; they stack capabilities, growing year after year." },
  { icon: BookOpen, color: "#f97316", title: "Proven Models", desc: "Our methodology is grounded in established learning models including SAVI, Meier's techniques, and 4MAT frameworks." },
];

const learnerOutcomes = [
  { text: "Break down complex problems into manageable steps" },
  { text: "Write creative code, design games, and grasp early AI" },
  { text: "Discuss ideas and confidently explain mechanisms" },
  { text: "Persist through open-ended, ambiguous challenges" }
];

// ── The Page Component ── //
const OurStory = () => {
  useEffect(() => {
    document.title = "Our Story — Sparvi Lab | The Origin of Innovation";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#2dd4bf]/30 overflow-x-hidden">
      <Navbar />

      {/* ===== Hero Banner ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        {/* Floating decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingShape className="absolute top-[20%] left-[10%] w-3 h-3 rounded-full bg-[#FBBF24]/30" delay={0} />
          <FloatingShape className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-[#2dd4bf]/40" delay={1} />
          <FloatingShape className="absolute bottom-[20%] left-[60%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20" delay={2} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-28 pb-16 md:pt-32 md:pb-20 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 font-display">
              The Origin <span className="text-[#FBBF24]">Story</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base mb-8">
              We started with one simple belief — every child deserves the chance to build, create, and master the tools of tomorrow.
            </p>

            <div className="flex justify-center border-t border-white/10 pt-8 max-w-2xl mx-auto">
              {/* <div className="grid grid-cols-3 gap-6 md:gap-12 w-full">
                {[
                  { value: "500+", label: "Students", icon: Users },
                  { value: "6 - 17", label: "Age Range", icon: Star },
                  { value: "10+", label: "Countries", icon: Globe2 }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <stat.icon className="w-5 h-5 text-[#FBBF24] mb-1 opacity-90" />
                    <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                    <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div> */}
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
            <path
              d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* ────────────────── 2. THE TIMELINE FLOW ────────────────── */}
      <section className="py-24 md:py-40 px-6 relative max-w-5xl mx-auto">
        <FadeIn className="text-center mb-20 md:mb-32">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">How it all unfolded</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            The transition from a simple observation to a structured educational revolution.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Timeline Center Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f97316] via-[#2dd4bf] to-[#a78bfa] rounded-full opacity-20 -translate-x-1/2" />

          <div className="space-y-24">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-10 md:gap-16 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                {/* Timeline Dot */}
                <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 w-16 h-16 rounded-full bg-white shadow-xl border-4 flex items-center justify-center -translate-x-1/2 md:-translate-y-1/2 z-10" style={{ borderColor: step.color }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <FadeIn direction={idx % 2 === 0 ? "right" : "left"} className={`w-full pl-24 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-bold text-sm`} style={{ color: step.color, backgroundColor: `${step.color}15` }}>
                    {step.year}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">{step.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{step.desc}</p>
                </FadeIn>

                {/* Spacer for alternate side */}
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── 3. CURRICULUM ARCHITECTURE ────────────────── */}
      <section className="py-24 md:py-32 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            {/* Left Text */}
            <div className="lg:col-span-5">
              <FadeIn direction="right">
                <div className="w-16 h-16 rounded-2xl bg-[#071228] text-white flex items-center justify-center mb-8 shadow-xl">
                  <Brain className="w-8 h-8 text-[#2dd4bf]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Engineered for <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6]">Deep Learning</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Sparvi Lab is not a one-off workshop or a scattered blend of tools. It is a curriculum-driven architecture designed around how children actually process information. We sequence experiences so the leap from early curiosity to real innovation is seamless.
                </p>

                <div className="space-y-5">
                  {[
                    "Experiential first, conceptual second",
                    "Adaptable across multiple tools & frameworks",
                    "Aligned with international tech standards"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
                      </div>
                      <span className="font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right Grid */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {pillars.map((pillar, i) => (
                <FadeIn key={i} delay={i * 0.1} direction="up">
                  <div className="group h-full p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-[#2dd4bf]/10 transition-all duration-500 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md" style={{ backgroundColor: pillar.color, color: 'white' }}>
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{pillar.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{pillar.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────── 4. WHAT THEY ACTUALLY DO ────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="p-10 md:p-16 rounded-[3rem] bg-[#071228] relative shadow-2xl overflow-hidden">
            {/* Dark Card Graphics */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-[#a78bfa]/20 to-transparent rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#2dd4bf]/20 to-transparent rounded-full blur-[80px]" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">From Coding to Creating</h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed font-light">
                  In Sparvi Lab, learners don't just "complete activities". They learn to see technology as a raw material they can shape, building a tolerance for trial, error, and debugging.
                </p>
                <blockquote className="pl-6 border-l-4 border-[#2dd4bf] text-slate-400 italic text-lg pr-4">
                  "They learn to be comfortable with ambiguity, debugging both their code and their own logic."
                </blockquote>
              </FadeIn>

              <div className="space-y-4">
                {learnerOutcomes.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                    <div className="flex items-start gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#3b82f6] flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Wrench className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-slate-200 mt-2 font-medium">{item.text}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 5. FULL WIDTH CALL TO ACTION ────────────────── */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Abstract shapes for background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[80%] bg-gradient-to-r from-[#2dd4bf]/20 via-[#FBBF24]/20 to-[#a78bfa]/20 rounded-full blur-[120px] pointer-events-none" />

        <FadeIn className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-10 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FBBF24] to-[#f97316] flex items-center justify-center shadow-2xl shadow-[#FBBF24]/30 rotate-3">
              <Rocket className="w-10 h-10 text-white -rotate-3" />
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            The future belongs to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#FBBF24]">resilient.</span>
          </h2>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The tools will keep changing, but the ability to think, adapt, and build will last forever. Join us in shaping tomorrow's leaders.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
            <Link to="/courses" className="group relative px-8 py-5 w-full sm:w-auto rounded-full bg-[#071228] text-white font-bold text-lg overflow-hidden shadow-2xl hover:shadow-[#071228]/40 transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center justify-center gap-3">
                Explore Programs
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link to="/contact" className="px-8 py-5 w-full sm:w-auto rounded-full bg-white border-2 border-slate-200 text-slate-700 hover:border-[#2dd4bf] hover:text-[#2dd4bf] text-center font-bold text-lg shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              Talk to an Expert
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      {/* <footer className="relative bg-[#071228] text-center pt-20 pb-10 border-t border-white/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf]/50 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2dd4bf] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#2dd4bf]/20">
              <span className="text-white font-bold text-2xl leading-none">S</span>
            </div>
            <span className="text-white font-bold text-3xl tracking-tight">Sparvi Lab</span>
          </div>

          <div className="w-24 h-1.5 bg-gradient-to-r from-[#FBBF24] to-[#f97316] rounded-full mb-10 opacity-90 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 w-full max-w-3xl text-sm">
            {[
              "Methodology",
              "Curriculum Framework",
              "For Parents",
              "Join the Team"
            ].map((link, i) => (
              <a key={i} href="#" className="text-slate-400 hover:text-white transition-colors">{link}</a>
            ))}
          </div>

          <p className="text-slate-500 text-sm border-t border-white/10 w-full pt-8">
            © {new Date().getFullYear()} Sparvi Lab. All rights reserved. <br className="md:hidden" />
            <span className="hidden md:inline"> | </span> 
            Pioneering resilient intelligence.
          </p>
        </div>
      </footer> */}

    </div>
  );
};

export default OurStory;
