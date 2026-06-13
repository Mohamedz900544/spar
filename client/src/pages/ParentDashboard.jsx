import { Fragment, useState, useEffect, useMemo, useRef } from "react";
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
  Settings,
  Play,
  Camera,
  Loader2,
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
    iconClass: "bg-slate-100 text-slate-900 ring-slate-200",
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
    iconClass: "bg-zinc-100 text-zinc-700 ring-zinc-200",
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
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    cardClass: "border-emerald-100 bg-white",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
    badge: "APK",
    details: ["Android package", "Mobile device", "Manual install"],
    actionLabel: "Download",
    actionIcon: Download,
    href: SPARVI_POINTER_ANDROID_DOWNLOAD_URL,
    download: true,
  },
];

/* ====== TABS ====== */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
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

const getCountdownParts = (diffMs) => {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
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
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const profilePhotoInputRef = useRef(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_token") : null;
  const getRole = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_role") : null;

  const hasCompletedProfile = (user) => {
    const firstChild = user?.children?.[0];
    return Boolean(firstChild?.name?.trim()) && Number(firstChild?.age) > 0;
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

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
      toast.success("Child enrolled successfully");
      setRoundCodeInput("");
      setActiveTab("overview");
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

  const allSessions = useMemo(() => {
    return visibleRounds.flatMap((round) =>
      (round.sessions || []).map((session) => ({
        ...session,
        roundCode: round.code,
        roundName: round.name,
      }))
    );
  }, [visibleRounds]);

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
  const upcomingOverviewSession = useMemo(
    () => overviewSessions.find((session) => session.lifecycle !== "completed") || null,
    [overviewSessions]
  );
  const upcomingCountdown = useMemo(() => {
    if (!upcomingOverviewSession?.startMs) return null;
    return getCountdownParts(upcomingOverviewSession.startMs - now.getTime());
  }, [upcomingOverviewSession, now]);

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

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    const token = getToken();
    if (!token || getRole() !== "parent") { navigate("/login"); return; }

    const previewUrl = URL.createObjectURL(file);
    setProfilePhotoPreview(previewUrl);
    setIsPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const res = await fetch(`${API_BASE_URL}/api/parent/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not update profile photo.");

      const updatedUser = json.user || {};
      setParent((prev) => ({ ...prev, ...updatedUser }));

      if (typeof window !== "undefined") {
        let storedUser = {};
        try {
          storedUser = JSON.parse(localStorage.getItem("sparvi_user") || "{}");
        } catch {
          storedUser = {};
        }
        localStorage.setItem("sparvi_user", JSON.stringify({ ...storedUser, ...updatedUser }));
      }

      toast.success("Profile photo updated.");
    } catch (err) {
      setProfilePhotoPreview("");
      toast.error(err.message || "Could not update profile photo.");
    } finally {
      setIsPhotoUploading(false);
      setProfilePhotoPreview("");
    }
  };

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const pageTitle = activeTab === "overview" ? "Dashboard" : activeTabConfig.label;
  const sidebarPhotoUrl = profilePhotoPreview || parent?.photoUrl || "";
  const parentInitial = parent?.name?.trim()?.charAt(0)?.toUpperCase() || "P";

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
            <div className="mb-6 px-3">
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />
              <button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
                disabled={isPhotoUploading}
                aria-label="Change profile photo"
                title="Change profile photo"
                className="group flex w-full flex-col items-center rounded-lg py-2 text-center transition-all hover:bg-slate-50 disabled:cursor-wait disabled:opacity-75"
              >
                <span className="relative">
                  <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-3xl font-bold text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all group-hover:ring-emerald-200">
                    {sidebarPhotoUrl ? (
                      <img src={sidebarPhotoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span>{parentInitial}</span>
                    )}
                  </span>
                  <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-2 ring-white transition-all group-hover:bg-emerald-700">
                    {isPhotoUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </span>
                </span>
                <span className="mt-3 block max-w-full truncate text-sm font-semibold text-slate-800">
                  {parent?.name || "Parent"}
                </span>
                <span className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                  {isPhotoUploading ? "Updating photo" : "Change photo"}
                </span>
              </button>
            </div>
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
            <Motion.div key="overview-redesign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),minmax(360px,440px)]">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Next session</p>
                      {upcomingOverviewSession ? (
                        <>
                          <h2 className="mt-2 truncate text-xl font-semibold text-slate-900">{upcomingOverviewSession.title}</h2>
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {upcomingOverviewSession.dateLabel} at {upcomingOverviewSession.timeLabel}
                            {upcomingOverviewSession.roundName ? ` - ${upcomingOverviewSession.roundName}` : ""}
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="mt-2 text-xl font-semibold text-slate-900">No upcoming sessions</h2>
                          <p className="mt-1 text-sm font-medium text-slate-500">Linked sessions will appear here.</p>
                        </>
                      )}
                    </div>

                  </div>

                  {upcomingOverviewSession && upcomingCountdown && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <div className="flex items-start justify-center gap-1 sm:gap-4">
                        {[
                          ["Days", upcomingCountdown.days, "text-slate-900"],
                          ["Hours", upcomingCountdown.hours, "text-slate-900"],
                          ["Minutes", upcomingCountdown.minutes, "text-slate-900"],
                          ["Seconds", upcomingCountdown.seconds, "text-red-600"],
                        ].map(([label, value, colorClass], index) => (
                          <Fragment key={label}>
                            {index > 0 && (
                              <span className="mt-0.5 text-3xl font-bold leading-none text-slate-400 sm:mt-1 sm:text-5xl">:</span>
                            )}
                            <div className="min-w-[52px] text-center sm:min-w-[78px]">
                              <p className={`font-mono text-3xl font-black leading-none tracking-normal sm:text-5xl lg:text-6xl ${colorClass}`}>
                                {String(value).padStart(2, "0")}
                              </p>
                              <p
                                className="mt-3 text-xs font-medium text-slate-600 sm:mt-4 sm:text-base"
                                style={{ fontFamily: '"Segoe Print", "Comic Sans MS", cursive' }}
                              >
                                {label}
                              </p>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Link a round</h2>
                      <p className="mt-1 text-xs font-medium text-slate-400">Add a child to a new round code.</p>
                    </div>
                    <KeyRound className="h-5 w-5 text-slate-300" />
                  </div>

                  <form onSubmit={handleLinkRound} className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition-all focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="" disabled>Select child</option>
                        {parent?.children?.map((child, i) => (
                          <option key={child._id || child.id || i} value={child._id || child.id}>
                            {child.name || child.childName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={roundCodeInput}
                        onChange={(e) => setRoundCodeInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-mono text-sm font-semibold uppercase tracking-wide text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="SPRV-101"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Motion.button
                        type="submit"
                        disabled={isEnrollingChild}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
                        whileTap={{ scale: 0.97 }}
                      >
                        {isEnrollingChild ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>Link round <ArrowRight className="h-4 w-4" /></>
                        )}
                      </Motion.button>
                      <a
                        href="https://wa.me/201500077369"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
                      >
                        Need code?
                      </a>
                    </div>
                  </form>

                  {linkErrorMessage && (
                    <Motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      {linkErrorMessage}
                    </Motion.div>
                  )}
                </section>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),minmax(360px,440px)]">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Schedule</h2>
                      <p className="mt-1 text-xs font-medium text-slate-400">{overviewSessions.length} session{overviewSessions.length !== 1 && "s"}</p>
                    </div>
                  </div>

                  {overviewSessions.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <CalendarClock className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-700">No sessions yet</p>
                      <p className="mt-1 text-sm text-slate-500">Use a round code to add your schedule.</p>
                    </div>
                  ) : (
                    <div className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                      {overviewSessions.map((session) => {
                        const statusMeta = getParentStatusMeta(session.lifecycle);
                        const isSelected = selectedOverviewSessionKey === session.key;
                        return (
                          <button
                            key={session.key}
                            type="button"
                            onClick={() => setSelectedOverviewSessionKey(session.key)}
                            className={`grid w-full gap-3 px-5 py-4 text-left transition-colors sm:grid-cols-[1fr,auto] sm:items-center ${
                              isSelected ? "bg-emerald-50/80" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                  session.lifecycle === "active"
                                    ? "bg-emerald-500"
                                    : session.lifecycle === "completed"
                                      ? "bg-slate-300"
                                      : "bg-amber-500"
                                }`} />
                                <p className="truncate text-sm font-semibold text-slate-900">{session.title}</p>
                              </div>
                              <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                {session.dateLabel} at {session.timeLabel}
                                {session.roundName ? ` - ${session.roundName}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                                {statusMeta.label}
                              </span>
                              <span className={`text-xs font-bold ${statusMeta.hintClass}`}>{session.hintText}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Session detail</h2>
                      <p className="mt-1 text-xs font-medium text-slate-400">Status and feedback</p>
                    </div>
                    <Star className="h-5 w-5 text-slate-300" />
                  </div>

                  {!selectedOverviewSession ? (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Select a session from the schedule.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getParentStatusMeta(selectedOverviewSession.lifecycle).badgeClass}`}>
                            {getParentStatusMeta(selectedOverviewSession.lifecycle).label}
                          </span>
                          <span className={`text-xs font-bold ${getParentStatusMeta(selectedOverviewSession.lifecycle).hintClass}`}>
                            {selectedOverviewSession.hintText}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-slate-900">{selectedOverviewSession.title}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {selectedOverviewSession.dateLabel} at {selectedOverviewSession.timeLabel}
                        </p>
                        {selectedOverviewSession.roundName && (
                          <p className="mt-1 text-xs font-semibold text-slate-400">{selectedOverviewSession.roundName}</p>
                        )}
                      </div>

                      {selectedOverviewSession.sessionType === "free" ? (
                        <div className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
                          <span><b className="text-slate-700">Parent:</b> {selectedOverviewSession.parentName || "-"}</span>
                          <span><b className="text-slate-700">Phone:</b> {selectedOverviewSession.phone || "-"}</span>
                          <span><b className="text-slate-700">Child:</b> {selectedOverviewSession.childName || "-"}</span>
                          <span><b className="text-slate-700">Age:</b> {selectedOverviewSession.childAge || "-"}</span>
                        </div>
                      ) : selectedOverviewSession.lifecycle === "completed" ? (
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Rating</span>
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
                            className={`w-full min-h-[96px] resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 ${selectedOverviewSubmitted ? "bg-slate-100/70 text-slate-600" : ""}`}
                          />
                          <div className="flex justify-end">
                            {selectedOverviewSubmitted ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" /> Submitted ({selectedOverviewRating}/5)
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!selectedOverviewRating}
                                onClick={() => handleSubmitRating(selectedOverviewSession.roundCode, selectedOverviewSession)}
                                className="rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50"
                              >
                                Submit feedback
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          Feedback opens after session completion.
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </Motion.div>
          )}

          {/* ===== TAB: TOOLS ===== */}
          {!loading && activeTab === "gallery" && (
            <Motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Pointer Apps</h2>
                      <p className="mt-1 text-xs font-medium text-slate-400">Downloads for live session devices</p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      {TOOL_SYSTEMS.filter((system) => !system.disabled).length} ready
                    </span>
                  </div>
                </div>

                <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(260px,0.9fr)_150px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 lg:grid">
                  <span>Platform</span>
                  <span>Package</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="divide-y divide-slate-100">
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
                        className="grid gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.9fr)_150px] lg:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${system.iconClass}`}>
                            <SystemIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-slate-900">{system.title}</h3>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${system.badgeClass}`}>
                                {system.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-slate-500">{system.subtitle}</p>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{system.description}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-start">
                          {system.details.map((detail) => (
                            <span
                              key={detail}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              {detail}
                            </span>
                          ))}
                        </div>

                        {system.disabled ? (
                          <button
                            type="button"
                            disabled
                            className={`inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold lg:w-auto lg:justify-self-end ${system.buttonClass}`}
                          >
                            {ActionContent}
                          </button>
                        ) : (
                          <a
                            href={system.href}
                            download={system.download}
                            className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition-all lg:w-auto lg:justify-self-end ${system.buttonClass}`}
                          >
                            {ActionContent}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
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
    photoUrl: PropTypes.string,
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
