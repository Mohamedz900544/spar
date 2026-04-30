import Enrollment from "../models/Enrollment.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { notifyParentRoundSessionReminder } from "./leadNotifications.service.js";

const REMINDER_WINDOW_MINUTES = {
  start: 55,
  end: 65,
};

const parseCairoSessionStart = (session) => {
  if (!session?.date || !session?.time) return null;
  const sessionStart = new Date(`${session.date.trim()}T${session.time.trim()}:00`);
  return Number.isNaN(sessionStart.getTime()) ? null : sessionStart;
};

const getNowInCairo = () =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
    })
  );

export const processRoundSessionReminders = async () => {
  const now = getNowInCairo();
  const windowStart = new Date(
    now.getTime() + REMINDER_WINDOW_MINUTES.start * 60 * 1000
  );
  const windowEnd = new Date(
    now.getTime() + REMINDER_WINDOW_MINUTES.end * 60 * 1000
  );
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  const candidateSessions = await Session.find({
    status: { $ne: "Completed" },
    round: { $ne: null },
    date: { $gte: today, $lte: tomorrowDate },
  })
    .populate("round")
    .lean();

  let sessionCandidates = 0;
  let parentReminderCount = 0;

  for (const session of candidateSessions) {
    const sessionStart = parseCairoSessionStart(session);
    if (!sessionStart || sessionStart < windowStart || sessionStart > windowEnd) {
      continue;
    }

    sessionCandidates += 1;

    const sentTo = new Set(
      (session.parentReminderSentTo || []).map((id) => id.toString())
    );

    const enrollments = await Enrollment.find({
      round: session.round?._id || session.round,
      status: { $ne: "Cancelled" },
      user: { $ne: null },
    }).lean();

    const unsentEnrollmentsByUser = new Map();
    for (const enrollment of enrollments) {
      const userId = enrollment.user?.toString();
      if (!userId || sentTo.has(userId) || unsentEnrollmentsByUser.has(userId)) {
        continue;
      }
      unsentEnrollmentsByUser.set(userId, enrollment);
    }

    if (!unsentEnrollmentsByUser.size) continue;

    const parents = await User.find({
      _id: { $in: [...unsentEnrollmentsByUser.keys()] },
      role: "parent",
    })
      .select("name phone email")
      .lean();

    const attemptedParentIds = [];
    for (const parent of parents) {
      const parentId = parent._id.toString();
      const enrollment = unsentEnrollmentsByUser.get(parentId);
      const result = await notifyParentRoundSessionReminder({
        parent,
        enrollment,
        session,
        round: session.round,
      });

      attemptedParentIds.push(parent._id);
      if (result?.sent) parentReminderCount += 1;
    }

    if (attemptedParentIds.length) {
      await Session.updateOne(
        { _id: session._id },
        {
          $addToSet: { parentReminderSentTo: { $each: attemptedParentIds } },
          $set: { parentReminderSentAt: new Date() },
        }
      );
    }
  }

  return {
    sessionCandidates,
    parentReminderCount,
  };
};
