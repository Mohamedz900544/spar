import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
export const EnrollmentsTab = ({
    enrollmentStatusFilter,
    setEnrollmentStatusFilter,
    filteredEnrollments,
    handleEnrollmentNoteChange,
    handleEnrollmentStatusChange
}) => {
    const MotionContainer = motion.div
    return <MotionContainer
        key="enrollments"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
    >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Enrollments & kids list
            </h2>
            <div className="flex items-center gap-1 text-[11px]">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <button
                    className={`px-2 py-1 rounded-full border text-[10px] ${enrollmentStatusFilter === "All"
                        ? "bg-[#102a5a] text-white border-[#102a5a]"
                        : "border-[#e2e8f0] text-slate-700"
                        }`}
                    onClick={() => setEnrollmentStatusFilter("All")}
                >
                    All
                </button>
                <button
                    className={`px-2 py-1 rounded-full border text-[10px] ${enrollmentStatusFilter === "Confirmed"
                        ? "bg-[#102a5a] text-white border-[#102a5a]"
                        : "border-[#e2e8f0] text-slate-700"
                        }`}
                    onClick={() =>
                        setEnrollmentStatusFilter("Confirmed")
                    }
                >
                    Confirmed
                </button>
                <button
                    className={`px-2 py-1 rounded-full border text-[10px] ${enrollmentStatusFilter === "Waiting"
                        ? "bg-[#102a5a] text-white border-[#102a5a]"
                        : "border-[#e2e8f0] text-slate-700"
                        }`}
                    onClick={() =>
                        setEnrollmentStatusFilter("Waiting")
                    }
                >
                    Waiting
                </button>
                <button
                    className={`px-2 py-1 rounded-full border text-[10px] ${enrollmentStatusFilter === "Pending Call"
                        ? "bg-[#102a5a] text-white border-[#102a5a]"
                        : "border-[#e2e8f0] text-slate-700"
                        }`}
                    onClick={() =>
                        setEnrollmentStatusFilter("Pending Call")
                    }
                >
                    Pending Call
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm align-top">
                <thead>
                    <tr className="border-b border-[#e5e7eb] text-slate-500">
                        <th className="text-left py-2 pr-3">Child</th>
                        <th className="text-left py-2 pr-3">Parent</th>
                        <th className="text-left py-2 pr-3">Phone</th>
                        <th className="text-left py-2 pr-3">Level</th>
                        <th className="text-left py-2 pr-3">Session</th>
                        <th className="text-left py-2 pr-3">Round code</th>
                        <th className="text-left py-2 pr-3">Status</th>
                        <th className="text-left py-2 pr-3">
                            Admin note (internal)
                        </th>
                        <th className="text-right py-2 pl-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEnrollments.map((e) => (
                        <tr
                            key={e.id}
                            className="border-b border-[#f1f5f9] last:border-b-0"
                        >
                            <td className="py-2 pr-3 font-medium text-slate-800">
                                {e.childName}
                            </td>
                            <td className="py-2 pr-3 text-slate-600">
                                {e.parentName}
                            </td>
                            <td className="py-2 pr-3 text-slate-600">
                                {e.phone}
                            </td>
                            <td className="py-2 pr-3 text-slate-600">
                                {e.level}
                            </td>
                            <td className="py-2 pr-3 text-slate-600">
                                {e.sessionTitle}
                            </td>
                            <td className="py-2 pr-3 text-slate-600 font-mono text-[11px]">
                                {e.roundCode || "-"}
                            </td>
                            <td className="py-2 pr-3">
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${e.status === "Confirmed"
                                        ? "bg-[#dcfce7] text-[#166534]"
                                        : e.status === "Waiting"
                                            ? "bg-[#fef9c3] text-[#854d0e]"
                                            : "bg-[#e0f2fe] text-[#075985]"
                                        }`}
                                >
                                    {e.status}
                                </span>
                            </td>
                            <td className="py-2 pr-3">
                                <textarea
                                    className="w-40 md:w-56 rounded-lg border border-[#e2e8f0] text-[11px] px-2 py-1 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#FBBF24]"
                                    placeholder="Call at 5 PM, prefers WhatsApp..."
                                    value={e.note}
                                    onChange={(ev) =>
                                        handleEnrollmentNoteChange(
                                            e.id,
                                            ev.target.value
                                        )
                                    }
                                    rows={2}
                                />
                            </td>
                            <td className="py-2 pl-3 text-right">
                                <div className="inline-flex flex-col gap-1">
                                    <button
                                        onClick={() =>
                                            handleEnrollmentStatusChange(
                                                e.id,
                                                "Confirmed"
                                            )
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleEnrollmentStatusChange(
                                                e.id,
                                                "Waiting"
                                            )
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fef3c7] text-[#854d0e] hover:bg-[#fef9c3]"
                                    >
                                        Wait list
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleEnrollmentStatusChange(
                                                e.id,
                                                "Pending Call"
                                            )
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e0f2fe] text-[#075985] hover:bg-[#e0f2fe]"
                                    >
                                        Call back
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredEnrollments.length === 0 && (
                <p className="text-xs text-slate-500 mt-3">
                    No enrollments match your filters.
                </p>
            )}
        </div>
    </MotionContainer>
}
