import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { Edit2, Trash2 } from 'lucide-react';
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
                                                    <button onClick={() => {
                                                        setOpenForm(true)
                                                        setSession(s)
                                                    }} className="p-1 rounded-full hover:bg-[#eff6ff] text-slate-500">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1 rounded-full hover:bg-[#fee2e2] text-[#b91c1c]">
                                                        <Trash2 onClick={() => handleDelete(s._id)} className="w-3.5 h-3.5" />
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
