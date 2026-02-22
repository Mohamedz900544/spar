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

const SessionsPage = () => {
  const {
    isLoading,
    loadError,
    filteredSessions,
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
                    placeholder="Search by title, campus or level"
                    className="pl-7 pr-3 py-1.5 rounded-full border border-[#e2e8f0] text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#FBBF24]"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  {["All", "Active", "Full", "Draft"].map((status) => (
                    <button
                      key={status}
                      className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === status
                          ? "bg-[#102a5a] text-white border-[#102a5a]"
                          : "border-[#e2e8f0] text-slate-700"
                        }`}
                      onClick={() => setSessionStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
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
                          {s.status}
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
