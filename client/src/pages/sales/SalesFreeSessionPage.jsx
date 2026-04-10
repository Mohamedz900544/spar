import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarClock, CheckCircle2, UserRound, Clock, ChevronDown, GraduationCap, Phone, Baby, MapPin, AlertCircle } from "lucide-react";
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

  const assignedCount = requestedLeads.filter((l) => l.freeSession?.isAssigned).length;
  const pendingCount = requestedLeads.length - assignedCount;

  return (
    <section className="space-y-5">
      {/* Header Card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 55%, #1a3a6b 100%)" }}
      >
        <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-[#FBBF24]/10" />
        <div className="absolute -bottom-3 left-1/3 w-10 h-10 rounded-full bg-emerald-500/10" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-[#FBBF24]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Assign Free Sessions</h2>
              <p className="text-xs text-slate-300">Pair leads with instructors and schedule their trial</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2 border border-white/10">
              <p className="text-lg font-bold text-[#FBBF24]">{pendingCount}</p>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Pending</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2 border border-white/10">
              <p className="text-lg font-bold text-emerald-400">{assignedCount}</p>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Assigned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {requestedLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-[#102a5a] mb-1">No Requests Yet</h3>
          <p className="text-sm text-slate-500">No leads currently need a free session assignment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requestedLeads.map((lead) => {
            const leadId = lead.id || lead._id;
            const draft = drafts[leadId] || { instructorId: "", scheduledAt: "" };
            const isAssigned = Boolean(lead.freeSession?.isAssigned);

            return (
              <article
                key={leadId}
                className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
                  isAssigned ? "border-emerald-200" : "border-slate-100 hover:border-[#FBBF24]/30 hover:shadow-md"
                }`}
              >
                {/* Lead Info Header */}
                <div className={`px-5 py-4 border-b ${isAssigned ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAssigned ? "bg-emerald-100 text-emerald-600" : "bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] text-white"
                      }`}>
                        {isAssigned ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{(lead.parentName || "?")[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#102a5a]">{lead.parentName}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1"><Baby className="w-3 h-3" /> {lead.childName}{lead.childAge ? ` (${lead.childAge})` : ""}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                        lead.source === "Free Session"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {lead.source || "Manual"}
                      </span>
                      {isAssigned && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment Form */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Instructor Select */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <GraduationCap className="w-3.5 h-3.5 text-[#102a5a]" />
                        Instructor
                      </label>
                      <div className="relative">
                        <select
                          value={draft.instructorId}
                          onChange={(e) => updateDraft(leadId, "instructorId", e.target.value)}
                          className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all cursor-pointer"
                        >
                          <option value="">Select instructor…</option>
                          {sales.instructors.map((instructor) => (
                            <option key={instructor.id || instructor._id} value={instructor.id || instructor._id}>
                              {instructor.name} - {instructor.phone || "No phone"}{" "}
                              {instructor.campusCode ? `(${instructor.campusCode})` : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={draft.scheduledAt}
                        onChange={(e) => updateDraft(leadId, "scheduledAt", e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all"
                      />
                    </div>

                    {/* Assign Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => assign(lead)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all group"
                        style={{ background: isAssigned ? "linear-gradient(135deg, #059669, #10b981)" : "linear-gradient(135deg, #102a5a, #1a3a6b)" }}
                      >
                        <CalendarClock className="w-4 h-4" />
                        {isAssigned ? "Reassign" : "Assign Session"}
                      </button>
                    </div>
                  </div>

                  {/* Assignment Details (when assigned) */}
                  {isAssigned && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Current Assignment
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-[#102a5a]">Instructor:</span>{" "}
                          {lead.freeSession?.instructorName || "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-[#102a5a]">Phone:</span>{" "}
                          {instructorPhoneById[lead.freeSession?.instructor] || "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-[#102a5a]">Scheduled:</span>{" "}
                          {formatDateTime(lead.freeSession?.scheduledAt)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Assigned by {lead.freeSession?.assignedByName || "-"} at{" "}
                          {formatDateTime(lead.freeSession?.assignedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SalesFreeSessionPage;
