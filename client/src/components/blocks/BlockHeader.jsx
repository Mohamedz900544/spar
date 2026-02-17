export const BlockHeader = ({ data }) => {
    return <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#dbeafe] sticky top-0 z-50">
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

            </div>
        </div>
    </header>
}