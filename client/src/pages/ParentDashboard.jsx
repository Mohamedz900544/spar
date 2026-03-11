import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CalendarClock,
  KeyRound,
  Star,
  Image as ImageIcon,
  ChevronDown,
  CheckCircle2,
  Camera,
  Sparkles,
  LogOut,
  Zap,
  ArrowRight,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ====== RATING STARS ====== */
const RatingStars = ({ value, onChange, disabled }) => (
  <div className="flex items-center -space-x-1 max-w-full">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => {
          if (!disabled) onChange(star);
        }}
        disabled={disabled}
        className={`focus:outline-none transform transition-all duration-200 p-1 hover:scale-110 active:scale-90 flex-shrink-0 ${disabled ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100" : ""}`}
      >
        <Star
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-all duration-300 ${value && star <= value
            ? "fill-[#FBBF24] text-[#FBBF24] drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]"
            : "fill-slate-200 text-slate-300 hover:text-[#FBBF24]/60"
            }`}
        />
      </button>
    ))}
  </div>
);

const getSessionDateTime = (session) => {
  if (!session?.date) return null;
  const time = session?.time ? session.time : "00:00";
  const dateTime = new Date(`${session.date}T${time}`);
  if (Number.isNaN(dateTime.getTime())) return null;
  return dateTime;
};

const getUpcomingSessionId = (sessions, now) => {
  if (!sessions?.length) return null;
  const upcoming = sessions
    .map((session) => {
      const dateTime = getSessionDateTime(session);
      if (!dateTime) return null;
      if (session.status === "Completed") return null;
      return { id: session.id || session._id, time: dateTime.getTime() };
    })
    .filter(Boolean)
    .filter((s) => s.time >= now.getTime())
    .sort((a, b) => a.time - b.time);
  return upcoming[0]?.id || null;
};

const getCountdownLabel = (diffMs) => {
  if (diffMs <= 0) return "Active";
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  if (diffMs <= 30 * minute) return "in 30 minutes";
  if (diffMs <= hour) return "in 1 hour";
  if (diffMs <= day) return "in 1 day";
  if (diffMs <= week) return "in 1 week";
  return "in 1 week";
};

const formatCountdown = (diffMs) => {
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (!days && minutes) parts.push(`${minutes}m`);
  return parts.join(" ");
};

/* ====== STAT CARD ====== */
const StatCard = ({ icon: Icon, label, value, accent, subtext }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {typeof value === "string" || typeof value === "number" ? (
          <p className="text-2xl font-bold text-[#102a5a] mt-0.5">{value}</p>
        ) : (
          <p className="text-sm font-medium text-[#102a5a] mt-1">{subtext}</p>
        )}
      </div>
    </div>
  </div>
);

/* ================= PARENT DASHBOARD ================= */
const ParentDashboard = ({ parent, setParent }) => {
  const navigate = useNavigate();

  const [rounds, setRounds] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [roundCodeInput, setRoundCodeInput] = useState("");
  const [linkedRounds, setLinkedRounds] = useState([]);
  const [selectedRoundCode, setSelectedRoundCode] = useState(null);
  const [linkErrorMessage, setLinkErrorMessage] = useState("");

  const [sessionRatings, setSessionRatings] = useState({});
  const [sessionFeedback, setSessionFeedback] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});
  const [now, setNow] = useState(() => new Date());

  const [selectedChildId, setSelectedChildId] = useState("");
  const [isEnrollingChild, setIsEnrollingChild] = useState(false);

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("sparvi_token")
      : null;
  const getRole = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("sparvi_role")
      : null;

  const hasCompletedProfile = (user) => {
    const firstChild = user?.children?.[0];
    return Boolean(firstChild?.name?.trim()) && Number(firstChild?.age) > 0;
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token || role !== "parent") { navigate("/login"); return; }

    const controller = new AbortController();
    const enrichRoundsWithAllPhotos = (apiData) => {
      const { rounds, enrollments, studentPhotos } = apiData;
      return rounds.map((round) => {
        const related = enrollments.filter((e) => e.roundCode === round.code);
        const photos = related.flatMap((e) => studentPhotos[e.id] || []);
        return { ...round, enrollments: related, photos };
      });
    };

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setGlobalError("");
        const res = await fetch(`${API_BASE_URL}/api/parent/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.status === 401) {
          localStorage.removeItem("sparvi_token");
          localStorage.removeItem("sparvi_role");
          localStorage.removeItem("sparvi_user");
          navigate("/login");
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load dashboard");
        if (!hasCompletedProfile(json.parent)) { navigate("/parent/profile"); return; }
        setParent(json.parent);
        setEnrollments(json.enrollments || []);
        setRounds(enrichRoundsWithAllPhotos(json));
        setLinkedRounds((json.rounds || []).map((r) => r.code));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setGlobalError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    return () => controller.abort();
  }, [navigate, setParent]);

  const handleLinkRound = async (e) => {
    e.preventDefault();
    const code = roundCodeInput.trim().toUpperCase();
    if (!code) { setLinkErrorMessage("Please enter a round code."); return; }
    if (!selectedChildId) { setLinkErrorMessage("Please select a child to enroll."); return; }
    const token = getToken();
    const role = getRole();
    if (!token || role !== "parent") { navigate("/login"); return; }
    try {
      setLinkErrorMessage("");
      setIsEnrollingChild(true);
      const res = await fetch(`${API_BASE_URL}/api/parent/link-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, childId: selectedChildId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Round code not found or not allowed.");
      if (json.round) {
        setRounds((prev) => prev.some((r) => r.code === json.round.code) ? prev : [...prev, json.round]);
        setLinkedRounds((prev) => prev.includes(json.round.code) ? prev : [...prev, json.round.code]);
        setSelectedRoundCode(json.round.code);
      }
      if (Array.isArray(json.enrollments)) setEnrollments(json.enrollments);
      toast.success("Child enrolled successfully");
      setRoundCodeInput("");
    } catch (err) {
      setLinkErrorMessage(err.message || "Could not link this round.");
    } finally {
      setIsEnrollingChild(false);
    }
  };

  const visibleRounds = useMemo(
    () => linkedRounds.map((code) => rounds.find((r) => r.code === code)).filter(Boolean),
    [linkedRounds, rounds]
  );
  const getChildrenForRound = (roundCode) => enrollments.filter((e) => e.roundCode === roundCode);

  const handleSessionRatingChange = (roundCode, sessionId, rating) => {
    setSessionRatings((prev) => ({ ...prev, [`${roundCode}-${sessionId}`]: rating }));
    setRatingSubmitted((prev) => { const copy = { ...prev }; delete copy[`${roundCode}-${sessionId}`]; return copy; });
  };
  const handleSessionFeedbackChange = (roundCode, sessionId, text) => {
    setSessionFeedback((prev) => ({ ...prev, [`${roundCode}-${sessionId}`]: text }));
  };

  const handleSubmitRating = async (roundCode, session) => {
    const sessionId = session.id || session._id;
    const key = `${roundCode}-${sessionId}`;
    const rating = sessionRatings[key];
    const feedback = sessionFeedback[key] || "";
    if (!rating) return;
    const token = getToken();
    if (!token || getRole() !== "parent") { navigate("/login"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/parent/rate-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roundCode, sessionId, rating, feedback }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not save rating");
      setRatingSubmitted((prev) => ({ ...prev, [key]: true }));
      toast.success("Feedback submitted successfully!");
    } catch {
      toast.error("Failed to submit feedback.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sparvi_token");
    localStorage.removeItem("sparvi_role");
    localStorage.removeItem("sparvi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col font-sans">
      {/* ===== Top Banner ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        {/* Floating shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Motion.div
            className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-[#FBBF24]/30"
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <Motion.div
            className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-[#2dd4bf]/40"
            animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 6, delay: 1, repeat: Infinity }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-[#2dd4bf]/5 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-8 pb-20">
          {/* Top bar */}
          {/* <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FBBF24] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#102a5a]" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Sparvi Lab
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div> */}

          {/* Welcome text */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Welcome back
              {parent?.name ? <>, <span className="text-[#FBBF24]">{parent.name.split(" ")[0]}</span></> : ""}
              <span className="text-[#FBBF24]">!</span>
            </h1>
            <p className="text-slate-300 text-base max-w-lg">
              Track sessions, browse project photos, and share feedback — all
              in one place.
            </p>
          </Motion.div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 -mt-10 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Global Error */}
          {globalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-5 py-3.5 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{globalError}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-16 text-center shadow-lg flex flex-col items-center">
              <div className="w-10 h-10 border-3 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-500">
                Loading your dashboard…
              </p>
            </div>
          )}

          {/* Stats + Enrollment Row */}
          {!loading && (
            <Motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {/* Stats */}
              <StatCard
                icon={CalendarClock}
                label="Linked Rounds"
                value={linkedRounds.length}
                accent="#102a5a"
              />
              <StatCard
                icon={Users}
                label="Active Children"
                value={
                  visibleRounds.length
                    ? enrollments.filter((e) => linkedRounds.includes(e.roundCode)).length
                    : 0
                }
                accent="#10b981"
              />
              <StatCard
                icon={ImageIcon}
                label="Media Gallery"
                accent="#FBBF24"
                subtext="In-person session photos"
              />
            </Motion.div>
          )}

          {/* Enrollment Card */}
          {!loading && (
            <Motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(16,42,90,0.06)] p-7 md:p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-5 h-5 text-[#FBBF24]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#102a5a]">
                    Enroll a Child
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter the round code from the lab
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleLinkRound}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-10 py-3.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                  >
                    <option value="" disabled>
                      Select child…
                    </option>
                    {parent?.children?.map((child, i) => (
                      <option
                        key={child._id || child.id || i}
                        value={child._id || child.id}
                      >
                        {child.name || child.childName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                <div className="relative flex-1">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={roundCodeInput}
                    onChange={(e) => setRoundCodeInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all uppercase font-mono tracking-wide"
                    placeholder="SPRV-101"
                  />
                </div>

                <Motion.button
                  type="submit"
                  disabled={isEnrollingChild}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold px-8 py-3.5 shadow-[0_8px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.4)] transition-all disabled:opacity-60 text-sm whitespace-nowrap"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -2 }}
                >
                  {isEnrollingChild ? (
                    <div className="w-5 h-5 border-2 border-[#102a5a]/30 border-t-[#102a5a] rounded-full animate-spin" />
                  ) : (
                    <>
                      Enroll <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Motion.button>
              </form>

              {/* Helper note */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Please enter the round code provided by the lab.</span>
                </div>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Don't have one?
                  <a
                    href="https://wa.me/201500077369"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 hover:-translate-y-px shadow-sm"
                    style={{ background: "#25D366" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contact us on WhatsApp
                  </a>
                </span>
              </div>

              {linkErrorMessage && (
                <Motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-rose-50 border border-rose-100 rounded-2xl p-3 text-sm text-rose-600 text-center"
                >
                  {linkErrorMessage}
                </Motion.div>
              )}
            </Motion.div>
          )}

          {/* Rounds List */}
          {!loading && visibleRounds.length > 0 && (
            <Motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-[#102a5a]">
                  Your Enrolled Rounds
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {visibleRounds.length} round{visibleRounds.length !== 1 && "s"}
                </span>
              </div>

              <div className="space-y-4">
                {visibleRounds.map((round) => {
                  const children = getChildrenForRound(round.code);
                  const isSelected = selectedRoundCode === round.code;
                  const upcomingSessionId = getUpcomingSessionId(round.sessions, now);

                  return (
                    <div
                      key={round.id || round.code}
                      className={`bg-white/80 backdrop-blur-xl rounded-3xl border transition-all duration-300 overflow-hidden ${isSelected
                        ? "border-[#FBBF24]/40 shadow-[0_12px_40px_rgba(251,191,36,0.08)]"
                        : "border-white/60 shadow-sm hover:shadow-md"
                        }`}
                    >
                      {/* Round Toggle Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRoundCode((prev) =>
                            prev === round.code ? null : round.code
                          )
                        }
                        className="w-full flex items-center justify-between text-left p-6 md:p-7 hover:bg-slate-50/30 transition-colors group"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-lg font-bold text-[#102a5a]">
                              {round.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${round.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                            >
                              {round.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                            <span className="text-[#102a5a] bg-[#102a5a]/5 px-2 py-0.5 rounded-lg border border-[#102a5a]/10 font-mono text-xs">
                              {round.code}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{round.level}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{round.campus}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 transition-all ${isSelected
                            ? "bg-[#FBBF24]/10 text-[#FBBF24]"
                            : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                            }`}
                        >
                          <Motion.div
                            animate={{ rotate: isSelected ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </Motion.div>
                        </div>
                      </button>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isSelected && (
                          <Motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-100 bg-slate-50/30 p-6 md:p-7 space-y-8">
                              {/* Students */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  Enrolled Students ({children.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {children.map((child) => (
                                    <div
                                      key={child.id || child._id}
                                      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm hover:border-[#FBBF24]/30 hover:shadow-md transition-all"
                                    >
                                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] flex items-center justify-center text-white font-bold text-lg shrink-0">
                                        {(child.childName || child.name || "?")[0].toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#102a5a]">
                                          {child.childName || child.name}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                          Level: {child.level || "Beginner"}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Gallery */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                  Round Gallery
                                </h4>
                                {!round.photos || round.photos.length === 0 ? (
                                  <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mx-auto mb-3">
                                      <Camera className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <p className="text-sm font-semibold text-[#102a5a]">
                                      No lab photos yet
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      Instructors will upload moments here.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {round.photos.map((photo, index) => (
                                      <div
                                        key={photo.id || index}
                                        className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 relative group shadow-sm"
                                      >
                                        <img
                                          src={photo.url}
                                          alt={photo.caption || "Lab Session"}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                          {photo.caption && (
                                            <p className="text-xs text-white p-3 font-medium truncate">
                                              {photo.caption}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </section>

                              {/* Sessions & Ratings */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-[#FBBF24]" />
                                  Sessions & Feedback
                                </h4>
                                <div className="space-y-3">
                                  {round?.sessions?.map((session) => {
                                    const sessionId = session.id || session._id;
                                    const key = `${round.code}-${sessionId}`;
                                    const isUpcoming = upcomingSessionId === sessionId;
                                    const sessionDateTime = isUpcoming ? getSessionDateTime(session) : null;
                                    const diffMs = sessionDateTime ? sessionDateTime.getTime() - now.getTime() : null;
                                    const countdownLabel = diffMs != null ? getCountdownLabel(diffMs) : null;
                                    const countdownText = diffMs != null ? formatCountdown(diffMs) : "";
                                    const rating = sessionRatings[key] || session.userRating || 0;
                                    const feedbackText = sessionFeedback[key] || session.feedback || "";
                                    const submitted = ratingSubmitted[key] || Boolean(session.userRating);
                                    const isLocked = submitted;
                                    const isCompleted = session.status === "Completed";

                                    return (
                                      <div
                                        key={sessionId}
                                        className={`bg-white border rounded-2xl p-5 flex flex-col lg:flex-row gap-5 transition-colors ${isCompleted
                                          ? "border-slate-100"
                                          : "border-[#FBBF24]/20 bg-[#FBBF24]/5"
                                          }`}
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-[#102a5a]">
                                              {session.title}
                                            </h5>
                                            {!isCompleted && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FBBF24]/20 text-[#92400e] uppercase tracking-wide">
                                                Upcoming
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                                            {session?.description || "No description provided."}
                                          </p>
                                          <div className="mt-3">
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-500">
                                              <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                                              {session.date || "Date TBA"}{session.time ? ` • ${session.time}` : ""}
                                            </span>
                                            {isUpcoming && countdownLabel && (
                                              <span className="ml-2 inline-flex items-center gap-1.5 bg-[#FBBF24]/15 text-[#92400e] px-2.5 py-1 rounded-lg text-xs font-semibold">
                                                <Zap className="w-3.5 h-3.5" />
                                                {countdownLabel}
                                                {countdownText ? ` · ${countdownText}` : ""}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="lg:w-[300px] flex-shrink-0 bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-100">
                                          {isCompleted ? (
                                            <div className="flex flex-col gap-3">
                                              <div className="flex items-center justify-between gap-3 w-full">
                                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-0 truncate">
                                                  Rate Session
                                                </p>
                                                <RatingStars
                                                  value={rating}
                                                  disabled={isLocked}
                                                  onChange={(stars) =>
                                                    handleSessionRatingChange(round.code, sessionId, stars)
                                                  }
                                                />
                                              </div>
                                              <textarea
                                                value={feedbackText}
                                                onChange={(e) =>
                                                  handleSessionFeedbackChange(round.code, sessionId, e.target.value)
                                                }
                                                placeholder="Leave feedback…"
                                                disabled={isLocked}
                                                className={`w-full min-h-[60px] rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/20 resize-none transition-all placeholder:text-slate-400 ${isLocked ? "bg-slate-100/70 text-slate-600" : ""}`}
                                              />
                                              <div className="flex items-center justify-between pt-1">
                                                {submitted ? (
                                                  <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                      <CheckCircle2 className="w-4 h-4" /> Received
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                      تقييمك: {rating || session.userRating}/5
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-xs text-slate-400 italic">
                                                    Not sent yet
                                                  </span>
                                                )}
                                                {!submitted && (
                                                  <button
                                                    type="button"
                                                    disabled={!rating}
                                                    onClick={() => handleSubmitRating(round.code, session)}
                                                    className="rounded-xl bg-[#102a5a] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1a3a6b] transition-all active:scale-[0.98] disabled:opacity-50"
                                                  >
                                                    Submit
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center justify-center text-center py-4">
                                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                                                <CalendarClock className="w-5 h-5 text-slate-400" />
                                              </div>
                                              <p className="text-sm font-semibold text-[#102a5a]">
                                                Pending
                                              </p>
                                              <p className="text-xs text-slate-500 mt-1">
                                                Feedback opens after session.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </section>
                            </div>
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Motion.section>
          )}

          {/* Empty state */}
          {!loading && visibleRounds.length === 0 && (
            <Motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-14 text-center shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-[#FBBF24]" />
              </div>
              <h3 className="text-lg font-bold text-[#102a5a] mb-2">
                No Rounds Linked Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Enter a valid round code above to unlock your child's schedule
                and media gallery.
              </p>
            </Motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs bg-[#071228] mt-auto">
        <p className="text-slate-500">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

ParentDashboard.propTypes = {
  parent: PropTypes.shape({
    name: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        childName: PropTypes.string,
        level: PropTypes.string,
        status: PropTypes.string,
        age: PropTypes.number,
        _id: PropTypes.string,
        id: PropTypes.string,
        enrolledRounds: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
      })
    ),
  }),
  setParent: PropTypes.func.isRequired,
};

export default ParentDashboard;
