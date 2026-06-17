import { Eye, LayoutDashboard, LogOut, Search } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const getPageTitle = (pathname) => {
  if (pathname === "/admin" || pathname === "/admin/") return "Admin Dashboard";
  if (pathname === "/admin/overview") return "Full Overview";
  if (/\/admin\/round\/[^/]+\/students/.test(pathname)) return "Round Students";
  if (/\/admin\/round\/[^/]+/.test(pathname)) return "Round Sessions";
  return "Admin";
};

const getNavLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
    isActive
      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
  }`;

const AdminHeader = ({ searchValue, setSearchValue }) => {
  const [searchAppear, setSearchAppear] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAdminHome = pathname === "/admin" || pathname === "/admin/";
  const isStudentsPage = /\/admin\/round\/[^/]+\/students/.test(pathname);
  const pageTitle = getPageTitle(pathname);

  const handleLogout = () => {
    localStorage.removeItem("sparvi_role");
    localStorage.removeItem("sparvi_token");
    localStorage.removeItem("sparvi_user");
    localStorage.removeItem("sparvi_user_email");
    localStorage.removeItem("sparvi_user_name");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-parent-theme h-screen w-full overflow-hidden bg-[#f4f7fb] font-sans text-slate-950 [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <div className="flex h-full w-full overflow-hidden bg-[#f4f7fb]">
        <aside className="hidden w-64 shrink-0 border-r border-blue-100 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-blue-100 px-6">
            <Link to="/admin" className="inline-flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-semibold text-slate-800">SP School Admin</span>
                <span className="block truncate text-xs font-semibold text-blue-600">Admin Workspace</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </p>

            {!isAdminHome && (
              <div className="space-y-1.5">
                <NavLink to="/admin" end className={getNavLinkClass}>
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Dashboard
                </NavLink>
                <NavLink to="/admin/overview" className={getNavLinkClass}>
                  <Eye className="h-4 w-4 shrink-0" />
                  Full Overview
                </NavLink>
              </div>
            )}

            <div id="admin-sidebar-tabs-slot" className={isAdminHome ? "" : "mt-4 border-t border-blue-100 pt-4"} />
          </nav>

          <div className="border-t border-blue-100 px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f4f7fb]">
          <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:h-20 lg:py-0">
            <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to="/admin"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 lg:hidden"
                >
                  <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
                </Link>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-950">
                    {pageTitle}
                  </h1>
                  <p className="truncate text-xs font-semibold text-blue-500">
                    Admin Workspace
                  </p>
                </div>
              </div>

              {isStudentsPage && (
                <div
                  className={`absolute left-1/2 top-full z-40 w-72 -translate-x-1/2 transition-all duration-200 ${
                    searchAppear
                      ? "visible translate-y-2 opacity-100"
                      : "invisible -translate-y-2 opacity-0"
                  }`}
                >
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full rounded-lg border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-lg outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="Search student or parent..."
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {isStudentsPage && (
                  <button
                    type="button"
                    onClick={() => setSearchAppear((current) => !current)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            <nav className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {!isAdminHome && (
                <>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-500 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/overview"
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-500 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Full Overview
                  </NavLink>
                </>
              )}
              <div id="admin-mobile-tabs-slot" className="contents" />
            </nav>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
