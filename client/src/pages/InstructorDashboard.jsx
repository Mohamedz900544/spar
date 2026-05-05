import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  RefreshCw,
  LogOut,
  CalendarClock,
  ChevronDown,
  Sparkles,
  ClipboardList,
  LayoutDashboard,
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
  {
    key: "saturday",
    label: "Saturday",
    rowClass: "bg-rose-100/70",
    stickyClass: "bg-rose-100",
    checkedCellClass: "border-rose-500 bg-rose-200",
    checkboxClass: "text-rose-700 focus:ring-rose-600",
  },
  {
    key: "sunday",
    label: "Sunday",
    rowClass: "bg-orange-100/70",
    stickyClass: "bg-orange-100",
    checkedCellClass: "border-orange-500 bg-orange-200",
    checkboxClass: "text-orange-700 focus:ring-orange-600",
  },
  {
    key: "monday",
    label: "Monday",
    rowClass: "bg-amber-100/65",
    stickyClass: "bg-amber-100",
    checkedCellClass: "border-amber-500 bg-amber-200",
    checkboxClass: "text-amber-700 focus:ring-amber-600",
  },
  {
    key: "tuesday",
    label: "Tuesday",
    rowClass: "bg-lime-100/65",
    stickyClass: "bg-lime-100",
    checkedCellClass: "border-lime-500 bg-lime-200",
    checkboxClass: "text-lime-700 focus:ring-lime-600",
  },
  {
    key: "wednesday",
    label: "Wednesday",
    rowClass: "bg-sky-100/65",
    stickyClass: "bg-sky-100",
    checkedCellClass: "border-sky-500 bg-sky-200",
    checkboxClass: "text-sky-700 focus:ring-sky-600",
  },
  {
    key: "thursday",
    label: "Thursday",
    rowClass: "bg-indigo-100/65",
    stickyClass: "bg-indigo-100",
    checkedCellClass: "border-indigo-500 bg-indigo-200",
    checkboxClass: "text-indigo-700 focus:ring-indigo-600",
  },
  {
    key: "friday",
    label: "Friday",
    rowClass: "bg-violet-100/65",
    stickyClass: "bg-violet-100",
    checkedCellClass: "border-violet-500 bg-violet-200",
    checkboxClass: "text-violet-700 focus:ring-violet-600",
  },
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

const SESSION_DURATION_MS = 60 * 60 * 1000;
const SESSION_STATUS_META = {
  upcoming: {
    label: "Upcoming",
    badgeClass: "border border-amber-200 bg-amber-50 text-amber-700",
    hintClass: "text-amber-700",
  },
  active: {
    label: "Active",
    badgeClass: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    hintClass: "text-emerald-700",
  },
  completed: {
    label: "Completed",
    badgeClass: "border border-slate-300 bg-slate-100 text-slate-600",
    hintClass: "text-slate-600",
  },
};
const STATUS_SORT_ORDER = { active: 0, upcoming: 1, completed: 2 };

const toNextDayStartTs = (sourceTs) => {
  if (!Number.isFinite(sourceTs)) return Number.NEGATIVE_INFINITY;
  const nextDay = new Date(sourceTs);
  nextDay.setHours(24, 0, 0, 0);
  return nextDay.getTime();
};

const parseRoundSessionStartTs = (session) => {
  const dateText = (session?.date || "").toString().trim();
  const timeTextRaw = (session?.time || "").toString().trim();
  if (!dateText) return Number.NaN;

  const timeText = /^\d{2}:\d{2}$/.test(timeTextRaw) ? `${timeTextRaw}:00` : timeTextRaw;
  const candidates = [
    `${dateText}T${timeText || "00:00:00"}`,
    `${dateText} ${timeTextRaw || "00:00"}`,
    dateText,
  ];

  for (const candidate of candidates) {
    const parsed = Date.parse(candidate);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return Number.NaN;
};

const getSessionLifecycleStatus = (startTs, endTs, nowTs) => {
  if (nowTs < startTs) return "upcoming";
  if (nowTs >= startTs && nowTs < endTs) return "active";
  return "completed";
};

const formatSessionDateLabel = (ts) =>
  new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatSessionTimeLabel = (ts) =>
  new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatCountdownLabel = (startTs, nowTs) => {
  const diffMinutes = Math.max(1, Math.round((startTs - nowTs) / 60000));
  if (diffMinutes < 60) return `After ${diffMinutes}m`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `After ${hours}h${minutes ? ` ${minutes}m` : ""}`;
};

const buildLifecycleHint = (status, startTs, endTs, nowTs) => {
  if (status === "upcoming") {
    return formatCountdownLabel(startTs, nowTs);
  }
  if (status === "active") {
    return `Ends ${formatSessionTimeLabel(endTs)}`;
  }
  return "Completed";
};

const getStatusMeta = (status) => SESSION_STATUS_META[status] || SESSION_STATUS_META.upcoming;

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
  const [isSavingFreeSessionAttendanceId, setIsSavingFreeSessionAttendanceId] = useState("");
  const [evaluationMessage, setEvaluationMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [timelineNow, setTimelineNow] = useState(() => Date.now());
  const [selectedOverviewSessionKey, setSelectedOverviewSessionKey] = useState("");
  const [showLinkedRounds, setShowLinkedRounds] = useState(false);
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
  useEffect(() => {
    const timer = setInterval(() => setTimelineNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const selectedRound = useMemo(
    () => rounds.find((r) => (r.id || r._id) === selectedRoundId),
    [rounds, selectedRoundId]
  );
  const sessions = useMemo(() => selectedRound?.sessions || [], [selectedRound]);
  const selectedEnrollments = useMemo(
    () => selectedRound?.enrollments || [],
    [selectedRound]
  );
  const upcomingSessions = useMemo(() => {
    const nowTs = timelineNow;

    const roundItems = rounds.flatMap((round) =>
      (round.sessions || []).map((session) => {
        const startTs = parseRoundSessionStartTs(session);
        const endTs = Number.isFinite(startTs) ? startTs + SESSION_DURATION_MS : Number.NaN;
        const lifecycleStatus = Number.isFinite(startTs)
          ? getSessionLifecycleStatus(startTs, endTs, nowTs)
          : "upcoming";

        return {
          key: `round:${session.id || session._id}`,
          id: session.id || session._id,
          sessionType: "round",
          _type: "round",
          sessionId: session.id || session._id,
          roundId: round.id || round._id,
          roundName: round.name,
          roundCode: round.code,
          roundLevel: round.level,
          title: session.title || "Untitled Session",
          date: session.date,
          time: session.time,
          startTs,
          endTs,
          visibleUntilTs: toNextDayStartTs(startTs),
          lifecycleStatus,
          hintText: Number.isFinite(startTs)
            ? buildLifecycleHint(lifecycleStatus, startTs, endTs, nowTs)
            : "Time unavailable",
          dateLabel: Number.isFinite(startTs) ? formatSessionDateLabel(startTs) : session.date || "-",
          timeLabel: Number.isFinite(startTs) ? formatSessionTimeLabel(startTs) : session.time || "-",
        };
      })
    );

    const freeItems = freeSessions.map((session) => {
      const startTs = session.scheduledAt ? new Date(session.scheduledAt).getTime() : Number.NaN;
      const fallbackEndTs = Number.isFinite(startTs)
        ? startTs + (Number(session.durationMinutes) || 60) * 60 * 1000
        : Number.NaN;
      const endTs = session.endsAt ? new Date(session.endsAt).getTime() : fallbackEndTs;
      const lifecycleStatus = Number.isFinite(startTs)
        ? getSessionLifecycleStatus(startTs, endTs, nowTs)
        : "upcoming";

      return {
        key: `free:${session.id}`,
        id: session.id,
        sessionType: "free",
        _type: "free",
        leadId: session.id,
        title: `Free Session - ${session.childName || "Child"}`,
        parentName: session.parentName,
        childName: session.childName,
        childAge: session.childAge,
        phone: session.phone,
        notes: session.notes || [],
        leadStatus: session.status,
        childShowedUp: session.childShowedUp,
        startTs,
        endTs,
        visibleUntilTs: toNextDayStartTs(startTs),
        lifecycleStatus,
        hintText: Number.isFinite(startTs)
          ? buildLifecycleHint(lifecycleStatus, startTs, endTs, nowTs)
          : "Time unavailable",
        dateLabel: Number.isFinite(startTs) ? formatSessionDateLabel(startTs) : "-",
        timeLabel: Number.isFinite(startTs) ? formatSessionTimeLabel(startTs) : "-",
      };
    });

    return [...roundItems, ...freeItems]
      .filter((session) => Number.isFinite(session.startTs))
      .filter((session) => nowTs < session.visibleUntilTs)
      .sort((a, b) => {
        const statusDiff =
          (STATUS_SORT_ORDER[a.lifecycleStatus] ?? 99) -
          (STATUS_SORT_ORDER[b.lifecycleStatus] ?? 99);
        if (statusDiff !== 0) return statusDiff;
        if (a.lifecycleStatus === "completed") return b.startTs - a.startTs;
        return a.startTs - b.startTs;
      })
      .slice(0, 20);
  }, [freeSessions, rounds, timelineNow]);

  useEffect(() => {
    if (!upcomingSessions.length) {
      setSelectedOverviewSessionKey("");
      return;
    }

    const stillExists = upcomingSessions.some((session) => session.key === selectedOverviewSessionKey);
    if (!selectedOverviewSessionKey || !stillExists) {
      setSelectedOverviewSessionKey(upcomingSessions[0].key);
    }
  }, [upcomingSessions, selectedOverviewSessionKey]);

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

  const updateAttendance = async (enrollmentId, present, context = {}) => {
    const targetSessionId = context.sessionId || selectedSessionId;
    const targetRoundId = context.roundId || selectedRoundId;
    const token = localStorage.getItem("sparvi_token");
    if (!token || !targetSessionId) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/instructor/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enrollmentId, sessionId: targetSessionId, present }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update attendance");
      setRounds((prev) =>
        prev.map((round) => {
          if ((round.id || round._id) !== targetRoundId) return round;
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
    (enrollment, sessionIdOverride) => {
      const targetSessionId = sessionIdOverride || selectedSessionId;
      if (!targetSessionId) return false;
      const record = (enrollment.attendance || []).find(
        (a) => (a.session || "").toString() === targetSessionId
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

  const selectedOverviewSession = useMemo(
    () => upcomingSessions.find((session) => session.key === selectedOverviewSessionKey) || null,
    [upcomingSessions, selectedOverviewSessionKey]
  );

  const overviewRound = useMemo(() => {
    if (!selectedOverviewSession || selectedOverviewSession.sessionType !== "round") return null;
    return (
      rounds.find((round) => (round.id || round._id) === selectedOverviewSession.roundId) || null
    );
  }, [rounds, selectedOverviewSession]);

  const overviewEnrollments = useMemo(() => overviewRound?.enrollments || [], [overviewRound]);

  const overviewAttendanceCounts = useMemo(() => {
    if (!selectedOverviewSession || selectedOverviewSession.sessionType !== "round") {
      return { present: 0, total: 0 };
    }
    const total = overviewEnrollments.length;
    const present = overviewEnrollments.filter((enrollment) =>
      getAttendanceStatus(enrollment, selectedOverviewSession.sessionId)
    ).length;
    return { present, total };
  }, [getAttendanceStatus, overviewEnrollments, selectedOverviewSession]);

  const selectedOverviewLead = useMemo(() => {
    if (!selectedOverviewSession || selectedOverviewSession.sessionType !== "free") return null;
    return (
      trialLeads.find((lead) => (lead.id || lead._id) === selectedOverviewSession.leadId) || null
    );
  }, [selectedOverviewSession, trialLeads]);

  const selectedOverviewLeadId = selectedOverviewLead
    ? selectedOverviewLead.id || selectedOverviewLead._id
    : "";

  const selectedOverviewEvaluationDraft = selectedOverviewLeadId
    ? (evaluationDrafts[selectedOverviewLeadId] || { strengths: "", favoriteProject: "" })
    : { strengths: "", favoriteProject: "" };

  const selectedOverviewChildShowedUp =
    selectedOverviewLead?.freeSession?.childShowedUp ?? selectedOverviewSession?.childShowedUp ?? null;

  const handleSelectOverviewSession = (session) => {
    setSelectedOverviewSessionKey(session.key);
    if (session.sessionType === "round") {
      setSelectedRoundId(session.roundId);
      setSelectedSessionId(session.sessionId);
      return;
    }

    const matchingLead = trialLeads.find((lead) => (lead.id || lead._id) === session.leadId);
    if (!matchingLead) return;
    const leadId = matchingLead.id || matchingLead._id;
    setEvaluationDrafts((prev) => {
      if (prev[leadId]) return prev;
      return {
        ...prev,
        [leadId]: {
          strengths: matchingLead.trainerEvaluation?.strengths || "",
          favoriteProject: matchingLead.trainerEvaluation?.favoriteProject || "",
        },
      };
    });
  };

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

  const handleOverviewBulkUpdate = async (present) => {
    if (!selectedOverviewSession || selectedOverviewSession.sessionType !== "round") return;
    if (overviewEnrollments.length === 0) return;

    setIsBulkUpdating(true);
    try {
      await Promise.all(
        overviewEnrollments.map((enrollment) =>
          updateAttendance(enrollment.id || enrollment._id, present, {
            sessionId: selectedOverviewSession.sessionId,
            roundId: selectedOverviewSession.roundId,
          })
        )
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
      setEvaluationMessage("");
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
      setEvaluationMessage("Evaluation saved successfully.");
      setTimeout(() => setEvaluationMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save evaluation");
    } finally {
      setIsSavingEvaluationId("");
    }
  };

  const saveFreeSessionAttendance = async (leadId, childShowedUp) => {
    const token = localStorage.getItem("sparvi_token");
    if (!token) { navigate("/login"); return; }

    try {
      setIsSavingFreeSessionAttendanceId(leadId);
      setEvaluationMessage("");
      const res = await fetch(`${API_BASE_URL}/api/instructor/trial-leads/${leadId}/free-session-attendance`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childShowedUp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save attendance");

      setTrialLeads((prev) =>
        prev.map((lead) => {
          const currentId = lead.id || lead._id;
          return currentId === leadId ? data : lead;
        })
      );
      setFreeSessions((prev) =>
        prev.map((session) =>
          session.id === leadId
            ? { ...session, childShowedUp: data.freeSession?.childShowedUp ?? childShowedUp }
            : session
        )
      );
      setError("");
      setEvaluationMessage("Free session attendance saved.");
      setTimeout(() => setEvaluationMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setIsSavingFreeSessionAttendanceId("");
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
          <AnimatePresence>
            {evaluationMessage && (
              <Motion.div
                key="evaluation-toast"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="fixed right-6 top-20 z-50 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-[0_18px_40px_-20px_rgba(16,42,90,0.55)] backdrop-blur"
              >
                {evaluationMessage}
              </Motion.div>
            )}
          </AnimatePresence>

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
              className="space-y-5"
            >
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <form
                  onSubmit={handleLinkRound}
                  className="grid grid-cols-1 gap-2 lg:grid-cols-[150px_1fr_auto_auto]"
                >
                  <label className="self-center text-sm font-semibold text-[#102a5a]">
                    Link New Round
                  </label>
                  <input
                    type="text"
                    value={roundCode}
                    onChange={(e) => setRoundCode(e.target.value)}
                    placeholder="Enter code here"
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/50"
                  />
                  <button
                    type="submit"
                    disabled={isLinking || !roundCode.trim()}
                    className="rounded-xl bg-[#FBBF24] px-5 py-2.5 text-sm font-bold text-[#102a5a] transition-all hover:bg-[#F59E0B] disabled:opacity-50"
                  >
                    {isLinking ? "Linking..." : "Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkedRounds((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    {showLinkedRounds ? "Hide linked rounds" : "See all rounds linked"}
                  </button>
                </form>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr]">
                  <div className="border-b border-slate-100 xl:border-b-0 xl:border-r">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h2 className="text-sm font-bold text-[#102a5a]">Upcoming Sessions</h2>
                      <span className="inline-flex items-center rounded-full bg-[#FBBF24]/10 px-2.5 py-0.5 text-xs font-semibold text-[#92400e]">
                        {upcomingSessions.length}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">Loading sessions...</div>
                    ) : upcomingSessions.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">
                        No sessions yet. Linked sessions will appear here.
                      </div>
                    ) : (
                      <div className="max-h-[620px] overflow-y-auto">
                        {upcomingSessions.map((session) => {
                          const statusMeta = getStatusMeta(session.lifecycleStatus);
                          const isSelected = selectedOverviewSessionKey === session.key;

                          return (
                            <button
                              key={session.key}
                              type="button"
                              onClick={() => handleSelectOverviewSession(session)}
                              className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors ${
                                isSelected ? "bg-[#FBBF24]/10" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-[#102a5a]">{session.title}</p>
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
                    {showLinkedRounds && (
                      <div className="border-b border-slate-100 p-4">
                        {rounds.length === 0 ? (
                          <p className="text-sm text-slate-500">No linked rounds yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {rounds.map((round) => {
                              const roundId = round.id || round._id;
                              const isSelectedRound = selectedRoundId === roundId;

                              return (
                                <button
                                  key={roundId}
                                  type="button"
                                  onClick={() => setSelectedRoundId(roundId)}
                                  className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                                    isSelectedRound
                                      ? "border-[#FBBF24] bg-[#FBBF24]/10 text-[#102a5a]"
                                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <p>{round.name}</p>
                                  <p className="mt-0.5 text-[11px] text-slate-500">{round.code}</p>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 lg:p-5">
                      {!selectedOverviewSession ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                          Select any upcoming session from the list to add attendance or evaluation.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-[#102a5a]">{selectedOverviewSession.title}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {selectedOverviewSession.dateLabel} at {selectedOverviewSession.timeLabel}
                                  {selectedOverviewSession.roundName ? ` - ${selectedOverviewSession.roundName}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusMeta(selectedOverviewSession.lifecycleStatus).badgeClass}`}>
                                  {getStatusMeta(selectedOverviewSession.lifecycleStatus).label}
                                </span>
                                <span className={`text-xs font-semibold ${getStatusMeta(selectedOverviewSession.lifecycleStatus).hintClass}`}>
                                  {selectedOverviewSession.hintText}
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedOverviewSession.sessionType === "round" ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-100">
                              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold text-[#102a5a]">Attendance</h3>
                                  <p className="text-xs text-slate-500">
                                    {overviewAttendanceCounts.present}/{overviewAttendanceCounts.total} marked present
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOverviewBulkUpdate(true)}
                                    disabled={isBulkUpdating || overviewEnrollments.length === 0}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    All Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOverviewBulkUpdate(false)}
                                    disabled={isBulkUpdating || overviewEnrollments.length === 0}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    All Absent
                                  </button>
                                </div>
                              </div>

                              {overviewEnrollments.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-slate-500">
                                  No students linked to this round.
                                </div>
                              ) : (
                                <div className="max-h-[420px] overflow-auto">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Parent</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Attendance</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {overviewEnrollments.map((enrollment) => {
                                        const enrollmentId = enrollment.id || enrollment._id;
                                        const isPresent = getAttendanceStatus(
                                          enrollment,
                                          selectedOverviewSession.sessionId
                                        );

                                        return (
                                          <tr key={enrollmentId} className="hover:bg-slate-50/70">
                                            <td className="px-4 py-3 font-medium text-[#102a5a]">
                                              {enrollment.childName || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{enrollment.parentName || "-"}</td>
                                            <td className="px-4 py-3 text-right">
                                              <label className="inline-flex cursor-pointer items-center gap-2">
                                                <span className={`text-xs font-semibold ${isPresent ? "text-emerald-600" : "text-slate-400"}`}>
                                                  {isPresent ? "Present" : "Absent"}
                                                </span>
                                                <input
                                                  type="checkbox"
                                                  checked={isPresent}
                                                  onChange={(e) =>
                                                    updateAttendance(enrollmentId, e.target.checked, {
                                                      sessionId: selectedOverviewSession.sessionId,
                                                      roundId: selectedOverviewSession.roundId,
                                                    })
                                                  }
                                                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                                />
                                              </label>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-slate-100 p-4">
                              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold text-[#102a5a]">Evaluation</h3>
                                  <p className="text-xs text-slate-500">
                                    Fill child strengths and favorite project directly from this free session.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("evaluations")}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                  Open all evaluations
                                </button>
                              </div>

                              {selectedOverviewLead ? (
                                <>
                                  <p className="mb-3 text-xs text-slate-500">
                                    Parent: {selectedOverviewLead.parentName || "-"} - Child: {selectedOverviewLead.childName || "-"}
                                  </p>
                                  <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-xs font-bold text-[#102a5a]">Did the kid show?</p>
                                      <p className="text-[11px] text-slate-500">
                                        This will be included in the automated follow-up message.
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => saveFreeSessionAttendance(selectedOverviewLeadId, true)}
                                        disabled={
                                          !selectedOverviewLeadId ||
                                          isSavingFreeSessionAttendanceId === selectedOverviewLeadId
                                        }
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                          selectedOverviewChildShowedUp === true
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                        } disabled:opacity-50`}
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveFreeSessionAttendance(selectedOverviewLeadId, false)}
                                        disabled={
                                          !selectedOverviewLeadId ||
                                          isSavingFreeSessionAttendanceId === selectedOverviewLeadId
                                        }
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                          selectedOverviewChildShowedUp === false
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
                                        } disabled:opacity-50`}
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                                    <textarea
                                      rows={3}
                                      value={selectedOverviewEvaluationDraft.strengths}
                                      onChange={(e) =>
                                        handleEvaluationDraftChange(selectedOverviewLeadId, "strengths", e.target.value)
                                      }
                                      placeholder="Child strengths..."
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/50"
                                    />
                                    <textarea
                                      rows={3}
                                      value={selectedOverviewEvaluationDraft.favoriteProject}
                                      onChange={(e) =>
                                        handleEvaluationDraftChange(selectedOverviewLeadId, "favoriteProject", e.target.value)
                                      }
                                      placeholder="Favorite project..."
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/50"
                                    />
                                  </div>
                                  <div className="mt-3 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => saveLeadEvaluation(selectedOverviewLeadId)}
                                      disabled={!selectedOverviewLeadId || isSavingEvaluationId === selectedOverviewLeadId}
                                      className="inline-flex items-center gap-2 rounded-xl bg-[#102a5a] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#1a3a6b] disabled:opacity-50"
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                      {isSavingEvaluationId === selectedOverviewLeadId ? "Saving..." : "Save Evaluation"}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                  Evaluation is not available for this free session yet. Please refresh or open the Evaluations tab.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                    {upcomingSessions.length} Visible
                  </span>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-10 border-t border-slate-100">
                    <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No sessions on your schedule.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {upcomingSessions.map((session) => {
                      const statusMeta = getStatusMeta(session.lifecycleStatus);

                      return (
                        <button
                          key={session.key}
                          type="button"
                          onClick={() => {
                            handleSelectOverviewSession(session);
                            setActiveTab("overview");
                          }}
                          className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
                            session._type === "free"
                              ? "border-emerald-200 bg-emerald-50/50 hover:bg-white hover:border-emerald-300"
                              : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#FBBF24]/30"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#102a5a]">
                              {session.title || "Untitled Session"}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {session._type === "free" && (
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Free
                                </span>
                              )}
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badgeClass}`}>
                                {statusMeta.label}
                              </span>
                            </div>
                          </div>

                          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                            {session.dateLabel} - {session.timeLabel}
                          </div>

                          <p className={`mb-3 text-xs font-semibold ${statusMeta.hintClass}`}>
                            {session.hintText}
                          </p>

                          {session._type === "free" ? (
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                <span><b className="text-[#102a5a]">Parent:</b> {session.parentName || "-"}</span>
                                <span><b className="text-[#102a5a]">Phone:</b> {session.phone || "-"}</span>
                              </div>
                              <p>
                                <b className="text-[#102a5a]">Child:</b> {session.childName || "-"}
                                {session.childAge ? ` (${session.childAge} yrs)` : ""}
                              </p>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#102a5a]/10 bg-[#102a5a]/5 px-2.5 py-1 text-xs text-[#102a5a]">
                              <span className="max-w-[120px] truncate font-semibold">{session.roundName}</span>
                              {session.roundCode && (
                                <>
                                  <span className="text-[#102a5a]/30">-</span>
                                  <span className="font-mono text-[#102a5a]/70">{session.roundCode}</span>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
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

                          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#102a5a]">Did the kid show?</p>
                              <p className="text-[11px] text-slate-500">
                                Included in the automated follow-up message.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveFreeSessionAttendance(leadId, true)}
                                disabled={isSavingFreeSessionAttendanceId === leadId}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                  lead.freeSession?.childShowedUp === true
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                } disabled:opacity-50`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => saveFreeSessionAttendance(leadId, false)}
                                disabled={isSavingFreeSessionAttendanceId === leadId}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                  lead.freeSession?.childShowedUp === false
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
                                } disabled:opacity-50`}
                              >
                                No
                              </button>
                            </div>
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

                <div
                  className="overflow-x-auto rounded-2xl border border-slate-200 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:hover:bg-slate-500"
                  style={{ scrollbarColor: "#94a3b8 #e2e8f0", scrollbarWidth: "thin" }}
                >
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
                          <tr key={dayItem.key} className={dayItem.rowClass}>
                            <th className={`sticky left-0 z-10 w-[96px] min-w-[96px] max-w-[96px] border-b border-r border-slate-200 px-2 py-1.5 text-left align-top ${dayItem.stickyClass}`}>
                              <p title={dayItem.label} className="truncate text-xs font-semibold text-[#102a5a]">
                                {dayItem.label}
                              </p>
                              <label className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={(e) => toggleWorkingDay(dayItem.key, e.target.checked)}
                                  className={`h-3 w-3 rounded border-slate-300 ${dayItem.checkboxClass}`}
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
                                  <label className={`mx-auto inline-flex h-6 w-6 items-center justify-center rounded-md transition-all ${checked ? dayItem.checkedCellClass : "border-slate-300 bg-white/80 hover:border-[#FBBF24]"}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleWorkingHourCell(dayItem.key, column.hour)}
                                      className={`h-3.5 w-3.5 rounded border-slate-300 ${dayItem.checkboxClass}`}
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
