import { motion } from "framer-motion";
import { CalendarClock, ImageIcon, Inbox, Users, BarChart3, GraduationCap } from "lucide-react";

const Tabs = ({ activeTab, setActiveTab, tabButtonBase, newMessagesCount }) => {
    const MotionContainer = motion.div

    const activeStyle = `${tabButtonBase} bg-[#102a5a] text-white shadow-md`;
    const inactiveStyle = `${tabButtonBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-[#102a5a]/20`;

    return (
        <MotionContainer
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-6"
        >
            <button
                onClick={() => setActiveTab("overview")}
                className={activeTab === "overview" ? activeStyle : inactiveStyle}
            >
                <BarChart3 className="w-4 h-4" />
                Overview
            </button>

            <button
                onClick={() => setActiveTab("rounds")}
                className={activeTab === "rounds" ? activeStyle : inactiveStyle}
            >
                <CalendarClock className="w-4 h-4" />
                Rounds
            </button>

            <button
                onClick={() => setActiveTab("sessions")}
                className={activeTab === "sessions" ? activeStyle : inactiveStyle}
            >
                <CalendarClock className="w-4 h-4" />
                Sessions
            </button>

            <button
                onClick={() => setActiveTab("enrollments")}
                className={activeTab === "enrollments" ? activeStyle : inactiveStyle}
            >
                <Users className="w-4 h-4" />
                Enrollments
            </button>

            <button
                onClick={() => setActiveTab("instructors")}
                className={activeTab === "instructors" ? activeStyle : inactiveStyle}
            >
                <GraduationCap className="w-4 h-4" />
                Instructors
            </button>

            <button
                onClick={() => setActiveTab("users")}
                className={activeTab === "users" ? activeStyle : inactiveStyle}
            >
                <Users className="w-4 h-4" />
                Users
            </button>

            <button
                onClick={() => setActiveTab("gallery")}
                className={activeTab === "gallery" ? activeStyle : inactiveStyle}
            >
                <ImageIcon className="w-4 h-4" />
                Gallery
            </button>

            <button
                onClick={() => setActiveTab("messages")}
                className={activeTab === "messages" ? activeStyle : inactiveStyle}
            >
                <Inbox className="w-4 h-4" />
                Messages
                {newMessagesCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#FBBF24] text-[10px] font-bold text-[#102a5a]">
                        {newMessagesCount}
                    </span>
                )}
            </button>
        </MotionContainer>
    )
}

export default Tabs
