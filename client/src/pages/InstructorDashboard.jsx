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
    <main className="min-h-screen bg-[#f1f5f9] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-[#dbeafe] bg-gradient-to-br from-white via-white to-[#eef4ff] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Instructor Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Link rounds, track attendance, and manage students in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="inline-flex items-center justify-center rounded-xl border border-[#dbeafe] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
            >
              Refresh data
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Linked rounds
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalRounds}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total students
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalStudents}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Session attendance
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {attendanceCounts.present}/{attendanceCounts.total}
              </p>
              <p className="text-xs text-slate-500">
                {attendanceCounts.absent} absent
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Link round by code
            </h2>
            <form onSubmit={handleLinkRound} className="space-y-3">
              <input
                type="text"
                value={roundCode}
                onChange={(e) => setRoundCode(e.target.value)}
                placeholder="Enter round code"
                className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />
              <button
                type="submit"
                disabled={isLinking}
                className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs md:text-sm font-semibold bg-[#0b63c7] text-white hover:bg-[#0a5ab4] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLinking ? "Linking..." : "Link round"}
              </button>
            </form>
            {error && (
              <div className="mt-3 text-xs text-rose-600">{error}</div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Linked rounds
              </h2>
              <span className="text-[11px] text-slate-500">
                {rounds.length} total
              </span>
            </div>
            {isLoading ? (
              <div className="text-xs text-slate-500">Loading...</div>
            ) : rounds.length === 0 ? (
              <div className="text-xs text-slate-500">
                No rounds linked yet.
              </div>
            ) : (
              <div className="space-y-2">
                {rounds.map((round) => (
                  <button
                    key={round.id || round._id}
                    type="button"
                    onClick={() => setSelectedRoundId(round.id || round._id)}
                    className={`w-full text-left rounded-xl border px-3 py-2 text-xs md:text-sm ${selectedRoundId === (round.id || round._id)
                      ? "border-[#0b63c7] bg-[#eef4ff] text-slate-900"
                      : "border-[#e5e7eb] text-slate-600 hover:bg-[#f8fafc]"
                      }`}
                  >
                    <div className="font-semibold">{round.name}</div>
                    <div className="text-[11px]">
                      {round.code} · {round.level} · {round.campus}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {selectedRound && (
              <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Attendance for {selectedRound.name}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {selectedRound.code} · {selectedRound.level} · {selectedRound.campus}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[11px] text-slate-600">
                      Session
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="rounded-lg border border-[#dbeafe] px-2 py-1 text-xs text-slate-700"
                    >
                      {sessions.map((session) => (
                        <option key={session.id || session._id} value={session.id || session._id}>
                          {session.title} · {session.date} · {session.time}
                        </option>
                      ))}
                    </select>
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] text-slate-700">
                      {attendanceCounts.present} present
                    </span>
                    <span className="rounded-full bg-[#fef2f2] px-3 py-1 text-[11px] text-slate-700">
                      {attendanceCounts.absent} absent
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search student, parent, phone..."
                      className="w-full rounded-xl border border-[#dbeafe] bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                    />
                    <select
                      value={attendanceFilter}
                      onChange={(e) => setAttendanceFilter(e.target.value)}
                      className="rounded-xl border border-[#dbeafe] bg-white px-3 py-2 text-xs text-slate-700"
                    >
                      <option value="all">All</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkUpdate(true)}
                      disabled={isBulkUpdating || !selectedSessionId}
                      className="rounded-xl border border-[#0b63c7] px-3 py-2 text-xs font-semibold text-[#0b63c7] hover:bg-[#eef4ff] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Mark all present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkUpdate(false)}
                      disabled={isBulkUpdating || !selectedSessionId}
                      className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Mark all absent
                    </button>
                  </div>
                </div>

                {selectedEnrollments.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] text-slate-500">
                          <th className="text-left py-2 pr-3">Student</th>
                          <th className="text-left py-2 pr-3">Parent</th>
                          <th className="text-left py-2 pr-3">Phone</th>
                          <th className="text-left py-2 pr-3">Present</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnrollments.map((enrollment) => {
                          const enrollmentId = enrollment.id || enrollment._id;
                          const isPresent = getAttendanceStatus(enrollment);
                          return (
                            <tr
                              key={enrollmentId}
                              className="border-b border-[#eef2ff] text-slate-700"
                            >
                              <td className="py-2 pr-3 font-semibold">
                                {enrollment.childName || "-"}
                              </td>
                              <td className="py-2 pr-3">{enrollment.parentName || "-"}</td>
                              <td className="py-2 pr-3">{enrollment.phone || "-"}</td>
                              <td className="py-2 pr-3">
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isPresent}
                                    onChange={(e) =>
                                      updateAttendance(enrollmentId, e.target.checked)
                                    }
                                    className="h-4 w-4 accent-[#0b63c7]"
                                  />
                                  <span>{isPresent ? "Present" : "Absent"}</span>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    No students linked to this round yet.
                  </div>
                )}
                {selectedEnrollments.length > 0 && filteredEnrollments.length === 0 && (
                  <div className="mt-3 text-xs text-slate-500">
                    No students match the current filter.
                  </div>
                )}
              </div>
            )}
          </div>
          <aside className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-1 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Upcoming sessions
              </h2>
              <span className="text-[11px] text-slate-500">
                {upcomingSessions.length} coming
              </span>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-xs text-slate-500">
                No upcoming sessions scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id || session._id}
                    className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2"
                  >
                    <div className="text-xs font-semibold text-slate-900">
                      {session.title || "Session"}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {session.date} · {session.time}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {session.roundName || ""} {session.roundCode ? `· ${session.roundCode}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

      </div>
    </main>
  );
};

export default InstructorDashboard;
