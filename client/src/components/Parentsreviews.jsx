import { useState, useEffect, useCallback } from "react";
import { Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
// Expanded testimonials array to demonstrate the sliding capability
const testimonials = [
  {
    name: "Ms. Eman Naguib",
    text: "My daughter has many ideas, and I want her to bring them to life. sparvi is building a solid foundation in this area",
  },
  {
    name: "Ms. Nadine Sami",
    text: "Kids must learn about technology at an early age. Many children today show interest in starting their own businesses",
  },
  {
    name: "Ms. Yusra Elimam",
    text: "This solution presents a great opportunity for children to learn and develop essential skills in a supportive environment",
  },
  {
    name: "Mr. Ahmed Hassan",
    text: "Seeing my son confidently present his project was incredible. The practical skills they learn here are unmatched",
  },
  {
    name: "Ms. Sarah Tariq",
    text: "The instructors are so patient and engaging. My children look forward to these sessions every single week!",
  },
  {
    name: "Dr. Omar Zaki",
    text: "A highly structured program that actually delivers on its promises. I've seen a noticeable improvement in problem-solving",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isHovered, setIsHovered] = useState(false);
  const { t, i18n } = useTranslation();

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1); // Mobile
      else if (window.innerWidth < 1024) setItemsPerView(2); // Tablet
      else setItemsPerView(3); // Desktop
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);
  const safeIndex = Math.min(currentIndex, maxIndex);

  // Auto-play logic
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [maxIndex, isHovered]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Generate initials for avatars
  const getInitials = (name) => {
    const cleanName = name.replace(/(Ms\.|Mr\.|Dr\.)\s/g, "");
    return cleanName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <section id="parents-reviews" className="py-8 sm:py-8 bg-slate-50/50">
      <div
        className="
          relative min-h-[640px] md:min-h-[760px] lg:min-h-[820px]
          flex flex-col items-center justify-center
          rounded-[40px] overflow-hidden
          bg-gradient-to-br from-blue-600 to-indigo-900
          w-full
          shadow-2xl shadow-indigo-900/30
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative Background Image Overlay */}
        <div
          className="
            pointer-events-none absolute inset-0
            bg-[url('https://res.cloudinary.com/dipzvlfnt/image/upload/v1772879885/testimonialbg_zqwuom.webp')]
            bg-center bg-cover
            mix-blend-overlay
            
          "
        />

        {/* Dynamic Glow Effect */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Content Wrapper */}
        <div className="relative w-full px-4 sm:px-10 lg:px-14 py-12">

          {/* Section Heading */}
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {t("landing.reviews.title1")} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                {t("landing.reviews.title2")}
              </span>
            </h2>
          </div>

          {/* Slider Container */}
          <div className="relative group/slider">

            {/* Sliding Track Wrapper */}
            <div className="overflow-hidden px-2 py-4 -mx-2">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: `translateX(${document.documentElement.dir === "rtl" ? "" : "-"}${safeIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 px-3 sm:px-4"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <article
                      className="
    group
    bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]
    border border-white/60
    p-6 sm:p-8
    flex flex-col h-[220px]
    transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white
    relative overflow-hidden
  "
                    >
                      {/* Quote top-right */}
                      <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100" />

                      {/* Name */}
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {t.name}
                      </h3>

                      {/* Text */}
                      <p className="mt-4 text-slate-600 text-sm sm:text-[15px] leading-relaxed line-clamp-3">
                        {t.text}
                      </p>

                      {/* Stars bottom-right */}
                      <div className="mt-auto flex justify-end pt-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows (Hidden on mobile, appear on hover for larger screens) */}
            {/* <button
              onClick={handlePrev}
              className={`
                absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-6
                w-12 h-12 rounded-full bg-white/90 shadow-lg border border-slate-200
                flex items-center justify-center text-blue-600
                transition-all duration-300 hover:scale-110 hover:bg-white z-20
                ${safeIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}
              `}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 mr-0.5" />
            </button>
            
            <button
              onClick={handleNext}
              className={`
                absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-6
                w-12 h-12 rounded-full bg-white/90 shadow-lg border border-slate-200
                flex items-center justify-center text-blue-600
                transition-all duration-300 hover:scale-110 hover:bg-white z-20
                ${safeIndex >= maxIndex ? "opacity-0 pointer-events-none" : "opacity-100"}
              `}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 ml-0.5" />
            </button> */}
          </div>

          {/* Interactive Pagination Dots */}
          <div className="mt-12 flex justify-center items-center gap-2.5">
            {[...Array(maxIndex + 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`
                  p-0 m-0 border-none min-h-0 min-w-0
                  h-2 rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-indigo-900
                  ${safeIndex === i ? "w-10 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "w-2.5 bg-white/30 hover:bg-white/60"}
                `}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
