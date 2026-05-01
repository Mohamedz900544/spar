// src/pages/SessionsPage.jsx
import React from "react";
import { motion as Motion } from "framer-motion";
import {
  CalendarClock,
  Filter,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

const SESSION_FILTERS = [
  "Today",
  "Active",
  "Full",
  "Draft",
  "Completed",
  "Free Pending",
  "Free Assigned",
  "Free Finished",
  "All",
];

const FILTER_LABELS = {
  Draft: "Upcoming",
};

const getStatusLabel = (status) => FILTER_LABELS[status] || status;

const FILTER_STYLES = {
  Today: {
    active: "bg-sky-600 text-white border-sky-600",
    idle: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-sky-100 text-sky-700",
  },
  Active: {
    active: "bg-emerald-600 text-white border-emerald-600",
    idle: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-emerald-100 text-emerald-700",
  },
  Full: {
    active: "bg-rose-600 text-white border-rose-600",
    idle: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-rose-100 text-rose-700",
  },
  Draft: {
    active: "bg-slate-700 text-white border-slate-700",
    idle: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-slate-200 text-slate-700",
  },
  Completed: {
    active: "bg-violet-600 text-white border-violet-600",
    idle: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-violet-100 text-violet-700",
  },
  "Free Pending": {
    active: "bg-amber-600 text-white border-amber-600",
    idle: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-amber-100 text-amber-700",
  },
  "Free Assigned": {
    active: "bg-teal-600 text-white border-teal-600",
    idle: "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-teal-100 text-teal-700",
  },
  "Free Finished": {
    active: "bg-indigo-600 text-white border-indigo-600",
    idle: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-indigo-100 text-indigo-700",
  },
  All: {
    active: "bg-[#102a5a] text-white border-[#102a5a]",
    idle: "border-[#102a5a]/20 bg-[#102a5a]/5 text-[#102a5a] hover:bg-[#102a5a]/10",
    countActive: "bg-white/20 text-white",
    countIdle: "bg-[#102a5a]/10 text-[#102a5a]",
  },
};

const SessionsPage = () => {
  const {
    isLoading,
    loadError,
    filteredSessions,
    sessionCounts,
    sessionSearch,
    setSessionSearch,
    sessionStatusFilter,
    setSessionStatusFilter,
    handleSessionStatusToggle,
  } = useAdminDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      <header className="bg-[#102a5a] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
            Sessions
          </h1>
          {isLoading && (
            <p className="text-[11px] text-blue-100 mt-0.5">
              Loading sessions…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CalendarClock className="w-4 h-4" />
          <span>Workshops & classes</span>
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
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Sessions management
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search title, date, campus, parent or phone"
                    className="pl-7 pr-3 py-1.5 rounded-full border border-[#e2e8f0] text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#FBBF24]"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  {SESSION_FILTERS.map((status) => {
                    const styles = FILTER_STYLES[status];
                    const isActive = sessionStatusFilter === status;
                    return (
                      <button
                        key={status}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold transition-colors ${isActive ? styles.active : styles.idle}`}
                        onClick={() => setSessionStatusFilter(status)}
                      >
                        <span>{getStatusLabel(status)}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? styles.countActive : styles.countIdle}`}>
                          {sessionCounts[status] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-slate-500">
                    <th className="text-left py-2 pr-3">Title</th>
                    <th className="text-left py-2 pr-3">Level</th>
                    <th className="text-left py-2 pr-3">Date</th>
                    <th className="text-left py-2 pr-3">Time</th>
                    <th className="text-left py-2 pr-3">Campus</th>
                    <th className="text-right py-2 pr-3">Kids</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-right py-2 pl-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#f1f5f9] last:border-b-0"
                    >
                      <td className="py-2 pr-3 font-medium text-slate-800">
                        {s.title}
                      </td>
                      <td className="py-2 pr-3 text-slate-600">
                        {s.level}
                      </td>
                      <td className="py-2 pr-3 text-slate-600">
                        {s.date}
                      </td>
                      <td className="py-2 pr-3 text-slate-600">
                        {s.time}
                      </td>
                      <td className="py-2 pr-3 text-slate-600">
                        {s.campus}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-600">
                        {s.enrolled}/{s.capacity}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.status === "Active"
                              ? "bg-[#dcfce7] text-[#166534]"
                              : s.status === "Full"
                                ? "bg-[#fee2e2] text-[#b91c1c]"
                                : s.status === "Draft"
                                  ? "bg-[#e5e7eb] text-[#374151]"
                                  : "bg-[#f5f3ff] text-[#6d28d9]"
                            }`}
                        >
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button className="p-1 rounded-full hover:bg-[#f1f5f9] text-slate-500">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded-full hover:bg-[#fee2e2] text-[#b91c1c]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleSessionStatusToggle(s.id, "Completed")
                            }
                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleSessionStatusToggle(s.id)}
                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e2e8f0] text-[#102a5a] hover:bg-[#f1f5f9]"
                          >
                            {s.status === "Active"
                              ? "Move to Draft"
                              : "Set Active"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSessions.length === 0 && (
                <p className="text-xs text-slate-500 mt-3">
                  No sessions match your filters.
                </p>
              )}
            </div>
          </Motion.div>
        </div>
      </main>
    </div>
  );
};

export default SessionsPage;
