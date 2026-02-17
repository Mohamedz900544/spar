import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const LogoutLogic = ({ style }) => {
    const navigate = useNavigate()
    const onLogout = () => {
        localStorage.removeItem("sparvi_role")
        localStorage.removeItem("sparvi_token")
        localStorage.removeItem("sparvi_user")
        localStorage.removeItem("sparvi_user_email")
        localStorage.removeItem("sparvi_user_name")
        navigate('/login')
    }
    return <button
        onClick={onLogout}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600  rounded-lg ${style}`}>
        <LogOut size={16} /> Logout
    </button>
}