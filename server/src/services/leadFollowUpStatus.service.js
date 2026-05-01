import Lead from "../models/Lead.js";
import { notifySalesFollowUpReminder } from "./leadNotifications.service.js";
import {
  getFreeSessionDurationMinutes,
  getFreeSessionFollowUpDelayMinutes,
} from "./freeSessionTiming.service.js";

const normalizeDuration = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return getFreeSessionDurationMinutes();
};

const isDifferentDate = (first, second) => {
  if (!first || !second) return Boolean(first || second);
  return Math.abs(new Date(first).getTime() - new Date(second).getTime()) > 1000;
};

export async function processLeadFollowUpStatus(now = new Date()) {
  const candidates = await Lead.find({
    status: "Demo Booked",
    "freeSession.isAssigned": true,
    "freeSession.scheduledAt": { $ne: null },
  })
    .select("parentName phone childName childAge status notes createdBy freeSession")
    .lean();

  const followUpDelayMinutes = getFreeSessionFollowUpDelayMinutes();
  const ops = [];
  const movedToFollowUpLeads = [];

  for (const lead of candidates) {
    const freeSession = lead.freeSession || {};
    const scheduledAt = freeSession.scheduledAt
      ? new Date(freeSession.scheduledAt)
      : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) continue;

    const durationMinutes = normalizeDuration(freeSession.durationMinutes);
    const computedEndsAt = new Date(
      scheduledAt.getTime() + durationMinutes * 60 * 1000
    );
    const storedEndsAt = freeSession.endsAt ? new Date(freeSession.endsAt) : null;
    const endsAt =
      storedEndsAt && !Number.isNaN(storedEndsAt.getTime())
        ? storedEndsAt
        : computedEndsAt;

    const computedFollowUpDueAt = new Date(
      endsAt.getTime() + followUpDelayMinutes * 60 * 1000
    );
    const followUpDueAt = computedFollowUpDueAt;

    const commonSet = {
      "freeSession.durationMinutes": durationMinutes,
      "freeSession.endsAt": endsAt,
      "freeSession.followUpDueAt": followUpDueAt,
    };

    if (now >= followUpDueAt) {
      const movedLead = await Lead.findOneAndUpdate(
        { _id: lead._id, status: "Demo Booked" },
        {
          $set: {
            ...commonSet,
            status: "Follow-up",
            "freeSession.movedToFollowUpAt": now,
          },
        },
        { new: true }
      ).lean();

      if (movedLead) {
        movedToFollowUpLeads.push(movedLead);
      }
    } else if (
      Number(freeSession.durationMinutes) !== durationMinutes ||
      isDifferentDate(freeSession.endsAt, endsAt) ||
      isDifferentDate(freeSession.followUpDueAt, followUpDueAt)
    ) {
      ops.push({
        updateOne: {
          filter: { _id: lead._id, status: "Demo Booked" },
          update: { $set: commonSet },
        },
      });
    }
  }

  if (ops.length) {
    await Lead.bulkWrite(ops);
  }

  const notificationResults = await Promise.all(
    movedToFollowUpLeads.map(async (lead) => {
      try {
        return await notifySalesFollowUpReminder({ lead });
      } catch (error) {
        console.error("[lead-follow-up] notification failed:", error);
        return { sent: false, error: error.message || "notification_error" };
      }
    })
  );

  return {
    durationMinutes: getFreeSessionDurationMinutes(),
    followUpDelayMinutes,
    candidates: candidates.length,
    updatedDueDates: ops.length,
    movedToFollowUp: movedToFollowUpLeads.length,
    notificationsSent: notificationResults.filter((result) => result?.sent).length,
  };
}
