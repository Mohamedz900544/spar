import Navbar from "../components/Navbar";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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

const Gallery = () => {
  const hasItems = galleryItems && galleryItems.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] via-[#e8efff] to-white">
      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pt-20 pb-16 md:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-10 md:mb-14"
          >
            <p className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-[#FBBF24] mb-2">
              Sparvi Lab Moments
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#102a5a] mb-3 font-display">
              Gallery
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              A peek into our on-site electronics sessions. Real kids, real
              components and lots of "I did it!" moments from past courses and
              camps.
            </p>
          </motion.div>

          {/* Gallery grid */}
          {hasItems ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            >
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.12 + index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 md:p-5 flex flex-col gap-1">
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
              className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 md:p-14 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-[#102a5a] mb-2 font-display">
                No photos yet
              </h2>
              <p className="text-sm md:text-base text-slate-500">
                Once you upload pictures from your previous Sparvi Lab courses
                through the admin interface, they will appear here for parents
                to explore.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs bg-[#040b18]">
        <p className="text-slate-500">© {new Date().getFullYear()} Sparvi Lab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Gallery;
