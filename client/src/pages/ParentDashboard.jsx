import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CalendarClock,
  KeyRound,
  Star,
  Blocks,
  ChevronDown,
  CheckCircle2,
  Download,
  HardDrive,
  LogOut,
  Zap,
  ArrowRight,
  User,
  LayoutDashboard,
  RefreshCw,
  BookOpen,
  Settings,
  Play,
} from "lucide-react";
import { FaAndroid, FaApple, FaWindows } from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const SPARVI_POINTER_DOWNLOAD_URL = `${API_BASE_URL}/api/sparvi/pointer/download`;
const SPARVI_POINTER_ANDROID_DOWNLOAD_URL = `${API_BASE_URL}/api/sparvi/pointer/android/download`;

const TOOL_SYSTEMS = [
  {
    title: "Windows",
    subtitle: "SP School Pointer desktop app",
    description:
      "Install the Windows companion used during live sessions and interactive classroom activities.",
    icon: FaWindows,
    iconClass: "bg-slate-950 text-white shadow-slate-950/20",
    cardClass: "border-slate-200 bg-white",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    buttonClass: "bg-slate-950 text-white hover:bg-slate-800",
    badge: "Ready",
    details: ["Installer (.exe)", "Live-session ready", "Student laptop"],
    actionLabel: "Download",
    actionIcon: Download,
    href: SPARVI_POINTER_DOWNLOAD_URL,
    download: true,
  },
  {
    title: "macOS",
    subtitle: "SP School Pointer for Mac",
    description:
      "The macOS version is being prepared. Parents can use the Windows or Android version for now.",
    icon: FaApple,
    iconClass: "bg-slate-900 text-white shadow-slate-900/20",
    cardClass: "border-slate-200 bg-white",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    buttonClass: "bg-slate-100 text-slate-500",
    badge: "Coming soon",
    details: ["Mac app", "In progress", "Not downloadable yet"],
    actionLabel: "Coming soon",
    actionIcon: HardDrive,
    disabled: true,
  },
  {
    title: "Android APK",
    subtitle: "SP School Pointer mobile app",
    description:
      "Download the Android APK and install it on a supported Android device for Sparvi activities.",
    icon: FaAndroid,
    iconClass: "bg-emerald-600 text-white shadow-emerald-600/20",
    cardClass: "border-emerald-100 bg-white",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
    badge: "APK",
    details: ["Android package", "Mobile device", "Manual install"],
    actionLabel: "Download APK",
    actionIcon: Download,
    href: SPARVI_POINTER_ANDROID_DOWNLOAD_URL,
    download: true,
  },
];

/* ====== TABS ====== */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rounds", label: "My Rounds", icon: BookOpen },
  { id: "gallery", label: "Tools", icon: Blocks },
  { id: "feedback", label: "Feedback", icon: Star },
];

/* ====== RATING STARS ====== */
const RatingStars = ({ value, onChange, disabled }) => (
  <div className="flex items-center -space-x-1 max-w-full">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => { if (!disabled) onChange(star); }}
        disabled={disabled}
        className={`focus:outline-none transform transition-all duration-200 p-1 hover:scale-110 active:scale-90 flex-shrink-0 ${disabled ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100" : ""}`}
      >
        <Star
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${value && star <= value
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
  if (diffMs <= 30 * minute) return "in 30 min";
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

const formatTime24 = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getParentSessionLifecycle = (session, now) => {
  if (session?.status === "Completed") return "completed";
  const dateTime = getSessionDateTime(session);
  if (!dateTime) return "upcoming";
  const start = dateTime.getTime();
  const end = start + 60 * 60 * 1000;
  const nowMs = now.getTime();
  if (nowMs < start) return "upcoming";
  if (nowMs <= end) return "active";
  return "completed";
};

const getParentStatusMeta = (lifecycle) => {
  switch (lifecycle) {
    case "active":
      return {
        label: "Active",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        hintClass: "text-emerald-700",
      };
    case "completed":
      return {
        label: "Completed",
        badgeClass: "border-slate-200 bg-slate-100 text-slate-600",
        hintClass: "text-slate-500",
      };
    default:
      return {
        label: "Upcoming",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        hintClass: "text-amber-700",
      };
  }
};

/* ================= PARENT DASHBOARD ================= */
const ParentDashboard = ({ parent, setParent }) => {
  const navigate = useNavigate();

  const [rounds, setRounds] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [roundCodeInput, setRoundCodeInput] = useState("");
  const [linkedRounds, setLinkedRounds] = useState([]);
  const [linkErrorMessage, setLinkErrorMessage] = useState("");
  const [freeSessions, setFreeSessions] = useState([]);

  const [sessionRatings, setSessionRatings] = useState({});
  const [sessionFeedback, setSessionFeedback] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});
  const [now, setNow] = useState(() => new Date());

  const [selectedChildId, setSelectedChildId] = useState("");
  const [isEnrollingChild, setIsEnrollingChild] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOverviewSessionKey, setSelectedOverviewSessionKey] = useState(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_token") : null;
  const getRole = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_role") : null;

  const hasCompletedProfile = (user) => {
    const firstChild = user?.children?.[0];
    return Boolean(firstChild?.name?.trim()) && Number(firstChild?.age) > 0;
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    const token = getToken();
    const role = getRole();
    if (!token || role !== "parent") { navigate("/login"); return; }

    const enrichRoundsWithAllPhotos = (apiData) => {
      const { rounds, enrollments, studentPhotos } = apiData;
      return rounds.map((round) => {
        const related = enrollments.filter((e) => e.roundCode === round.code);
        const photos = related.flatMap((e) => studentPhotos[e.id] || []);
        return { ...round, enrollments: related, photos };
      });
    };

    try {
      setLoading(true);
      setGlobalError("");
      const res = await fetch(`${API_BASE_URL}/api/parent/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
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
      setFreeSessions(json.freeSessions || []);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setGlobalError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
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
      }
      if (Array.isArray(json.enrollments)) setEnrollments(json.enrollments);
      toast.success("Child enrolled successfully");
      setRoundCodeInput("");
      setActiveTab("rounds");
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

  const allSessions = useMemo(() => {
    return visibleRounds.flatMap((round) =>
      (round.sessions || []).map((session) => ({
        ...session,
        roundCode: round.code,
        roundName: round.name,
      }))
    );
  }, [visibleRounds]);

  const completedSessions = useMemo(
    () => allSessions.filter((s) => s.status === "Completed"),
    [allSessions]
  );

  const overviewSessions = useMemo(() => {
    const roundItems = allSessions.map((session) => ({
      ...session,
      sessionType: "round",
      title: session.title || "Session",
    }));

    const freeItems = (freeSessions || []).map((session) => {
      const scheduledAt = session.scheduledAt ? new Date(session.scheduledAt) : null;
      const date = scheduledAt ? scheduledAt.toISOString().slice(0, 10) : null;
      const time = scheduledAt ? formatTime24(scheduledAt) : null;
      return {
        ...session,
        sessionType: "free",
        title: `Free Session - ${session.childName || "Child"}`,
        date,
        time,
        roundCode: "FREE",
      };
    });

    return [...roundItems, ...freeItems]
      .map((session) => {
        const sessionId = session.id || session._id;
        const dateTime = getSessionDateTime(session);
        const startMs = dateTime ? dateTime.getTime() : null;
        const lifecycle = getParentSessionLifecycle(session, now);
        const diffMs = startMs != null ? startMs - now.getTime() : null;
        const timeLabel = session.time || (dateTime ? dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBA");
        const dateLabel = dateTime
          ? dateTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
          : "TBA";
        const hintText = lifecycle === "active"
          ? "Active now"
          : lifecycle === "completed"
            ? "Completed"
            : diffMs != null
              ? `After ${formatCountdown(diffMs)}`
              : "TBA";
        return {
          ...session,
          sessionId,
          key: `${session.roundCode}-${sessionId}`,
          lifecycle,
          startMs,
          dateLabel,
          timeLabel,
          hintText,
        };
      })
      .sort((a, b) => {
        const order = { active: 0, upcoming: 1, completed: 2 };
        const statusDiff = order[a.lifecycle] - order[b.lifecycle];
        if (statusDiff !== 0) return statusDiff;
        if (a.startMs == null && b.startMs == null) return 0;
        if (a.startMs == null) return 1;
        if (b.startMs == null) return -1;
        if (a.lifecycle === "completed") return b.startMs - a.startMs;
        return a.startMs - b.startMs;
      });
  }, [allSessions, freeSessions, now]);

  const selectedOverviewSession = useMemo(
    () => overviewSessions.find((s) => s.key === selectedOverviewSessionKey) || null,
    [overviewSessions, selectedOverviewSessionKey]
  );

  useEffect(() => {
    if (overviewSessions.length === 0) {
      setSelectedOverviewSessionKey(null);
      return;
    }
    const exists = overviewSessions.some((s) => s.key === selectedOverviewSessionKey);
    if (!selectedOverviewSessionKey || !exists) {
      setSelectedOverviewSessionKey(overviewSessions[0].key);
    }
  }, [overviewSessions, selectedOverviewSessionKey]);

  const selectedOverviewKey = selectedOverviewSession
    ? `${selectedOverviewSession.roundCode}-${selectedOverviewSession.sessionId}`
    : null;
  const selectedOverviewRating = selectedOverviewKey
    ? sessionRatings[selectedOverviewKey] || selectedOverviewSession.userRating || 0
    : 0;
  const selectedOverviewFeedback = selectedOverviewKey
    ? sessionFeedback[selectedOverviewKey] || selectedOverviewSession.feedback || ""
    : "";
  const selectedOverviewSubmitted = selectedOverviewKey
    ? ratingSubmitted[selectedOverviewKey] || Boolean(selectedOverviewSession.userRating)
    : false;

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
      toast.success("Feedback submitted!");
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

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const pageTitle = activeTab === "overview" ? "Dashboard" : activeTabConfig.label;

  /* ================================================================== */
  return (
    <div className="h-screen w-full overflow-hidden bg-[#f7f8f6] font-sans text-slate-900 [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <div className="flex h-full w-full overflow-hidden bg-white">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <Link to="/parent" className="inline-flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-semibold text-slate-800">SP School Parent</span>
                <span className="block truncate text-xs font-semibold text-slate-400">Parent Workspace</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <div className="space-y-1.5">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>
            <div className="space-y-1.5">
              <Link
                to="/parent/profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Settings className="h-4 w-4 shrink-0" />
                Settings
              </Link>
              <Link
                to="/blocks"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Play className="h-4 w-4 shrink-0" />
                Blocks
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f8f6]">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to="/parent"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 lg:hidden"
                >
                  <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
                </Link>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-800">
                    {pageTitle}
                  </h1>
                  <p className="truncate text-xs font-medium text-slate-400">
                    {parent?.name || "Parent"} Workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <Link
                  to="/parent/profile"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            <nav className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="w-full space-y-5">
          {/* Error */}
          <AnimatePresence>
            {globalError && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm"
              >
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{globalError}</p>
                <button onClick={() => setGlobalError("")} className="ml-auto text-rose-400 hover:text-rose-600 text-lg font-bold leading-none">&times;</button>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="text-sm font-medium text-slate-500">Loading your dashboard…</p>
            </div>
          )}

          {/* ===== TAB: OVERVIEW ===== */}
          {!loading && activeTab === "overview" && (
            <Motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Link new round row */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <form onSubmit={handleLinkRound} className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="min-w-[140px] text-sm font-bold text-slate-700">
                    Link New Round
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(180px,240px),1fr] gap-2">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition-all focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="" disabled>Select child</option>
                        {parent?.children?.map((child, i) => (
                          <option key={child._id || child.id || i} value={child._id || child.id}>
                            {child.name || child.childName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={roundCodeInput}
                        onChange={(e) => setRoundCodeInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 font-mono text-sm font-semibold uppercase tracking-wide text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="SPRV-101"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Motion.button
                      type="submit"
                      disabled={isEnrollingChild}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60 whitespace-nowrap"
                      whileTap={{ scale: 0.97 }}
                    >
                      {isEnrollingChild ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>Link <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Motion.button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("rounds")}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 whitespace-nowrap"
                    >
                      See all rounds linked
                    </button>
                    <a
                      href="https://wa.me/201500077369"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 whitespace-nowrap"
                      style={{ background: "#25D366" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Don’t have a round code?
                    </a>
                  </div>
                </form>

                {linkErrorMessage && (
                  <Motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-sm font-semibold text-rose-700"
                  >
                    {linkErrorMessage}
                  </Motion.div>
                )}
              </div>

              {/* Stats Row */}
          
              {/* Sessions Overview */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr]">
                  <div className="border-b border-slate-100 xl:border-b-0 xl:border-r">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h2 className="text-sm font-bold text-slate-700">Sessions</h2>
                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                        {overviewSessions.length}
                      </span>
                    </div>

                    {overviewSessions.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">
                        No sessions yet. Linked sessions will appear here.
                      </div>
                    ) : (
                      <div className="max-h-[620px] overflow-y-auto">
                        {overviewSessions.map((session) => {
                          const statusMeta = getParentStatusMeta(session.lifecycle);
                          const isSelected = selectedOverviewSessionKey === session.key;
                          return (
                            <button
                              key={session.key}
                              type="button"
                              onClick={() => setSelectedOverviewSessionKey(session.key)}
                              className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors ${
                                isSelected ? "bg-emerald-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800">{session.title}</p>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badgeClass}`}>
                                  {statusMeta.label}
                                </span>
                              </div>
                              <p className={`mt-1 text-xs font-medium ${statusMeta.hintClass}`}>
                                {session.hintText} ({session.timeLabel})
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {session.dateLabel}
                                {session.roundName ? ` - ${session.roundName}` : ""}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="p-4 lg:p-5">
                      {!selectedOverviewSession ? (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                          Select any session from the list to add feedback.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{selectedOverviewSession.title}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {selectedOverviewSession.dateLabel} at {selectedOverviewSession.timeLabel}
                                  {selectedOverviewSession.roundName ? ` - ${selectedOverviewSession.roundName}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getParentStatusMeta(selectedOverviewSession.lifecycle).badgeClass}`}>
                                  {getParentStatusMeta(selectedOverviewSession.lifecycle).label}
                                </span>
                                <span className={`text-xs font-semibold ${getParentStatusMeta(selectedOverviewSession.lifecycle).hintClass}`}>
                                  {selectedOverviewSession.hintText}
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedOverviewSession.sessionType === "free" ? (
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-700">
                                  Free session details
                                </p>
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Free
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                <span><b className="text-slate-700">Parent:</b> {selectedOverviewSession.parentName || "-"}</span>
                                <span><b className="text-slate-700">Phone:</b> {selectedOverviewSession.phone || "-"}</span>
                                <span><b className="text-slate-700">Child:</b> {selectedOverviewSession.childName || "-"}</span>
                                <span><b className="text-slate-700">Age:</b> {selectedOverviewSession.childAge || "-"}</span>
                              </div>
                            </div>
                          ) : selectedOverviewSession.lifecycle === "completed" ? (
                            <div className="rounded-xl border border-slate-100 p-4">
                              <div className="flex flex-col lg:flex-row gap-3">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Rating:</span>
                                    <RatingStars
                                      value={selectedOverviewRating}
                                      disabled={selectedOverviewSubmitted}
                                      onChange={(stars) => handleSessionRatingChange(selectedOverviewSession.roundCode, selectedOverviewSession.sessionId, stars)}
                                    />
                                  </div>
                                  <textarea
                                    value={selectedOverviewFeedback}
                                    onChange={(e) => handleSessionFeedbackChange(selectedOverviewSession.roundCode, selectedOverviewSession.sessionId, e.target.value)}
                                    placeholder="Leave feedback..."
                                    disabled={selectedOverviewSubmitted}
                                    className={`w-full min-h-[70px] resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 ${selectedOverviewSubmitted ? "bg-slate-100/70 text-slate-600" : ""}`}
                                  />
                                </div>
                                <div className="flex flex-col justify-end items-end gap-2">
                                  {selectedOverviewSubmitted ? (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                      <CheckCircle2 className="w-4 h-4" /> Submitted ({selectedOverviewRating}/5)
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={!selectedOverviewRating}
                                      onClick={() => handleSubmitRating(selectedOverviewSession.roundCode, selectedOverviewSession)}
                                      className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50"
                                    >
                                      Submit
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                              <CalendarClock className="w-4 h-4 text-slate-400" />
                              Feedback opens after session completion.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick nav to tabs */}
             

              {/* Empty state */}
              {visibleRounds.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                    <KeyRound className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-800">No Rounds Linked Yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Enter a round code above to unlock your child's schedule and media gallery.
                  </p>
                </div>
              )}
            </Motion.div>
          )}

          {/* ===== TAB: MY ROUNDS ===== */}
          {!loading && activeTab === "rounds" && (
            <Motion.div key="rounds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-normal text-slate-700">Your Enrolled Rounds</h2>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
                  {visibleRounds.length} round{visibleRounds.length !== 1 && "s"}
                </span>
              </div>

              {visibleRounds.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                  <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No rounds linked yet.</p>
                  <button onClick={() => setActiveTab("overview")} className="mt-4 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800">
                    Enroll Now
                  </button>
                </div>
              ) : (
                visibleRounds.map((round) => {
                  const children = getChildrenForRound(round.code);
                  const upcomingSessionId = getUpcomingSessionId(round.sessions, now);

                  return (
                    <div key={round.id || round.code} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {/* Round Header */}
                      <div className="p-5 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-lg font-semibold text-slate-800">{round.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${round.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {round.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">{round.code}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{round.level}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{round.campus}</span>
                        </div>
                      </div>

                      {/* Students */}
                      <div className="p-5 border-b border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          Enrolled ({children.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {children.map((child) => (
                            <div key={child.id || child._id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                                {(child.childName || child.name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{child.childName || child.name}</p>
                                <p className="text-xs text-slate-500">{child.level || "Beginner"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sessions Timeline */}
                      <div className="p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-slate-400" />
                          Sessions ({round.sessions?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {round.sessions?.map((session) => {
                            const sessionId = session.id || session._id;
                            const isUpcoming = upcomingSessionId === sessionId;
                            const sessionDateTime = isUpcoming ? getSessionDateTime(session) : null;
                            const diffMs = sessionDateTime ? sessionDateTime.getTime() - now.getTime() : null;
                            const countdownLabel = diffMs != null ? getCountdownLabel(diffMs) : null;
                            const isCompleted = session.status === "Completed";

                            return (
                              <div
                                key={sessionId}
                                className={`flex items-center gap-4 rounded-xl p-3 border transition-colors ${
                                  isUpcoming ? "border-amber-200 bg-amber-50/70" : isCompleted ? "border-slate-100 bg-white" : "border-slate-100 bg-slate-50/50"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCompleted ? "bg-emerald-100 text-emerald-600" : isUpcoming ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                                }`}>
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">{session.title}</p>
                                  <p className="text-xs text-slate-500">{session.date || "TBA"}{session.time ? ` · ${session.time}` : ""}</p>
                                </div>
                                {isUpcoming && countdownLabel && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                    <Zap className="w-3 h-3" />
                                    {countdownLabel}
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-xs font-medium text-emerald-600 shrink-0">Done</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </Motion.div>
          )}

          {/* ===== TAB: TOOLS ===== */}
          {!loading && activeTab === "gallery" && (
            <Motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
            
              <div className="space-y-5">
                {TOOL_SYSTEMS.map((system) => {
                  const SystemIcon = system.icon;
                  const ActionIcon = system.actionIcon;
                  const ActionContent = (
                    <>
                      <ActionIcon className="h-4 w-4" />
                      <span>{system.actionLabel}</span>
                    </>
                  );

                  return (
                    <div
                      key={system.title}
                      className={`overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md sm:p-6 ${system.cardClass}`}
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl shadow-sm ${system.iconClass}`}>
                          <SystemIcon className="h-10 w-10" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold text-slate-800">{system.title}</h3>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${system.badgeClass}`}>
                              {system.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{system.subtitle}</p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{system.description}</p>

                          <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {system.details.map((detail) => (
                              <span
                                key={detail}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>

                        {system.disabled ? (
                          <button
                            type="button"
                            disabled
                            className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold sm:w-auto ${system.buttonClass}`}
                          >
                            {ActionContent}
                          </button>
                        ) : (
                          <a
                            href={system.href}
                            download={system.download}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all sm:w-auto ${system.buttonClass}`}
                          >
                            {ActionContent}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Motion.div>
          )}

          {/* ===== TAB: FEEDBACK ===== */}
          {!loading && activeTab === "feedback" && (
            <Motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                      <Star className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h2 className="text-base font-semibold tracking-normal text-slate-700">Session Feedback</h2>
                  </div>
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
                    {allSessions.length} Sessions
                  </span>
                </div>

                {allSessions.length === 0 ? (
                  <div className="text-center py-12 border-t border-slate-100">
                    <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No sessions available for feedback yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allSessions.map((session) => {
                      const sessionId = session.id || session._id;
                      const key = `${session.roundCode}-${sessionId}`;
                      const rating = sessionRatings[key] || session.userRating || 0;
                      const feedbackText = sessionFeedback[key] || session.feedback || "";
                      const submitted = ratingSubmitted[key] || Boolean(session.userRating);
                      const isCompleted = session.status === "Completed";

                      return (
                        <div
                          key={key}
                          className={`rounded-xl border p-4 transition-colors ${
                            isCompleted ? "border-slate-100 bg-white" : "border-amber-200 bg-amber-50/70"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="text-sm font-bold text-slate-800">{session.title}</h5>
                                {!isCompleted && (
                                  <span className="inline-flex items-center rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                    Upcoming
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {session.roundName} · {session.date || "TBA"}{session.time ? ` · ${session.time}` : ""}
                              </p>
                            </div>
                          </div>

                          {isCompleted ? (
                            <div className="flex flex-col lg:flex-row gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-500 uppercase">Rating:</span>
                                  <RatingStars
                                    value={rating}
                                    disabled={submitted}
                                    onChange={(stars) => handleSessionRatingChange(session.roundCode, sessionId, stars)}
                                  />
                                </div>
                                <textarea
                                  value={feedbackText}
                                  onChange={(e) => handleSessionFeedbackChange(session.roundCode, sessionId, e.target.value)}
                                  placeholder="Leave feedback…"
                                  disabled={submitted}
                                  className={`w-full min-h-[60px] resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 ${submitted ? "bg-slate-100/70 text-slate-600" : ""}`}
                                />
                              </div>
                              <div className="flex flex-col justify-end items-end gap-2">
                                {submitted ? (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4" /> Submitted ({rating}/5)
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!rating}
                                    onClick={() => handleSubmitRating(session.roundCode, session)}
                                    className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50"
                                  >
                                    Submit
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                              <CalendarClock className="w-4 h-4 text-slate-400" />
                              Feedback opens after session completion.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Motion.div>
          )}
            </div>
          </main>
        </div>
      </div>

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
