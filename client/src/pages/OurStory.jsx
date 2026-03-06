import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  Globe2,
  Cpu,
  X,
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
  Rocket
} from "lucide-react";

const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const OurStory = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white font-sans selection:bg-[#FBBF24]/30 selection:text-[#071228]">
      <Navbar />

      {/* ===== Hero ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        {/* Floating decorative dots */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingShape className="absolute top-[20%] left-[10%] w-3 h-3 rounded-full bg-[#FBBF24]/30" delay={0} />
          <FloatingShape className="absolute top-[60%] right-[12%] w-2 h-2 rounded-full bg-[#2dd4bf]/40" delay={1.5} />
          <FloatingShape className="absolute bottom-[25%] left-[60%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20" delay={2.5} />
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              Our Journey
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
              The Story Behind{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#f97316]">
                Sparvi Lab
              </span>
            </h1>

            <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              We started with one simple belief — every child deserves the chance
              to build, create, and discover. Here's how that belief became a
              movement.
            </p>
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

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-5 py-16 md:py-24 space-y-24 md:space-y-32 max-w-6xl mx-auto w-full">
        
        {/* Section 1: The World is Changing */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-2">
                <Globe2 className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                The world is changing faster than childhood.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  Children today are growing up in a world shaped by AI, automation, and technologies that didn't exist even a few years ago. The tools they'll use as adults are evolving at a speed schools can't keep up with.
                </p>
                <p>
                  Yet most kids are still learning as if they are preparing for the past, not the future. They are expected to compete in an AI-driven world without being equipped with the thinking skills, confidence, or adaptability they actually need.
                </p>
                <p className="font-medium text-slate-800 border-l-4 border-[#2dd4bf] pl-4 py-1">
                  Parents feel this gap deeply. They don't just want "screen time" or random apps. They want their children to understand technology, to be creators not just consumers, and to build skills that will still matter when today's tools are obsolete.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="relative">
            <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-100 shadow-2xl relative flex items-center justify-center border border-slate-200">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent" />
               <Cpu className="w-32 h-32 text-slate-300" strokeWidth={1} />
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute w-64 h-64 border border-dashed border-slate-300 rounded-full"
               />
               <motion.div 
                 animate={{ rotate: -360 }} 
                 transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 className="absolute w-48 h-48 border border-slate-300 rounded-full"
               />
            </div>
          </FadeIn>
        </section>

        {/* Section 2: The Problem We Saw */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <FadeIn className="text-center max-w-3xl mx-auto mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">The problem we saw</h2>
            <p className="text-slate-600 text-lg">
              When we looked at the market, we saw the same pattern repeated everywhere:
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {[
              "Short, tool-based courses that teach Scratch, Python, or robotics in isolation",
              "No long-term plan that follows a child from early curiosity to real innovation",
              "Little focus on core thinking skills like problem-solving, logical reasoning, and learning how to learn",
              "No alignment with international standards or clear way to measure growth over years"
            ].map((text, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-red-50/50 transition-colors">
                  <div className="mt-1 flex-shrink-0">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="mt-12 text-center relative z-10">
            <div className="inline-block bg-slate-900 text-white px-8 py-6 rounded-2xl shadow-xl">
              <p className="text-slate-300 mb-2">Children were collecting disconnected badges and certificates, but not building a foundation. They knew "some code"...</p>
              <p className="text-xl font-semibold text-[#FBBF24]">But they didn't know how to think, adapt, and keep learning.</p>
            </div>
          </FadeIn>
        </section>

        {/* Section 3: Why We Founded */}
        <section className="text-center max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBBF24]/10 text-[#f97316] mb-6">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why we founded Sparvi Lab</h2>
            <p className="text-xl text-slate-600 mb-10">
              We started Sparvi Lab with a simple but ambitious question: <br/>
              <span className="font-semibold text-slate-900 mt-2 inline-block">"What if we designed a learning journey that grows with the child, not just a set of classes around tools?"</span>
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "How do we build problem-solvers, not button-clickers?",
              "How do we grow confidence when facing something new and unfamiliar?",
              "How do we help kids transfer skills from one tool to another, one field to another?",
              "How do we involve parents as partners, not spectators?"
            ].map((q, i) => (
              <FadeIn key={i} delay={i * 0.1} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
                <Compass className="w-6 h-6 text-[#2dd4bf] flex-shrink-0" />
                <p className="text-slate-700 font-medium">{q}</p>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="mt-10">
            <p className="text-lg text-slate-600 leading-relaxed p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100">
              Sparvi Lab was born from the belief that <strong className="text-slate-900">the real skill of the AI age is learning resilience</strong> – the ability to understand, experiment, adapt, and keep going when the rules change.
            </p>
          </FadeIn>
        </section>

        {/* Section 4: Curriculum Pillars */}
        <section className="grid md:grid-cols-12 gap-12 items-center">
          <FadeIn className="md:col-span-5">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
              A curriculum built around how children actually learn
            </h2>
            <p className="text-slate-600 text-lg mb-6">
              Sparvi Lab is a curriculum-driven learning system for ages 6–17. It is not a one-off course, not a workshop, and not a random mix of tools.
            </p>
            <p className="text-slate-600 mb-8">
              This means every lesson is intentionally designed to engage different learning styles, move through a clear cognitive journey (experience → reflect → conceptualize → apply), and connect to real-world problems.
            </p>
          </FadeIn>
          
          <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
            {[
              { icon: Layers, title: "Age-structured", desc: "Designed specifically for different developmental stages from 6 to 17." },
              { icon: Brain, title: "Skills-driven", desc: "Focused on thinking skills first, specific tools second." },
              { icon: TrendingUp, title: "Progressive", desc: "Each level builds on the last, so children grow year after year." },
              { icon: BookOpen, title: "Proven Models", desc: "Grounded in learning models including SAVI, Meier's, and 4MAT." }
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <feature.icon className="w-8 h-8 text-[#071228] mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Section 5: What they do */}
        <section className="bg-[#071228] rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2dd4bf] opacity-10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FBBF24] opacity-10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">From coding to creating: what learners do</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                In Sparvi Lab, students don't just "complete activities". They learn to see technology as a tool they can shape, not something that controls them.
              </p>
              <p className="text-slate-300 italic">
                "They learn to be comfortable with trial and error, to debug both their code and their thinking."
              </p>
            </FadeIn>
            
            <div className="space-y-4">
              {[
                { icon: Zap, text: "Break down problems and design solutions" },
                { icon: Code, text: "Build projects in computational thinking, creative coding, electronics, game design, and early AI concepts" },
                { icon: MessageSquare, text: "Discuss their ideas, present their thinking, and explain why something works" },
                { icon: Wrench, text: "Face open-ended challenges where there is no single correct answer" }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <item.icon className="w-6 h-6 text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-200">{item.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Parents Partnership */}
        <section className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <HeartHandshake className="w-12 h-12 text-[#f97316] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">A partnership with parents</h2>
            <p className="text-xl text-slate-600 mb-10">
              We believe real change happens when school, learning centers, and home are aligned. You're not just "dropping your child off for a class". You are joining a long-term learning journey with them.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {[
              "Helping you understand your child's learning style",
              "Offering practical ways to support focus and curiosity at home",
              "Encouraging healthy tech habits rather than passive screen time",
              "Making progress visible, not just through grades, but through skills and behaviors"
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-slate-700 font-medium text-sm">{item}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Section 7: Vision / Conclusion */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1a3a6b] to-[#071228] text-white py-20 px-8 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <FadeIn className="relative z-10 max-w-3xl mx-auto">
            <Rocket className="w-16 h-16 text-[#FBBF24] mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our vision for the next generation</h2>
            
            <p className="text-xl md:text-2xl font-light text-slate-200 mb-8 leading-relaxed">
              We are not trying to create an army of coders. We are building a generation of innovators and resilient learners who:
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Think clearly when problems are messy", "Stay curious when tools change", "Feel confident experimenting", "Understand AI responsibility"].map((trait, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm md:text-base backdrop-blur-md">
                  {trait}
                </span>
              ))}
            </div>

            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              The future will keep changing. New platforms, new devices, new roles will appear. Our mission at Sparvi Lab is to ensure that when that future arrives, today's children are not afraid of it. They are ready for it.
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-orange-400 to-[#2dd4bf]">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>Ready to understand.</motion.div>
              <div className="hidden md:block w-2 h-2 rounded-full bg-slate-600" />
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>Ready to create.</motion.div>
              <div className="hidden md:block w-2 h-2 rounded-full bg-slate-600" />
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>Ready to lead.</motion.div>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs bg-[#071228]">
        <p className="text-slate-500">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

// Custom minimal icon for the checkmarks to keep imports clean
const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export default OurStory;