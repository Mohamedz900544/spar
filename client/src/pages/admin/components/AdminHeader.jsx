import { LogOut, Search, Settings } from "lucide-react"
import { LogoutLogic } from "./LogoutLogic"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { LucideLayoutDashboard } from "lucide-react"
import { MenuIcon } from "lucide-react"

const AdminHeader = ({ isLoading, searchValue, setSearchValue }) => {
    const [searchAppear, setSearchAppear] = useState(false);
    const { pathname } = useLocation()

    const isStudentsPage = !!pathname.match(/\/admin\/round\/.{24}\/students/);
    // useEffect(() => {

    // }, [pathname])
    return <div className="min-h-screen relative bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
        <header className="bg-[#0b63c7] relative text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
            <div>
                <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
                    Control Panel
                </h1>
                {isLoading && (
                    <p className="text-[11px] text-blue-100 mt-0.5">
                        Loading data from server…
                    </p>
                )}
            </div>

            {/* search Input */}
            {isStudentsPage && <>
                <div tabIndex={-1} className={`absolute left-1/2 top-full -translate-x-1/2 w-60 transition-all duration-300 ease-in-out
                ${searchAppear
                        ? " translate-y-2 opacity-100 visible"
                        : " -translate-y-full opacity-0 invisible -z-10"
                    }`}>
                    <input type="text" value={searchValue} onChange={(e) => {
                        setSearchValue(e.target.value)
                    }} className="w-full bg-white text-black outline-none  px-2 py-1 focus:ring-2 rounded-full" placeholder="account / child name search" />
                </div>

            </>
            }
            <div className="flex items-center gap-2">
                {isStudentsPage && <button onClick={() => {
                    setSearchAppear(!searchAppear)
                }} className="">
                    <Search />
                </button>}

                {/* <button className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-1.5 text-xs hover:bg-white/10">
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                </button>
                <button className="inline-flex group items-center gap-1 rounded-full bg-white text-[#0b63c7] px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">
                    Admin
                </button> */}
                <div className="group cursor-pointer">
                    <MenuIcon />
                    <div className="absolute right-0 mt-2 z-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                        <Link to="/admin/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                            <LucideLayoutDashboard size={16} /> Dashboard
                        </Link>
                        {/* <Link to="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                            <Settings size={16} /> Settings
                        </Link> */}
                        <LogoutLogic style={"hover:bg-red-50"} />
                    </div>
                </div>
            </div>
        </header>
        <Outlet />
    </div>
}

export default AdminHeader
