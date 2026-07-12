import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  LogOut,
  MessageSquareText,
  Send,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useSalesDashboard } from "./hooks/useSalesDashboard";
import {
  fillWhatsAppMessageTemplate,
  loadCustomWhatsAppMessages,
  saveCustomWhatsAppMessages,
  toWhatsAppMessageLink,
} from "./salesHelpers";

const navItems = [
  { to: "/sales", label: "Overview", icon: TrendingUp },
  { to: "/sales/new", label: "New Lead", icon: UserPlus },
  { to: "/sales/pipeline", label: "Pipeline", icon: ClipboardList },
  { to: "/sales/free-session", label: "Assign Free Session", icon: CalendarClock },
  { to: "/sales/follow-ups", label: "Follow-ups", icon: Users },
  { to: "/sales/closed", label: "Closed Deals", icon: Users },
  { to: "/sales/custom-messages", label: "Custom Messages", icon: MessageSquareText },
];

const getPageTitle = (pathname) => {
  const activeItem =
    navItems.find((item) =>
      item.to === "/sales" ? pathname === "/sales" : pathname.startsWith(item.to)
    ) || navItems[0];

  return activeItem.label === "Overview" ? "Dashboard" : activeItem.label;
};

const SalesLayout = () => {
  const sales = useSalesDashboard();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [customWhatsAppMessages, setCustomWhatsAppMessages] = useState(() =>
    loadCustomWhatsAppMessages()
  );
  const [whatsAppPickerLead, setWhatsAppPickerLead] = useState(null);

  useEffect(() => {
    saveCustomWhatsAppMessages(customWhatsAppMessages);
  }, [customWhatsAppMessages]);

  const closeWhatsAppMessagePicker = () => setWhatsAppPickerLead(null);

  const closeLostReasonPrompt = () => {
    sales.closeLostReasonPrompt();
  };

  const sendWhatsAppMessage = (message) => {
    if (!whatsAppPickerLead) return;
    const resolvedMessage = message
      ? fillWhatsAppMessageTemplate(message.body, whatsAppPickerLead)
      : "";
    const link = toWhatsAppMessageLink(whatsAppPickerLead.phone, resolvedMessage);
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
    closeWhatsAppMessagePicker();
  };

  const salesContext = {
    ...sales,
    customWhatsAppMessages,
    setCustomWhatsAppMessages,
    openWhatsAppMessagePicker: setWhatsAppPickerLead,
  };

  return (
    <div className="sales-parent-theme h-screen w-full overflow-hidden bg-[#f4f7fb] font-sans text-slate-950 [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <div className="flex h-full w-full overflow-hidden bg-[#f4f7fb]">
        <aside className="hidden w-64 shrink-0 border-r border-blue-100 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-blue-100 px-6">
            <Link to="/sales" className="inline-flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-semibold text-slate-800">SP School Sales</span>
                <span className="block truncate text-xs font-semibold text-blue-600">Telesales Workspace</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/sales"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                          : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-blue-100 px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>
            <button
              type="button"
              onClick={sales.logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f4f7fb]">
          <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:h-20 lg:py-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to="/sales"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 lg:hidden"
                >
                  <img src="/icon.png" alt="SP School" className="h-6 w-6 rounded-md object-contain" />
                </Link>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-950">
                    {pageTitle}
                  </h1>
                  <p className="truncate text-xs font-semibold text-blue-500">
                    Telesales Workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={sales.fetchDashboard}
                  disabled={sales.isRefreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${sales.isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={sales.logout}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/sales"}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-500 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="w-full space-y-5">
              {sales.error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {sales.error}
                </div>
              )}

              <Outlet context={salesContext} />
            </div>
          </main>
        </div>
      </div>

      {sales.lostReasonPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close lost reason form"
            onClick={closeLostReasonPrompt}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              sales.submitLostReason(formData.get("lostReason"));
            }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Close Lead as Lost
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-slate-800">
                    {sales.lostReasonPrompt.lead?.parentName || "Lead"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Add a clear reason so the team understands why this lead was lost.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeLostReasonPrompt}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-0 text-slate-500 transition-all hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Lost Reason
              </label>
              <textarea
                name="lostReason"
                rows={5}
                defaultValue={sales.lostReasonPrompt.initialReason || ""}
                required
                autoFocus
                placeholder="Example: parent is not interested, pricing concern, no response..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeLostReasonPrompt}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Reason
              </button>
            </div>
          </form>
        </div>
      )}

      {whatsAppPickerLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close WhatsApp message picker"
            onClick={closeWhatsAppMessagePicker}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
          />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  WhatsApp Message
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold text-slate-800">
                  Choose message for {whatsAppPickerLead.parentName || "customer"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeWhatsAppMessagePicker}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-0 text-slate-500 transition-all hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {customWhatsAppMessages.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  No custom WhatsApp messages yet. Add one from Custom Messages.
                </div>
              ) : (
                <div className="space-y-3">
                  {customWhatsAppMessages.map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => sendWhatsAppMessage(message)}
                      className="block w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-800">{message.title}</span>
                        <Send className="h-4 w-4 shrink-0 text-emerald-600" />
                      </span>
                      <span className="mt-2 block whitespace-pre-wrap text-xs leading-5 text-slate-500">
                        {fillWhatsAppMessageTemplate(message.body, whatsAppPickerLead)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => sendWhatsAppMessage(null)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
              >
                Open WhatsApp without message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesLayout;
