import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardCopy, MessageCircle, Save } from "lucide-react";
import {
  LEAD_STATUSES,
  toWhatsAppLink,
  formatDateTime,
  statusPill,
} from "./salesHelpers";

const SalesPipelinePage = () => {
  const sales = useOutletContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (sales.leads || []).filter((lead) => {
      const matchesStatus = statusFilter === "All" || (lead.status || "New") === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return [lead.parentName, lead.childName, lead.phone, lead.source]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(q));
    });
  }, [sales.leads, search, statusFilter]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-[#102a5a]">Pipeline</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lead..."
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
          >
            <option value="All">All statuses</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <p className="text-sm text-slate-500">No leads match the current filter.</p>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const leadId = lead.id || lead._id;
            const noteValue = sales.noteDrafts[leadId] || "";
            const paymentValue = sales.paymentDrafts[leadId] ?? lead.paymentLink ?? "";
            const waLink = toWhatsAppLink(lead.phone);

            return (
              <article key={leadId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                  <div className="xl:col-span-3">
                    <p className="font-bold text-[#102a5a] text-sm">{lead.parentName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Child: {lead.childName} {lead.childAge ? `(${lead.childAge})` : ""}
                    </p>
                    <p className="text-xs text-slate-600">{lead.phone}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Updated: {formatDateTime(lead.updatedAt || lead.createdAt)}
                    </p>
                    <span
                      className={`inline-flex mt-2 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusPill[lead.status || "New"]}`}
                    >
                      {lead.status || "New"}
                    </span>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={lead.status || "New"}
                      onChange={(e) => sales.updateLeadStatus(lead, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {lead.status === "Closed - Lost" && lead.lostReason && (
                      <p className="text-[10px] text-rose-600 mt-1">{lead.lostReason}</p>
                    )}
                  </div>

                  <div className="xl:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quick Note</label>
                    <textarea
                      rows={2}
                      value={noteValue}
                      onChange={(e) =>
                        sales.setNoteDrafts((prev) => ({
                          ...prev,
                          [leadId]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                      placeholder="Call summary..."
                    />
                    <button
                      type="button"
                      onClick={() => sales.addLeadNote(lead, noteValue)}
                      className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24] px-2.5 py-1 text-[11px] font-semibold text-[#102a5a] hover:bg-[#FBBF24]/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save note
                    </button>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payment Link</label>
                    <input
                      type="url"
                      value={paymentValue}
                      onChange={(e) =>
                        sales.setPaymentDrafts((prev) => ({
                          ...prev,
                          [leadId]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                      placeholder="https://..."
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => sales.savePaymentLink(lead, paymentValue)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => sales.copyPaymentLink(paymentValue)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <ClipboardCopy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Actions</label>
                    <a
                      href={waLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                        waLink
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Trainer: {lead.trainerEvaluation?.strengths ? "Added" : "Pending"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SalesPipelinePage;
