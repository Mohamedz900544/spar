import { FaSpinner } from "react-icons/fa6"

export const Button = ({ type, text, isLoading }) => {
    return <button
        type={type}
        disabled={isLoading ? true : false}
        className={`${isLoading ? 'bg-gray-500' : ` bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c] `} flex justify-center items-center gap-3 w-full rounded-full  text-slate-900 font-semibold text-xs md:text-sm py-2.5 shadow-md hover:shadow-lg`}
    >
        {text} {isLoading && <FaSpinner className="animate-spin" />}
    </button>
}