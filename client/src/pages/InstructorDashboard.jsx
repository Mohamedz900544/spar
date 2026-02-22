import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    if (!token || role !== "instructor") {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/instructor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }
      setRounds(data.rounds || []);
      if (data.rounds?.length) {
        const firstRoundId = data.rounds[0].id || data.rounds[0]._id;
        setSelectedRoundId((prev) => prev || firstRoundId);
      }
      setError("");
    } catch (err) {
      console.error("Instructor dashboard error:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const selectedRound = useMemo(
    () => rounds.find((r) => (r.id || r._id) === selectedRoundId),
    [rounds, selectedRoundId]
  );

  const sessions = useMemo(() => selectedRound?.sessions || [], [selectedRound]);
  const totalRounds = rounds.length;
  const totalStudents = useMemo(
    () =>
      rounds.reduce((sum, round) => sum + (round.enrollments?.length || 0), 0),
    [rounds]
  );
  const selectedEnrollments = useMemo(
    () => selectedRound?.enrollments || [],
    [selectedRound]
  );
  const upcomingSessions = useMemo(() => {
    if (!rounds.length) return [];
    const now = Date.now();
    const normalize = (value) => (value || "").toString().trim();
    const toTimestamp = (session) => {
      const date = normalize(session.date);
      const time = normalize(session.time);
      if (!date) return Number.POSITIVE_INFINITY;
      const parsed = Date.parse(time ? `${date} ${time}` : date);
      return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
    };
    return rounds
      .flatMap((round) =>
        (round.sessions || []).map((session) => ({
          ...session,
          roundName: round.name,
          roundCode: round.code,
          roundLevel: round.level,
        }))
      )
      .map((session) => ({ session, ts: toTimestamp(session) }))
      .filter((item) => item.ts >= now)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 5)
      .map((item) => item.session);
  }, [rounds]);

  useEffect(() => {
    if (!selectedRound) return;
    if (!sessions.length) {
      setSelectedSessionId("");
      return;
    }
    const firstSessionId = sessions[0].id || sessions[0]._id;
    if (!selectedSessionId || !sessions.some((s) => (s.id || s._id) === selectedSessionId)) {
      setSelectedSessionId(firstSessionId);
    }
  }, [selectedRoundId, sessions, selectedSessionId, selectedRound]);

  const handleLinkRound = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("sparvi_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const trimmedCode = roundCode.trim();
    if (!trimmedCode) return;

    try {
      setIsLinking(true);
      const res = await fetch(`${API_BASE_URL}/api/instructor/link-round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: trimmedCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to link round");
      }
      setRounds((prev) => {
        const existing = prev.find((r) => (r.id || r._id) === data.round.id);
        if (existing) return prev;
        return [data.round, ...prev];
      });
      setSelectedRoundId(data.round.id);
      setRoundCode("");
      setError("");
    } catch (err) {
      console.error("Link round error:", err);
      setError(err.message || "Failed to link round");
    } finally {
      setIsLinking(false);
    }
  };

  const updateAttendance = async (enrollmentId, present) => {
    const token = localStorage.getItem("sparvi_token");
    if (!token || !selectedSessionId) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/instructor/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollmentId,
          sessionId: selectedSessionId,
          present,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update attendance");
      }

      setRounds((prev) =>
        prev.map((round) => {
          const roundId = round.id || round._id;
          if (roundId !== (selectedRoundId || "")) return round;
          return {
            ...round,
            enrollments: (round.enrollments || []).map((enrollment) =>
              enrollment.id === enrollmentId ||
                enrollment._id === enrollmentId
                ? { ...enrollment, attendance: data.attendance }
                : enrollment
            ),
          };
        })
      );
      setError("");
    } catch (err) {
      console.error("Attendance update error:", err);
      setError(err.message || "Failed to update attendance");
    }
  };

  const getAttendanceStatus = useCallback(
    (enrollment) => {
      const attendance = enrollment.attendance || [];
      const record = attendance.find(
        (a) => (a.session || "").toString() === selectedSessionId
      );
      return record?.present || false;
    },
    [selectedSessionId]
  );

  const filteredEnrollments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return selectedEnrollments.filter((enrollment) => {
      const matchesSearch = normalizedSearch
        ? [enrollment.childName, enrollment.parentName, enrollment.phone]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(normalizedSearch))
        : true;
      if (!matchesSearch) return false;
      if (attendanceFilter === "all") return true;
      const isPresent = getAttendanceStatus(enrollment);
      return attendanceFilter === "present" ? isPresent : !isPresent;
    });
  }, [attendanceFilter, getAttendanceStatus, searchTerm, selectedEnrollments]);

  const attendanceCounts = useMemo(() => {
    if (!selectedEnrollments.length) {
      return { present: 0, absent: 0, total: 0 };
    }
    const present = selectedEnrollments.filter(getAttendanceStatus).length;
    return {
      present,
      absent: selectedEnrollments.length - present,
      total: selectedEnrollments.length,
    };
  }, [getAttendanceStatus, selectedEnrollments]);

  const handleBulkUpdate = async (present) => {
    if (!selectedSessionId || filteredEnrollments.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        filteredEnrollments.map((enrollment) =>
          updateAttendance(enrollment.id || enrollment._id, present)
        )
      );
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & Stats Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6 md:p-8 bg-gradient-to-r from-white via-white to-slate-50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-[#FBBF24] flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-[#102a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h1 className="text-2xl font-bold text-[#102a5a] tracking-tight">
                    Instructor Dashboard
                  </h1>
                </div>
                <p className="mt-1 text-sm text-slate-500 ml-12">
                  Link your rounds, track daily attendance, and manage student records.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/30 active:scale-[0.98] disabled:opacity-50"
              >
                <svg className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-6 md:p-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#102a5a]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#102a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Rounds</p>
                <p className="mt-1 text-3xl font-bold text-[#102a5a]">{totalRounds}</p>
              </div>
            </div>
            <div className="p-6 md:p-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
                <p className="mt-1 text-3xl font-bold text-[#102a5a]">{totalStudents}</p>
              </div>
            </div>
            <div className="p-6 md:p-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Attendance</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#102a5a]">{attendanceCounts.present}</span>
                  <span className="text-sm font-medium text-slate-500">/ {attendanceCounts.total}</span>
                </div>
                {attendanceCounts.absent > 0 && (
                  <p className="text-xs font-medium text-rose-500 mt-0.5">{attendanceCounts.absent} absent currently</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Linked Rounds & Linking */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Link Round Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-[#102a5a] mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Link New Round
              </h2>
              <form onSubmit={handleLinkRound} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={roundCode}
                    onChange={(e) => setRoundCode(e.target.value)}
                    placeholder="Enter unique round code"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10 transition-all hover:border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLinking || !roundCode.trim()}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-[#102a5a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3a6b] focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinking ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Linking...
                    </span>
                  ) : "Link Round"}
                </button>
              </form>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-sm text-rose-600 flex items-start gap-2">
                  <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
            </div>

            {/* Linked Rounds List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h2 className="text-base font-bold text-[#102a5a]">Your Rounds</h2>
                <span className="inline-flex items-center rounded-full bg-[#102a5a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#102a5a]">
                  {rounds.length} Total
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoading ? (
                  <div className="text-sm text-slate-500 text-center py-6 animate-pulse">Loading rounds...</div>
                ) : rounds.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">
                    No rounds linked yet. <br /> Use the form above to get started.
                  </div>
                ) : (
                  rounds.map((round) => {
                    const isSelected = selectedRoundId === (round.id || round._id);
                    return (
                      <button
                        key={round.id || round._id}
                        type="button"
                        onClick={() => setSelectedRoundId(round.id || round._id)}
                        className={`w-full text-left rounded-xl p-4 transition-all duration-200 border ${isSelected
                            ? "border-[#FBBF24] bg-[#FBBF24]/5 shadow-sm ring-1 ring-[#FBBF24]/30"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <div className={`font-semibold text-sm ${isSelected ? 'text-[#102a5a]' : 'text-slate-900'}`}>
                          {round.name}
                        </div>
                        <div className={`mt-1.5 flex items-center gap-2 text-xs font-medium ${isSelected ? 'text-[#102a5a]/70' : 'text-slate-500'}`}>
                          <span className="truncate">{round.code}</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                          <span className="truncate">{round.level}</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                          <span className="truncate">{round.campus}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Attendance & Upcoming */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Attendance Section */}
            {selectedRound ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header Area */}
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#102a5a] tracking-tight">
                        {selectedRound.name} Attendance
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span>{selectedRound.code}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span>{selectedRound.level}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span>{selectedRound.campus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <select
                          value={selectedSessionId}
                          onChange={(e) => setSelectedSessionId(e.target.value)}
                          className="appearance-none w-full min-w-[200px] rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-[#FBBF24]/10 focus:border-[#FBBF24] transition-all cursor-pointer hover:border-slate-300"
                        >
                          {sessions.map((session) => (
                            <option key={session.id || session._id} value={session.id || session._id}>
                              {session.title} — {session.date}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative w-full sm:max-w-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search student or phone..."
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10 transition-all hover:border-slate-300"
                        />
                      </div>
                      <select
                        value={attendanceFilter}
                        onChange={(e) => setAttendanceFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-[#FBBF24]/10 focus:border-[#FBBF24] cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">All Status</option>
                        <option value="present">Present Only</option>
                        <option value="absent">Absent Only</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleBulkUpdate(true)}
                        disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                        className="rounded-xl bg-[#102a5a]/10 px-4 py-2 text-sm font-medium text-[#102a5a] hover:bg-[#102a5a]/20 focus:outline-none focus:ring-2 focus:ring-[#102a5a]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkUpdate(false)}
                        disabled={isBulkUpdating || !selectedSessionId || filteredEnrollments.length === 0}
                        className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-x-auto">
                  {selectedEnrollments.length ? (
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Info</th>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                          <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredEnrollments.map((enrollment) => {
                          const enrollmentId = enrollment.id || enrollment._id;
                          const isPresent = getAttendanceStatus(enrollment);
                          return (
                            <tr
                              key={enrollmentId}
                              className="group hover:bg-slate-50/80 transition-colors duration-150"
                            >
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="font-semibold text-[#102a5a] group-hover:text-[#FBBF24] transition-colors">
                                  {enrollment.childName || "—"}
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
                                  <span className={`text-sm font-medium transition-colors ${isPresent ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {isPresent ? "Present" : "Absent"}
                                  </span>
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={isPresent}
                                      onChange={(e) => updateAttendance(enrollmentId, e.target.checked)}
                                      className="peer sr-only"
                                    />
                                    <div className={`h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${isPresent ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                    <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${isPresent ? 'translate-x-5' : 'translate-x-0'}`}></div>
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
                      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </div>
                      <h3 className="text-sm font-semibold text-[#102a5a]">No students found</h3>
                      <p className="mt-1 text-sm text-slate-500">There are no students linked to this round yet.</p>
                    </div>
                  )}

                  {selectedEnrollments.length > 0 && filteredEnrollments.length === 0 && (
                    <div className="text-center py-12 text-sm text-slate-500">
                      No students match your current search or filter.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-[#FBBF24]/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-[#102a5a]">No Round Selected</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Select a round from the sidebar or link a new one to view and manage student attendance.</p>
              </div>
            )}

            {/* Upcoming Sessions Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-[#102a5a] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Upcoming Sessions
                </h2>
                <span className="inline-flex items-center rounded-full bg-[#FBBF24]/10 px-2.5 py-0.5 text-xs font-bold text-[#92400e]">
                  {upcomingSessions.length} Scheduled
                </span>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 border-t border-slate-100">
                  No upcoming sessions on your schedule.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id || session._id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-[#FBBF24]/30 hover:shadow-sm"
                    >
                      <div className="font-semibold text-[#102a5a] mb-1">
                        {session.title || "Untitled Session"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {session.date} • {session.time}
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#102a5a]/5 px-2 py-1 text-xs text-[#102a5a] w-full border border-[#102a5a]/10">
                        <span className="font-semibold truncate max-w-[120px]">{session.roundName || "Unknown Round"}</span>
                        {session.roundCode && (
                          <>
                            <span className="text-[#102a5a]/30">•</span>
                            <span className="text-[#102a5a]/70 font-mono">{session.roundCode}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default InstructorDashboard;