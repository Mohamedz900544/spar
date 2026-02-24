import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  const logoScrolled = "/logo.png";
  const logoTransparent = "/logo-white.png";

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  /* ================= SCROLL DETECTION — ALL PAGES ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLanding) return;
    const section = document.getElementById("parents-reviews");
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldHide = entry.isIntersecting;
        setHideNavbar(shouldHide);
        if (shouldHide) setOpen(false);
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isLanding]);

  const shouldHideNavbar = isLanding ? hideNavbar : false;

  /* ================= CORE STYLE LOGIC ================= */
  const forceWhiteNavbar = open && scrolled;
  const effectiveScrolled = scrolled || forceWhiteNavbar;

  /* ================= STYLES ================= */
  const linkBase =
    "whitespace-nowrap text-sm font-medium transition-colors duration-300 relative";

  const linkInactive = effectiveScrolled
    ? "text-[#102a5a] hover:text-[#FBBF24]"
    : "text-white/90 hover:text-white";

  const linkActive = effectiveScrolled
    ? "text-[#FBBF24]"
    : "text-white font-semibold";

  const mobileLinkBase =
    "block w-full py-4 text-[15px] font-semibold transition-colors duration-300";
  const mobileInactive = "text-[#102a5a] hover:text-[#FBBF24]";
  const mobileActive = "text-[#FBBF24]";

  return (
    <header
      className={[
        "fixed top-0 left-0 w-full z-40",
        "transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        shouldHideNavbar
          ? "opacity-0 -translate-y-full pointer-events-none"
          : "opacity-100 translate-y-0",
        effectiveScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
          : "bg-transparent shadow-none",
      ].join(" ")}
    >
      {/* ================= NAV BAR ================= */}
      <div
        className={[
          "max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between",
          "transition-all duration-500",
          effectiveScrolled ? "h-14 md:h-16" : "h-16 md:h-20",
        ].join(" ")}
      >
        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <img
            src={effectiveScrolled ? logoScrolled : logoTransparent}
            alt="Sparvi Lab"
            className={[
              "transition-all duration-300 object-contain",
              effectiveScrolled ? "h-8 md:h-10" : "h-9 md:h-12",
            ].join(" ")}
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Login
          </NavLink>

          <Link to="/signup">
            <button className="rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-sm">
              Sign Up
            </button>
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className={[
            "md:hidden p-2 rounded-md transition",
            effectiveScrolled ? "text-[#102a5a]" : "text-white",
          ].join(" ")}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* OVERLAY */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#071228]/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* PANEL */}
        <aside
          className={[
            "absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl",
            "transform transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between p-5">
            <img src={logoScrolled} alt="Sparvi Lab" className="h-8" />
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-[#102a5a] hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6">
            <nav className="divide-y divide-slate-100">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${mobileLinkBase} ${isActive ? mobileActive : mobileInactive
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className={mobileLinkBase + " " + mobileInactive}
              >
                Login
              </NavLink>
            </nav>

            <Link to="/signup" onClick={() => setOpen(false)}>
              <button className="mt-8 w-full rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold py-3.5 shadow-md transition-all duration-200">
                Sign Up
              </button>
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;
