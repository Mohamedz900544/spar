import { LogOut, Play, Settings, User } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { LogoutLogic } from "./LogoutLogic"
import { LucideLayoutDashboard } from "lucide-react"

const ParentHeader = ({ data }) => {

    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f0f7ff] via-[#e3f2ff] to-[#ffffff]">
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#dbeafe] sticky top-0 z-50">
            {/* Logo Area */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    S
                </div>
                <span className="font-bold text-slate-800 text-lg hidden md:block">Sparvi Lab</span>
            </div>

            {/* Profile Area */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{data.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Parent Account</p>
                </div>

                <div className="relative group cursor-pointer">
                    {/* The Avatar */}
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={20} />
                            </div>
                        )}
                    </div>

                    {/* Simple Dropdown on Hover/Click */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                        <Link to="/parent/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                            <LucideLayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/parent/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                            <Settings size={16} /> Settings
                        </Link>
                        <Link to="/blocks/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                            <Play size={16} /> Blocks
                        </Link>

                        <LogoutLogic style={"hover:bg-red-50"} />
                    </div>
                </div>
            </div>
        </header>
        <Outlet />
    </div>
}

export default ParentHeader
