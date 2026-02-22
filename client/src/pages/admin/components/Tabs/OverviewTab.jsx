import { motion } from 'framer-motion'
import { CalendarClock, ImageIcon, Users } from 'lucide-react'
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
    return (
        <MotionContainer
            key="overview"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="flex items-center justify_between mb-3">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Latest messages<br></br><br></br>
                            last 3 requests
                        </h2>

                        <span className="text-[11px] text-slate-500">
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
            </div>
        </MotionContainer>
    )
}

export default OverviewTab
