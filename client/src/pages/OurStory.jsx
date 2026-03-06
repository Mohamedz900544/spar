import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  Globe2,
  Cpu,
  Target,
  Compass,
  BookOpen,
  Layers,
  TrendingUp,
  Brain,
  Code,
  Wrench,
  MessageSquare,
  Zap,
  HeartHandshake,
  Rocket,
  X,
  Users,
  Star,
} from "lucide-react";

/* ── Helpers ── */
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.65, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const CheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ── Data ── */
const heroStats = [
  { icon: Users, label: "Students", value: "500+" },
  { icon: Star, label: "Age Range", value: "6 – 17" },
  { icon: Globe2, label: "Countries", value: "3+" },
];

const pillars = [
  { icon: Layers, color: "#2dd4bf", bg: "rgba(45,212,191,0.12)", title: "Age-structured", desc: "Designed specifically for different developmental stages from 6 to 17." },
  { icon: Brain, color: "#FBBF24", bg: "rgba(251,191,36,0.12)", title: "Skills-driven", desc: "Focused on thinking skills first, specific tools second." },
  { icon: TrendingUp, color: "#a78bfa", bg: "rgba(167,139,250,0.12)", title: "Progressive", desc: "Each level builds on the last, so children grow year after year." },
  { icon: BookOpen, color: "#f97316", bg: "rgba(249,115,22,0.12)", title: "Proven Models", desc: "Grounded in learning models including SAVI, Meier's, and 4MAT." },
];

const learnItems = [
  { icon: Zap, color: "#FBBF24", text: "Break down problems and design solutions" },
  { icon: Code, color: "#2dd4bf", text: "Build projects in computational thinking, creative coding, electronics, game design, and early AI concepts" },
  { icon: MessageSquare, color: "#a78bfa", text: "Discuss their ideas, present their thinking, and explain why something works" },
  { icon: Wrench, color: "#f97316", text: "Face open-ended challenges where there is no single correct answer" },
];

const partnerItems = [
  "Helping you understand your child's learning style",
  "Offering practical ways to support focus and curiosity at home",
  "Encouraging healthy tech habits rather than passive screen time",
  "Making progress visible — through skills and behaviors, not just grades",
];

/* ── Page ── */
const OurStory = () => (
  <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans">
    <Navbar />

    {/* ═══════════ HERO ═══════════ */}
    <div
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 55%, #1a3a6b 100%)" }}
    >
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingShape className="absolute top-[20%] left-[10%] w-3 h-3 rounded-full bg-[#FBBF24]/30" delay={0} />
        <FloatingShape className="absolute top-[60%] right-[12%] w-2 h-2 rounded-full bg-[#2dd4bf]/40" delay={1.5} />
        <FloatingShape className="absolute bottom-[30%] left-[55%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20" delay={2.5} />
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-28 pb-6 md:pt-36 md:pb-8 text-center">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Our Journey
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            The Story Behind{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#f97316]">
              Sparvi Lab
            </span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10">
            We started with one simple belief — every child deserves the chance to build, create, and discover.
            Here's how that belief became a movement.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-4 pb-12"
        >
          {heroStats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 bg-white/8 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2.5"
            >
              <Icon className="w-4 h-4 text-[#FBBF24]" />
              <span className="text-white font-bold text-sm">{value}</span>
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Wave */}
      <div className="absolute -bottom-px left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
          <path d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#f8fafc" />
        </svg>
      </div>
    </div>

    {/* ═══════════ CONTENT ═══════════ */}
    <main className="flex-1 px-5 py-16 md:py-20 space-y-20 md:space-y-28 max-w-6xl mx-auto w-full">

      {/* §1 — The world is changing */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf]">
              <Globe2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              The world is changing faster than childhood.
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-[17px]">
              <p>
                Children today are growing up in a world shaped by AI, automation, and technologies that didn't exist even a few years ago. The tools they'll use as adults are evolving at a speed schools can't keep up with.
              </p>
              <p>
                Yet most kids are still learning as if they are preparing for the past, not the future. They are expected to compete in an AI-driven world without the thinking skills, confidence, or adaptability they actually need.
              </p>
              <p className="font-medium text-slate-800 border-l-4 border-[#2dd4bf] pl-4 py-1 bg-[#2dd4bf]/5 rounded-r-xl">
                Parents feel this gap deeply. They want their children to understand technology, to be creators not just consumers, and to build skills that will still matter when today's tools are obsolete.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Decorative dark card */}
        <FadeIn delay={0.2}>
          <div
            className="rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 100%)" }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#2dd4bf]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FBBF24]/8 rounded-full blur-[60px] pointer-events-none" />
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-6 relative z-10">Skills of the future</p>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { icon: Brain, color: "#FBBF24", label: "Critical Thinking" },
                { icon: Cpu, color: "#2dd4bf", label: "Tech Literacy" },
                { icon: Zap, color: "#a78bfa", label: "Adaptability" },
                { icon: Code, color: "#f97316", label: "Creative Coding" },
              ].map(({ icon: Icon, color, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-white text-xs font-semibold leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* §2 — The problem we saw */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <FadeIn className="text-center max-w-3xl mx-auto mb-10 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The problem we saw</h2>
          <p className="text-slate-600 text-lg">When we looked at the market, we saw the same pattern repeated everywhere:</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-5 relative z-10">
          {[
            "Short, tool-based courses that teach Scratch, Python, or robotics in isolation",
            "No long-term plan that follows a child from early curiosity to real innovation",
            "Little focus on core thinking skills like problem-solving, logical reasoning, and learning how to learn",
            "No alignment with international standards or clear way to measure growth over years",
          ].map((text, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border-l-4 border-red-400 border border-slate-100 hover:bg-red-50/40 transition-colors">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 leading-relaxed">{text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-10 relative z-10">
          <div className="bg-[#071228] rounded-2xl shadow-xl overflow-hidden flex">
            <div className="w-1.5 bg-gradient-to-b from-[#FBBF24] to-[#f97316] flex-shrink-0" />
            <div className="px-8 py-6">
              <p className="text-slate-300 mb-2">Children were collecting disconnected badges and certificates, but not building a foundation. They knew "some code"…</p>
              <p className="text-lg font-semibold text-[#FBBF24]">But they didn't know how to think, adapt, and keep learning.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* §3 — Why we founded */}
      <section className="text-center max-w-4xl mx-auto">
        <FadeIn>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBBF24]/10 text-[#FBBF24] mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">Why we founded Sparvi Lab</h2>
          <p className="text-xl text-slate-600 mb-10">
            We started with a simple but ambitious question:{" "}
            <span className="font-semibold text-slate-900">
              "What if we designed a learning journey that grows with the child, not just a set of classes around tools?"
            </span>
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4 text-left">
          {[
            "How do we build problem-solvers, not button-clickers?",
            "How do we grow confidence when facing something new and unfamiliar?",
            "How do we help kids transfer skills from one tool to another, one field to another?",
            "How do we involve parents as partners, not spectators?",
          ].map((q, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start hover:border-[#2dd4bf]/40 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-[#2dd4bf]" />
                </div>
                <p className="text-slate-700 font-medium text-sm leading-relaxed">{q}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-8">
          <p className="text-lg text-slate-700 leading-relaxed p-6 bg-gradient-to-r from-[#102a5a]/5 to-[#2dd4bf]/5 rounded-2xl border border-[#2dd4bf]/20">
            Sparvi Lab was born from the belief that{" "}
            <strong className="text-slate-900">the real skill of the AI age is learning resilience</strong> — the ability to understand, experiment, adapt, and keep going when the rules change.
          </p>
        </FadeIn>
      </section>

      {/* §4 — Curriculum pillars */}
      <section className="grid md:grid-cols-12 gap-12 items-start">
        <FadeIn className="md:col-span-5">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-5">
            A curriculum built around how children actually learn
          </h2>
          <p className="text-slate-600 text-lg mb-4">
            Sparvi Lab is a curriculum-driven learning system for ages 6–17. It is not a one-off course, not a workshop, and not a random mix of tools.
          </p>
          <p className="text-slate-600">
            Every lesson is intentionally designed to engage different learning styles, move through a clear cognitive journey (experience → reflect → conceptualize → apply), and connect to real-world problems.
          </p>
        </FadeIn>

        <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
          {pillars.map(({ icon: Icon, color, bg, title, desc }, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* §5 — From coding to creating */}
      <section
        className="rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2dd4bf] opacity-10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FBBF24] opacity-8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">From coding to creating: what learners do</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              In Sparvi Lab, students don't just "complete activities". They learn to see technology as a tool they can shape, not something that controls them.
            </p>
            <p className="text-slate-400 italic border-l-2 border-[#2dd4bf]/40 pl-4">
              "They learn to be comfortable with trial and error, to debug both their code and their thinking."
            </p>
          </FadeIn>

          <div className="space-y-3">
            {learnItems.map(({ icon: Icon, color, text }, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* §6 — Partnership with parents */}
      <section className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2dd4bf]/10 text-[#2dd4bf] mb-6">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">A partnership with parents</h2>
          <p className="text-xl text-slate-600 mb-10">
            We believe real change happens when school, learning centers, and home are aligned. You are not just "dropping your child off for a class" — you are joining a long-term learning journey with them.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4 text-left">
          {partnerItems.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-[#2dd4bf]/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-4 h-4 text-[#2dd4bf]" />
                </div>
                <p className="text-slate-700 font-medium text-sm leading-relaxed">{item}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* §7 — Vision */}
      <section
        className="relative rounded-[2.5rem] overflow-hidden text-white py-20 px-8 text-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 60%, #1a3a6b 100%)" }}
      >
        {/* CSS dots pattern instead of external URL */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[#FBBF24]/10 rounded-full blur-[80px] pointer-events-none" />

        <FadeIn className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] mb-8">
            <Rocket className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our vision for the next generation</h2>

          <p className="text-xl md:text-2xl font-light text-slate-200 mb-10 leading-relaxed">
            We are not trying to create an army of coders. We are building a generation of innovators and resilient learners who:
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["Think clearly when problems are messy", "Stay curious when tools change", "Feel confident experimenting", "Understand AI responsibility"].map((trait, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm md:text-base backdrop-blur-md"
              >
                {trait}
              </span>
            ))}
          </div>

          <p className="text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The future will keep changing. New platforms, new devices, new roles will appear. Our mission at Sparvi Lab is to ensure that when that future arrives, today's children are not afraid of it — they are ready for it.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-2xl md:text-3xl font-bold">
            {["Ready to understand.", "Ready to create.", "Ready to lead."].map((phrase, i) => (
              <React.Fragment key={phrase}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.2 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#2dd4bf]"
                >
                  {phrase}
                </motion.div>
                {i < 2 && <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600" />}
              </React.Fragment>
            ))}
          </div>
        </FadeIn>
      </section>

    </main>

    {/* Footer */}
    <footer className="py-6 text-center text-xs bg-[#071228]">
      <p className="text-slate-500">© {new Date().getFullYear()} Sparvi Lab. All rights reserved.</p>
    </footer>
  </div>
);

export default OurStory;
