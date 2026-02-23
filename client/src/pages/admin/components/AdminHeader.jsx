import { Search, Shield } from "lucide-react"
import { LogoutLogic } from "./LogoutLogic"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { LucideLayoutDashboard, MenuIcon } from "lucide-react"

const AdminHeader = ({ isLoading, searchValue, setSearchValue }) => {
    const [searchAppear, setSearchAppear] = useState(false);
    const { pathname } = useLocation()
    const isStudentsPage = !!pathname.match(/\/admin\/round\/.{24}\/students/);

    return <div className="min-h-screen relative bg-gradient-to-b from-slate-50 via-white to-white flex flex-col">
        <header
            className="relative text-white px-5 md:px-8 py-3.5 flex items-center justify-between shadow-lg border-b border-[#FBBF24]/20"
            style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 55%, #1a3a6b 100%)" }}
        >
            {/* Logo + role badge */}
            <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo-white.png" alt="Sparvi Lab" className="h-8" />
                <span
                    className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FBBF24]/30 text-[#FBBF24]"
                    style={{ background: "rgba(251,191,36,0.08)" }}
                >
                    <Shield className="w-3 h-3" />
                    Admin Panel
                </span>
            </Link>

            {/* Search dropdown (students page only) */}
            {isStudentsPage && <>
                <div tabIndex={-1} className={`absolute left-1/2 top-full -translate-x-1/2 w-64 transition-all duration-300 ease-in-out z-20
                ${searchAppear
                        ? " translate-y-2 opacity-100 visible"
                        : " -translate-y-full opacity-0 invisible -z-10"
                    }`}>
                    <input type="text" value={searchValue} onChange={(e) => {
                        setSearchValue(e.target.value)
                    }} className="w-full bg-white text-slate-800 outline-none px-4 py-2.5 focus:ring-2 focus:ring-[#FBBF24] rounded-xl border border-slate-200 shadow-lg text-sm" placeholder="Search student or parent..." />
                </div>
            </>
            }

            <div className="flex items-center gap-3">
                {isStudentsPage && <button onClick={() => {
                    setSearchAppear(!searchAppear)
                }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Search className="w-5 h-5" />
                </button>}

                <div className="relative group cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <MenuIcon className="w-5 h-5" />
                    </div>
                    <div className="absolute right-0 mt-2 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                        <Link to="/admin/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <LucideLayoutDashboard size={16} className="text-[#102a5a]" /> Dashboard
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

export default AdminHeader
