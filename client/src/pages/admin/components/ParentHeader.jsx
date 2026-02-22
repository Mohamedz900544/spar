import { LogOut, Play, Settings, User, Sparkles } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { LogoutLogic } from "./LogoutLogic"
import { LucideLayoutDashboard } from "lucide-react"

const ParentHeader = ({ data }) => {

    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-white">
        <header className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] rounded-xl flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5 text-[#FBBF24]" />
                </div>
                <span className="font-bold text-[#102a5a] text-lg hidden md:block tracking-tight">Sparvi Lab</span>
            </div>

            {/* Profile Area */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{data.name}</p>
                    <p className="text-[10px] text-[#FBBF24] font-semibold uppercase tracking-widest">Parent Portal</p>
                </div>

                <div className="relative group cursor-pointer">
                    {/* The Avatar */}
                    <div className="w-10 h-10 rounded-full border-2 border-[#FBBF24]/30 shadow-md overflow-hidden bg-slate-100 ring-2 ring-white">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] text-white">
                                <User size={20} />
                            </div>
                        )}
                    </div>

                    {/* Simple Dropdown on Hover/Click */}
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50">
                        <Link to="/parent/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <LucideLayoutDashboard size={16} className="text-[#102a5a]" /> Dashboard
                        </Link>
                        <Link to="/parent/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <Settings size={16} className="text-slate-500" /> Settings
                        </Link>
                        <Link to="/blocks/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <Play size={16} className="text-[#FBBF24]" /> Blocks
                        </Link>
                        <div className="my-1 border-t border-slate-100"></div>
                        <LogoutLogic style={"hover:bg-red-50"} />
                    </div>
                </div>
            </div>
        </header>
        <Outlet />
    </div>
}

export default ParentHeader
