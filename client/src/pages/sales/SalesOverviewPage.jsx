import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Send,
  TrendingUp,
} from "lucide-react";
import { LEAD_STATUSES, statusPill, formatDateTime, normalizeLeadStatus } from "./salesHelpers";

const WHATSAPP_AUTOMATION_TESTS = [
  { type: "sales_follow_up", label: "Sales follow-up" },
  { type: "reserved_call_reminder", label: "Reserved later reminder" },
  { type: "busy_call_reminder", label: "Busy call later reminder" },
  { type: "instructor_assignment", label: "Instructor assignment" },
  { type: "instructor_reminder", label: "Instructor reminder" },
  { type: "parent_welcome", label: "Parent welcome" },
  { type: "parent_assignment", label: "Parent booking" },
  { type: "parent_reminder", label: "Parent reminder" },
];

const statusTheme = {
  New: {
    dot: "bg-blue-500",
    fill: "bg-blue-500",
    border: "border-blue-100",
  },
  "Reserved Later": {
    dot: "bg-cyan-500",
    fill: "bg-cyan-500",
    border: "border-cyan-100",
  },
  "Demo Booked": {
    dot: "bg-violet-500",
    fill: "bg-violet-500",
    border: "border-violet-100",
  },
  "Follow-up": {
    dot: "bg-amber-500",
    fill: "bg-amber-500",
    border: "border-amber-100",
  },
  "Busy Call Later": {
    dot: "bg-cyan-500",
    fill: "bg-cyan-500",
    border: "border-cyan-100",
  },
  "Closed - Won": {
    dot: "bg-emerald-500",
    fill: "bg-emerald-500",
    border: "border-emerald-100",
  },
  "Closed - Lost": {
    dot: "bg-rose-500",
    fill: "bg-rose-500",
    border: "border-rose-100",
  },
};

const numberFormatter = new Intl.NumberFormat("en-US");

const getStatusCount = (stats, status) => {
  if (status !== "Reserved Later") return Number(stats?.[status] || 0);
  return (
    Number(stats?.["Reserved Later"] || 0) +
    Number(stats?.Contacted || 0)
  );
};

const SalesOverviewPage = () => {
  const sales = useOutletContext();

  const latestLeads = [...(sales.leads || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const statusCounts = LEAD_STATUSES.map((status) => ({
    status,
    count: getStatusCount(sales.stats, status),
    theme: statusTheme[status] || statusTheme.New,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count));

  return (
    <div className="space-y-5">
      {/* <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Free Session Requests
              </p>
              <h2 className="mt-2 max-w-xl text-lg font-semibold leading-snug tracking-normal text-slate-700 sm:text-xl">
                {numberFormatter.format(freeSessionRequests.length)} leads waiting for assignment
              </h2>
            </div>
            <Link
              to="/sales/free-session"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              Assign Free Session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={sales.sendWhatsAppTest}
              disabled={sales.isSendingWhatsAppTest}
              className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-100 disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-bold text-emerald-800">
                  {sales.isSendingWhatsAppTest ? "Sending Test..." : "Test WhatsApp (01007775705)"}
                </span>
                <span className="mt-1 block text-xs font-semibold text-emerald-600">
                  Test number: 01007775705
                </span>
              </span>
              <Send className="h-4 w-4 shrink-0 text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={sales.sendEmailTest}
              disabled={sales.isSendingEmailTest}
              className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-left transition-all hover:border-sky-200 hover:bg-sky-100 disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-bold text-sky-800">
                  {sales.isSendingEmailTest ? "Sending Test..." : "Test Email (mohamedz90054@gmail.com)"}
                </span>
                <span className="mt-1 block text-xs font-semibold text-sky-600">
                  Test email: mohamedz90054@gmail.com
                </span>
              </span>
              <Mail className="h-4 w-4 shrink-0 text-sky-700" />
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-slate-700">
                WhatsApp Automation Tests
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Test number: 01007775705</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WHATSAPP_AUTOMATION_TESTS.map((test) => {
              const isSending = Boolean(sales.sendingWhatsAppAutomationTests?.[test.type]);
              return (
                <button
                  key={test.type}
                  type="button"
                  onClick={() => sales.sendWhatsAppAutomationTest(test.type, test.label)}
                  disabled={isSending}
                  className="inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-left text-sm font-bold text-emerald-800 transition-all hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
                >
                  <span className="min-w-0 truncate">{isSending ? "Sending..." : test.label}</span>
                  <Send className="h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </section> */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statusCounts.map(({ status, count, theme }) => {
          return (
            <article
              key={status}
              className={`rounded-xl border bg-white p-4 shadow-sm ${theme.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-700">{status}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-normal text-slate-800">
                    {numberFormatter.format(count)}
                  </p>
                </div>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-slate-300" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${theme.fill}`}
                  style={{ width: `${Math.max(4, (count / maxStatusCount) * 100)}%` }}
                />
              </div>
            </article>
          );
        })}
      </section>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          to="/sales/pipeline"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pipeline View</p>
          <h3 className="text-lg font-bold text-[#102a5a] mt-2">Manage all leads</h3>
          <p className="text-sm text-slate-500 mt-1">Quick update status, notes, WhatsApp and payment link.</p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#102a5a]">
            Open pipeline <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/sales/new"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Add Lead</p>
          <h3 className="text-lg font-bold text-[#102a5a] mt-2">Create lead in seconds</h3>
          <p className="text-sm text-slate-500 mt-1">Dedicated page for clean and fast lead entry.</p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#102a5a]">
            Create lead <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/sales/follow-ups"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Follow-ups</p>
          <h3 className="text-lg font-bold text-[#102a5a] mt-2">Focus on hot leads</h3>
          <p className="text-sm text-slate-500 mt-1">Demo booked + follow-up queue with trainer notes.</p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#102a5a]">
            Open follow-ups <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div> */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-normal text-slate-700">Performance</h2>
          <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Statuses
          </span>
        </div>

        <div className="flex min-h-[220px] items-end gap-3 overflow-x-auto pb-1">
          {statusCounts.map(({ status, count, theme }) => (
            <div key={status} className="flex min-w-[92px] flex-1 flex-col items-center">
              <div className="flex h-36 w-full max-w-[56px] items-end rounded-t-lg bg-slate-50 px-2">
                <div
                  className={`w-full rounded-t-lg ${theme.fill}`}
                  style={{ height: `${Math.max(8, (count / maxStatusCount) * 100)}%` }}
                />
              </div>
              <p className="mt-3 w-full truncate text-center text-xs font-bold text-slate-600" title={status}>
                {status}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {numberFormatter.format(count)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold tracking-normal text-slate-700">Latest Leads</h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
            <CalendarClock className="h-3.5 w-3.5" />
            last updates
          </span>
        </div>
        {latestLeads.length === 0 ? (
          <p className="px-5 py-8 text-sm font-medium text-slate-500">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-5 py-3 text-left text-xs font-bold">Parent</th>
                  <th className="px-5 py-3 text-left text-xs font-bold">Child</th>
                  <th className="px-5 py-3 text-left text-xs font-bold">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-bold">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {latestLeads.map((lead) => (
                  (() => {
                    const status = normalizeLeadStatus(lead.status);
                    return (
                      <tr key={lead.id || lead._id} className="border-b border-slate-100 text-slate-700 last:border-0">
                        <td className="px-5 py-4 font-bold text-slate-950">{lead.parentName}</td>
                        <td className="px-5 py-4 font-medium">{lead.childName}</td>
                        <td className="px-5 py-4 font-medium">{lead.phone}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                              statusPill[status] || "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                          {formatDateTime(lead.updatedAt || lead.createdAt)}
                        </td>
                      </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default SalesOverviewPage;
