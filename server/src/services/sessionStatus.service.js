import Session from "../models/Session.js";

const SESSION_TIMEZONE = "Africa/Cairo";

const LOCAL_DATE_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/;

const getTimeZoneOffsetMs = (date, timeZone = SESSION_TIMEZONE) => {
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

const parseDateTimeInTimeZone = (value, timeZone = SESSION_TIMEZONE) => {
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

const getSessionStart = (session) => {
  if (!session?.date || !session?.time) return null;
  const sessionStart = parseDateTimeInTimeZone(
    `${session.date.trim()}T${session.time.trim()}:00`
  );
  return Number.isNaN(sessionStart.getTime()) ? null : sessionStart;
};

export const updateSessionStatuses = async (now = new Date()) => {
  const activeSessions = await Session.find({
    status: { $ne: "Completed" },
  })
    .select("date time durationMinutes status")
    .lean();

  const bulkOps = [];

  for (const session of activeSessions) {
    const sessionStart = getSessionStart(session);
    if (!sessionStart) {
      console.error("[session-status] invalid session date/time");
      continue;
    }

    const durationMinutes = Number(session.durationMinutes) || 120;
    const sessionEnd = new Date(
      sessionStart.getTime() + durationMinutes * 60 * 1000
    );

    let newStatus = null;

    if (now >= sessionEnd) {
      if (session.status !== "Completed") newStatus = "Completed";
    } else if (now >= sessionStart) {
      if (session.status !== "Active") newStatus = "Active";
    }

    if (newStatus) {
      bulkOps.push({
        updateOne: {
          filter: { _id: session._id },
          update: { $set: { status: newStatus } },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    await Session.bulkWrite(bulkOps);
  }

  return bulkOps.length;
};
