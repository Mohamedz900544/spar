import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import CurriculumSection from "../components/CurriculumSection";

/* -------------------------------------------------------
   FLOATING SHAPE COMPONENT
--------------------------------------------------------*/
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <Motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* -------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------*/
export default function Courses() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = "Courses — Sparvi Lab | STEM Programs for Ages 6–17";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white font-sans">
      <Navbar />

      {/* ===== Hero Banner ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        {/* Floating shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingShape
            className="absolute top-[18%] left-[12%] w-3 h-3 rounded-full bg-[#FBBF24]/30"
            delay={0}
          />
          <FloatingShape
            className="absolute top-[45%] right-[18%] w-2 h-2 rounded-full bg-[#2dd4bf]/40"
            delay={1.2}
          />
          <FloatingShape
            className="absolute bottom-[25%] left-[55%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20"
            delay={2}
          />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-32 pb-16 md:pt-40 md:pb-24 text-center">
          <Motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight text-center">
              {t("courses.hero_title1")} <span className="text-[#FBBF24]">{t("courses.hero_title2")}</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base text-center">
              {t("courses.hero_subtitle")}
            </p>
          </Motion.div>
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
      <main className="flex-1 px-4 pb-16 pt-8 md:pt-12">
        <CurriculumSection />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs bg-[#071228]">
        <p className="text-slate-500">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}