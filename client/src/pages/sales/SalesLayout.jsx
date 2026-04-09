import { Link, NavLink, Outlet } from "react-router-dom";
import { ClipboardList, LogOut, RefreshCw, UserPlus, Users, TrendingUp } from "lucide-react";
import { useSalesDashboard } from "./hooks/useSalesDashboard";

const navItems = [
  { to: "/sales", label: "Overview", icon: TrendingUp },
  { to: "/sales/pipeline", label: "Pipeline", icon: ClipboardList },
  { to: "/sales/new", label: "New Lead", icon: UserPlus },
  { to: "/sales/follow-ups", label: "Follow-ups", icon: Users },
  { to: "/sales/closed", label: "Closed Deals", icon: Users },
];

const SalesLayout = () => {
  const sales = useSalesDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col">
      <header
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo-white.png" alt="Sparvi Lab" className="h-8" />
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FBBF24]/30 text-[#FBBF24]">
                Sales Dashboard
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={sales.fetchDashboard}
                disabled={sales.isRefreshing}
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${sales.isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={sales.logout}
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
            Telesales <span className="text-[#FBBF24]">Workspace</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Internal pages and focused routes to move faster between pipeline, follow-ups, and closed deals.
          </p>

          <nav className="mt-6 bg-white/10 border border-white/15 rounded-2xl p-2">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/sales"}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#FBBF24] text-[#102a5a]"
                          : "bg-white/5 text-white/90 hover:bg-white/15"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 -mt-3 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-5">
          {sales.error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-4 py-3">
              {sales.error}
            </div>
          )}

          <Outlet context={sales} />
        </div>
      </main>
    </div>
  );
};

export default SalesLayout;
