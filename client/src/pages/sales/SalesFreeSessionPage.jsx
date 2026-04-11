import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ChevronDown,
  GraduationCap,
  Phone,
  Baby,
  CalendarDays,
  X,
} from "lucide-react";
import { formatDateTime } from "./salesHelpers";

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

  const assignedCount = requestedLeads.filter((lead) => lead.freeSession?.isAssigned).length;
  const pendingCount = requestedLeads.length - assignedCount;
  const selectedSlotValue = drafts[slotPicker.leadId]?.scheduledAt || "";

  return (
    <section className="space-y-5">
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
                  isAssigned
                    ? "border-emerald-200"
                    : "border-slate-100 hover:border-[#FBBF24]/30 hover:shadow-md"
                }`}
              >
                <div
                  className={`px-5 py-4 border-b ${
                    isAssigned
                      ? "border-emerald-100 bg-emerald-50/30"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isAssigned
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-gradient-to-br from-[#102a5a] to-[#1a3a6b] text-white"
                        }`}
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

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                          lead.source === "Free Session"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
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

                <div className="p-5">
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
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                        style={{
                          background: isAssigned
                            ? "linear-gradient(135deg, #059669, #10b981)"
                            : "linear-gradient(135deg, #102a5a, #1a3a6b)",
                        }}
                      >
                        <CalendarClock className="w-4 h-4" />
                        {isAssigned ? "Reassign" : "Assign Session"}
                      </button>
                    </div>
                  </div>

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
