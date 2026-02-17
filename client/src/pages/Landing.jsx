import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
      {/* Top navigation */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="w-full bg-gradient-to-br from-[#0754a7] via-[#0b63c7] to-[#0ea5e9] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Text */}
          <Motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              <span className="block">
                Discover, Play,&nbsp;Learn
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f97316] to-[#fb7185]">
                Real Electronics and Programming for Kids
              </span>
            </h1>

            <p className="max-w-xl mx-auto md:mx-0 text-base md:text-lg text-slate-100 mb-6">
              Sparvi Lab runs in-person electronics , robotics and programming sessions where kids aged 7-12
              build real projects using hardware, code, and creative ideas, guided by a friendly mentor every step of the way.
            </p>  

            {/* Button + tagline row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
              <Link to="/signup">
                <button className="inline-flex items-center justify-center rounded-full px-10 py-3 text-base md:text-lg font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] bg-[#fbbf24] hover:bg-[#f59e0b] text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                  Join Sparvi Lab
                </button>
              </Link>

              <p className="text-xs md:text-sm text-sky-100 sm:ml-4 sm:mt-0 mt-1 max-w-xs sm:text-left text-center">
                On-site sessions • Hands-on projects • Designed for young makers
              </p>
            </div>
          </Motion.div>

          {/* Right: Robot Image */}
          <Motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="flex justify-center"
          >
            <img
              src="/Robot.png"
              alt="Sparvi Lab Robot"
              className="w-full max-w-md drop-shadow-xl"
            />
          </Motion.div>
        </div>
      </section>

      {/* SECTION 1 – Text left, image right */}
      <Motion.section
        className="py-20 px-6 bg-white"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24] mb-2">
              Curriculum
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-[#0b63c7]">
              Progressive lesson plans for on-site workshops
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-3">
              Our program runs only in person – as weekly clubs, short courses
              or holiday camps. Each session builds on the last, starting from
              “What is electricity?” and growing into real mini-projects kids
              can demo at the end of class.
            </p>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Lessons are written for children aged 6–8, with simple language,
              clear visuals and plenty of time for trying, failing and trying
              again inside the lab.
            </p>

            <ul className="text-sm text-slate-700 space-y-2">
              <li>• Story-based intros that make concepts memorable.</li>
              <li>• Instructor-led demos followed by guided practice.</li>
              <li>• End-of-session share time so kids show what they built.</li>
            </ul>

            <div className="mt-8">
              <Link to="/courses">
                <button className="rounded-full bg-[#fbbf24] hover:bg-[#f59e0b] text-slate-900 text-sm font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5">
                  Learn more about our sessions
                </button>
              </Link>
            </div>
          </div>

          {/* Image (replace src with your illustration) */}
          <div className="flex justify-center">
            <img
              src="/sparvi-curriculum.png"
              alt="Sparvi Lab in-person class"
              className="w-full max-w-xl"
            />
          </div>
        </div>
      </Motion.section>

      {/* SECTION 2 – Image left, text right */}
      <Motion.section
        className="py-20 px-6 bg-[#fff9f0]"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="order-1 md:order-none flex justify-center">
            <img
              src="/sparvi-kits.png"
              alt="Electronics tables and tools"
              className="w-full max-w-xl"
            />
          </div>

          {/* Text */}
          <div className="order-2 md:order-none">
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24] mb-2">
              Lab Stations
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-[#0b63c7]">
              Real tools and components set up at every table
            </h2>
            <p className="text-sm md:text-base text-slate-700 mb-3">
              Kids don&apos;t work through a screen – they move, share and build
              around real lab tables. Each station has motors, batteries, LEDs,
              switches and alligator clips ready to plug in and test.
            </p>
            <p className="text-sm md:text-base text-slate-700 mb-6">
              Projects like “Build a mini fan” or “Create a light maze” happen
              right there in the classroom, with a Sparvi Lab instructor helping
              them troubleshoot in person.
            </p>

            <ul className="text-sm text-slate-700 space-y-2">
              <li>• Small groups so every child gets a turn with the parts.</li>
              <li>• Safe, classroom-ready components chosen for young hands.</li>
              <li>• Extra challenge cards for kids who finish early.</li>
            </ul>
          </div>
        </div>
      </Motion.section>

      {/* SECTION 3 – Text left, image right (parents focus) */}
      <Motion.section
        className="py-20 px-6 bg-white"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24] mb-2">
              For Parents
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-[#0b63c7]">
              In-person sessions that replace extra screen time
            </h2>
            <p className="text-sm md:text-base text-slate-700 mb-3">
              Sparvi Lab is a place you bring your child to – not an app you
              install. Sessions run on a fixed schedule so families can plan
              around school and activities.
            </p>
            <p className="text-sm md:text-base text-slate-700 mb-6">
              Our team handles the setup, safety and teaching. You can stay and
              watch, join in, or use the time for a quiet coffee nearby while
              your child learns and builds with friends.
            </p>

            <ul className="text-sm text-slate-700 space-y-2 mb-6">
              <li>• No devices required for kids during the session.</li>
              <li>• Clear communication about what they built each week.</li>
              <li>• End-of-term showcase where families see all projects.</li>
            </ul>

            <Link to="/signup">
              <button className="rounded-full bg-[#0b63c7] hover:bg-[#0754a7] text-white text-sm font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5">
                View upcoming sessions
              </button>
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src="/sparvi-family.png"
              alt="Parent and child at Sparvi Lab"
              className="w-full max-w-xl"
            />
          </div>
        </div>
      </Motion.section>

      {/* CTA BANNER */}
      <Motion.section
        className="py-10 px-6 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c]"
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center text-slate-900">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Book a Sparvi Lab session for your child
          </h2>
          <p className="text-sm md:text-base mb-5 text-slate-800/90">
            Reserve a spot in our next on-site group and let your child discover
            how real electronics work – with guidance, friends and lots of
            excitement.
          </p>

          <Link to="/signup">
            <button className="bg-white text-slate-900 font-semibold px-7 py-3 rounded-full shadow-md hover:shadow-xl hover:bg-slate-100 transition-transform duration-200 hover:-translate-y-0.5">
              Sign up for a session
            </button>
          </Link>
        </div>
      </Motion.section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs md:text-sm text-slate-500 bg-[#edf2fb] mt-auto border-t border-[#dbe2ff]">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
