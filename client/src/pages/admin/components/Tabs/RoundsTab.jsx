import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";
import { Button } from "../Button";

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
    handleRoundSessionChange,
    isCreatingRound,
    rounds,
    getRoundStudents,
    handleRoundStatusChange,
    expandedRoundId,
    handleAddStudentPhotos,
    getRoundRating,
    regenerateSessions,
    handleCreateRound,
    evenSessionDateAndTime,
    setEvenSessionDateAndTime,
    oddSessionDateAndTime,
    setOddSessionDateAndTime,
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
                            Even Session Dates and Times
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                            value={evenSessionDateAndTime}
                            onChange={(e) => setEvenSessionDateAndTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Odd Session Dates and Times
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                            value={oddSessionDateAndTime}
                            onChange={(e) =>
                                setOddSessionDateAndTime(e.target.value)
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
                            sessions Per week
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

                {/* Code */}
                {/* <div>
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
                        Parents will enter this code in their account to join
                        the round.
                    </p>
                </div> */}

                {/* Sessions Editor */}
                <div className="border-t border-dashed border-[#e5e7eb] pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-slate-700">
                            Sessions Details
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                regenerateSessions(evenSessionDateAndTime, oddSessionDateAndTime)
                            }}
                            className="text-[10px] text-[#102a5a] hover:underline font-medium"
                        >
                            Auto-fill dates
                        </button>
                    </div>

                    <div className={`space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar `}>
                        {newRound.sessions?.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic">
                                Click "Auto-fill dates" to generate sessions based on start date.
                            </p>
                        )}
                        {newRound.sessions?.map((session, idx) => (
                            <div key={idx} className="border border-[#e5e7eb] rounded-lg p-2 bg-slate-50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Session {idx + 1}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    {/* Title */}
                                    <div className="col-span-12 md:col-span-4">
                                        <input
                                            type="text"
                                            value={session.title}
                                            onChange={(e) =>
                                                handleRoundSessionChange(idx, "title", e.target.value)
                                            }
                                            className="w-full rounded-md border border-[#e2e8f0] px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#FBBF24]"
                                            placeholder="Title"
                                        />
                                    </div>
                                    {/* date of session and time*/}
                                    <div className="col-span-6 md:col-span-4 flex gap-1">
                                        <input
                                            type="date"
                                            value={session.date}
                                            onChange={(e) =>
                                                handleRoundSessionChange(idx, "date", e.target.value)
                                            }
                                            className="w-full rounded-md border border-[#e2e8f0] px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-[#FBBF24]"
                                            title="session date"
                                        />
                                        <input
                                            type="time"
                                            value={session.time || "18:00"}
                                            onChange={(e) =>
                                                handleRoundSessionChange(idx, "time", e.target.value)
                                            }
                                            className="w-full rounded-md border border-[#e2e8f0] px-1 py-1 text-[10px] outline-none focus:ring-1 focus:ring-[#FBBF24]"
                                            title="session time"
                                        />
                                    </div>

                                </div>
                                <div className="mt-3">
                                    <textarea
                                        type="text"
                                        onChange={(e) =>
                                            handleRoundSessionChange(idx, "description", e.target.value)
                                        }
                                        value={session.description}
                                        className="w-full rounded-md border border-[#e2e8f0] px-1 py-1 text-[10px] outline-none focus:ring-1 focus:ring-[#FBBF24]" placeholder="description" />
                                </div>
                            </div>
                        ))}
                    </div>
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
                    const students = getRoundStudents(r.code);
                    const rating = getRoundRating(r.code);
                    return (
                        <div
                            key={r.id}
                            className="border cursor-pointer border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div >
                                    <div className="round-details cursor-pointer" onClick={() => navigate(`/admin/round/${r.id ?? r._id}`)}>
                                        <p className="name font-semibold text-slate-800">
                                            {r.name}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {r.level} · {r.campus}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {r.startDate} → {r.endDate} ·{" "}
                                            {r.sessionsCount} sessions ·{" "}
                                            {r.weeksPerSession} sessions / week
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
                                                handleRoundStatusChange(r.id, "Active")
                                            }
                                            className="px-2 py-1 rounded_full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
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
                                                handleRoundStatusChange(
                                                    r.id,
                                                    "Completed"
                                                )
                                            }
                                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fef3c7] text-[#854d0e] hover:bg-[#fef9c3]"
                                        >
                                            Completed
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRound(r.id)}
                                            className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#fee2e2] text-[#b91c1c] hover:bg-[#fee2e2]"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <button
                                        // onClick={() => toggleRoundExpand(r.id)}
                                        onClick={() => navigate(`/admin/round/${r.id}/students`)}
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
