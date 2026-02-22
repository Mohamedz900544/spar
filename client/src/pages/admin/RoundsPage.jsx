// src/pages/RoundsPage.jsx
import React from "react";
import { motion as Motion } from "framer-motion";
import { CalendarClock, Users } from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { Link } from "react-router-dom";

const generateRoundCode = () =>
  "R-" + Math.random().toString(36).substring(2, 7).toUpperCase();

const RoundsPage = () => {
  const {
    isLoading,
    loadError,
    rounds,
    newRound,
    handleNewRoundChange,
    handleCreateRound,
    expandedRoundId,
    toggleRoundExpand,
    handleRoundStatusChange,
    getRoundStudents,
    getRoundRating,
    studentPhotos,
    handleAddStudentPhotos,
  } = useAdminDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      <header className="bg-[#102a5a] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
            Rounds
          </h1>
          {isLoading && (
            <p className="text-[11px] text-blue-100 mt-0.5">
              Loading rounds…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CalendarClock className="w-4 h-4" />
          <span>Level rounds</span>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-10 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm text-red-700">
              {loadError}
            </div>
          )}

          <Motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Create round */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-1">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
                Create new round
              </h2>
              <form
                onSubmit={handleCreateRound}
                className="space-y-3 text-xs md:text-sm"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Round name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                    placeholder="Round 3 – Nasr City (Sunday)"
                    value={newRound.name}
                    onChange={(e) =>
                      handleNewRoundChange("name", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Level
                    </label>
                    <select
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24] text-xs"
                      value={newRound.level}
                      onChange={(e) =>
                        handleNewRoundChange("level", e.target.value)
                      }
                    >
                      <option>Level 1</option>
                      <option disabled>Level 2 (coming)</option>
                      <option disabled>Level 3 (coming)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Campus
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                      placeholder="Nasr City / Maadi ..."
                      value={newRound.campus}
                      onChange={(e) =>
                        handleNewRoundChange("campus", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Start date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                      value={newRound.startDate}
                      onChange={(e) =>
                        handleNewRoundChange("startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      End date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                      value={newRound.endDate}
                      onChange={(e) =>
                        handleNewRoundChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sessions
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                      value={newRound.sessionsCount}
                      onChange={(e) =>
                        handleNewRoundChange(
                          "sessionsCount",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Weeks per session
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                      value={newRound.weeksPerSession}
                      onChange={(e) =>
                        handleNewRoundChange(
                          "weeksPerSession",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Round code (send to parents)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none font-mono text-xs focus:ring-2 focus:ring-[#FBBF24]"
                      value={newRound.code}
                      onChange={(e) =>
                        handleNewRoundChange("code", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleNewRoundChange("code", generateRoundCode())
                      }
                      className="px-3 py-2 rounded-xl border border-[#102a5a] text-[#102a5a] text-xs font-semibold hover:bg-[#f1f5f9]"
                    >
                      New
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Parents will enter this code in their account to join the
                    round.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c] text-slate-900 font-semibold text-xs md:text-sm py-2.5 shadow-md hover:shadow-lg"
                >
                  Create round
                </button>
              </form>
            </div>

            {/* Rounds list */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-4">
                Rounds list
              </h2>
              <div className="space-y-3">
                {rounds.map((r) => {
                  const students = getRoundStudents(r.code);
                  const rating = getRoundRating(r.code);
                  return (
                    <Link to={`/admin/round/${r.id}`}
                      key={r.id}
                      className="border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {r.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {r.level} · {r.campus}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {r.startDate} → {r.endDate} · {r.sessionsCount}{" "}
                            sessions · {r.weeksPerSession} week(s)/session
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Code:{" "}
                            <span className="font-mono font-semibold text-[#102a5a]">
                              {r.code}
                            </span>
                          </p>
                          {rating && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              Parent rating:{" "}
                              <span className="font-semibold text-[#f59e0b]">
                                {rating.averageRating.toFixed(1)}★
                              </span>{" "}
                              ({rating.totalReviews} reviews)
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === "Active"
                              ? "bg-[#dcfce7] text-[#166534]"
                              : r.status === "Planned"
                                ? "bg-[#e0f2fe] text-[#075985]"
                                : "bg-[#e5e7eb] text-[#374151]"
                              }`}
                          >
                            {r.status}
                          </span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <button
                              onClick={() =>
                                handleRoundStatusChange(r.id, "Active")
                              }
                              className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                            >
                              Set Active
                            </button>
                            <button
                              onClick={() =>
                                handleRoundStatusChange(r.id, "Planned")
                              }
                              className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e0f2fe] text-[#075985] hover:bg-[#e0f2fe]"
                            >
                              Planned
                            </button>
                            <button
                              onClick={() =>
                                handleRoundStatusChange(r.id, "Completed")
                              }
                              className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fef3c7] text-[#854d0e] hover:bg-[#fef9c3]"
                            >
                              Completed
                            </button>
                          </div>
                          <button
                            onClick={() => toggleRoundExpand(r.id)}
                            className="px-3 py-1 rounded-full border border-[#e2e8f0] text-[11px] text-[#102a5a] hover:bg-[#f1f5f9]"
                          >
                            {expandedRoundId === r.id
                              ? "Hide students"
                              : `Show students (${students.length})`}
                          </button>
                        </div>
                      </div>

                      {expandedRoundId === r.id && (
                        <div className="mt-3 border-t border-dashed border-[#e5e7eb] pt-3">
                          <p className="text-[11px] font-semibold text-slate-700 mb-2">
                            Students in this round ({students.length})
                          </p>
                          {students.length === 0 && (
                            <p className="text-[11px] text-slate-500">
                              No enrollments linked yet. Make sure enrollments
                              have the round code{" "}
                              <span className="font-mono">{r.code}</span>.
                            </p>
                          )}
                          <div className="space-y-2">
                            {students.map((stu) => (
                              <div
                                key={stu.id}
                                className="border border-[#e5e7eb] rounded-lg px-2 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                              >
                                <div>
                                  <p className="font-semibold text-slate-800 text-xs md:text-sm">
                                    {stu.childName}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Parent: {stu.parentName} · {stu.phone}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Status: {stu.status} · Session:{" "}
                                    {stu.sessionTitle}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    Photos uploaded:{" "}
                                    <span className="font-semibold">
                                      {studentPhotos[stu.id]?.length || 0}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="text-[11px]"
                                    onChange={(e) =>
                                      handleAddStudentPhotos(
                                        stu.id,
                                        e.target.files
                                      )
                                    }
                                  />
                                  <p className="text-[11px] text-slate-400">
                                    Photos will be uploaded and stored for this
                                    child.
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Motion.div>
        </div>
      </main>
    </div>
  );
};

export default RoundsPage;
