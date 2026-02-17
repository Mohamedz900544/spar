import Navbar from "../components/Navbar";

// Later you can replace this with data from your backend / admin
const galleryItems = [
  {
    id: 1,
    title: "Energy & Motors Session",
    caption: "Kids testing mini fans and motors.",
    imageUrl: "/gallery/sample-1.jpg", // replace with real path from admin
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff]">
      {/* Solid white navbar wrapper */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pt-20 pb-16 md:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-10 md:mb-14"
          >
            <p className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24] mb-2">
              Sparvi Lab Moments
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#0b63c7] mb-3">
              Gallery
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              A peek into our on-site electronics sessions. Real kids, real
              components and lots of “I did it!” moments from past courses and
              camps.
            </p>
          </motion.div>

          {/* Gallery grid */}
          {hasItems ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            >
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="group bg-white/90 rounded-2xl shadow-[0_10px_30px_rgba(15,118,210,0.12)] border border-[#dbeafe] overflow-hidden flex flex-col"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
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
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 md:p-5 flex flex-col gap-1">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">
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
            // Empty state – will show if array is empty (before you add photos)
            <motion.div
              className="bg-white/80 border border-dashed border-[#cbd5f5] rounded-3xl p-10 md:p-14 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-[#0b63c7] mb-2">
                No photos yet
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                Once you upload pictures from your previous Sparvi Lab courses
                through the admin interface, they will appear here for parents
                to explore.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs md:text-sm text-slate-500 bg-white border-t border-[#e2e8f0]">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default Gallery;
