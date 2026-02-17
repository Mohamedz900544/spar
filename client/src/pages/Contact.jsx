import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, PhoneCall } from "lucide-react";
import Navbar from "../components/Navbar";

/* ========= API BASE ========= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Contact = () => {
  const [formState, setFormState] = useState({
    parentName: "",
    phone: "",
    childAge: "",
    message: "",
  });
  const MotionContainer = motion.div;
  const MotionButton = motion.button;

  const inputClass =
    "w-full rounded-xl border border-[#c7d2fe] px-3 py-2.5 text-sm " +
    "bg-[#f9fbff] text-slate-800 outline-none " +
    "focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] " +
    "transition-shadow shadow-sm placeholder:text-slate-400";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------------------------------
     SUBMIT CONTACT FORM → BACKEND
  -------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        return;
      }

      alert("Message sent successfully");

      setFormState({
        parentName: "",
        phone: "",
        childAge: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact submit error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff]">
      {/* Navbar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 pt-20 pb-16 md:pt-24 overflow-hidden">
        <MotionContainer
          className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-start"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Left info */}
          <MotionContainer
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24]">
              Contact Us
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b63c7] leading-tight">
              Get in touch with
              <br />
              <span className="text-slate-900">Sparvi Lab</span>
            </h1>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#eff6ff] p-2">
                  <Mail className="w-5 h-5 text-[#0b63c7]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-800">
                    hello@sparvilab.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#eff6ff] p-2">
                  <PhoneCall className="w-5 h-5 text-[#0b63c7]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone / WhatsApp</p>
                  <p className="text-sm font-medium text-slate-800">
                    +201500077369
                  </p>
                </div>
              </div>
            </div>
          </MotionContainer>

          {/* Form */}
          <MotionContainer
            className="bg-white/90 p-8 rounded-3xl shadow-lg border border-[#dbeafe] max-w-md w-full mx-auto"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <h2 className="text-xl font-bold mb-2 text-[#0b63c7] text-center">
              Send us a message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="parentName"
                value={formState.parentName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Parent name"
                required
              />

              <input
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="Phone / WhatsApp"
                required
              />

              <input
                type="number"
                name="childAge"
                value={formState.childAge}
                onChange={handleChange}
                className={inputClass}
                placeholder="Child age (optional)"
              />

              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                className={`${inputClass} min-h-[110px] resize-none`}
                placeholder="Your message"
                required
              />

              <MotionButton
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c] text-slate-900 text-sm font-semibold px-4 py-2.5"
                whileTap={{ scale: 0.97 }}
              >
                Send Message
              </MotionButton>
            </form>
          </MotionContainer>
        </MotionContainer>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 bg-white border-t">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default Contact;
