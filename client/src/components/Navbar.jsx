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

  const logoScrolled = "/logo.png";
  const logoTransparent = "/logo-white.png";

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  /* ================= SCROLL DETECTION ================= */
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  /* ================= CORE FIX ================= */
  const forceWhiteNavbar = open && scrolled;
  const effectiveScrolled = !isLanding || scrolled || forceWhiteNavbar;

  /* ================= STYLES ================= */
  const linkBase =
    "whitespace-nowrap text-sm md:text-base font-medium transition-colors duration-300";

  const linkInactive = effectiveScrolled
    ? "text-[#333333] hover:text-[#FBBF24]"
    : "text-white/90 hover:text-white";

  const linkActive = effectiveScrolled ? "text-[#FBBF24]" : "text-white";

  const mobileLinkBase =
    "block w-full py-4 text-[16px] font-semibold transition-colors duration-300";
  const mobileInactive = "text-[#333333] hover:text-[#FBBF24]";
  const mobileActive = "text-[#FBBF24]";

  return (
    <header
      className={[
        "fixed top-0 left-0 w-full z-40",
        "transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        effectiveScrolled
          ? "bg-white shadow-md"
          : "bg-transparent shadow-none",
      ].join(" ")}
    >
      {/* ================= NAV BAR ================= */}
      <div
        className={[
          "max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between",
          "transition-all duration-500",
          effectiveScrolled ? "h-14 md:h-16" : "h-16 md:h-20",
        ].join(" ")}
      >
        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <img
            src={
              isLanding && !effectiveScrolled
                ? logoTransparent
                : logoScrolled
            }
            alt="Logo"
            className={[
              "transition-all duration-300 object-contain",
              effectiveScrolled ? "h-8 md:h-10" : "h-9 md:h-11",
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
            <button className="rounded-full bg-[#FBBF24] hover:bg-[#f59e0b] text-[#333333] font-semibold px-5 py-2 shadow">
              Sign Up
            </button>
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className={[
            "md:hidden p-2 rounded-md transition",
            effectiveScrolled
              ? "text-[#333333]"
              : "text-white",
          ].join(" ")}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
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
          <div className="flex justify-end p-4">
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 border rounded-md"
            >
              <X size={22} />
            </button>
          </div>

          <div className="px-6">
            <nav className="divide-y">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${mobileLinkBase} ${
                      isActive ? mobileActive : mobileInactive
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
              <button className="mt-8 w-full rounded-xl bg-[#FBBF24] text-[#333333] font-bold py-4">
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
