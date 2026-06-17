import { motion } from 'framer-motion'
import { CalendarClock, ImageIcon, Users, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
const OverviewTab = ({
    averageOccupancy,
    totalKids,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    sessions,
    messages
}) => {
    const MotionContainer = motion.div
    const navigate = useNavigate()
    return (
        <MotionContainer
            key="overview"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
        >
            {/* Full Overview link */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/admin/overview')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                    <Eye className="w-4 h-4" />
                    Full Overview & Visitors
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="flex flex-col gap-1 rounded-xl border border-blue-100 bg-white p-4 shadow-sm md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Total kids
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                            {totalKids}
                        </p>
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                            <Users className="h-5 w-5 text-blue-600" />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-blue-100 bg-white p-4 shadow-sm md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Active sessions
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                            {activeSessionsCount}
                        </p>
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 ring-1 ring-cyan-100">
                            <CalendarClock className="h-5 w-5 text-cyan-700" />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-blue-100 bg-white p-4 shadow-sm md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Active rounds
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                            {activeRoundsCount}
                        </p>
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                            <CalendarClock className="h-5 w-5 text-blue-600" />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-blue-100 bg-white p-4 shadow-sm md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Gallery photos
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                            {publishedPhotos}
                        </p>
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100">
                            <ImageIcon className="h-5 w-5 text-amber-600" />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-50 p-4 shadow-sm md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Occupancy
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                            {averageOccupancy}%
                        </p>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-blue-100">
                            <div
                                className="h-full bg-blue-600"
                                style={{ width: `${averageOccupancy}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming sessions */}
                <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Upcoming sessions
                        </h2>
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            next 3 sessions
                        </span>
                    </div>
                    <div className="space-y-3">
                        {sessions.slice(0, 3).map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between border-b border-dashed border-blue-100 pb-2 text-xs last:border-b-0 last:pb-0 md:text-sm"
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
                <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Latest messages<br></br><br></br>
                            last 3 requests
                        </h2>

                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            {/* last 3 requests */}
                        </span>

                    </div>
                    <div className="space-y-3">
                        {sessions.length === 0 && messages.length === 0 && (
                            <p className="text-[11px] text-slate-500">
                                No messages yet.
                            </p>
                        )}
                        {messages.slice(0, 3).map((m) => (
                            <div
                                key={m.id}
                                className="border-b border-dashed border-blue-100 pb-2 text-xs last:border-b-0 last:pb-0 md:text-sm"
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
            </div>
        </MotionContainer>
    )
}

export default OverviewTab
