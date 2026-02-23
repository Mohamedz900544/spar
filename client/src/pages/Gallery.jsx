import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Camera, ImageIcon, Sparkles } from "lucide-react";

// Later you can replace this with data from your backend / admin
const galleryItems = [
  {
    id: 1,
    title: "Energy & Motors Session",
    caption: "Kids testing mini fans and motors.",
    imageUrl: "/gallery/sample-1.jpg",
  },
  {
    id: 2,
    title: "Light Maze Activity",
    caption: "Designing simple light circuits together.",
    imageUrl: "/gallery/sample-2.jpg",
  },
  {
    id: 3,
    title: "First Circuit Built",
    caption: "Proud faces after lighting their first LED.",
    imageUrl: "/gallery/sample-3.jpg",
  },
  {
    id: 4,
    title: "Holiday Camp Group",
    caption: "Team photo after our final demo day.",
    imageUrl: "/gallery/sample-4.jpg",
  },
  {
    id: 5,
    title: "Breadboard Practice",
    caption: "Learning how to plug wires safely.",
    imageUrl: "/gallery/sample-5.jpg",
  },
  {
    id: 6,
    title: "Parent Showcase",
    caption: "Sharing projects with families at the end.",
    imageUrl: "/gallery/sample-6.jpg",
  },
];

/* ======= Floating Shape ======= */
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Gallery = () => {
  const hasItems = galleryItems && galleryItems.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8fafc] to-white">
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
          <FloatingShape className="absolute top-[20%] left-[10%] w-3 h-3 rounded-full bg-[#FBBF24]/30" delay={0} />
          <FloatingShape className="absolute top-[50%] right-[15%] w-2 h-2 rounded-full bg-[#2dd4bf]/40" delay={1.5} />
          <FloatingShape className="absolute bottom-[30%] left-[65%] w-2.5 h-2.5 rounded-full bg-[#FBBF24]/20" delay={2.5} />
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#2dd4bf]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-28 pb-16 md:pt-32 md:pb-20 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm border border-white/10">
              <Camera className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                Sparvi Lab Moments
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 font-display">
              Our <span className="text-[#FBBF24]">Gallery</span>
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base">
              A peek into our on-site electronics sessions. Real kids, real
              components, and lots of "I did it!" moments.
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

      {/* ===== Gallery Grid ===== */}
      <main className="flex-1 px-4 pb-16 -mt-2">
        <div className="max-w-6xl mx-auto">
          {hasItems ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.06,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071228]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Title overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-semibold text-sm drop-shadow">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-1.5">
                    <h3 className="text-sm md:text-base font-semibold text-[#102a5a]">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500">
                      {item.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-12 md:p-16 text-center max-w-2xl mx-auto shadow-[0_20px_60px_rgba(16,42,90,0.06)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mx-auto mb-5">
                <ImageIcon className="w-7 h-7 text-[#FBBF24]" />
              </div>
              <h2 className="text-xl font-bold text-[#102a5a] mb-2 font-display">
                No photos yet
              </h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Once pictures are uploaded from your Sparvi Lab sessions
                through the admin panel, they'll appear here for everyone to explore.
              </p>
            </motion.div>
          )}

          {/* Fun stats strip */}
          {hasItems && (
            <motion.div
              className="mt-14 bg-gradient-to-r from-[#102a5a] to-[#1a3a6b] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-around gap-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { emoji: "🔧", label: "Projects Built", value: "200+" },
                { emoji: "🧒", label: "Happy Students", value: "150+" },
                { emoji: "⚡", label: "Sessions Held", value: "50+" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{stat.emoji}</span>
                  <span className="text-2xl font-extrabold text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
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

export default Gallery;
