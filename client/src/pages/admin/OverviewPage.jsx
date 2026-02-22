// src/pages/OverviewPage.jsx
import React from "react";
import { Users, CalendarClock, Image as ImageIcon, Inbox } from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

const OverviewPage = () => {
  const {
    isLoading,
    loadError,
    totalKids,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    sessions,
    filteredMessages, // نستخدم الـ filteredMessages هنا كـ latest messages
  } = useAdminDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      <header className="bg-[#102a5a] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
            Overview
          </h1>
          {isLoading && (
            <p className="text-[11px] text-blue-100 mt-0.5">
              Loading data from server…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Inbox className="w-4 h-4" />
          <span>Admin overview</span>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-10 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm text-red-700">
              {loadError}
            </div>
          )}

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
          >
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1 md:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total kids
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">
                  {totalKids}
                </p>
                <Users className="w-7 h-7 text-[#102a5a]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1 md:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Active sessions
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">
                  {activeSessionsCount}
                </p>
                <CalendarClock className="w-7 h-7 text-[#102a5a]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1 md:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Active rounds
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">
                  {activeRoundsCount}
                </p>
                <CalendarClock className="w-7 h-7 text-[#102a5a]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1 md:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Gallery photos
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">
                  {publishedPhotos}
                </p>
                <ImageIcon className="w-7 h-7 text-[#102a5a]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1 md:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Occupancy
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">
                  {averageOccupancy}%
                </p>
                <div className="w-16 h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                  <div
                    className="h-full bg-[#102a5a]"
                    style={{ width: `${averageOccupancy}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming + messages */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Upcoming sessions */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Upcoming sessions
                </h2>
                <span className="text-[11px] text-slate-500">
                  next 3 sessions
                </span>
              </div>
              <div className="space-y-3">
                {sessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs md:text-sm border-b border-dashed border-[#e5e7eb] pb-2 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {s.level} · {s.campus}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        {s.date} · {s.time}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {s.enrolled}/{s.capacity} kids
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest messages */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Latest messages
                </h2>
                <span className="text-[11px] text-slate-500">
                  last 3 requests
                </span>
              </div>
              <div className="space-y-3">
                {sessions.length === 0 && filteredMessages.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    No messages yet.
                  </p>
                )}
                {filteredMessages.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="border-b border-dashed border-[#e5e7eb] pb-2 last:border-b-0 last:pb-0 text-xs md:text-sm"
                  >
                    <p className="font-semibold text-slate-800">
                      {m.parentName} · {m.phone}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-1">
                      Child age: {m.childAge}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
