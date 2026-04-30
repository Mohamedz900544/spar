import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../Button";

const WEEKDAY_OPTIONS = [
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
];

const WEEKDAY_LABELS = WEEKDAY_OPTIONS.reduce((labels, day) => {
    labels[day.value] = day.label;
    return labels;
}, {});

const formatDate = (value) => {
    if (!value) return "TBA";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) return "TBA";
    const [hour, minute] = value.split(":");
    if (hour === undefined || minute === undefined) return value;

    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

//some styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1; /* slate-300 */
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8; /* slate-400 */
  }
  /* Firefox support */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
`;

export const RoundsTab = ({
    setIsCreatingRound,
    newRound,
    handleNewRoundChange,
    isCreatingRound,
    rounds,
    getRoundStudents,
    handleRoundStatusChange,
    expandedRoundId,
    handleAddStudentPhotos,
    getRoundRating,
    handleCreateRound,
    studentPhotos,
    handleDeleteRound
}) => {

    const navigate = useNavigate()
    const MotionContainer = motion.div
    return <MotionContainer
        key="rounds"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
    >
        <style>{scrollbarStyles}</style>
        {/* Create round */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
                Create new round
            </h2>
            <form
                onSubmit={(e) => handleCreateRound(e, setIsCreatingRound)}
                className={`space-y-3 text-xs md:text-sm `}
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
                            className="w-full rounded-xl border bg-white border-[#e2e8f0] px-3 py-2 bg_white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24] text-xs"
                            value={newRound.level}
                            onChange={(e) =>
                                handleNewRoundChange("level", e.target.value)
                            }
                        >
                            <option value={'Level 1'}>Level 1</option>
                            <option value={'Level 2'}>Level 2</option>
                            <option value={'Level 3'}>Level 3</option>
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
                            Weekly session day
                        </label>
                        <select
                            className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                            value={newRound.weeklySessionDay}
                            onChange={(e) =>
                                handleNewRoundChange("weeklySessionDay", e.target.value)
                            }
                        >
                            {WEEKDAY_OPTIONS.map((day) => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Weekly session time
                        </label>
                        <input
                            type="time"
                            className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                            value={newRound.weeklySessionTime}
                            onChange={(e) =>
                                handleNewRoundChange("weeklySessionTime", e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    The system will create one weekly session on the selected day
                    between the start and end dates. Every session is fixed at 2 hours.
                </div>

                <Button type="submit" text={'Create round'} isLoading={isCreatingRound} />

            </form>
        </div>

        {/* Rounds list */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-2">
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-4">
                Rounds list
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-scroll custom-scrollbar">
                {rounds.map((r) => {
                    const roundId = r.id || r._id;
                    const students = getRoundStudents(r.code);
                    const rating = getRoundRating(r.code);
                    return (
                        <div
                            key={roundId}
                            className="border cursor-pointer border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div >
                                    <div className="round-details cursor-pointer" onClick={() => navigate(`/admin/round/${roundId}`)}>
                                        <p className="name font-semibold text-slate-800">
                                            {r.name}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {r.level} - {r.campus}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {formatDate(r.startDate)} to {formatDate(r.endDate)} -{" "}
                                            {r.sessionsCount || 0} sessions -{" "}
                                            {WEEKDAY_LABELS[r.weeklySessionDay] || "TBA"} at {formatTime(r.weeklySessionTime)} - 2 hours
                                        </p>
                                    </div>
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
                                                {(rating.averageRating || 0).toFixed(1)}★
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
                                                handleRoundStatusChange(roundId, "Active")
                                            }
                                            className="px-2 py-1 rounded_full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                                        >
                                            Set Active
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRoundStatusChange(roundId, "Planned")
                                            }
                                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e0f2fe] text-[#075985] hover:bg-[#e0f2fe]"
                                        >
                                            Planned
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRoundStatusChange(
                                                    roundId,
                                                    "Completed"
                                                )
                                            }
                                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fef3c7] text-[#854d0e] hover:bg-[#fef9c3]"
                                        >
                                            Completed
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRound(roundId)}
                                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fee2e2] text-[#b91c1c] hover:bg-[#fee2e2]"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <button
                                        // onClick={() => toggleRoundExpand(r.id)}
                                        onClick={() => navigate(`/admin/round/${roundId}/students`)}
                                        className="px-3 py-1 rounded-full border border-[#e2e8f0] text-[11px] text-[#102a5a] hover:bg-[#f1f5f9]"
                                    >
                                        {expandedRoundId === roundId
                                            ? "Hide students"
                                            : `Show students (${students.length})`}
                                    </button>
                                </div>
                            </div>

                            {expandedRoundId === roundId && (
                                <div className="mt-3 border-t border-dashed border-[#e5e7eb] pt-3">
                                    <p className="text-[11px] font-semibold text-slate-700 mb-2">
                                        Students in this round ({students.length})
                                    </p>
                                    {students.length === 0 && (
                                        <p className="text-[11px] text-slate-500">
                                            No enrollments linked yet. Make sure
                                            enrollments have the round code{" "}
                                            <span className="font-mono">
                                                {r.code}
                                            </span>
                                            .
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
                                                        Parent: {stu.parentName} ·{" "}
                                                        {stu.phone}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Status: {stu.status} · Session:{" "}
                                                        {stu.sessionTitle}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-1">
                                                        Photos uploaded:{" "}
                                                        <span className="font-semibold">
                                                            {studentPhotos[stu.id]?.length ||
                                                                0}
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
                                                        Photos will be uploaded and stored
                                                        for this child.
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </MotionContainer>
}
