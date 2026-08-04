import express from "express";
import mongoose from "mongoose";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import { authRequired, agentOrAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Round from "../models/Round.js";
import Session from "../models/Session.js";
import {
  notifyInstructorFreeSessionAssigned,
  notifyParentFreeSessionAssigned,
  notifySalesFollowUpReminder,
  sendWhatsAppAutomationTest,
} from "../services/leadNotifications.service.js";
import {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "../services/whatsapp.service.js";
import { sendBrevoEmail } from "../services/brevoEmail.service.js";
import { sendBrevoSms } from "../services/brevoSms.service.js";
import {
  getFreeSessionDurationMinutes,
  getFreeSessionFollowUpDelayMinutes,
} from "../services/freeSessionTiming.service.js";

const router = express.Router();
const WHATSAPP_TEST_PHONE = process.env.WHATSAPP_TEST_PHONE || "01007775705";
const WHATSAPP_TEST_TEMPLATE = process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world";
const WHATSAPP_TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
const EMAIL_TEST_RECIPIENT =
  process.env.BREVO_TEST_EMAIL || "mohamedz90054@gmail.com";
const SMS_TEST_RECIPIENT =
  process.env.BREVO_TEST_SMS_NUMBER || "01280669844";
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
const FREE_SESSION_TIMEZONE = "Africa/Cairo";
const PUBLIC_FREE_SESSION_DAYS_AHEAD = 3;
const PUBLIC_FREE_SESSION_MIN_LEAD_MINUTES = 120;
const PUBLIC_FREE_SESSION_MAX_SLOTS = 180;
const ROUND_SESSION_FALLBACK_DURATION_MINUTES = 120;
const SESSION_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const LOCAL_DATE_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/;
const WEEKDAY_NAME_TO_KEY = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
};

const assertValidStatus = (status) => LEAD_STATUSES.includes(status);
const isReminderStatus = (status) =>
  status === "Reserved Later" || status === "Busy Call Later";

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const getTimeZoneOffsetMs = (date, timeZone = FREE_SESSION_TIMEZONE) => {
  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const asUtc = Date.UTC(
    Number(fields.year),
    Number(fields.month) - 1,
    Number(fields.day),
    Number(fields.hour),
    Number(fields.minute),
    Number(fields.second)
  );

  return asUtc - date.getTime();
};

const parseDateTimeInTimeZone = (value, timeZone = FREE_SESSION_TIMEZONE) => {
  if (value instanceof Date) return value;

  const raw = `${value || ""}`.trim();
  if (!raw) return new Date(raw);

  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)) {
    return new Date(raw);
  }

  const match = raw.match(LOCAL_DATE_TIME_REGEX);
  if (!match) return new Date(raw);

  const [, year, month, day, hour, minute, second = "0"] = match;
  const localUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  let utcMs = localUtcMs;
  for (let index = 0; index < 3; index += 1) {
    const offsetMs = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
    const nextUtcMs = localUtcMs - offsetMs;
    if (Math.abs(nextUtcMs - utcMs) < 1) break;
    utcMs = nextUtcMs;
  }

  return new Date(utcMs);
};

const parseCallLaterAt = (value) => {
  const scheduledAt = parseDateTimeInTimeZone(value);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Valid reminder date/time is required" };
  }
  if (scheduledAt.getTime() <= Date.now()) {
    return { error: "Reminder date/time must be in the future" };
  }
  return { scheduledAt };
};

const getDateTimePartsInTimeZone = (
  value,
  timeZone = FREE_SESSION_TIMEZONE
) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    dayKey: WEEKDAY_NAME_TO_KEY[(fields.weekday || "").toLowerCase()] || "",
    hours: Number(fields.hour),
    minutes: Number(fields.minute),
  };
};

const normalizeInstructorWorkingHours = (workingHours) => {
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
    timezone: workingHours?.timezone?.trim?.() || "Africa/Cairo",
    slotDurationMinutes:
      Number.isFinite(slotDuration) && slotDuration >= 15 && slotDuration <= 180
        ? Math.round(slotDuration)
        : 60,
    days,
    updatedAt: workingHours?.updatedAt || null,
  };
};

const isInsideWorkingHours = (scheduledDate, durationMinutes, workingHours) => {
  const scheduledParts = getDateTimePartsInTimeZone(
    scheduledDate,
    workingHours?.timezone || FREE_SESSION_TIMEZONE
  );
  if (!scheduledParts) return false;

  const dayKey = scheduledParts.dayKey;
  const slots = workingHours?.days?.[dayKey] || [];
  if (!slots.length) return false;

  const startMinutes = scheduledParts.hours * 60 + scheduledParts.minutes;
  const endMinutes = startMinutes + durationMinutes;

  return slots.some((slot) => {
    const slotStart = toMinutes(slot.start);
    const slotEnd = toMinutes(slot.end);
    return startMinutes >= slotStart && endMinutes <= slotEnd;
  });
};

const resolveFreeSessionRange = (freeSession, fallbackDurationMinutes) => {
  const startRaw = freeSession?.scheduledAt;
  const startDate = startRaw ? new Date(startRaw) : null;
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return null;
  }

  const durationRaw = Number(freeSession?.durationMinutes);
  const durationMinutes =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? durationRaw
      : fallbackDurationMinutes;

  const explicitEnd = freeSession?.endsAt ? new Date(freeSession.endsAt) : null;
  const endDate =
    explicitEnd && !Number.isNaN(explicitEnd.getTime())
      ? explicitEnd
      : new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return {
    startDate,
    endDate,
  };
};

const rangesOverlap = (firstRange, secondRange) => {
  if (!firstRange || !secondRange) return false;
  return (
    firstRange.startDate.getTime() < secondRange.endDate.getTime() &&
    secondRange.startDate.getTime() < firstRange.endDate.getTime()
  );
};

const hasParentWelcomeBeenSent = async (phone) => {
  const normalizedPhone = normalizePhoneForWhatsApp(phone || "");
  if (!normalizedPhone) return false;

  const welcomedLeads = await Lead.find({
    "freeSession.parentWelcomeSentAt": { $ne: null },
  })
    .select("phone")
    .lean();

  return welcomedLeads.some(
    (lead) => normalizePhoneForWhatsApp(lead.phone || "") === normalizedPhone
  );
};

const clampInteger = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const getPublicFreeSessionDaysAhead = () =>
  clampInteger(
    process.env.FREE_SESSION_PUBLIC_DAYS_AHEAD,
    PUBLIC_FREE_SESSION_DAYS_AHEAD,
    1,
    60
  );

const getPublicFreeSessionMinLeadMinutes = () =>
  clampInteger(
    process.env.FREE_SESSION_PUBLIC_MIN_LEAD_MINUTES,
    PUBLIC_FREE_SESSION_MIN_LEAD_MINUTES,
    0,
    24 * 60
  );

const padDatePart = (value) => String(value).padStart(2, "0");

const getDateFieldsInTimeZone = (value, timeZone = FREE_SESSION_TIMEZONE) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    year: Number(fields.year),
    month: Number(fields.month),
    day: Number(fields.day),
  };
};

const addDaysToDateFields = (dateFields, dayOffset) => {
  const utcDate = new Date(
    Date.UTC(
      Number(dateFields.year),
      Number(dateFields.month) - 1,
      Number(dateFields.day) + dayOffset
    )
  );

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
};

const getDateKeyFromFields = (dateFields) =>
  `${dateFields.year}-${padDatePart(dateFields.month)}-${padDatePart(
    dateFields.day
  )}`;

const getWeekdayKeyFromDateFields = (dateFields) => {
  const utcDate = new Date(
    Date.UTC(dateFields.year, dateFields.month - 1, dateFields.day)
  );
  return WEEK_DAYS[utcDate.getUTCDay()] || "";
};

const getPublicSlotParts = (value, timeZone = FREE_SESSION_TIMEZONE) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    localDate: `${fields.year}-${fields.month}-${fields.day}`,
    localTime: `${fields.hour}:${fields.minute}`,
    weekdayKey: WEEKDAY_NAME_TO_KEY[(fields.weekday || "").toLowerCase()] || "",
  };
};

const stringifyId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.toHexString) return value.toHexString();
  if (value._id && value._id !== value) return stringifyId(value._id);
  if (value.toString) return value.toString();
  return `${value}`;
};

const normalizeRoundCode = (value) =>
  value?.toString?.().trim().toUpperCase() || "";

const getSessionDateKey = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const resolveRoundSessionRange = (session, round) => {
  const dateKey = getSessionDateKey(session?.date);
  const time = `${session?.time || ""}`.trim();
  if (!dateKey || !SESSION_TIME_REGEX.test(time)) {
    return null;
  }

  const startDate = parseDateTimeInTimeZone(
    `${dateKey}T${time}:00`,
    FREE_SESSION_TIMEZONE
  );
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const durationRaw = Number(
    session?.durationMinutes ?? round?.sessionDurationMinutes
  );
  const isTwoSessionsPerWeek =
    round?.twoSessionsPerWeek === true || Number(round?.sessionsPerWeek) === 2;
  const durationMinutes =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? durationRaw
      : isTwoSessionsPerWeek
        ? 60
        : ROUND_SESSION_FALLBACK_DURATION_MINUTES;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return {
    source: "round",
    sessionId: stringifyId(session?._id || session?.id),
    roundId: stringifyId(round?._id || round?.id || session?.round),
    roundCode: round?.code || "",
    roundName: round?.name || "",
    sessionTitle: session?.title || "",
    durationMinutes,
    startDate,
    endDate,
  };
};

const cloneBusyRangesByInstructor = (sourceRangesByInstructor) => {
  const rangesByInstructor = new Map();

  for (const [instructorId, ranges] of sourceRangesByInstructor || []) {
    const normalizedInstructorId = stringifyId(instructorId);
    if (!normalizedInstructorId || !Array.isArray(ranges)) continue;

    const clonedRanges = ranges
      .map((range) => {
        const startDate =
          range?.startDate instanceof Date
            ? range.startDate
            : new Date(range?.startDate);
        const endDate =
          range?.endDate instanceof Date ? range.endDate : new Date(range?.endDate);

        if (
          Number.isNaN(startDate.getTime()) ||
          Number.isNaN(endDate.getTime()) ||
          startDate.getTime() >= endDate.getTime()
        ) {
          return null;
        }

        return {
          ...range,
          instructorId: normalizedInstructorId,
          startDate,
          endDate,
        };
      })
      .filter(Boolean);

    if (clonedRanges.length) {
      rangesByInstructor.set(normalizedInstructorId, clonedRanges);
    }
  }

  return rangesByInstructor;
};

const serializeBusyRange = (range) => ({
  ...range,
  startDate: range.startDate?.toISOString?.() || range.startDate,
  endDate: range.endDate?.toISOString?.() || range.endDate,
});

const loadRoundBusyRangesByInstructor = async (instructors = []) => {
  const instructorRoundLinks = new Map();
  const allRoundIds = new Set();
  const allRoundCodes = new Set();

  for (const instructor of instructors || []) {
    const instructorId = stringifyId(instructor?._id || instructor?.id);
    if (!instructorId) continue;

    const roundIds = new Set();
    for (const linkedRound of instructor.linkedRounds || []) {
      const roundId = stringifyId(linkedRound);
      if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) continue;
      roundIds.add(roundId);
      allRoundIds.add(roundId);
    }

    const roundCodes = new Set();
    for (const linkedRoundCode of instructor.linkedRoundCodes || []) {
      const roundCode = normalizeRoundCode(linkedRoundCode);
      if (!roundCode) continue;
      roundCodes.add(roundCode);
      allRoundCodes.add(roundCode);
    }

    if (roundIds.size || roundCodes.size) {
      instructorRoundLinks.set(instructorId, { roundIds, roundCodes });
    }
  }

  if (!instructorRoundLinks.size) {
    return new Map();
  }

  const roundClauses = [];
  if (allRoundIds.size) {
    roundClauses.push({ _id: { $in: Array.from(allRoundIds) } });
  }
  if (allRoundCodes.size) {
    roundClauses.push({ code: { $in: Array.from(allRoundCodes) } });
  }

  const roundQuery =
    roundClauses.length === 1 ? roundClauses[0] : { $or: roundClauses };
  const rounds = await Round.find(roundQuery)
    .select("code name sessionDurationMinutes twoSessionsPerWeek sessionsPerWeek status")
    .lean();
  if (!rounds.length) {
    return new Map();
  }

  const roundById = new Map();
  const roundIdsByInstructor = new Map();

  for (const round of rounds) {
    const roundId = stringifyId(round._id);
    const roundCode = normalizeRoundCode(round.code);
    if (!roundId) continue;

    roundById.set(roundId, round);

    for (const [instructorId, links] of instructorRoundLinks) {
      if (links.roundIds.has(roundId) || links.roundCodes.has(roundCode)) {
        if (!roundIdsByInstructor.has(instructorId)) {
          roundIdsByInstructor.set(instructorId, new Set());
        }
        roundIdsByInstructor.get(instructorId).add(roundId);
      }
    }
  }

  const matchedRoundIds = Array.from(roundById.keys());
  if (!matchedRoundIds.length) {
    return new Map();
  }

  const sessions = await Session.find({ round: { $in: matchedRoundIds } })
    .select("round title date time durationMinutes status")
    .lean();

  const sessionsByRound = new Map();
  for (const session of sessions) {
    if (session.status === "Completed") continue;

    const roundId = stringifyId(session.round);
    if (!roundId) continue;
    if (!sessionsByRound.has(roundId)) {
      sessionsByRound.set(roundId, []);
    }
    sessionsByRound.get(roundId).push(session);
  }

  const rangesByInstructor = new Map();
  for (const [instructorId, roundIds] of roundIdsByInstructor) {
    const ranges = [];

    for (const roundId of roundIds) {
      const round = roundById.get(roundId);
      if (round?.status === "Completed") continue;

      for (const session of sessionsByRound.get(roundId) || []) {
        const range = resolveRoundSessionRange(session, round);
        if (!range) continue;
        ranges.push({ instructorId, ...range });
      }
    }

    if (ranges.length) {
      ranges.sort(
        (first, second) => first.startDate.getTime() - second.startDate.getTime()
      );
      rangesByInstructor.set(instructorId, ranges);
    }
  }

  return rangesByInstructor;
};

const buildBusyRangesByInstructor = (
  assignedSessions,
  fallbackDurationMinutes,
  excludedLeadId = "",
  seedBusyRangesByInstructor = new Map()
) => {
  const rangesByInstructor = cloneBusyRangesByInstructor(
    seedBusyRangesByInstructor
  );

  for (const lead of assignedSessions || []) {
    const leadId = stringifyId(lead._id || lead.id);
    if (excludedLeadId && leadId === excludedLeadId) continue;

    const instructorId = stringifyId(lead.freeSession?.instructor);
    if (!instructorId) continue;

    const range = resolveFreeSessionRange(
      lead.freeSession,
      fallbackDurationMinutes
    );
    if (!range) continue;

    if (!rangesByInstructor.has(instructorId)) {
      rangesByInstructor.set(instructorId, []);
    }
    rangesByInstructor.get(instructorId).push({
      source: "freeSession",
      leadId,
      parentName: lead.parentName || "",
      childName: lead.childName || "",
      ...range,
    });
  }

  return rangesByInstructor;
};

const isAlignedToWorkingHoursSlot = (
  scheduledDate,
  durationMinutes,
  workingHours
) => {
  const scheduledParts = getDateTimePartsInTimeZone(
    scheduledDate,
    workingHours?.timezone || FREE_SESSION_TIMEZONE
  );
  if (!scheduledParts) return false;

  const daySlots = workingHours?.days?.[scheduledParts.dayKey] || [];
  if (!daySlots.length) return false;

  const startMinutes = scheduledParts.hours * 60 + scheduledParts.minutes;
  const endMinutes = startMinutes + durationMinutes;
  const slotStep = Number(workingHours?.slotDurationMinutes) || durationMinutes;

  return daySlots.some((slot) => {
    const slotStart = toMinutes(slot.start);
    const slotEnd = toMinutes(slot.end);
    return (
      startMinutes >= slotStart &&
      endMinutes <= slotEnd &&
      (startMinutes - slotStart) % slotStep === 0
    );
  });
};

const getAvailableInstructorsForScheduledDate = ({
  scheduledDate,
  instructors,
  assignedSessions,
  durationMinutes,
  excludedLeadId = "",
  seedBusyRangesByInstructor = new Map(),
}) => {
  const targetRange = {
    startDate: scheduledDate,
    endDate: new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000),
  };
  const busyRangesByInstructor = buildBusyRangesByInstructor(
    assignedSessions,
    durationMinutes,
    excludedLeadId,
    seedBusyRangesByInstructor
  );

  return (instructors || []).reduce((available, instructor) => {
    const instructorId = stringifyId(instructor._id || instructor.id);
    if (!instructorId) return available;

    const normalizedWorkingHours = normalizeInstructorWorkingHours(
      instructor.workingHours
    );
    if (
      !isAlignedToWorkingHoursSlot(
        scheduledDate,
        durationMinutes,
        normalizedWorkingHours
      )
    ) {
      return available;
    }

    const hasConflict = (busyRangesByInstructor.get(instructorId) || []).some(
      (busyRange) => rangesOverlap(targetRange, busyRange)
    );
    if (hasConflict) return available;

    available.push({
      ...instructor,
      workingHours: normalizedWorkingHours,
    });
    return available;
  }, []);
};

const formatPublicSlot = (scheduledDate) => {
  const parts = getPublicSlotParts(scheduledDate, FREE_SESSION_TIMEZONE);
  if (!parts) return null;

  return {
    id: scheduledDate.toISOString(),
    scheduledAt: scheduledDate.toISOString(),
    startsAt: scheduledDate.getTime(),
    ...parts,
  };
};

const buildPublicFreeSessionDays = (now = new Date()) => {
  const todayFields = getDateFieldsInTimeZone(now, FREE_SESSION_TIMEZONE);
  if (!todayFields) return [];

  return Array.from({ length: getPublicFreeSessionDaysAhead() }, (_, dayOffset) => {
    const dateFields = addDaysToDateFields(todayFields, dayOffset);
    const localDate = getDateKeyFromFields(dateFields);
    return {
      localDate,
      dayOffset,
      weekdayKey: getWeekdayKeyFromDateFields(dateFields),
    };
  });
};

const buildPublicFreeSessionSlots = ({
  instructors,
  assignedSessions,
  now = new Date(),
  seedBusyRangesByInstructor = new Map(),
}) => {
  const durationMinutes = getFreeSessionDurationMinutes();
  const minLeadMinutes = getPublicFreeSessionMinLeadMinutes();
  const minStartMs = now.getTime() + minLeadMinutes * 60 * 1000;
  const daysAhead = getPublicFreeSessionDaysAhead();
  const busyRangesByInstructor = buildBusyRangesByInstructor(
    assignedSessions,
    durationMinutes,
    "",
    seedBusyRangesByInstructor
  );
  const slotsByStart = new Map();

  for (const instructor of instructors || []) {
    const instructorId = stringifyId(instructor._id || instructor.id);
    if (!instructorId) continue;

    const normalizedWorkingHours = normalizeInstructorWorkingHours(
      instructor.workingHours
    );
    const todayFields = getDateFieldsInTimeZone(
      now,
      normalizedWorkingHours.timezone
    );
    if (!todayFields) continue;

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const dateFields = addDaysToDateFields(todayFields, dayOffset);
      const dateKey = getDateKeyFromFields(dateFields);
      const dayKey = getWeekdayKeyFromDateFields(dateFields);
      const daySlots = normalizedWorkingHours.days?.[dayKey] || [];

      for (const slotRange of daySlots) {
        const startMinutes = toMinutes(slotRange.start);
        const endMinutes = toMinutes(slotRange.end);
        const slotStep = normalizedWorkingHours.slotDurationMinutes;

        for (
          let minuteCursor = startMinutes;
          minuteCursor + durationMinutes <= endMinutes;
          minuteCursor += slotStep
        ) {
          const localDateTime = `${dateKey}T${padDatePart(
            Math.floor(minuteCursor / 60)
          )}:${padDatePart(minuteCursor % 60)}:00`;
          const scheduledDate = parseDateTimeInTimeZone(
            localDateTime,
            normalizedWorkingHours.timezone
          );
          if (Number.isNaN(scheduledDate.getTime())) continue;
          if (scheduledDate.getTime() < minStartMs) continue;

          const targetRange = {
            startDate: scheduledDate,
            endDate: new Date(
              scheduledDate.getTime() + durationMinutes * 60 * 1000
            ),
          };
          const hasConflict = (
            busyRangesByInstructor.get(instructorId) || []
          ).some((busyRange) => rangesOverlap(targetRange, busyRange));
          if (hasConflict) continue;

          const slotKey = scheduledDate.toISOString();
          if (!slotsByStart.has(slotKey)) {
            const slot = formatPublicSlot(scheduledDate);
            if (!slot) continue;
            slotsByStart.set(slotKey, { ...slot, instructorIds: new Set() });
          }
          slotsByStart.get(slotKey).instructorIds.add(instructorId);
        }
      }
    }
  }

  return Array.from(slotsByStart.values())
    .map(({ instructorIds, ...slot }) => ({
      ...slot,
      instructorCount: instructorIds.size,
    }))
    .sort((first, second) => first.startsAt - second.startsAt)
    .slice(0, PUBLIC_FREE_SESSION_MAX_SLOTS);
};

const loadFreeSessionBookingData = async () => {
  const [instructors, assignedSessions] = await Promise.all([
    User.find({ role: "instructor" })
      .select("name email phone campusCode workingHours linkedRounds linkedRoundCodes")
      .lean(),
    Lead.find({
      "freeSession.isAssigned": true,
      "freeSession.scheduledAt": { $ne: null },
    })
      .select("parentName childName freeSession")
      .lean(),
  ]);
  const roundBusyRangesByInstructor =
    await loadRoundBusyRangesByInstructor(instructors);

  return [instructors, assignedSessions, roundBusyRangesByInstructor];
};

const pickRandomItem = (items) =>
  items[Math.floor(Math.random() * items.length)];

const sanitizePublicText = (value, maxLength = 200) =>
  `${value || ""}`.trim().slice(0, maxLength);

const normalizeEgyptMobilePhone = (value) => {
  const rawDigits = `${value || ""}`.replace(/\D/g, "");
  let localDigits = rawDigits;

  if (localDigits.startsWith("0020")) {
    localDigits = `0${localDigits.slice(4)}`;
  } else if (localDigits.startsWith("20")) {
    localDigits = `0${localDigits.slice(2)}`;
  }

  return /^(010|011|012|015)\d{8}$/.test(localDigits) ? localDigits : "";
};

const isValidEmail = (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

router.get("/public/free-session/slots", async (_req, res) => {
  try {
    const [instructors, assignedSessions, roundBusyRangesByInstructor] =
      await loadFreeSessionBookingData();
    const durationMinutes = getFreeSessionDurationMinutes();
    const minLeadMinutes = getPublicFreeSessionMinLeadMinutes();
    const days = buildPublicFreeSessionDays();
    const slots = buildPublicFreeSessionSlots({
      instructors,
      assignedSessions,
      seedBusyRangesByInstructor: roundBusyRangesByInstructor,
    });

    return res.json({
      timezone: FREE_SESSION_TIMEZONE,
      durationMinutes,
      minLeadMinutes,
      days,
      slots,
    });
  } catch (err) {
    console.error("Public free-session slots error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/public/free-session/book", async (req, res) => {
  try {
    const childName = sanitizePublicText(
      req.body?.childName || req.body?.studentName
    );
    const parentEmail = sanitizePublicText(req.body?.email, 200).toLowerCase();
    const phone = normalizeEgyptMobilePhone(req.body?.phone);
    const parsedAge = Number(req.body?.childAge || req.body?.studentAge);
    const scheduledAt = req.body?.scheduledAt;

    if (!childName) {
      return res.status(400).json({ message: "Student name is required" });
    }
    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 6 ||
      parsedAge > 17
    ) {
      return res
        .status(400)
        .json({ message: "Student age must be between 6 and 17" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ message: "A valid Egyptian mobile number is required" });
    }
    if (!parentEmail || !isValidEmail(parentEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (req.body?.deviceConfirmed !== true) {
      return res.status(400).json({
        message:
          "Please confirm that the student has a laptop or computer with camera and microphone",
      });
    }

    const scheduledDate = parseDateTimeInTimeZone(
      scheduledAt,
      FREE_SESSION_TIMEZONE
    );
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt date" });
    }

    const minLeadMinutes = getPublicFreeSessionMinLeadMinutes();
    const minStartMs = Date.now() + minLeadMinutes * 60 * 1000;
    if (scheduledDate.getTime() < minStartMs) {
      return res.status(400).json({
        message: `Please choose a time at least ${minLeadMinutes} minutes from now`,
      });
    }

    const durationMinutes = getFreeSessionDurationMinutes();
    const followUpDelayMinutes = getFreeSessionFollowUpDelayMinutes();
    const [instructors, assignedSessions, roundBusyRangesByInstructor] =
      await loadFreeSessionBookingData();
    const availableInstructors = getAvailableInstructorsForScheduledDate({
      scheduledDate,
      instructors,
      assignedSessions,
      durationMinutes,
      seedBusyRangesByInstructor: roundBusyRangesByInstructor,
    });

    if (!availableInstructors.length) {
      return res.status(409).json({
        message:
          "Selected time is no longer available. Please choose another slot.",
      });
    }

    const instructor = pickRandomItem(availableInstructors);
    const endsAt = new Date(
      scheduledDate.getTime() + durationMinutes * 60 * 1000
    );
    const followUpDueAt = new Date(
      endsAt.getTime() + followUpDelayMinutes * 60 * 1000
    );
    const shouldSendParentWelcome = !(await hasParentWelcomeBeenSent(phone));

    const lead = await Lead.create({
      parentName: `ولي أمر ${childName}`,
      parentEmail,
      childName,
      childAge: parsedAge,
      phone,
      source: "Free Session",
      status: "Demo Booked",
      notes: parentEmail
        ? [
            {
              text: `Email: ${parentEmail}`,
              createdByName: "Public booking",
              createdByRole: "public",
            },
          ]
        : [],
      freeSession: {
        requested: true,
        isAssigned: true,
        scheduledAt: scheduledDate,
        durationMinutes,
        endsAt,
        followUpDueAt,
        movedToFollowUpAt: null,
        instructor: instructor._id,
        instructorName: instructor.name || "",
        assignedByName: "Public booking",
        assignedAt: new Date(),
        reminderSentAt: null,
        parentWelcomeSentAt: null,
        parentAssignmentNotifiedAt: null,
        parentReminderSentAt: null,
      },
    });

    const [notificationResult, parentNotificationResult] = await Promise.all([
      notifyInstructorFreeSessionAssigned({
        lead: lead.toObject(),
        instructor,
      }),
      notifyParentFreeSessionAssigned({
        lead: lead.toObject(),
        shouldSendWelcome: shouldSendParentWelcome,
      }),
    ]);

    const notificationUpdates = {};
    const notificationTimestamp = new Date();
    if (parentNotificationResult?.welcomeSent) {
      notificationUpdates["freeSession.parentWelcomeSentAt"] =
        notificationTimestamp;
    }
    if (parentNotificationResult?.assignmentSent) {
      notificationUpdates["freeSession.parentAssignmentNotifiedAt"] =
        notificationTimestamp;
    }
    if (Object.keys(notificationUpdates).length) {
      await Lead.updateOne({ _id: lead._id }, { $set: notificationUpdates });
      Object.assign(lead.freeSession, {
        ...(notificationUpdates["freeSession.parentWelcomeSentAt"]
          ? { parentWelcomeSentAt: notificationTimestamp }
          : {}),
        ...(notificationUpdates["freeSession.parentAssignmentNotifiedAt"]
          ? { parentAssignmentNotifiedAt: notificationTimestamp }
          : {}),
      });
    }

    if (!notificationResult?.whatsappSent) {
      console.warn(
        "[sales][public-free-session] instructor whatsapp notification failed"
      );
    }

    return res.status(201).json({
      lead: lead.toJSON(),
      notificationResult,
      parentNotificationResult,
      assignedInstructor: {
        id: stringifyId(instructor._id),
        name: instructor.name || "",
      },
    });
  } catch (err) {
    console.error("Public free-session booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard", authRequired, agentOrAdmin, async (_req, res) => {
  try {
    const [leads, instructors] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: "instructor" })
        .select("name email phone campusCode workingHours linkedRounds linkedRoundCodes")
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    const roundBusyRangesByInstructor =
      await loadRoundBusyRangesByInstructor(instructors);

    const stats = LEAD_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );

    for (const lead of leads) {
      if (stats[lead.status] !== undefined) {
        stats[lead.status] += 1;
      }
    }

    return res.json({
      statuses: LEAD_STATUSES,
      stats,
      leads: leads.map((lead) => ({
        ...lead,
        id: lead._id.toString(),
      })),
      instructors: instructors.map((instructor) => ({
        ...instructor,
        id: instructor._id.toString(),
        workingHours: normalizeInstructorWorkingHours(instructor.workingHours),
        busyRanges: (
          roundBusyRangesByInstructor.get(instructor._id.toString()) || []
        ).map(serializeBusyRange),
      })),
      freeSessionDurationMinutes: getFreeSessionDurationMinutes(),
    });
  } catch (err) {
    console.error("Sales dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/whatsapp/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || WHATSAPP_TEST_PHONE;
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test phone number" });
    }

    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

    let result = await sendWhatsAppTemplate({
      to,
      templateName: WHATSAPP_TEST_TEMPLATE,
      languageCode: WHATSAPP_TEMPLATE_LANGUAGE,
    });

    if (!result?.sent) {
      result = await sendWhatsAppText({
        to,
        body: `WhatsApp test from Sales Dashboard\nAgent: ${agentName}\nTime: ${now}`,
      });
    }

    if (!result?.sent) {
      return res.status(502).json({
        message: "WhatsApp test failed",
        details: result,
      });
    }

    return res.json({
      message: `WhatsApp test sent to ${to}`,
      to,
      result,
    });
  } catch (err) {
    console.error("WhatsApp test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/whatsapp/automation-test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || WHATSAPP_TEST_PHONE;
    const type = req.body?.type || "";
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test phone number" });
    }

    const result = await sendWhatsAppAutomationTest({ type, phone: to });
    if (result?.reason === "invalid_automation_test_type") {
      return res.status(400).json({
        message: "Invalid WhatsApp automation test type",
        details: result,
      });
    }

    if (result?.reason === "invalid_test_phone_number") {
      return res.status(400).json({
        message: "Invalid WhatsApp test phone number",
        details: result,
      });
    }

    if (
      result?.reason === "missing_busy_call_template_env" ||
      result?.reason === "missing_call_reminder_template_env"
    ) {
      return res.status(400).json({
        message:
          "Missing WHATSAPP_TEMPLATE_BUSY_CALL_REMINDER or WHATSAPP_TEMPLATE_RESERVED_CALL_REMINDER env for call later reminder",
        details: result,
      });
    }

    if (!result?.sent) {
      return res.status(502).json({
        message: "WhatsApp automation test failed",
        details: result,
      });
    }

    return res.json({
      message: `${result.label || "WhatsApp automation"} test sent to ${to}`,
      to,
      type,
      result,
    });
  } catch (err) {
    console.error("WhatsApp automation test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/email/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const to = EMAIL_TEST_RECIPIENT;
    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

    const subject = "Brevo Email Test from Sales Dashboard";
    const textContent = [
      "Brevo test email",
      `Agent: ${agentName}`,
      `Time: ${now}`,
      "Source: Sales Dashboard",
    ].join("\n");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #102a5a; color: #fff; padding: 12px 16px; font-size: 16px; font-weight: 700;">
          Brevo Test Email
        </div>
        <div style="padding: 16px; color: #0f172a; line-height: 1.6; font-size: 14px;">
          <p style="margin: 0 0 8px;">This is a test email from Sales Dashboard.</p>
          <p style="margin: 0 0 6px;"><strong>Agent:</strong> ${agentName}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${now}</p>
        </div>
      </div>
    `;

    const result = await sendBrevoEmail({
      to,
      toName: "Mohamed Zalama",
      subject,
      textContent,
      htmlContent,
    });

    if (!result?.sent) {
      return res.status(502).json({
        message: "Email test failed",
        details: result,
      });
    }

    return res.json({
      message: `Email test sent to ${to}`,
      to,
      result,
    });
  } catch (err) {
    console.error("Email test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/sms/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || SMS_TEST_RECIPIENT;
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test SMS phone number" });
    }

    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });
    const content = [
      "SP School SMS test",
      "",
      "Agent:",
      agentName,
      "",
      "Time:",
      now,
    ].join("\n");

    const result = await sendBrevoSms({
      recipient: to,
      content,
      tag: "sales_sms_test",
    });

    if (!result?.sent) {
      const reason = result?.reason || result?.error || "";
      const message =
        reason === "no_sms_credits"
          ? "SMS credits are 0 on Brevo account"
          : "SMS test failed";
      return res.status(502).json({
        message,
        details: result,
      });
    }

    return res.json({
      message: `SMS test sent to ${requestedPhone}`,
      to,
      result,
    });
  } catch (err) {
    console.error("SMS test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const {
      parentName,
      childName,
      childAge,
      phone,
      source,
      paymentLink,
      initialNote,
    } = req.body;

    if (!parentName || !childName || !phone) {
      return res.status(400).json({
        message: "parentName, childName and phone are required",
      });
    }

    const notes = [];
    if (initialNote?.trim()) {
      notes.push({
        text: initialNote.trim(),
        createdBy: req.user._id,
        createdByName: req.user.name || "",
        createdByRole: req.user.role || "",
      });
    }

    const lead = await Lead.create({
      parentName,
      childName,
      childAge: childAge || undefined,
      phone,
      source: source || "Manual",
      paymentLink: paymentLink || "",
      createdBy: req.user._id,
      notes,
      freeSession: {
        requested: (source || "Manual") === "Free Session",
      },
    });

    return res.status(201).json(lead.toJSON());
  } catch (err) {
    console.error("Create lead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/status", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { status, lostReason = "", callLaterAt = "" } = req.body;

    if (!assertValidStatus(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (status === "Closed - Lost" && !lostReason.trim()) {
      return res
        .status(400)
        .json({ message: "lostReason is required for Closed - Lost" });
    }

    const callLaterParse = isReminderStatus(status) ? parseCallLaterAt(callLaterAt) : null;
    if (callLaterParse?.error) {
      return res.status(400).json({ message: callLaterParse.error });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatePayload = {
      status,
      lostReason: status === "Closed - Lost" ? lostReason.trim() : "",
    };

    if (isReminderStatus(status)) {
      updatePayload["callLater.scheduledAt"] = callLaterParse.scheduledAt;
      updatePayload["callLater.scheduledBy"] = req.user._id;
      updatePayload["callLater.scheduledByName"] = req.user.name || "";
      updatePayload["callLater.scheduledAtSet"] = new Date();
      updatePayload["callLater.reminderSentAt"] = null;
      updatePayload["callLater.reminderLastAttemptAt"] = null;
      updatePayload["callLater.reminderLastError"] = "";
    } else {
      updatePayload["callLater.scheduledAt"] = null;
      updatePayload["callLater.reminderSentAt"] = null;
      updatePayload["callLater.reminderLastAttemptAt"] = null;
      updatePayload["callLater.reminderLastError"] = "";
    }

    // If telesales marks a lead as Demo Booked manually, treat it as a free-session request.
    if (status === "Demo Booked") {
      updatePayload["freeSession.requested"] = true;
    }

    if (!leadBefore.createdBy && ["agent", "admin"].includes(req.user.role)) {
      updatePayload.createdBy = req.user._id;
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    const statusChangedToFollowUp =
      status === "Follow-up" && (leadBefore.status || "") !== "Follow-up";

    let notificationResult = null;
    if (statusChangedToFollowUp && updated) {
      try {
        notificationResult = await notifySalesFollowUpReminder({
          lead: updated.toObject(),
          fallbackSalesUser: req.user,
        });
      } catch (waErr) {
        console.error("[sales][status] follow-up notification error:", waErr);
        notificationResult = { sent: false, error: waErr.message || "notification_error" };
      }
    }

    return res.json({
      ...updated.toJSON(),
      ...(notificationResult
        ? {
            notificationResult,
            whatsappNotification: notificationResult.whatsapp || null,
            emailNotification: notificationResult.email || null,
          }
        : {}),
    });
  } catch (err) {
    console.error("Update lead status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/call-later", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { callLaterAt, status = "Busy Call Later" } = req.body;
    if (!isReminderStatus(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Reserved Later or Busy Call Later" });
    }

    const parsed = parseCallLaterAt(callLaterAt);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatePayload = {
      status,
      lostReason: "",
      "callLater.scheduledAt": parsed.scheduledAt,
      "callLater.scheduledBy": req.user._id,
      "callLater.scheduledByName": req.user.name || "",
      "callLater.scheduledAtSet": new Date(),
      "callLater.reminderSentAt": null,
      "callLater.reminderLastAttemptAt": null,
      "callLater.reminderLastError": "",
    };

    if (!leadBefore.createdBy && ["agent", "admin"].includes(req.user.role)) {
      updatePayload.createdBy = req.user._id;
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Schedule busy call later error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads/:id/notes", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: text.trim(),
            createdBy: req.user._id,
            createdByName: req.user.name || "",
            createdByRole: req.user.role || "",
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Add lead note error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/payment-link", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { paymentLink = "" } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentLink: paymentLink.trim() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Update payment link error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/free-session", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { scheduledAt, instructorId } = req.body;

    if (!scheduledAt || !instructorId) {
      return res
        .status(400)
        .json({ message: "scheduledAt and instructorId are required" });
    }

    const scheduledDate = parseDateTimeInTimeZone(
      scheduledAt,
      FREE_SESSION_TIMEZONE
    );
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt date" });
    }

    const durationMinutes = getFreeSessionDurationMinutes();
    const followUpDelayMinutes = getFreeSessionFollowUpDelayMinutes();
    const endsAt = new Date(
      scheduledDate.getTime() + durationMinutes * 60 * 1000
    );
    const followUpDueAt = new Date(
      endsAt.getTime() + followUpDelayMinutes * 60 * 1000
    );

    const instructor = await User.findOne({
      _id: instructorId,
      role: "instructor",
    }).lean();

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    const normalizedWorkingHours = normalizeInstructorWorkingHours(
      instructor.workingHours
    );

    if (!isInsideWorkingHours(scheduledDate, durationMinutes, normalizedWorkingHours)) {
      return res.status(400).json({
        message: "Selected time is outside the instructor working hours",
      });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }
    const shouldSendParentWelcome = !(await hasParentWelcomeBeenSent(
      leadBefore.phone
    ));

    const targetRange = {
      startDate: scheduledDate,
      endDate: endsAt,
    };
    const instructorAssignedSessions = await Lead.find({
      _id: { $ne: req.params.id },
      "freeSession.isAssigned": true,
      "freeSession.instructor": instructor._id,
      "freeSession.scheduledAt": { $ne: null },
    })
      .select("parentName childName freeSession")
      .lean();
    const roundBusyRangesByInstructor =
      await loadRoundBusyRangesByInstructor([instructor]);
    const busyRangesByInstructor = buildBusyRangesByInstructor(
      instructorAssignedSessions,
      durationMinutes,
      req.params.id,
      roundBusyRangesByInstructor
    );
    const conflictingRange = (
      busyRangesByInstructor.get(stringifyId(instructor._id)) || []
    ).find((busyRange) => rangesOverlap(targetRange, busyRange));

    if (conflictingRange) {
      const conflictStart = conflictingRange.startDate
        ? new Date(conflictingRange.startDate).toLocaleString("en-GB", {
            timeZone: "Africa/Cairo",
          })
        : "this selected time";
      const conflictLabel =
        conflictingRange.source === "round"
          ? `round ${conflictingRange.roundCode || conflictingRange.roundName || ""}`.trim()
          : "free session";
      return res.status(409).json({
        message: `This instructor already has ${conflictLabel} at ${conflictStart}. Choose another slot.`,
        conflict: {
          source: conflictingRange.source || "busy",
          leadId: conflictingRange.leadId || "",
          parentName: conflictingRange.parentName || "",
          childName: conflictingRange.childName || "",
          roundId: conflictingRange.roundId || "",
          roundCode: conflictingRange.roundCode || "",
          roundName: conflictingRange.roundName || "",
          sessionId: conflictingRange.sessionId || "",
          sessionTitle: conflictingRange.sessionTitle || "",
          scheduledAt: conflictingRange.startDate || null,
          endsAt: conflictingRange.endDate || null,
        },
      });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(leadBefore?.createdBy
            ? {}
            : ["agent", "admin"].includes(req.user.role)
              ? { createdBy: req.user._id }
              : {}),
          status: "Demo Booked",
          freeSession: {
            requested: true,
            isAssigned: true,
            scheduledAt: scheduledDate,
            durationMinutes,
            endsAt,
            followUpDueAt,
            movedToFollowUpAt: null,
            instructor: instructor._id,
            instructorName: instructor.name || "",
            assignedBy: req.user._id,
            assignedByName: req.user.name || "",
            assignedAt: new Date(),
            reminderSentAt: null,
            parentWelcomeSentAt:
              leadBefore?.freeSession?.parentWelcomeSentAt || null,
            parentAssignmentNotifiedAt: null,
            parentReminderSentAt: null,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const [notificationResult, parentNotificationResult] = await Promise.all([
      notifyInstructorFreeSessionAssigned({
        lead: updated.toObject(),
        instructor,
      }),
      notifyParentFreeSessionAssigned({
        lead: updated.toObject(),
        shouldSendWelcome: shouldSendParentWelcome,
      }),
    ]);
    const notificationUpdates = {};
    const notificationTimestamp = new Date();
    if (parentNotificationResult?.welcomeSent) {
      notificationUpdates["freeSession.parentWelcomeSentAt"] =
        notificationTimestamp;
    }
    if (parentNotificationResult?.assignmentSent) {
      notificationUpdates["freeSession.parentAssignmentNotifiedAt"] =
        notificationTimestamp;
    }
    if (Object.keys(notificationUpdates).length) {
      await Lead.updateOne({ _id: updated._id }, { $set: notificationUpdates });
      Object.assign(updated.freeSession, {
        ...(notificationUpdates["freeSession.parentWelcomeSentAt"]
          ? { parentWelcomeSentAt: notificationTimestamp }
          : {}),
        ...(notificationUpdates["freeSession.parentAssignmentNotifiedAt"]
          ? { parentAssignmentNotifiedAt: notificationTimestamp }
          : {}),
      });
    }
    const whatsappNotificationTarget = {
      instructorId: instructor._id?.toString?.() || instructorId,
      instructorName: instructor.name || "",
      instructorEmail: instructor.email || "",
      instructorPhoneRaw: instructor.phone || "",
      instructorPhoneNormalized: normalizePhoneForWhatsApp(instructor.phone || ""),
    };
    const parentNotificationTarget = {
      parentName: updated.parentName || "",
      parentPhoneRaw: updated.phone || "",
      parentPhoneNormalized: normalizePhoneForWhatsApp(updated.phone || ""),
    };

    if (!notificationResult?.whatsappSent) {
      console.warn("[sales][free-session] instructor whatsapp notification failed");
    }

    return res.json({
      ...updated.toJSON(),
      notificationResult,
      parentNotificationResult,
      whatsappNotification: notificationResult?.whatsapp || null,
      parentWhatsAppNotification: parentNotificationResult || null,
      emailNotification: notificationResult?.email || null,
      whatsappNotificationTarget,
      parentNotificationTarget,
    });
  } catch (err) {
    console.error("Assign free session error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/leads/:id/free-session", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const removeRequest = req.query?.removeRequest === "true";
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (!removeRequest && !lead.freeSession?.isAssigned && !lead.freeSession?.scheduledAt) {
      return res.status(400).json({ message: "This lead has no assigned free session" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(lead.status === "Demo Booked" ? { status: "New" } : {}),
          ...(removeRequest && lead.source === "Free Session" ? { source: "Manual" } : {}),
          "freeSession.requested": removeRequest ? false : true,
          "freeSession.isAssigned": false,
          "freeSession.scheduledAt": null,
          "freeSession.durationMinutes": 60,
          "freeSession.endsAt": null,
          "freeSession.followUpDueAt": null,
          "freeSession.movedToFollowUpAt": null,
          "freeSession.instructor": null,
          "freeSession.instructorName": "",
          "freeSession.assignedBy": null,
          "freeSession.assignedByName": "",
          "freeSession.assignedAt": null,
          "freeSession.reminderSentAt": null,
          "freeSession.parentAssignmentNotifiedAt": null,
          "freeSession.parentReminderSentAt": null,
        },
      },
      { new: true }
    );

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Clear free session assignment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
