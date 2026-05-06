import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarClock, ClipboardCopy, MessageCircle, Save } from "lucide-react";
import {
  LEAD_STATUSES,
  normalizeLeadStatus,
  toWhatsAppLink,
  formatDate,
  formatDateKey,
  formatDateTime,
  parseDashboardDateInput,
  statusPill,
} from "./salesHelpers";
import LeadNotesList from "./components/LeadNotesList";

const FILTER_BUTTONS = [...LEAD_STATUSES, "All"];
const filterButtonStyles = {
  All: "border-cyan-200 bg-cyan-50 text-cyan-700",
  New: "border-blue-200 bg-blue-50 text-blue-700",
  "Reserved Later": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Demo Booked": "border-violet-200 bg-violet-50 text-violet-700",
  "Follow-up": "border-amber-200 bg-amber-50 text-amber-700",
  "Busy Call Later": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Closed - Won": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Closed - Lost": "border-rose-200 bg-rose-50 text-rose-700",
};
const activeFilterButtonStyles = {
  All: "border-cyan-600 bg-cyan-600 text-white shadow-sm",
  New: "border-blue-600 bg-blue-600 text-white shadow-sm",
  "Reserved Later": "border-cyan-600 bg-cyan-600 text-white shadow-sm",
  "Demo Booked": "border-violet-600 bg-violet-600 text-white shadow-sm",
  "Follow-up": "border-amber-500 bg-amber-500 text-white shadow-sm",
  "Busy Call Later": "border-cyan-600 bg-cyan-600 text-white shadow-sm",
  "Closed - Won": "border-emerald-600 bg-emerald-600 text-white shadow-sm",
  "Closed - Lost": "border-rose-600 bg-rose-600 text-white shadow-sm",
};
const REMINDER_STATUSES = ["Reserved Later", "Busy Call Later"];
const CALL_LATER_DAY_OPTIONS = [
  { offset: 0, label: "Today" },
  { offset: 1, label: "Tomorrow" },
  { offset: 2, label: "After 2 days" },
];
const padDatePart = (value) => String(value).padStart(2, "0");

const getDateKeyFromOffset = (offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + Number(offset || 0));
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const getLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const getLocalTimeValue = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

const buildCallLaterAt = (dateKey, time) => {
  if (!dateKey || !time) return "";
  return `${dateKey}T${time}`;
};

const getDefaultCallDate = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
};

const createBusyCallDraft = (scheduledAt, status = "Busy Call Later") => {
  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const dateSource =
    scheduledDate && !Number.isNaN(scheduledDate.getTime())
      ? scheduledDate
      : getDefaultCallDate();
  const dateKey = getLocalDateKey(dateSource);
  const time = getLocalTimeValue(dateSource);
  const matchedDay = CALL_LATER_DAY_OPTIONS.find(
    (option) => getDateKeyFromOffset(option.offset) === dateKey
  );

  return {
    status,
    dateKey,
    dateText: formatDateKey(dateKey),
    dayOffset: matchedDay?.offset ?? null,
    time,
    callLaterAt: buildCallLaterAt(dateKey, time),
  };
};

const SalesPipelinePage = () => {
  const sales = useOutletContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("New");
  const [busyCallDrafts, setBusyCallDrafts] = useState({});

  const openBusyCallForm = (lead, status = "") => {
    const leadId = lead.id || lead._id;
    const reminderStatus = REMINDER_STATUSES.includes(status)
      ? status
      : REMINDER_STATUSES.includes(lead.status)
        ? lead.status
        : "Busy Call Later";
    setBusyCallDrafts((prev) => ({
      ...prev,
      [leadId]: createBusyCallDraft(lead.callLater?.scheduledAt, reminderStatus),
    }));
  };

  const closeBusyCallForm = (leadId) => {
    setBusyCallDrafts((prev) => {
      const next = { ...prev };
      delete next[leadId];
      return next;
    });
  };

  const updateBusyCallDraft = (leadId, field, value) => {
    setBusyCallDrafts((prev) => {
      const current = prev[leadId] || createBusyCallDraft();
      let next = { ...current, [field]: value };

      if (field === "callLaterAt") {
        const dateKey = value ? value.slice(0, 10) : "";
        const time = value ? value.slice(11, 16) : "";
        const matchedDay = CALL_LATER_DAY_OPTIONS.find(
          (option) => getDateKeyFromOffset(option.offset) === dateKey
        );
        next = {
          ...next,
          dateKey,
          dateText: formatDateKey(dateKey),
          dayOffset: matchedDay?.offset ?? null,
          time,
        };
      }

      if (field === "dayOffset") {
        const dateKey = getDateKeyFromOffset(value);
        const time = current.time || getLocalTimeValue(getDefaultCallDate());
        next = {
          ...next,
          dateKey,
          dateText: formatDateKey(dateKey),
          time,
          callLaterAt: buildCallLaterAt(dateKey, time),
        };
      }

      if (field === "customDate") {
        const dateKey = value || current.dateKey || getDateKeyFromOffset(0);
        const time = current.time || getLocalTimeValue(getDefaultCallDate());
        next = {
          ...next,
          dateKey,
          dateText: formatDateKey(dateKey),
          dayOffset: null,
          time,
          callLaterAt: buildCallLaterAt(dateKey, time),
        };
      }

      if (field === "dateKey") {
        const time = current.time || getLocalTimeValue(getDefaultCallDate());
        next = {
          ...next,
          dateKey: value,
          dateText: formatDateKey(value),
          dayOffset: null,
          time,
          callLaterAt: buildCallLaterAt(value, time),
        };
      }

      if (field === "dateText") {
        const dateKey = parseDashboardDateInput(value);
        const time = current.time || getLocalTimeValue(getDefaultCallDate());
        next = {
          ...next,
          dateText: value,
          dateKey,
          dayOffset: null,
          time,
          callLaterAt: buildCallLaterAt(dateKey, time),
        };
      }

      if (field === "time") {
        const dateKey = current.dateKey || getDateKeyFromOffset(current.dayOffset || 0);
        next = {
          ...next,
          dateKey,
          dateText: formatDateKey(dateKey),
          callLaterAt: buildCallLaterAt(dateKey, value),
        };
      }

      return {
        ...prev,
        [leadId]: next,
      };
    });
  };

  const handleStatusChange = (lead, status) => {
    const leadId = lead.id || lead._id;
    if (REMINDER_STATUSES.includes(status)) {
      openBusyCallForm(lead, status);
      return;
    }
    closeBusyCallForm(leadId);
    sales.updateLeadStatus(lead, status);
  };

  const saveBusyCallLater = async (lead) => {
    const leadId = lead.id || lead._id;
    const draft = busyCallDrafts[leadId];
    const result = await sales.scheduleBusyCallLater(
      lead,
      draft?.callLaterAt || "",
      draft?.status || "Busy Call Later"
    );
    if (result) closeBusyCallForm(leadId);
  };

  const statusCounts = useMemo(() => {
    const counts = { All: (sales.leads || []).length };
    for (const status of LEAD_STATUSES) {
      counts[status] = 0;
    }
    for (const lead of sales.leads || []) {
      const status = normalizeLeadStatus(lead.status);
      counts[status] = (counts[status] || 0) + 1;
    }
    return counts;
  }, [sales.leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (sales.leads || []).filter((lead) => {
      const matchesStatus = statusFilter === "All" || normalizeLeadStatus(lead.status) === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return [lead.parentName, lead.childName, lead.phone, lead.source]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(q));
    });
  }, [sales.leads, search, statusFilter]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col gap-3 mb-4">
        {/* <h2 className="text-base font-bold text-[#102a5a]">Pipeline</h2> */}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40 sm:max-w-md"
            />
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
              {filteredLeads.length} shown
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_BUTTONS.map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? activeFilterButtonStyles[status]
                      : `${filterButtonStyles[status]} hover:brightness-95`
                  }`}
                >
                  <span>{status === "All" ? "All Statuses" : status}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-white/80"
                    }`}
                  >
                    {statusCounts[status] || 0}
                  </span>
                </button>
              );
            })}
          </div>
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
            const busyCallDraft = busyCallDrafts[leadId];
            const normalizedStatus = normalizeLeadStatus(lead.status);
            const selectedStatus = busyCallDraft ? busyCallDraft.status : normalizedStatus;
            const shouldShowReminderPanel =
              Boolean(busyCallDraft) ||
              (REMINDER_STATUSES.includes(normalizedStatus) && Boolean(lead.callLater?.scheduledAt));

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
                      className={`inline-flex mt-2 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusPill[normalizedStatus]}`}
                    >
                      {normalizedStatus}
                    </span>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(lead, e.target.value)}
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
                    {shouldShowReminderPanel && (
                      <div className="mt-2 rounded-xl border border-cyan-100 bg-cyan-50/70 p-2">
                        {lead.callLater?.scheduledAt && !busyCallDraft && (
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <p className="text-[10px] font-semibold text-cyan-700">
                              Reminder at: {formatDateTime(lead.callLater.scheduledAt)}
                            </p>
                            <button
                              type="button"
                              onClick={() => openBusyCallForm(lead, normalizedStatus)}
                              className="rounded-lg border border-cyan-200 bg-white px-2 py-1 text-[10px] font-semibold text-cyan-700 hover:bg-cyan-100"
                            >
                              Edit time
                            </button>
                          </div>
                        )}
                        {busyCallDraft && (
                          <div className="space-y-2">
                            {busyCallDraft.status === "Busy Call Later" ? (
                              <>
                                <div className="grid grid-cols-2 gap-1">
                                  {CALL_LATER_DAY_OPTIONS.map((option) => {
                                    const dateKey = getDateKeyFromOffset(option.offset);
                                    const isSelected = busyCallDraft.dayOffset === option.offset;
                                    return (
                                      <button
                                        key={option.offset}
                                        type="button"
                                        onClick={() => updateBusyCallDraft(leadId, "dayOffset", option.offset)}
                                        className={`rounded-lg border px-2 py-1.5 text-left transition-all ${
                                          isSelected
                                            ? "border-cyan-600 bg-cyan-600 text-white"
                                            : "border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-100"
                                        }`}
                                      >
                                        <span className="block text-[10px] font-bold">{option.label}</span>
                                        <span className="block text-[9px] font-semibold opacity-80">
                                          {formatDate(`${dateKey}T00:00`)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateBusyCallDraft(leadId, "customDate", busyCallDraft.dateKey)
                                    }
                                    className={`rounded-lg border px-2 py-1.5 text-left transition-all ${
                                      busyCallDraft.dayOffset === null
                                        ? "border-cyan-600 bg-cyan-600 text-white"
                                        : "border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-100"
                                    }`}
                                  >
                                    <span className="block text-[10px] font-bold">Custom date</span>
                                    <span className="block text-[9px] font-semibold opacity-80">
                                      Choose date
                                    </span>
                                  </button>
                                </div>
                                {busyCallDraft.dayOffset === null && (
                                  <>
                                    <label className="block text-[10px] font-semibold text-cyan-700">
                                      Custom date
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={busyCallDraft.dateText || ""}
                                      onChange={(event) =>
                                        updateBusyCallDraft(leadId, "dateText", event.target.value)
                                      }
                                      placeholder="dd/mm/yyyy"
                                      className="w-full rounded-lg border border-cyan-200 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-200"
                                    />
                                  </>
                                )}
                                <label className="block text-[10px] font-semibold text-cyan-700">
                                  Reminder time
                                </label>
                                <input
                                  type="time"
                                  value={busyCallDraft.time || ""}
                                  onChange={(event) => updateBusyCallDraft(leadId, "time", event.target.value)}
                                  className="w-full rounded-lg border border-cyan-200 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-[10px] font-semibold text-cyan-700">
                                  Selected: {formatDateTime(busyCallDraft.callLaterAt)}
                                </p>
                              </>
                            ) : (
                              <>
                                <label className="block text-[10px] font-semibold text-cyan-700">
                                  Reminder date
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={busyCallDraft.dateText || ""}
                                  onChange={(event) =>
                                    updateBusyCallDraft(leadId, "dateText", event.target.value)
                                  }
                                  placeholder="dd/mm/yyyy"
                                  className="w-full rounded-lg border border-cyan-200 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-200"
                                />
                                <label className="block text-[10px] font-semibold text-cyan-700">
                                  Reminder time
                                </label>
                                <input
                                  type="time"
                                  value={busyCallDraft.time || ""}
                                  onChange={(event) => updateBusyCallDraft(leadId, "time", event.target.value)}
                                  className="w-full rounded-lg border border-cyan-200 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-[10px] font-semibold text-cyan-700">
                                  Selected: {formatDateTime(busyCallDraft.callLaterAt)}
                                </p>
                              </>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => saveBusyCallLater(lead)}
                                className="inline-flex items-center gap-1 rounded-lg border border-cyan-600 bg-cyan-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-cyan-700"
                              >
                                <CalendarClock className="w-3.5 h-3.5" />
                                Save reminder time
                              </button>
                              <button
                                type="button"
                                onClick={() => closeBusyCallForm(leadId)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
                    <LeadNotesList notes={lead.notes || []} />
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
                    <button
                      type="button"
                      onClick={() => sales.openWhatsAppMessagePicker(lead)}
                      disabled={!waLink}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                        waLink
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
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
