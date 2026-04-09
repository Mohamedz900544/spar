import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "./salesHelpers";

const SalesFreeSessionPage = () => {
  const sales = useOutletContext();
  const [drafts, setDrafts] = useState({});

  const requestedLeads = useMemo(() => {
    return (sales.leads || [])
      .filter(
        (lead) =>
          lead.freeSession?.requested ||
          lead.source === "Free Session" ||
          (lead.status || "New") === "Demo Booked"
      )
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [sales.leads]);

  const instructorPhoneById = useMemo(() => {
    const map = {};
    for (const instructor of sales.instructors || []) {
      const id = instructor.id || instructor._id;
      if (!id) continue;
      map[id] = instructor.phone || "";
    }
    return map;
  }, [sales.instructors]);

  useEffect(() => {
    const next = {};
    for (const lead of requestedLeads) {
      const leadId = lead.id || lead._id;
      next[leadId] = {
        instructorId: lead.freeSession?.instructor || "",
        scheduledAt: lead.freeSession?.scheduledAt
          ? new Date(lead.freeSession.scheduledAt).toISOString().slice(0, 16)
          : "",
      };
    }
    setDrafts(next);
  }, [requestedLeads]);

  const updateDraft = (leadId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [leadId]: {
        instructorId: prev[leadId]?.instructorId || "",
        scheduledAt: prev[leadId]?.scheduledAt || "",
        [field]: value,
      },
    }));
  };

  const assign = async (lead) => {
    const leadId = lead.id || lead._id;
    const draft = drafts[leadId] || {};
    await sales.assignFreeSession({
      leadId,
      instructorId: draft.instructorId,
      scheduledAt: draft.scheduledAt,
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#102a5a]">Assign Free Session</h2>
        <span className="text-xs text-slate-500">
          {requestedLeads.length} leads requested free session
        </span>
      </div>

      {requestedLeads.length === 0 ? (
        <p className="text-sm text-slate-500">
          No leads currently marked as free session requests.
        </p>
      ) : (
        <div className="space-y-3">
          {requestedLeads.map((lead) => {
            const leadId = lead.id || lead._id;
            const draft = drafts[leadId] || { instructorId: "", scheduledAt: "" };
            const isAssigned = Boolean(lead.freeSession?.isAssigned);

            return (
              <article key={leadId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-[#102a5a]">{lead.parentName}</p>
                    <p className="text-xs text-slate-600">
                      Child: {lead.childName} {lead.childAge ? `(${lead.childAge})` : ""} · {lead.phone}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Source: {lead.source || "Manual"}
                    </p>
                  </div>
                  {isAssigned && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Assigned
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Choose Instructor
                    </label>
                    <select
                      value={draft.instructorId}
                      onChange={(e) => updateDraft(leadId, "instructorId", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                    >
                      <option value="">Select instructor</option>
                      {sales.instructors.map((instructor) => (
                        <option key={instructor.id || instructor._id} value={instructor.id || instructor._id}>
                          {instructor.name} - {instructor.phone || "No phone"}{" "}
                          {instructor.campusCode ? `(${instructor.campusCode})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Session Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={draft.scheduledAt}
                      onChange={(e) => updateDraft(leadId, "scheduledAt", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => assign(lead)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold bg-[#102a5a] text-white hover:bg-[#1a3a6b] transition-all"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Assign Free Session
                    </button>
                  </div>
                </div>

                {isAssigned && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Current instructor:</span>{" "}
                      {lead.freeSession?.instructorName || "-"}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold">Instructor phone:</span>{" "}
                      {instructorPhoneById[lead.freeSession?.instructor] || "-"}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold">Scheduled at:</span>{" "}
                      {formatDateTime(lead.freeSession?.scheduledAt)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Assigned by {lead.freeSession?.assignedByName || "-"} at{" "}
                      {formatDateTime(lead.freeSession?.assignedAt)}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SalesFreeSessionPage;
