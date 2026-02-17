import { motion } from "framer-motion";
import { CalendarClock, ImageIcon, Inbox, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tabs = ({ activeTab, setActiveTab, tabButtonBase, newMessagesCount }) => {
    const MotionContainer = motion.div
    const navigate = useNavigate();
    return (
        <MotionContainer
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-6"
        >
            <button
                onClick={() => setActiveTab("overview")}
                className={
                    activeTab === "overview"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <Users className="w-4 h-4" />
                Overview
            </button>

            <button
                onClick={() => setActiveTab("rounds")}
                className={
                    activeTab === "rounds"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <CalendarClock className="w-4 h-4" />
                Rounds
            </button>

            <button
                onClick={() => setActiveTab("sessions")}
                className={
                    activeTab === "sessions"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <CalendarClock className="w-4 h-4" />
                Sessions
            </button>

            <button
                onClick={() => setActiveTab("enrollments")}
                className={
                    activeTab === "enrollments"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <Users className="w-4 h-4" />
                Enrollments
            </button>

            <button
                onClick={() => setActiveTab("instructors")}
                className={
                    activeTab === "instructors"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <Users className="w-4 h-4" />
                Instructors
            </button>

            <button
                onClick={() => setActiveTab("gallery")}
                className={
                    activeTab === "gallery"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <ImageIcon className="w-4 h-4" />
                Gallery
            </button>

            <button
                onClick={() => setActiveTab("messages")}
                className={
                    activeTab === "messages"
                        ? `${tabButtonBase} bg-[#0b63c7] text-white shadow-md`
                        : `${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`
                }
            >
                <Inbox className="w-4 h-4" />
                Messages
                {newMessagesCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#fee2e2] text-[10px] font-semibold text-[#b91c1c]">
                        {newMessagesCount}
                    </span>
                )}
            </button>
            <button
                onClick={() => navigate("/admin/inbox")}
                className={`${tabButtonBase} bg-white/80 text-slate-700 border border-[#dbeafe] hover:bg-white`}
            >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Inbox
            </button>
        </MotionContainer>
    )
}

export default Tabs
