import { motion } from 'framer-motion'
import { Edit2, Filter, Search, Trash2 } from 'lucide-react'
import { formatTime } from "../../../../helpers/helpers.js";
export const SessionsTab = ({
    sessionSearch,
    setSessionSearch,
    setSessionStatusFilter,
    filteredSessions,
    handleFormUpdate,
    deleteSessions,
    sessionStatusFilter
}) => {
    const MotionContainer = motion.div
    return <MotionContainer
        key="sessions"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
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
                    <button
                        className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === "All"
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-[#e2e8f0] text-slate-700"
                            }`}
                        onClick={() => setSessionStatusFilter("All")}
                    >
                        All
                    </button>
                    <button
                        className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === "Active"
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-[#e2e8f0] text-slate-700"
                            }`}
                        onClick={() => setSessionStatusFilter("Active")}
                    >
                        Active
                    </button>
                    <button
                        className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === "Full"
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-[#e2e8f0] text-slate-700"
                            }`}
                        onClick={() => setSessionStatusFilter("Full")}
                    >
                        Full
                    </button>
                    <button
                        className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === "Draft"
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-[#e2e8f0] text-slate-700"
                            }`}
                        onClick={() => setSessionStatusFilter("Draft")}
                    >
                        Draft
                    </button>

                    <button
                        onClick={() => setSessionStatusFilter("Today")}
                        className={`px-2 py-1 rounded-full border text-[10px] ${sessionStatusFilter === "Today"
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-[#e2e8f0] text-slate-700"}`}
                    >today</button>
                </div>
            </div>
        </div>
        <div>

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
                                {formatTime(s.time)}
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
                                        <Edit2 onClick={() => handleFormUpdate(s.id)} className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1 rounded-full hover:bg-[#fee2e2] text-[#b91c1c]">
                                        <Trash2 onClick={() => deleteSessions(s.id)} className="w-3.5 h-3.5" />
                                    </button>
                                    {/* <button
                                        onClick={() =>
                                            handleSessionStatusToggle(s.id, "Completed")
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                                    >
                                        Completed
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSessionStatusToggle(s.id)
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e2e8f0] text-[#102a5a] hover:bg-[#f1f5f9]"
                                    >
                                        {s.status === "Active"
                                            ? "Move to Draft"
                                            : "Set Active"}
                                    </button> */}
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
    </MotionContainer>
}
