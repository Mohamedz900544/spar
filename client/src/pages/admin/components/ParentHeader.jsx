import { LogOut, Play, Settings, User, Sparkles } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { LogoutLogic } from "./LogoutLogic"
import { LucideLayoutDashboard } from "lucide-react"

const ParentHeader = ({ data }) => {

    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-white">
      
        <Outlet />
    </div>
}

export default ParentHeader
