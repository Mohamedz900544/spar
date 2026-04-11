import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Link2,
  Search,
  RefreshCw,
  Zap,
  LogOut,
  CalendarClock,
  ChevronDown,
  Sparkles,
  ClipboardList,
  LayoutDashboard,
  GraduationCap,
  Save,
  Clock3,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ======= TABS ======= */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
  { id: "sessions", label: "Upcoming", icon: CalendarClock },
  { id: "evaluations", label: "Evaluations", icon: Sparkles },
  { id: "workingHours", label: "Working Hours", icon: Clock3 },
];

const WEEK_DAY_ITEMS = [
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
];
const HOURS_IN_DAY = 24;
const DISPLAY_START_HOUR = 9;
const DISPLAY_END_HOUR = 23;
const TIME_RANGE_REGEX = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;
const HOUR_COLUMNS = Array.from(
  { length: DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1 },
  (_, index) => {
    const hour = DISPLAY_START_HOUR + index;
    return {
      hour,
      numberLabel: hour % 12 || 12,
      periodLabel: hour < 12 ? "AM" : "PM",
    };
  }
);

const createEmptyWorkingHours = () => ({
  timezone: "Africa/Cairo",
  slotDurationMinutes: 60,
  days: WEEK_DAY_ITEMS.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {}),
});

const normalizeWorkingHours = (value) => ({
  ...createEmptyWorkingHours(),
  ...(value || {}),
  days: {
    ...createEmptyWorkingHours().days,
    ...(value?.days || {}),
  },
});

const toMinutes = (timeValue) => {
  if (timeValue === "24:00") return 24 * 60;
  const [hours, minutes] = (timeValue || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
};

const formatHourToTime = (hour) => `${String(hour).padStart(2, "0")}:00`;

const createEmptyWorkingHoursGrid = () =>
  WEEK_DAY_ITEMS.reduce((acc, day) => {
    acc[day.key] = Array(HOURS_IN_DAY).fill(false);
    return acc;
  }, {});

const buildGridFromWorkingHours = (workingHoursValue) => {
  const grid = createEmptyWorkingHoursGrid();
  const normalized = normalizeWorkingHours(workingHoursValue);

  for (const day of WEEK_DAY_ITEMS) {
    const slots = Array.isArray(normalized.days?.[day.key]) ? normalized.days[day.key] : [];
    for (const slot of slots) {
      const start = (slot?.start || "").toString().trim();
      const end = (slot?.end || "").toString().trim();
      if (!TIME_RANGE_REGEX.test(start) || !TIME_RANGE_REGEX.test(end)) continue;
      const startMinutes = toMinutes(start);
      const endMinutes = toMinutes(end);
      if (startMinutes >= endMinutes) continue;

      for (let hour = 0; hour < HOURS_IN_DAY; hour += 1) {
        const cellStart = hour * 60;
        const cellEnd = (hour + 1) * 60;
        if (startMinutes < cellEnd && endMinutes > cellStart) {
          grid[day.key][hour] = true;
        }
      }
    }
  }

  return grid;
};

const buildWorkingHoursFromGrid = (grid, previousWorkingHours) => {
  const normalizedPrevious = normalizeWorkingHours(previousWorkingHours);
  const days = {};

  for (const day of WEEK_DAY_ITEMS) {
    const row = Array.isArray(grid?.[day.key]) ? grid[day.key] : [];
    const slots = [];
    let startHour = null;

    for (let hour = DISPLAY_START_HOUR; hour <= DISPLAY_END_HOUR; hour += 1) {
      const checked = Boolean(row[hour]);
      if (checked && startHour === null) {
        startHour = hour;
      }
      const isLastColumn = hour === DISPLAY_END_HOUR;
      if ((!checked || isLastColumn) && startHour !== null) {
        const endHour = checked && isLastColumn ? hour + 1 : hour;
        slots.push({
          start: formatHourToTime(startHour),
          end: endHour === HOURS_IN_DAY ? "24:00" : formatHourToTime(endHour),
        });
        startHour = null;
      }
    }

    days[day.key] = slots;
  }

  return {
    timezone: normalizedPrevious.timezone || "Africa/Cairo",
    slotDurationMinutes:
      Number(normalizedPrevious.slotDurationMinutes) > 0
        ? Number(normalizedPrevious.slotDurationMinutes)
        : 60,
    days,
  };
};

/* ======= STAT CARD ======= */
const StatCard = ({ icon: Icon, label, value, accent, extra }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold text-[#102a5a]">{value}</span>
          {extra}
        </div>
      </div>
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */
const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rounds, setRounds] = useState([]);
  const [roundCode, setRoundCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [trialLeads, setTrialLeads] = useState([]);
  const [freeSessions, setFreeSessions] = useState([]);
  const [evaluationDrafts, setEvaluationDrafts] = useState({});
  const [isSavingEvaluationId, setIsSavingEvaluationId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [workingHours, setWorkingHours] = useState(createEmptyWorkingHours());
  const [workingHoursGrid, setWorkingHoursGrid] = useState(createEmptyWorkingHoursGrid());
  const [isSavingWorkingHours, setIsSavingWorkingHours] = useState(false);
  const [workingHoursMessage, setWorkingHoursMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("sparvi_token");
    const role = localStorage.getItem("sparvi_role");
    if (!token || role !== "instructor") { navigate("/login"); return; }
    try {
      setIsLoading(true);
      const [dashboardRes, trialLeadsRes, freeSessionsRes, workingHoursRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/instructor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/instructor/trial-leads`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/instructor/my-free-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/instructor/working-hours`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const safeJson = async (res) => {
        try {
          return await res.json();
        } catch {
          return {};
        }
      };

      const [dashboardData, trialLeadsData, freeSessionsData, workingHoursData] = await Promise.all([
        safeJson(dashboardRes),
        safeJson(trialLeadsRes),
        safeJson(freeSessionsRes),
        safeJson(workingHoursRes),
      ]);

      if (!dashboardRes.ok) {
        throw new Error(dashboardData.message || "Failed to load dashboard");
      }

      setRounds(dashboardData.rounds || []);
      if (dashboardData.rounds?.length) {
        const firstRoundId = dashboardData.rounds[0].id || dashboardData.rounds[0]._id;
        setSelectedRoundId((prev) => prev || firstRoundId);
      }

      if (trialLeadsRes.ok) {
        setTrialLeads(trialLeadsData.leads || []);
        const nextDrafts = {};
        for (const lead of trialLeadsData.leads || []) {
          const leadId = lead.id || lead._id;
          nextDrafts[leadId] = {
            strengths: lead.trainerEvaluation?.strengths || "",
            favoriteProject: lead.trainerEvaluation?.favoriteProject || "",
          };
        }
        setEvaluationDrafts(nextDrafts);
      }

      if (freeSessionsRes.ok) {
        setFreeSessions(freeSessionsData.freeSessions || []);
      }

      if (workingHoursRes.ok) {
        const normalizedWorkingHours = normalizeWorkingHours(workingHoursData.workingHours);
        setWorkingHours(normalizedWorkingHours);
        setWorkingHoursGrid(buildGridFromWorkingHours(normalizedWorkingHours));
      }

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const selectedRound = useMemo(
    () => rounds.find((r) => (r.id || r._id) === selectedRoundId),
    [rounds, selectedRoundId]
  );
  const sessions = useMemo(() => selectedRound?.sessions || [], [selectedRound]);
  const totalRounds = rounds.length;
  const totalStudents = useMemo(
    () => rounds.reduce((sum, r) => sum + (r.enrollments?.length || 0), 0),
    [rounds]
  );
  const selectedEnrollments = useMemo(
    () => selectedRound?.enrollments || [],
    [selectedRound]
  );
  const upcomingSessions = useMemo(() => {
    const now = Date.now();
    const norm = (v) => (v || "").toString().trim();
    const toTs = (s) => {
      const d = norm(s.date); const t = norm(s.time);
      if (!d) return Infinity;
      const p = Date.parse(t ? `${d} ${t}` : d);
      return Number.isNaN(p) ? Infinity : p;
    };

    const roundSessions = rounds
      .flatMap((r) =>
        (r.sessions || []).map((s) => ({
          ...s, roundName: r.name, roundCode: r.code, roundLevel: r.level,
          _type: "round",
        }))
      )
      .map((s) => ({ session: s, ts: toTs(s) }))
      .filter((i) => i.ts >= now);

    const freeItems = freeSessions
      .map((fs) => {
        const ts = fs.scheduledAt ? new Date(fs.scheduledAt).getTime() : Infinity;
        const dateObj = new Date(fs.scheduledAt);
        return {
          session: {
            id: fs.id,
            _type: "free",
            title: `Free Session — ${fs.childName}`,
            date: dateObj.toLocaleDateString("en-US"),
            time: dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }),
            parentName: fs.parentName,
            childName: fs.childName,
            childAge: fs.childAge,
            phone: fs.phone,
            notes: fs.notes || [],
            leadStatus: fs.status,
          },
          ts,
        };
      })
      .filter((i) => i.ts >= now);

    return [...roundSessions, ...freeItems]
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 10)
      .map((i) => i.session);
  }, [rounds, freeSessions]);

  useEffect(() => {
    if (!selectedRound) return;
    if (!sessions.length) { setSelectedSessionId(""); return; }
    const firstId = sessions[0].id || sessions[0]._id;
    if (!selectedSessionId || !sessions.some((s) => (s.id || s._id) === selectedSessionId)) {
      setSelectedSessionId(firstId);
    }
  }, [selectedRoundId, sessions, selectedSessionId, selectedRound]);

  const handleLinkRound = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("sparvi_token");
    if (!token) { navigate("/login"); return; }
    const trimmed = roundCode.trim();
    if (!trimmed) return;
    try {
      setIsLinking(true);
      const res = await fetch(`${API_BASE_URL}/api/instructor/link-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to link round");
      setRounds((prev) => prev.find((r) => (r.id || r._id) === data.round.id) ? prev : [data.round, ...prev]);
      setSelectedRoundId(data.round.id);
      setRoundCode("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to link round");
    } finally {
      setIsLinking(false);
    }
  };

  const updateAttendance = async (enrollmentId, present) => {
    const token = localStorage.getItem("sparvi_token");
    if (!token || !selectedSessionId) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/instructor/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enrollmentId, sessionId: selectedSessionId, present }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update attendance");
      setRounds((prev) =>
        prev.map((round) => {
          if ((round.id || round._id) !== selectedRoundId) return round;
          return {
            ...round,
            enrollments: (round.enrollments || []).map((e) =>
              (e.id === enrollmentId || e._id === enrollmentId)
                ? { ...e, attendance: data.attendance } : e
            ),
          };
        })
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update attendance");
    }
  };

  const getAttendanceStatus = useCallback(
    (enrollment) => {
      const record = (enrollment.attendance || []).find(
        (a) => (a.session || "").toString() === selectedSessionId
      );
      return record?.present || false;
    },
    [selectedSessionId]
  );

  const filteredEnrollments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return selectedEnrollments.filter((e) => {
      const match = q
        ? [e.childName, e.parentName, e.phone]
          .filter(Boolean)
          .some((v) => v.toString().toLowerCase().includes(q))
        : true;
      if (!match) return false;
      if (attendanceFilter === "all") return true;
      const pres = getAttendanceStatus(e);
      return attendanceFilter === "present" ? pres : !pres;
    });
  }, [attendanceFilter, getAttendanceStatus, searchTerm, selectedEnrollments]);

  const attendanceCounts = useMemo(() => {
    if (!selectedEnrollments.length) return { present: 0, absent: 0, total: 0 };
    const present = selectedEnrollments.filter(getAttendanceStatus).length;
    return { present, absent: selectedEnrollments.length - present, total: selectedEnrollments.length };
  }, [getAttendanceStatus, selectedEnrollments]);

  const handleBulkUpdate = async (present) => {
    if (!selectedSessionId || filteredEnrollments.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        filteredEnrollments.map((e) => updateAttendance(e.id || e._id, present))
      );
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleEvaluationDraftChange = (leadId, field, value) => {
    setEvaluationDrafts((prev) => ({
      ...prev,
      [leadId]: {
        strengths: prev[leadId]?.strengths || "",
        favoriteProject: prev[leadId]?.favoriteProject || "",
        [field]: value,
      },
    }));
  };

  const saveLeadEvaluation = async (leadId) => {
    const token = localStorage.getItem("sparvi_token");
    if (!token) { navigate("/login"); return; }

    const draft = evaluationDrafts[leadId] || {};
    if (!draft.strengths?.trim() && !draft.favoriteProject?.trim()) {
      setError("Please add strengths or favorite project before saving.");
      return;
    }

    try {
      setIsSavingEvaluationId(leadId);
      const res = await fetch(`${API_BASE_URL}/api/instructor/trial-leads/${leadId}/evaluation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          strengths: draft.strengths,
          favoriteProject: draft.favoriteProject,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save evaluation");

      setTrialLeads((prev) =>
        prev.map((lead) => {
          const currentId = lead.id || lead._id;
          return currentId === leadId ? data : lead;
        })
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save evaluation");
    } finally {
      setIsSavingEvaluationId("");
    }
  };

  const toggleWorkingHourCell = (dayKey, hour) => {
    setWorkingHoursGrid((prev) => {
      const row = [...(prev[dayKey] || Array(HOURS_IN_DAY).fill(false))];
      row[hour] = !row[hour];
      return {
        ...prev,
        [dayKey]: row,
      };
    });
  };

  const toggleWorkingDay = (dayKey, enabled) => {
    setWorkingHoursGrid((prev) => {
      const nextRow = Array(HOURS_IN_DAY).fill(false);
      for (let hour = DISPLAY_START_HOUR; hour <= DISPLAY_END_HOUR; hour += 1) {
        nextRow[hour] = enabled;
      }
      return {
        ...prev,
        [dayKey]: nextRow,
      };
    });
  };

  const saveWorkingHours = async () => {
    const token = localStorage.getItem("sparvi_token");
    if (!token) { navigate("/login"); return; }

    try {
      setIsSavingWorkingHours(true);
      setWorkingHoursMessage("");
      const payloadWorkingHours = buildWorkingHoursFromGrid(workingHoursGrid, workingHours);

      const res = await fetch(`${API_BASE_URL}/api/instructor/working-hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workingHours: payloadWorkingHours }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save working hours");

      const normalizedWorkingHours = normalizeWorkingHours(data.workingHours);
      setWorkingHours(normalizedWorkingHours);
      setWorkingHoursGrid(buildGridFromWorkingHours(normalizedWorkingHours));
      setWorkingHoursMessage("Working hours saved successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save working hours");
    } finally {
      setIsSavingWorkingHours(false);
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

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col font-sans">
      {/* ===== Sticky Navbar ===== */}
      <nav
        className="sticky top-0 z-50 border-b border-white/10"
        style={{
          background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo-white.png" alt="Sparvi Lab" className="h-7" />
              <span className="hidden md:inline text-xs font-semibold text-[#FBBF24] border border-[#FBBF24]/30 rounded-full px-2.5 py-0.5" style={{ background: "rgba(251,191,36,0.08)" }}>
                Instructor
              </span>
            </Link>

            {/* Center: Tab Navigation */}
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isActive && (
                      <Motion.div
                        layoutId="activeTabIndicator"
                        className="absolute -bottom-[1px] left-3 right-3 h-0.5 bg-[#FBBF24] rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchDashboard}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2.5 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2.5 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-5 py-3.5 flex items-start gap-3 shadow-sm"
              >
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
                <button onClick={() => setError("")} className="ml-auto text-rose-400 hover:text-rose-600 text-lg font-bold leading-none">&times;</button>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* ===== TAB: OVERVIEW ===== */}
          {activeTab === "overview" && (
            <Motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Linked Rounds" value={totalRounds} accent="#102a5a" />
                <StatCard icon={Users} label="Total Students" value={totalStudents} accent="#10b981" />
                <StatCard icon={CalendarClock} label="Upcoming" value={upcomingSessions.length} accent="#FBBF24" />
                <StatCard
                  icon={CheckCircle2}
                  label="Attendance"
                  value={attendanceCounts.present}
                  accent="#8b5cf6"
                  extra={
                    <span className="text-sm text-slate-500 font-medium">
                      / {attendanceCounts.total}
                    </span>
                  }
                />
              </div>

              {/* Quick Actions + Link Round */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Link Round */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-[#FBBF24]" />
                    </div>
                    <h2 className="text-base font-bold text-[#102a5a]">Link New Round</h2>
                  </div>
                  <form onSubmit={handleLinkRound} className="flex gap-2">
                    <input
                      type="text"
                      value={roundCode}
                      onChange={(e) => setRoundCode(e.target.value)}
                      placeholder="Enter round code…"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] uppercase font-mono tracking-wide"
                    />
                    <Motion.button
                      type="submit"
                      disabled={isLinking || !roundCode.trim()}
                      className="rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold px-5 py-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                      whileTap={{ scale: 0.97 }}
                    >
                      {isLinking ? "Linking…" : "Link"}
                    </Motion.button>
                  </form>
                </div>

                {/* Quick Nav Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {TABS.filter((t) => t.id !== "overview").map((tab) => {
                    const TabIcon = tab.icon;
                    const count = tab.id === "sessions" ? upcomingSessions.length
                      : tab.id === "attendance" ? totalRounds
                      : tab.id === "evaluations" ? trialLeads.length
                      : 0;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-[#FBBF24]/30 transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#102a5a]/5 flex items-center justify-center mb-3 group-hover:bg-[#FBBF24]/10 transition-colors">
                          <TabIcon className="w-4 h-4 text-[#102a5a] group-hover:text-[#FBBF24] transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-[#102a5a]">{tab.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{count} items</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Your Rounds List */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#102a5a]">Your Rounds</h2>
                  <span className="inline-flex items-center rounded-full bg-[#102a5a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#102a5a]">
                    {rounds.length}
                  </span>
                </div>
                {isLoading ? (
                  <div className="text-sm text-slate-500 text-center py-8">
                    <div className="w-6 h-6 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mx-auto mb-2" />
                    Loading…
                  </div>
                ) : rounds.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8 px-4">
                    No rounds linked yet. Use the form above to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {rounds.map((round) => (
                      <button
                        key={round.id || round._id}
                        type="button"
                        onClick={() => { setSelectedRoundId(round.id || round._id); setActiveTab("attendance"); }}
                        className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border ${
                          selectedRoundId === (round.id || round._id)
                            ? "border-[#FBBF24] bg-[#FBBF24]/5 shadow-sm"
                            : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            selectedRoundId === (round.id || round._id) ? "bg-[#FBBF24] text-[#102a5a]" : "bg-slate-200/60 text-slate-500"
                          }`}>
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate text-[#102a5a]">{round.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {round.code} · {round.level} · {round.campus}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {/* ===== TAB: ATTENDANCE ===== */}
          {activeTab === "attendance" && (
            <Motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Round Selector Bar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-bold text-[#102a5a] shrink-0">Select Round:</label>
                  <div className="relative flex-1 max-w-md">
                    <select
                      value={selectedRoundId}
                      onChange={(e) => setSelectedRoundId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] cursor-pointer"
                    >
                      {rounds.length === 0 ? (
                        <option value="">No rounds linked</option>
                      ) : (
                        rounds.map((r) => (
                          <option key={r.id || r._id} value={r.id || r._id}>
                            {r.name} ({r.code})
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {selectedRound ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#102a5a]">{selectedRound.name}</h2>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <span className="font-mono text-xs bg-[#102a5a]/5 px-2 py-0.5 rounded-lg border border-[#102a5a]/10">
                            {selectedRound.code}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{selectedRound.level}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{selectedRound.campus}</span>
                        </div>
                      </div>

                      {/* Session select */}
                      <div className="relative">
                        <select
                          value={selectedSessionId}
                          onChange={(e) => setSelectedSessionId(e.target.value)}
                          className="appearance-none min-w-[220px] rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] cursor-pointer"
                        >
                          {sessions.map((s) => (
                            <option key={s.id || s._id} value={s.id || s._id}>
                              {s.title} — {s.date}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search student…"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24]"
                          />
                        </div>
                        <select
                          value={attendanceFilter}
                          onChange={(e) => setAttendanceFilter(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 cursor-pointer"
                        >
                          <option value="all">All</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          {attendanceCounts.present}/{attendanceCounts.total}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleBulkUpdate(true)}
                          disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                          className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          All Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkUpdate(false)}
                          disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                          className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                          All Absent
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    {selectedEnrollments.length ? (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                          {filteredEnrollments.map((enrollment) => {
                            const eId = enrollment.id || enrollment._id;
                            const isPresent = getAttendanceStatus(enrollment);
                            return (
                              <tr key={eId} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="whitespace-nowrap px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                      {(enrollment.childName || "?")[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-[#102a5a]">
                                      {enrollment.childName || "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                                  {enrollment.parentName || "—"}
                                </td>
                                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 font-medium">
                                  {enrollment.phone || "—"}
                                </td>
                                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                                  <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <span className={`text-sm font-medium transition-colors ${isPresent ? "text-emerald-600" : "text-slate-400"}`}>
                                      {isPresent ? "Present" : "Absent"}
                                    </span>
                                    <div className="relative flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={isPresent}
                                        onChange={(e) => updateAttendance(eId, e.target.checked)}
                                        className="peer sr-only"
                                      />
                                      <div className={`h-6 w-11 rounded-full transition-colors duration-200 ${isPresent ? "bg-emerald-500" : "bg-slate-200"}`} />
                                      <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isPresent ? "translate-x-5" : "translate-x-0"}`} />
                                    </div>
                                  </label>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#102a5a]">No students found</h3>
                        <p className="mt-1 text-sm text-slate-500">No students linked to this round yet.</p>
                      </div>
                    )}

                    {selectedEnrollments.length > 0 && filteredEnrollments.length === 0 && (
                      <div className="text-center py-10 text-sm text-slate-500">
                        No students match your search or filter.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mb-4 mx-auto">
                    <ClipboardList className="w-6 h-6 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#102a5a]">No Round Selected</h3>
                  <p className="mt-2 text-sm text-slate-500">Link a round from the Overview tab to get started.</p>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="mt-4 rounded-xl bg-[#102a5a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3a6b] transition-all"
                  >
                    Go to Overview
                  </button>
                </div>
              )}
            </Motion.div>
          )}

          {/* ===== TAB: UPCOMING SESSIONS ===== */}
          {activeTab === "sessions" && (
            <Motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-[#FBBF24]" />
                    </div>
                    <h2 className="text-base font-bold text-[#102a5a]">Upcoming Sessions</h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FBBF24]/10 px-2.5 py-0.5 text-xs font-bold text-[#92400e]">
                    {upcomingSessions.length} Scheduled
                  </span>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-10 border-t border-slate-100">
                    <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No upcoming sessions on your schedule.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id || session._id}
                        className={`rounded-2xl border p-4 hover:shadow-md transition-all ${
                          session._type === "free"
                            ? "border-emerald-200 bg-emerald-50/50 hover:bg-white hover:border-emerald-300"
                            : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#FBBF24]/30"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-[#102a5a] text-sm">
                            {session.title || "Untitled Session"}
                          </p>
                          {session._type === "free" && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Free
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                          {session.date} · {session.time}
                        </div>

                        {session._type === "free" ? (
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              <span><b className="text-[#102a5a]">Parent:</b> {session.parentName}</span>
                              <span><b className="text-[#102a5a]">Phone:</b> {session.phone}</span>
                            </div>
                            <p><b className="text-[#102a5a]">Child:</b> {session.childName}{session.childAge ? ` (${session.childAge} yrs)` : ""}</p>
                            {session.notes?.length > 0 && (
                              <div className="mt-1.5 text-[11px] text-slate-500 bg-white/70 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                <b className="text-slate-600">Notes:</b> {session.notes.join(" | ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#102a5a]/5 px-2.5 py-1 text-xs text-[#102a5a] border border-[#102a5a]/10">
                            <span className="font-semibold truncate max-w-[120px]">{session.roundName}</span>
                            {session.roundCode && (
                              <>
                                <span className="text-[#102a5a]/30">·</span>
                                <span className="font-mono text-[#102a5a]/70">{session.roundCode}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {/* ===== TAB: EVALUATIONS ===== */}
          {activeTab === "evaluations" && (
            <Motion.div
              key="evaluations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#102a5a]/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#102a5a]" />
                    </div>
                    <h2 className="text-base font-bold text-[#102a5a]">Trial Session Evaluations</h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#102a5a]/10 px-2.5 py-0.5 text-xs font-bold text-[#102a5a]">
                    {trialLeads.length} Leads
                  </span>
                </div>

                {trialLeads.length === 0 ? (
                  <div className="text-center py-10 border-t border-slate-100">
                    <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No demo leads available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trialLeads.map((lead) => {
                      const leadId = lead.id || lead._id;
                      const draft = evaluationDrafts[leadId] || {
                        strengths: "",
                        favoriteProject: "",
                      };
                      return (
                        <div
                          key={leadId}
                          className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                            <div>
                              <p className="text-sm font-semibold text-[#102a5a]">
                                {lead.parentName} · {lead.childName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Status: {lead.status || "New"} · Phone: {lead.phone || "-"}
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Last: {lead.trainerEvaluation?.updatedAt
                                ? new Date(lead.trainerEvaluation.updatedAt).toLocaleString()
                                : "-"}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            <textarea
                              rows={2}
                              value={draft.strengths}
                              onChange={(e) => handleEvaluationDraftChange(leadId, "strengths", e.target.value)}
                              placeholder="Child strengths..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24]"
                            />
                            <textarea
                              rows={2}
                              value={draft.favoriteProject}
                              onChange={(e) => handleEvaluationDraftChange(leadId, "favoriteProject", e.target.value)}
                              placeholder="Favorite project..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24]"
                            />
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => saveLeadEvaluation(leadId)}
                              disabled={isSavingEvaluationId === leadId}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#102a5a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6b] disabled:opacity-50 transition-all"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {isSavingEvaluationId === leadId ? "Saving..." : "Save Evaluation"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {/* ===== TAB: WORKING HOURS ===== */}
          {activeTab === "workingHours" && (
            <Motion.div
              key="working-hours"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#102a5a]/10 flex items-center justify-center">
                      <Clock3 className="w-4 h-4 text-[#102a5a]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#102a5a]">Working Hours</h2>
                      <p className="text-xs text-slate-500">
                        Choose your available hours each day. Sales can only book from these slots.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={saveWorkingHours}
                    disabled={isSavingWorkingHours}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102a5a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a3a6b] disabled:opacity-50 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingWorkingHours ? "Saving..." : "Save Working Hours"}
                  </button>
                </div>

                {workingHoursMessage && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    {workingHoursMessage}
                  </div>
                )}

                <div className="mb-3 text-xs text-slate-500">
                  Check the hours where you are available. Each checkbox means one full hour.
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-[1480px] w-full border-collapse">
                    <thead className="bg-slate-100/90">
                      <tr>
                        <th className="sticky left-0 z-20 w-[96px] min-w-[96px] max-w-[96px] border-b border-r border-slate-200 bg-slate-100 px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Day
                        </th>
                        {HOUR_COLUMNS.map((column) => (
                          <th
                            key={`hour-header-${column.hour}`}
                            className="border-b border-r border-slate-200 px-1.5 py-2 text-center"
                          >
                            <p className="text-xs font-bold text-[#102a5a] leading-none">{column.numberLabel}</p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              {column.periodLabel}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {WEEK_DAY_ITEMS.map((dayItem) => {
                        const row = workingHoursGrid[dayItem.key] || [];
                        const isEnabled = row
                          .slice(DISPLAY_START_HOUR, DISPLAY_END_HOUR + 1)
                          .some(Boolean);

                        return (
                          <tr key={dayItem.key} className="even:bg-slate-50/50">
                            <th className="sticky left-0 z-10 w-[96px] min-w-[96px] max-w-[96px] border-b border-r border-slate-200 bg-white px-2 py-1.5 text-left align-top">
                              <p title={dayItem.label} className="truncate text-xs font-semibold text-[#102a5a]">
                                {dayItem.label}
                              </p>
                              <label className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={(e) => toggleWorkingDay(dayItem.key, e.target.checked)}
                                  className="h-3 w-3 rounded border-slate-300 text-[#102a5a] focus:ring-[#FBBF24]"
                                />
                                All day
                              </label>
                            </th>
                            {HOUR_COLUMNS.map((column) => {
                              const checked = Boolean(row[column.hour]);
                              return (
                                <td
                                  key={`${dayItem.key}-hour-${column.hour}`}
                                  className="border-b border-r border-slate-200 p-1 text-center"
                                >
                                  <label className={`mx-auto inline-flex h-6 w-6 items-center justify-center rounded-md transition-all ${checked ? "border-emerald-500 bg-emerald-100" : "border-slate-300 bg-white hover:border-[#FBBF24]"}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleWorkingHourCell(dayItem.key, column.hour)}
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs bg-[#071228] mt-auto">
        <p className="text-slate-500">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default InstructorDashboard;
