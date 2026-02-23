import { LogOut, Play, Settings, User, Sparkles } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { LogoutLogic } from "./LogoutLogic"
import { LucideLayoutDashboard } from "lucide-react"

const ParentHeader = ({ data }) => {

    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-white">
        <header
            className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 shadow-lg"
            style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 55%, #1a3a6b 100%)" }}
        >
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo-white.png" alt="Sparvi Lab" className="h-8" />
                <span
                    className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FBBF24]/30 text-[#FBBF24]"
                    style={{ background: "rgba(251,191,36,0.08)" }}
                >
                    {/* <Sparkles className="w-3 h-3" /> */}
                    Parent Portal
                </span>
            </Link>

            {/* Profile Area */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white">{data.name}</p>
                    <p className="text-[10px] text-[#FBBF24] font-semibold uppercase tracking-widest">Parent</p>
                </div>

                <div className="relative group cursor-pointer">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full border-2 border-[#FBBF24]/40 shadow-md overflow-hidden bg-white/10 ring-2 ring-white/10">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/10 text-white">
                                <User size={20} />
                            </div>
                        )}
                    </div>

                    {/* Dropdown */}
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
