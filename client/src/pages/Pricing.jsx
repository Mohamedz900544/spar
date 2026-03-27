import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import PricingSection from "../components/PricingSection";

const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Pricing = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Pricing — Sparvi Lab | Plans & Packages";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
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
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 font-display text-center">
              {t("landing.pricing.title")}
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base mb-8 text-center">
              {t("landing.pricing.subtitle")}
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

      {/* ===== Pricing Cards ===== */}
      <PricingSection />
    </div>
  );
};

export default Pricing;
