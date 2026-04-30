import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useAdminDashboard } from './admin/hooks/useAdminDashboard';
import UpdateSessionForm from './admin/components/UpdateSessionForm';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const RoundSessionsPage = () => {
    const { roundId } = useParams()
    const [roundDetails, setRoundDetails] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [openForm, setOpenForm] = useState(false)
    // const { sessions, setSessions } = useAdminDashboard()
    const [session, setSession] = useState({})
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [newSession, setNewSession] = useState({
        title: "",
        date: "",
        time: "",
        campus: "",
        capacity: 12,
        description: "",
    })
    const fetchRoundSessionData = useCallback(() => {
        axios.get(`${API_BASE_URL}/api/admin/rounds/${roundId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('sparvi_token')}`
            }
        }).then(roundData => {
            setRoundDetails(roundData.data.round)
        }).finally(() => {
            setIsLoading(false)
        })
    }, [roundId])
    useEffect(() => {
        fetchRoundSessionData()
    }, [fetchRoundSessionData])

    useEffect(() => {
        const interval = setInterval(() => {
            fetchRoundSessionData()
        }, 60000)

        return () => clearInterval(interval)
    }, [fetchRoundSessionData])

    const handleDelete = async (sessionId) => {

        await deleteSessions(sessionId);

        setRoundDetails(prev => ({
            ...prev,
            sessions: prev.sessions.filter(s => s._id !== sessionId && s.id !== sessionId)
        }));
    };

    const handleNewSessionChange = (field, value) => {
        setNewSession((prev) => ({ ...prev, [field]: value }))
    }

    const handleCreateCustomSession = async (e) => {
        e.preventDefault()

        if (!newSession.title || !newSession.date || !newSession.time) {
            alert("Please fill title, date, and time.")
            return
        }

        try {
            setIsCreatingSession(true)
            const { data } = await axios.post(
                `${API_BASE_URL}/api/admin/rounds/${roundId}/sessions`,
                newSession,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('sparvi_token')}`
                    }
                }
            )

            setRoundDetails((prev) => ({
                ...prev,
                sessions: [...(prev.sessions || []), data.session],
                sessionsCount: data.round?.sessionsCount ?? ((prev.sessions || []).length + 1),
            }))
            setNewSession({
                title: "",
                date: "",
                time: "",
                campus: "",
                capacity: 12,
                description: "",
            })
        } catch (error) {
            console.error(error)
            alert(error.response?.data?.message || "Failed to add session")
        } finally {
            setIsCreatingSession(false)
        }
    }

    const { deleteSessions, handleUpdateSession } = useAdminDashboard()
    return (
        <div className='bg-[#f5f7ff] min-h-screen relative'>
            {isLoading ?
                <p>Loading data</p>
                :
                <>
                    <UpdateSessionForm handleUpdateSession={handleUpdateSession} openForm={openForm} setOpenForm={setOpenForm} session={session} setSession={setSession} />
                    <div className=' px-40'>

                        {/* round title */}
                        <div className=' py-5'>
                            <h2 className='text-black font-bold text-2xl'>{roundDetails?.name} </h2>
                            <p className='text-[#333] text-md'>{roundDetails?.level}</p>
                        </div>
                        <form
                            onSubmit={handleCreateCustomSession}
                            className="mb-5 rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-sm"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-[#102a5a]" />
                                <h3 className="text-sm font-bold text-[#102a5a]">
                                    Add custom session
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newSession.title}
                                        onChange={(e) => handleNewSessionChange("title", e.target.value)}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                        placeholder="Extra revision session"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newSession.date}
                                        onChange={(e) => handleNewSessionChange("date", e.target.value)}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newSession.time}
                                        onChange={(e) => handleNewSessionChange("time", e.target.value)}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newSession.capacity}
                                        onChange={(e) => handleNewSessionChange("capacity", Number(e.target.value))}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Campus
                                    </label>
                                    <input
                                        type="text"
                                        value={newSession.campus}
                                        onChange={(e) => handleNewSessionChange("campus", e.target.value)}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                        placeholder={roundDetails?.campus || "Campus"}
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Description
                                    </label>
                                    <textarea
                                        value={newSession.description}
                                        onChange={(e) => handleNewSessionChange("description", e.target.value)}
                                        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                                        placeholder="Optional notes for this custom session"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreatingSession}
                                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#102a5a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a3a6b] disabled:opacity-60"
                            >
                                {isCreatingSession ? "Adding..." : "Add session"}
                            </button>
                        </form>
                        {/* sessions */}
                        <div className="overflow-x-auto bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm">
                            <table className="min-w-full text-xs md:text-sm p-2 bg-white rounded-xl">
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
                                    {roundDetails?.sessions?.map((s) => (
                                        <tr
                                            key={s.id || s._id}
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
                                                    <button onClick={() => {
                                                        setOpenForm(true)
                                                        setSession(s)
                                                    }} className="p-1 rounded-full hover:bg-[#eff6ff] text-slate-500">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1 rounded-full hover:bg-[#fee2e2] text-[#b91c1c]">
                                                        <Trash2 onClick={() => handleDelete(s.id || s._id)} className="w-3.5 h-3.5" />
                                                    </button>
                                                    {/* <button
                                                        onClick={() =>
                                                            handleSessionStatusToggle(s._id, "Completed")
                                                        }
                                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                                                    >
                                                        Completed
                                                    </button>
                                                    <button
                                                        onClick={() => handleSessionStatusToggle(s._id)}
                                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#dbeafe] text-[#0b63c7] hover:bg-[#eff6ff]"
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
                            {/* {filteredSessions.length === 0 && (
                                <p className="text-xs text-slate-500 mt-3">
                                    No sessions match your filters.
                                </p>
                            )} */}
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default RoundSessionsPage
