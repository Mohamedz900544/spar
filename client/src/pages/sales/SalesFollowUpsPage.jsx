import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageCircle, Save } from "lucide-react";
import { LEAD_STATUSES, formatDateTime, toWhatsAppLink } from "./salesHelpers";

const focusStatuses = ["Demo Booked", "Follow-up", "Contacted"];

const SalesFollowUpsPage = () => {
  const sales = useOutletContext();

  const leads = useMemo(
    () =>
      (sales.leads || [])
        .filter((lead) => focusStatuses.includes(lead.status || "New"))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [sales.leads]
  );

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#102a5a]">Follow-ups</h2>
        <span className="text-xs text-slate-500">{leads.length} active leads</span>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500">No leads currently need follow-up.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const leadId = lead.id || lead._id;
            const noteValue = sales.noteDrafts[leadId] || "";
            const waLink = toWhatsAppLink(lead.phone);

            return (
              <article key={leadId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-[#102a5a]">{lead.parentName}</p>
                    <p className="text-xs text-slate-600">
                      Child: {lead.childName} {lead.childAge ? `(${lead.childAge})` : ""} · {lead.phone}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Last update: {formatDateTime(lead.updatedAt || lead.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status || "New"}
                      onChange={(e) => sales.updateLeadStatus(lead, e.target.value)}
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <a
                      href={waLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                        waLink
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-[#102a5a] mb-1">Trainer Initial Evaluation</p>
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Strengths:</span>{" "}
                      {lead.trainerEvaluation?.strengths || "Not added yet."}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold">Favorite project:</span>{" "}
                      {lead.trainerEvaluation?.favoriteProject || "Not added yet."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-[#102a5a] mb-1">Add Follow-up Note</p>
                    <textarea
                      rows={3}
                      value={noteValue}
                      onChange={(e) =>
                        sales.setNoteDrafts((prev) => ({
                          ...prev,
                          [leadId]: e.target.value,
                        }))
                      }
                      placeholder="Asked to call next week..."
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                    />
                    <button
                      type="button"
                      onClick={() => sales.addLeadNote(lead, noteValue)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24] px-2.5 py-1.5 text-[11px] font-semibold text-[#102a5a] hover:bg-[#FBBF24]/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save note
                    </button>
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

export default SalesFollowUpsPage;
