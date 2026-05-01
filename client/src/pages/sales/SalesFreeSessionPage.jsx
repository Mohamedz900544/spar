import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ChevronDown,
  GraduationCap,
  MessageCircle,
  Phone,
  Baby,
  CalendarDays,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { formatDateTime, toWhatsAppLink } from "./salesHelpers";

const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const TIME_RANGE_REGEX = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;
const FREE_SESSION_FILTERS = [
  { id: "pending", label: "Pending", hint: "Need assignment", icon: Clock },
  { id: "assigned", label: "Assigned", hint: "Upcoming trials", icon: CheckCircle2 },
  { id: "finished", label: "Finished", hint: "Trial time passed", icon: CalendarDays },
];
const FREE_SESSION_FILTER_STYLES = {
  pending: {
    active: "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200",
    inactive: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:border-indigo-300 hover:bg-indigo-100",
    chipActive: "bg-white/20 text-white",
    chipInactive: "bg-white text-indigo-700",
    hintActive: "text-white/75",
    hintInactive: "text-indigo-600/70",
  },
  assigned: {
    active: "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-200",
    inactive: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100",
    chipActive: "bg-white/20 text-white",
    chipInactive: "bg-white text-emerald-700",
    hintActive: "text-white/75",
    hintInactive: "text-emerald-600/70",
  },
  finished: {
    active: "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-200",
    inactive: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100",
    chipActive: "bg-white/20 text-white",
    chipInactive: "bg-white text-sky-700",
    hintActive: "text-white/75",
    hintInactive: "text-sky-600/70",
  },
};
const STATUS_BADGE_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  assigned: "border-emerald-200 bg-emerald-50 text-emerald-700",
  finished: "border-sky-200 bg-sky-50 text-sky-700",
};
const CARD_STATUS_STYLES = {
  pending: {
    border: "border-slate-100 hover:border-[#FBBF24]/30 hover:shadow-md",
    header: "border-slate-100 bg-slate-50/50",
    icon: "bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] text-white",
    panel: "border-amber-100 bg-amber-50/40",
    panelText: "text-amber-700",
  },
  assigned: {
    border: "border-emerald-200",
    header: "border-emerald-100 bg-emerald-50/30",
    icon: "bg-emerald-100 text-emerald-600",
    panel: "border-emerald-100 bg-emerald-50/50",
    panelText: "text-emerald-700",
  },
  finished: {
    border: "border-sky-200",
    header: "border-sky-100 bg-sky-50/40",
    icon: "bg-sky-100 text-sky-600",
    panel: "border-sky-100 bg-sky-50/50",
    panelText: "text-sky-700",
  },
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const toLocalDateTimeInputValue = (dateValue) => {
  const date = new Date(dateValue);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const normalizeWorkingHours = (workingHours) => {
  const daysSource = workingHours?.days || {};
  const days = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  for (const day of WEEK_DAYS) {
    days[day] = (Array.isArray(daysSource[day]) ? daysSource[day] : [])
      .map((slot) => ({
        start: (slot?.start || "").toString().trim(),
        end: (slot?.end || "").toString().trim(),
      }))
      .filter(
        (slot) =>
          TIME_RANGE_REGEX.test(slot.start) &&
          TIME_RANGE_REGEX.test(slot.end) &&
          toMinutes(slot.start) < toMinutes(slot.end)
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }

  const slotDuration = Number(workingHours?.slotDurationMinutes);

  return {
    slotDurationMinutes:
      Number.isFinite(slotDuration) && slotDuration >= 15 && slotDuration <= 180
        ? Math.round(slotDuration)
        : 60,
    days,
  };
};

const formatSlotDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

const formatSlotTime = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const formatSessionRange = (range) => {
  if (!range) return "-";
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(range.startDate);
  return `${date}, ${formatSlotTime(range.startDate)} - ${formatSlotTime(range.endDate)}`;
};

const resolveLeadSessionRange = (lead, fallbackDurationMinutes = 60) => {
  const freeSession = lead?.freeSession;
  const leadId = (lead?.id || lead?._id || "").toString();
  const instructorId = freeSession?.instructor?.toString
    ? freeSession.instructor.toString()
    : (freeSession?.instructor || "").toString();

  if (!freeSession?.isAssigned || !leadId || !instructorId || !freeSession?.scheduledAt) {
    return null;
  }

  const startDate = new Date(freeSession.scheduledAt);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const durationRaw = Number(freeSession.durationMinutes);
  const durationMinutes =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? durationRaw
      : fallbackDurationMinutes;

  const explicitEndDate = freeSession.endsAt ? new Date(freeSession.endsAt) : null;
  const endDate =
    explicitEndDate && !Number.isNaN(explicitEndDate.getTime())
      ? explicitEndDate
      : new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return {
    leadId,
    instructorId,
    startDate,
    endDate,
  };
};

const getFreeSessionStatus = (lead, now = new Date()) => {
  if (!lead?.freeSession?.isAssigned) {
    return "pending";
  }

  const sessionRange = resolveLeadSessionRange(lead);
  if (sessionRange?.endDate?.getTime() <= now.getTime()) {
    return "finished";
  }

  return "assigned";
};

const buildBusyRangesByInstructor = (leads) => {
  const rangesByInstructor = {};

  for (const lead of leads || []) {
    const range = resolveLeadSessionRange(lead);
    if (!range) continue;
    if (!rangesByInstructor[range.instructorId]) {
      rangesByInstructor[range.instructorId] = [];
    }
    rangesByInstructor[range.instructorId].push(range);
  }

  for (const key of Object.keys(rangesByInstructor)) {
    rangesByInstructor[key].sort(
      (first, second) => first.startDate.getTime() - second.startDate.getTime()
    );
  }

  return rangesByInstructor;
};

const buildInstructorSlots = (instructor, busyRanges = [], daysAhead = 21) => {
  if (!instructor) return [];

  const normalizedHours = normalizeWorkingHours(instructor.workingHours);
  const now = new Date();
  const slotDurationMinutes = normalizedHours.slotDurationMinutes;
  const slots = [];

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const baseDate = new Date(now);
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + dayOffset);

    const dayKey = WEEK_DAYS[baseDate.getDay()];
    const daySlots = normalizedHours.days[dayKey] || [];

    for (const slotRange of daySlots) {
      const startMinutes = toMinutes(slotRange.start);
      const endMinutes = toMinutes(slotRange.end);

      for (
        let minuteCursor = startMinutes;
        minuteCursor + slotDurationMinutes <= endMinutes;
        minuteCursor += slotDurationMinutes
      ) {
        const slotDate = new Date(baseDate);
        slotDate.setHours(Math.floor(minuteCursor / 60), minuteCursor % 60, 0, 0);

        if (slotDate.getTime() <= now.getTime()) {
          continue;
        }

        const slotEndsAt = new Date(slotDate.getTime() + slotDurationMinutes * 60 * 1000);
        const hasConflict = busyRanges.some(
          (busyRange) =>
            slotDate.getTime() < busyRange.endDate.getTime() &&
            busyRange.startDate.getTime() < slotEndsAt.getTime()
        );

        slots.push({
          value: toLocalDateTimeInputValue(slotDate),
          startsAt: slotDate.getTime(),
          dateKey: `${slotDate.getFullYear()}-${slotDate.getMonth() + 1}-${slotDate.getDate()}`,
          dateLabel: formatSlotDate(slotDate),
          timeLabel: formatSlotTime(slotDate),
          isAvailable: !hasConflict,
        });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt - b.startsAt).slice(0, 120);
};

const SalesFreeSessionPage = () => {
  const sales = useOutletContext();
  const [draftOverrides, setDraftOverrides] = useState({});
  const [freeSessionFilter, setFreeSessionFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [slotPicker, setSlotPicker] = useState({
    open: false,
    leadId: "",
    instructorId: "",
    instructorName: "",
    slots: [],
  });

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

  const instructorById = useMemo(() => {
    const map = {};
    for (const instructor of sales.instructors || []) {
      const id = instructor.id || instructor._id;
      if (!id) continue;
      map[id] = instructor;
    }
    return map;
  }, [sales.instructors]);

  const instructorPhoneById = useMemo(() => {
    const map = {};
    for (const instructor of sales.instructors || []) {
      const id = instructor.id || instructor._id;
      if (!id) continue;
      map[id] = instructor.phone || "";
    }
    return map;
  }, [sales.instructors]);

  const busyRangesByInstructor = useMemo(
    () => buildBusyRangesByInstructor(sales.leads || []),
    [sales.leads]
  );

  const groupedSlotPickerDates = useMemo(() => {
    return (slotPicker.slots || []).reduce((acc, slot) => {
      if (!acc[slot.dateKey]) {
        acc[slot.dateKey] = {
          label: slot.dateLabel,
          slots: [],
        };
      }
      acc[slot.dateKey].slots.push(slot);
      return acc;
    }, {});
  }, [slotPicker.slots]);

  const initialDraftsByLead = useMemo(() => {
    const next = {};
    for (const lead of requestedLeads) {
      const leadId = lead.id || lead._id;
      next[leadId] = {
        instructorId: lead.freeSession?.instructor || "",
        scheduledAt: lead.freeSession?.scheduledAt
          ? toLocalDateTimeInputValue(lead.freeSession.scheduledAt)
          : "",
      };
    }
    return next;
  }, [requestedLeads]);

  const drafts = useMemo(() => {
    const merged = {};
    for (const lead of requestedLeads) {
      const leadId = lead.id || lead._id;
      merged[leadId] = {
        ...(initialDraftsByLead[leadId] || { instructorId: "", scheduledAt: "" }),
        ...(draftOverrides[leadId] || {}),
      };
    }
    return merged;
  }, [draftOverrides, initialDraftsByLead, requestedLeads]);

  const freeSessionBuckets = useMemo(() => {
    const buckets = {
      pending: [],
      assigned: [],
      finished: [],
    };
    const now = new Date();

    for (const lead of requestedLeads) {
      buckets[getFreeSessionStatus(lead, now)].push(lead);
    }

    return buckets;
  }, [requestedLeads]);

  const filterCounts = {
    pending: freeSessionBuckets.pending.length,
    assigned: freeSessionBuckets.assigned.length,
    finished: freeSessionBuckets.finished.length,
  };
  const activeFilter = FREE_SESSION_FILTERS.find((filter) => filter.id === freeSessionFilter);
  const filteredRequestedLeads = useMemo(() => {
    const statusLeads = freeSessionBuckets[freeSessionFilter] || [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) return statusLeads;

    return statusLeads.filter((lead) => {
      const haystack = [
        lead.parentName,
        lead.childName,
        lead.phone,
        lead.source,
        lead.status,
        lead.freeSession?.instructorName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [freeSessionBuckets, freeSessionFilter, searchQuery]);

  const updateDraft = (leadId, field, value) => {
    setDraftOverrides((prev) => ({
      ...prev,
      [leadId]: {
        ...(prev[leadId] || {}),
        [field]: value,
      },
    }));
  };

  const closeSlotPicker = () => {
    setSlotPicker({
      open: false,
      leadId: "",
      instructorId: "",
      instructorName: "",
      slots: [],
    });
  };

  const openSlotPicker = (leadId, instructorId) => {
    const instructor = instructorById[instructorId];
    const normalizedLeadId = (leadId || "").toString();
    const instructorBusyRanges = (busyRangesByInstructor[instructorId] || []).filter(
      (busyRange) => busyRange.leadId !== normalizedLeadId
    );
    const slots = buildInstructorSlots(instructor, instructorBusyRanges);
    setSlotPicker({
      open: true,
      leadId,
      instructorId,
      instructorName: instructor?.name || "Instructor",
      slots,
    });
  };

  const handleInstructorChange = (leadId, instructorId) => {
    setDraftOverrides((prev) => ({
      ...prev,
      [leadId]: {
        ...(prev[leadId] || {}),
        instructorId,
        scheduledAt: "",
      },
    }));

    if (instructorId) {
      openSlotPicker(leadId, instructorId);
    }
  };

  const selectSlotFromPicker = (slotValue) => {
    if (!slotPicker.leadId) return;
    updateDraft(slotPicker.leadId, "scheduledAt", slotValue);
    closeSlotPicker();
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

  const clearAssignment = async (lead) => {
    const leadId = lead.id || lead._id;
    const confirmed = window.confirm(
      `Remove the assigned free session for ${lead.parentName || "this lead"}? The request will move back to Pending.`
    );
    if (!confirmed) return;

    const updated = await sales.clearFreeSession(leadId);
    if (!updated) return;

    setDraftOverrides((prev) => ({
      ...prev,
      [leadId]: {
        instructorId: "",
        scheduledAt: "",
      },
    }));
  };

  const deleteRequest = async (lead) => {
    const leadId = lead.id || lead._id;
    const confirmed = window.confirm(
      `Delete the free session request for ${lead.parentName || "this lead"}? It will be removed from Pending.`
    );
    if (!confirmed) return;

    const updated = await sales.clearFreeSession(leadId, { removeRequest: true });
    if (!updated) return;

    setDraftOverrides((prev) => {
      const next = { ...prev };
      delete next[leadId];
      return next;
    });
  };

  const selectedSlotValue = drafts[slotPicker.leadId]?.scheduledAt || "";

  return (
    <section className="space-y-5">
     

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
          <div className="sticky top-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-3 gap-2 lg:w-[560px]">
                {FREE_SESSION_FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = freeSessionFilter === filter.id;
                  const filterStyle = FREE_SESSION_FILTER_STYLES[filter.id];
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setFreeSessionFilter(filter.id)}
                      className={`min-h-[68px] rounded-xl border px-3 py-2 text-left transition-all ${
                        isActive ? filterStyle.active : filterStyle.inactive
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            isActive ? filterStyle.chipActive : filterStyle.chipInactive
                          }`}
                        >
                          {filterCounts[filter.id]}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-bold">{filter.label}</span>
                      <span
                        className={`mt-0.5 hidden text-[10px] font-semibold sm:block ${
                          isActive ? filterStyle.hintActive : filterStyle.hintInactive
                        }`}
                      >
                        {filter.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-1 lg:justify-end">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search parent, child, phone..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10"
                  />
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <span className="font-bold text-[#102a5a]">{filteredRequestedLeads.length}</span>{" "}
                  of {filterCounts[freeSessionFilter]} {activeFilter?.label.toLowerCase()}
                </div>
              </div>
            </div>
          </div>

          {filteredRequestedLeads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CalendarClock className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-[#102a5a] mb-1">
                No {freeSessionFilter} free sessions
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery.trim() ? "No matching lead found in this status." : "Try another status filter."}
              </p>
            </div>
          ) : (
            filteredRequestedLeads.map((lead) => {
              const leadId = lead.id || lead._id;
              const draft = drafts[leadId] || { instructorId: "", scheduledAt: "" };
              const sessionStatus = getFreeSessionStatus(lead);
              const statusStyles = CARD_STATUS_STYLES[sessionStatus];
              const isAssigned = sessionStatus !== "pending";
              const isFinished = sessionStatus === "finished";
              const sessionRange = resolveLeadSessionRange(lead);
              const waLink = toWhatsAppLink(lead.phone);
              const canAssign = Boolean(draft.instructorId && draft.scheduledAt);

              return (
                <article
                  key={leadId}
                  className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${statusStyles.border}`}
                >
                  <div className={`px-5 py-4 border-b ${statusStyles.header}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusStyles.icon}`}
                      >
                        {isAssigned ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{(lead.parentName || "?")[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#102a5a]">{lead.parentName}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Baby className="w-3 h-3" /> {lead.childName}
                            {lead.childAge ? ` (${lead.childAge})` : ""}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isAssigned && (
                        <button
                          type="button"
                          onClick={() => deleteRequest(lead)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Request
                        </button>
                      )}
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                          lead.source === "Free Session"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {lead.source || "Manual"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE_STYLES[sessionStatus]}`}
                      >
                        {sessionStatus === "pending" ? (
                          <Clock className="w-3 h-3" />
                        ) : isFinished ? (
                          <CalendarDays className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {sessionStatus === "pending" ? "Pending" : isFinished ? "Finished" : "Assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requested</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {formatDateTime(lead.createdAt || lead.updatedAt)}
                      </p>
                    </div>
                    <div className={`rounded-xl border px-3 py-2 ${statusStyles.panel}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${statusStyles.panelText}`}>
                        {isAssigned ? "Session Window" : "Next Step"}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {isAssigned ? formatSessionRange(sessionRange) : "Choose instructor and available slot"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <GraduationCap className="w-3.5 h-3.5 text-[#102a5a]" />
                        Instructor
                      </label>
                      <div className="relative">
                        <select
                          value={draft.instructorId}
                          onChange={(event) => handleInstructorChange(leadId, event.target.value)}
                          className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all cursor-pointer"
                        >
                          <option value="">Select instructor...</option>
                          {sales.instructors.map((instructor) => (
                            <option
                              key={instructor.id || instructor._id}
                              value={instructor.id || instructor._id}
                            >
                              {instructor.name} - {instructor.phone || "No phone"}{" "}
                              {instructor.campusCode ? `(${instructor.campusCode})` : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                        Date and Time
                      </label>
                      <button
                        type="button"
                        onClick={() => openSlotPicker(leadId, draft.instructorId)}
                        disabled={!draft.instructorId}
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-left text-sm font-medium text-slate-800 outline-none transition-all hover:border-[#FBBF24]/60 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {draft.scheduledAt ? formatDateTime(draft.scheduledAt) : "Choose from instructor availability"}
                      </button>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Slots are generated from the instructor Working Hours.
                      </p>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => assign(lead)}
                        disabled={!canAssign}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
                        style={{
                          background: isAssigned
                            ? "linear-gradient(135deg, #059669, #10b981)"
                            : "linear-gradient(135deg, #102a5a, #1a3a6b)",
                        }}
                      >
                        <CalendarClock className="w-4 h-4" />
                        {!draft.instructorId
                          ? "Select Instructor"
                          : !draft.scheduledAt
                          ? "Choose Time"
                          : isAssigned
                          ? "Reassign"
                          : "Assign Session"}
                      </button>
                    </div>
                  </div>

                  {isAssigned && (
                    <div className={`mt-4 rounded-xl border p-4 ${statusStyles.panel}`}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusStyles.panelText}`}
                        >
                          {isFinished ? (
                            <CalendarDays className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {isFinished ? "Finished Assignment" : "Current Assignment"}
                        </p>
                        <button
                          type="button"
                          onClick={() => clearAssignment(lead)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Assignment
                        </button>
                      </div>
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
          })
          )}
        </div>
      )}

      {slotPicker.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeSlotPicker}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            aria-label="Close slot picker"
          />

          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assign Free Session
                </p>
                <h3 className="truncate text-base font-bold text-[#102a5a]">
                  {slotPicker.instructorName} Availability
                </h3>
              </div>
              <button
                type="button"
                onClick={closeSlotPicker}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {slotPicker.slots.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  No available slots right now. Either working hours are not set or all slots are already booked.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(groupedSlotPickerDates).map((group) => (
                    <div key={group.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {group.label}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {group.slots.map((slot) => {
                          const isSelected = selectedSlotValue === slot.value;
                          const buttonClass = !slot.isAvailable
                            ? "border-rose-300 bg-rose-50 text-rose-500 cursor-not-allowed"
                            : isSelected
                              ? "border-[#102a5a] bg-[#102a5a] text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#FBBF24] hover:text-[#102a5a]";
                          return (
                            <button
                              key={`${slot.dateKey}-${slot.value}`}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => selectSlotFromPicker(slot.value)}
                              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${buttonClass}`}
                            >
                              {slot.timeLabel}
                              {!slot.isAvailable ? " - Booked" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SalesFreeSessionPage;
