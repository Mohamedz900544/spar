import { motion } from "framer-motion";
import {
  Activity,
  CalendarClock,
  Eye,
  Image as ImageIcon,
  Inbox,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

const StatTile = ({ label, value, icon: Icon, footer, progress }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-700">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-normal text-slate-800">
          {value}
        </p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <Icon className="h-5 w-5" />
      </span>
    </div>
    {typeof progress === "number" && (
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    )}
    {footer && <p className="mt-3 text-xs font-semibold text-slate-400">{footer}</p>}
  </article>
);

const OverviewPage = () => {
  const {
    isLoading,
    loadError,
    totalKids,
    todayVisitors,
    liveVisitors,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    sessions,
    filteredMessages,
  } = useAdminDashboard();

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
          Loading data from server...
        </div>
      )}

      {loadError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7"
      >
        <StatTile label="Today's visitors" value={todayVisitors} icon={Eye} />
        <StatTile label="Live visitors" value={liveVisitors} icon={Activity} footer="Last 5 minutes" />
        <StatTile label="Total kids" value={totalKids} icon={Users} />
        <StatTile label="Active sessions" value={activeSessionsCount} icon={CalendarClock} />
        <StatTile label="Active rounds" value={activeRoundsCount} icon={CalendarClock} />
        <StatTile label="Gallery photos" value={publishedPhotos} icon={ImageIcon} />
        <StatTile
          label="Occupancy"
          value={`${averageOccupancy}%`}
          icon={Activity}
          progress={Number(averageOccupancy) || 0}
        />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold tracking-normal text-slate-700">
              Upcoming Sessions
            </h2>
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
              <CalendarClock className="h-3.5 w-3.5" />
              next 3 sessions
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {(sessions || []).slice(0, 3).map((session) => (
              <div key={session.id || session._id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800">{session.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {session.level} - {session.campus}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-500">
                    {session.date} - {session.time}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {session.enrolled}/{session.capacity} kids
                  </p>
                </div>
              </div>
            ))}
            {(sessions || []).length === 0 && (
              <p className="px-5 py-8 text-sm font-medium text-slate-500">No sessions yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold tracking-normal text-slate-700">
              Latest Messages
            </h2>
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
              <Inbox className="h-3.5 w-3.5" />
              last 3 requests
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {(filteredMessages || []).slice(0, 3).map((message) => (
              <div key={message.id || message._id} className="px-5 py-4 text-sm">
                <p className="font-bold text-slate-800">
                  {message.parentName} - {message.phone}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Child age: {message.childAge}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                  {message.message}
                </p>
              </div>
            ))}
            {(filteredMessages || []).length === 0 && (
              <p className="px-5 py-8 text-sm font-medium text-slate-500">No messages yet.</p>
            )}
          </div>
        </section>
      </motion.section>
    </div>
  );
};

export default OverviewPage;
