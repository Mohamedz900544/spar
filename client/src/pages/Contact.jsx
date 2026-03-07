import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  PhoneCall,
  Send,
  MapPin,
  Clock,
  MessageCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import EgyptPhoneInput from "../components/EgyptPhoneInput";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isValidEgyptPhone = (v) => {
  const d = (v || "").replace(/\D/g, "");
  return /^(010|011|012|015)\d{8}$/.test(d);
};

const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@sparvilab.com",
    accent: "#FBBF24",
  },
  {
    icon: PhoneCall,
    label: "Phone / WhatsApp",
    value: "+201500077369",
    accent: "#2dd4bf",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Cairo, Egypt",
    accent: "#a78bfa",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Sat – Thu, 10AM – 6PM",
    accent: "#fb923c",
  },
];

const Contact = () => {
  useEffect(() => {
    document.title = "Contact Sparvi Lab — Reach Us by Phone, WhatsApp, or Email";
  }, []);
  const [formState, setFormState] = useState({
    parentName: "",
    phone: "",
    childAge: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (formatted) => {
    setFormState((prev) => ({ ...prev, phone: formatted }));
    if (formatted && !isValidEgyptPhone(formatted)) {
      setPhoneError("Enter a valid Egyptian mobile (010 / 011 / 012 / 015)");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formState.phone && !isValidEgyptPhone(formState.phone)) {
      setPhoneError("Enter a valid Egyptian mobile (010 / 011 / 012 / 015)");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: formState.parentName,
          phone: formState.phone,
          childAge: formState.childAge || null,
          message: formState.message,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Contact submit error:", text);
        alert("Failed to send message");
        setSending(false);
        return;
      }
      setSent(true);
      setFormState({ parentName: "", phone: "", childAge: "", message: "" });
    } catch (err) {
      console.error("Contact submit error:", err);
      alert("Server error");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white overflow-x-hidden">
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
              Get in <span className="text-[#FBBF24]">Touch</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base">
              Have a question about our sessions, want to enroll, or just want to
              say hi? We're here to help!
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-5 -mt-2 md:-mt-4 pb-16 relative z-10">
        <div className="grid lg:grid-cols-5 gap-6 md:gap-8 items-start">
          {/* Contact Info Cards — left */}
          <motion.div
            className="lg:col-span-2 space-y-4 order-2 lg:order-none"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-[#102a5a] mb-2 text-center lg:text-left">
              Contact info
            </h2>
            {contactMethods.map((m, i) => (
              <motion.div
                key={i}
                className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${m.accent}15` }}
                  >
                    <m.icon
                      className="w-5 h-5"
                      style={{ color: m.accent }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      {m.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {m.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Small brand callout */}
            <div className="bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] rounded-2xl p-5 text-center mt-4">
              <div className="w-10 h-10 rounded-xl bg-[#FBBF24] flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-[#102a5a]" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">
                Kids Building the Future
              </h3>
              <p className="text-slate-400 text-xs">
                STEM • Electronics • Robotics
              </p>
            </div>
          </motion.div>

          {/* Form Card — right */}
          <motion.div
            className="lg:col-span-3 order-1 lg:order-none min-w-0 w-full"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.06)] border border-white/60 p-6 sm:p-8 md:p-10 w-full">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-[#102a5a] font-display">
                  Send us a message
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Fill in the form and we'll get back to you within 24 hours.
                </p>
              </div>

              {sent ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Message sent!</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    We'll get back to you soon. Thank you for reaching out!
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-[#102a5a] font-semibold hover:text-[#FBBF24] transition-colors"
                  >
                    Send another message →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
                  
                  {/* Flattened structure here so everything scales uniformly */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Parent name
                    </label>
                    <input
                      name="parentName"
                      value={formState.parentName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone / WhatsApp
                    </label>
                    <EgyptPhoneInput
                      value={formState.phone}
                      onChange={handlePhoneChange}
                      error={phoneError}
                      name="phone"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Child age <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      name="childAge"
                      value={formState.childAge}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      className={`${inputClass} min-h-[130px] resize-none`}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold py-3.5 shadow-[0_8px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -2 }}
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-[#102a5a]/30 border-t-[#102a5a] rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
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

export default Contact;