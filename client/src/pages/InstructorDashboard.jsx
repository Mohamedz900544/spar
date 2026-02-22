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
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ======= STAT CARD ======= */
const StatCard = ({ icon: Icon, label, value, accent, extra }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-sm hover:shadow-md transition-all group">
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

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("sparvi_token");
    const role = localStorage.getItem("sparvi_role");
    if (!token || role !== "instructor") { navigate("/login"); return; }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/instructor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
      setRounds(data.rounds || []);
      if (data.rounds?.length) {
        const firstRoundId = data.rounds[0].id || data.rounds[0]._id;
        setSelectedRoundId((prev) => prev || firstRoundId);
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
    if (!rounds.length) return [];
    const now = Date.now();
    const norm = (v) => (v || "").toString().trim();
    const toTs = (s) => {
      const d = norm(s.date); const t = norm(s.time);
      if (!d) return Infinity;
      const p = Date.parse(t ? `${d} ${t}` : d);
      return Number.isNaN(p) ? Infinity : p;
    };
    return rounds
      .flatMap((r) =>
        (r.sessions || []).map((s) => ({
          ...s, roundName: r.name, roundCode: r.code, roundLevel: r.level,
        }))
      )
      .map((s) => ({ session: s, ts: toTs(s) }))
      .filter((i) => i.ts >= now)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 5)
      .map((i) => i.session);
  }, [rounds]);

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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Motion.div
            className="absolute top-[18%] left-[8%] w-3 h-3 rounded-full bg-[#FBBF24]/30"
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <Motion.div
            className="absolute top-[35%] right-[12%] w-2 h-2 rounded-full bg-[#2dd4bf]/40"
            animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 6, delay: 1, repeat: Infinity }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-[#2dd4bf]/5 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 pt-8 pb-20">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FBBF24] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#102a5a]" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Sparvi Lab</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboard}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm border border-white/10">
              <ClipboardList className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                Instructor Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Instructor <span className="text-[#FBBF24]">Dashboard</span>
            </h1>
            <p className="text-slate-300 text-base max-w-lg">
              Link rounds, manage attendance, and track your upcoming sessions.
            </p>
          </Motion.div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 -mt-10 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-5 py-3.5 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Stats Row */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            <StatCard icon={BookOpen} label="Linked Rounds" value={totalRounds} accent="#102a5a" />
            <StatCard icon={Users} label="Total Students" value={totalStudents} accent="#10b981" />
            <StatCard
              icon={CheckCircle2}
              label="Session Attendance"
              value={attendanceCounts.present}
              accent="#FBBF24"
              extra={
                <span className="text-sm text-slate-500 font-medium">
                  / {attendanceCounts.total}
                  {attendanceCounts.absent > 0 && (
                    <span className="text-rose-500 ml-2">
                      ({attendanceCounts.absent} absent)
                    </span>
                  )}
                </span>
              }
            />
          </Motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              {/* Link Round */}
              <Motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-[#FBBF24]" />
                  </div>
                  <h2 className="text-base font-bold text-[#102a5a]">
                    Link New Round
                  </h2>
                </div>
                <form onSubmit={handleLinkRound} className="space-y-3">
                  <input
                    type="text"
                    value={roundCode}
                    onChange={(e) => setRoundCode(e.target.value)}
                    placeholder="Enter round code…"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all uppercase font-mono tracking-wide"
                  />
                  <Motion.button
                    type="submit"
                    disabled={isLinking || !roundCode.trim()}
                    className="w-full rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold py-3 shadow-[0_6px_20px_rgba(251,191,36,0.25)] hover:shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition-all disabled:opacity-50 text-sm"
                    whileTap={{ scale: 0.97 }}
                  >
                    {isLinking ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#102a5a]/30 border-t-[#102a5a] rounded-full animate-spin" />
                        Linking…
                      </span>
                    ) : (
                      "Link Round"
                    )}
                  </Motion.button>
                </form>
              </Motion.div>

              {/* Round List */}
              <Motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden flex flex-col max-h-[500px]"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#102a5a]">
                    Your Rounds
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-[#102a5a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#102a5a]">
                    {rounds.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                    rounds.map((round) => {
                      const isSelected = selectedRoundId === (round.id || round._id);
                      return (
                        <button
                          key={round.id || round._id}
                          type="button"
                          onClick={() => setSelectedRoundId(round.id || round._id)}
                          className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border ${isSelected
                              ? "border-[#FBBF24] bg-[#FBBF24]/5 shadow-sm"
                              : "border-transparent bg-slate-50/50 hover:bg-slate-100/60"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected
                                  ? "bg-[#FBBF24] text-[#102a5a]"
                                  : "bg-slate-200/60 text-slate-500"
                                }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isSelected ? "text-[#102a5a]" : "text-slate-800"}`}>
                                {round.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {round.code} · {round.level} · {round.campus}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </Motion.div>
            </div>

            {/* Right Column: Attendance + Upcoming */}
            <div className="lg:col-span-8 space-y-5">
              {/* Attendance Panel */}
              {selectedRound ? (
                <Motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 md:p-7 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div>
                        <h2 className="text-xl font-bold text-[#102a5a]">
                          {selectedRound.name}
                        </h2>
                        <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
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
                          className="appearance-none min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all cursor-pointer"
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
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search student…"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                          />
                        </div>
                        <select
                          value={attendanceFilter}
                          onChange={(e) => setAttendanceFilter(e.target.value)}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] cursor-pointer"
                        >
                          <option value="all">All Status</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBulkUpdate(true)}
                          disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                          className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          All Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkUpdate(false)}
                          disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                          className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50"
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
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Parent
                            </th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                          {filteredEnrollments.map((enrollment) => {
                            const eId = enrollment.id || enrollment._id;
                            const isPresent = getAttendanceStatus(enrollment);
                            return (
                              <tr key={eId} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                      {(enrollment.childName || "?")[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-[#102a5a]">
                                      {enrollment.childName || "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                  {enrollment.parentName || "—"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-600 font-medium">
                                  {enrollment.phone || "—"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                  <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <span
                                      className={`text-sm font-medium transition-colors ${isPresent ? "text-emerald-600" : "text-slate-400"
                                        }`}
                                    >
                                      {isPresent ? "Present" : "Absent"}
                                    </span>
                                    <div className="relative flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={isPresent}
                                        onChange={(e) => updateAttendance(eId, e.target.checked)}
                                        className="peer sr-only"
                                      />
                                      <div
                                        className={`h-6 w-11 rounded-full transition-colors duration-200 ${isPresent ? "bg-emerald-500" : "bg-slate-200"
                                          }`}
                                      />
                                      <div
                                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isPresent ? "translate-x-5" : "translate-x-0"
                                          }`}
                                      />
                                    </div>
                                  </label>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#102a5a]">
                          No students found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          No students linked to this round yet.
                        </p>
                      </div>
                    )}

                    {selectedEnrollments.length > 0 && filteredEnrollments.length === 0 && (
                      <div className="text-center py-12 text-sm text-slate-500">
                        No students match your search or filter.
                      </div>
                    )}
                  </div>
                </Motion.div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm p-14 text-center min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mb-4">
                    <ClipboardList className="w-7 h-7 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#102a5a]">
                    No Round Selected
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm">
                    Select a round from the sidebar or link a new one.
                  </p>
                </div>
              )}

              {/* Upcoming Sessions */}
              <Motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-[#FBBF24]" />
                    </div>
                    <h2 className="text-base font-bold text-[#102a5a]">
                      Upcoming Sessions
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FBBF24]/10 px-2.5 py-0.5 text-xs font-bold text-[#92400e]">
                    {upcomingSessions.length} Scheduled
                  </span>
                </div>

                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 border-t border-slate-100">
                    No upcoming sessions on your schedule.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id || session._id}
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-white hover:border-[#FBBF24]/30 hover:shadow-sm transition-all"
                      >
                        <p className="font-semibold text-[#102a5a] text-sm mb-1.5">
                          {session.title || "Untitled Session"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                          {session.date} · {session.time}
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#102a5a]/5 px-2.5 py-1 text-xs text-[#102a5a] border border-[#102a5a]/10">
                          <span className="font-semibold truncate max-w-[120px]">
                            {session.roundName}
                          </span>
                          {session.roundCode && (
                            <>
                              <span className="text-[#102a5a]/30">·</span>
                              <span className="font-mono text-[#102a5a]/70">
                                {session.roundCode}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Motion.div>
            </div>
          </div>
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

export default InstructorDashboard;