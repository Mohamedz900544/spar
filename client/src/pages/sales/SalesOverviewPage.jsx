import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, CalendarClock, Send } from "lucide-react";
import { LEAD_STATUSES, statusPill, formatDateTime } from "./salesHelpers";

const SalesOverviewPage = () => {
  const sales = useOutletContext();

  const latestLeads = [...(sales.leads || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const freeSessionRequests = (sales.leads || []).filter(
    (lead) => lead.freeSession?.requested || lead.source === "Free Session"
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Free Session Requests
          </p>
          <p className="text-lg font-bold text-[#102a5a] mt-1">
            {freeSessionRequests.length} leads waiting for assignment
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={sales.sendWhatsAppTest}
            disabled={sales.isSendingWhatsAppTest}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all"
          >
            {sales.isSendingWhatsAppTest ? "Sending Test..." : "Test WhatsApp (01007775705)"}
            <Send className="w-4 h-4" />
          </button>
          <Link
            to="/sales/free-session"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#102a5a] text-white hover:bg-[#1a3a6b] transition-all"
          >
            Assign Free Session
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {LEAD_STATUSES.map((status) => (
          <div
            key={status}
            className={`rounded-2xl border px-4 py-3 ${statusPill[status] || "bg-slate-50 border-slate-200 text-slate-700"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">{status}</p>
            <p className="text-2xl font-bold mt-1">{sales.stats[status] || 0}</p>
          </div>
        ))}
      </div>

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

      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#102a5a]">Latest Leads</h2>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <CalendarClock className="w-3.5 h-3.5" />
            last updates
          </span>
        </div>
        {latestLeads.length === 0 ? (
          <p className="text-sm text-slate-500">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide">Parent</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide">Child</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide">Phone</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide">Updated</th>
                </tr>
              </thead>
              <tbody>
                {latestLeads.map((lead) => (
                  <tr key={lead.id || lead._id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-3 font-semibold text-[#102a5a]">{lead.parentName}</td>
                    <td className="py-2 pr-3">{lead.childName}</td>
                    <td className="py-2 pr-3">{lead.phone}</td>
                    <td className="py-2 pr-3">{lead.status || "New"}</td>
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {formatDateTime(lead.updatedAt || lead.createdAt)}
                    </td>
                  </tr>
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
